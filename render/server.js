import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = Number(process.env.PORT);
if (!PORT) {
  console.error("Missing process.env.PORT");
  process.exit(1);
}

process.env.REMOTION_BROWSER_CACHE_DIRECTORY = path.join(
  os.tmpdir(),
  "remotion-browser-cache"
);

const PALETTES = {
  dark: { background: "#0b0f19", headline: "#ffffff", subheadline: "#e5e7eb" },
  blue: { background: "#0a2540", headline: "#ffffff", subheadline: "#dbeafe" },
  light: { background: "#f9fafb", headline: "#0b0f19", subheadline: "#374151" }
};

app.get("/health", (_req, res) => res.json({ ok: true }));

/* =======================
   REMOTION BUNDLE (ROOT)
======================= */

const BUNDLE_DIR = path.join(process.cwd(), ".remotion-bundle");
const ENTRY = path.join(process.cwd(), "remotion", "entry.jsx");

let bundleReady = false;
let bundlingPromise = null;

async function ensureBundle() {
  if (bundleReady) return;
  if (bundlingPromise) return bundlingPromise;

  bundlingPromise = (async () => {
    console.log("[BUNDLE] bundling…");
    await fs.rm(BUNDLE_DIR, { recursive: true, force: true });
    await bundle({
      entryPoint: ENTRY,
      outDir: BUNDLE_DIR,
      enableCaching: true
    });
    bundleReady = true;
    console.log("[BUNDLE] ready ✅");
  })();

  return bundlingPromise;
}

/**
 * 🔑 SERVIAMO IL BUNDLE ALLA ROOT
 * index.html, bundle.js, ecc.
 */
app.use(express.static(BUNDLE_DIR));

/* =======================
   JOB SYSTEM
======================= */

const jobs = new Map();
let queue = Promise.resolve();

function newJobId() {
  return `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function updateJob(jobId, patch) {
  const job = jobs.get(jobId);
  if (!job) return;
  jobs.set(jobId, { ...job, ...patch, updatedAt: Date.now() });
}

async function renderMp4({ jobId, headline, subheadline, paletteKey }) {
  const palette = PALETTES[paletteKey] || PALETTES.dark;

  updateJob(jobId, { phase: "bundling" });
  await ensureBundle();

  const serveUrl = `http://127.0.0.1:${PORT}`;

  updateJob(jobId, { phase: "compositions" });
  const composition = await selectComposition({
    serveUrl,
    id: "Template01",
    inputProps: { headline, subheadline, palette }
  });

  updateJob(jobId, { phase: "rendering" });

  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "bct-video-"));
  const out = path.join(outDir, `out_${Date.now()}.mp4`);

  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    outputLocation: out,
    inputProps: { headline, subheadline, palette },
    chromiumOptions: {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--disable-gpu"
      ]
    },
    timeoutInMilliseconds: 180000
  });

  return out;
}

/* =======================
   API
======================= */

app.post("/render/mp4/start", async (req, res) => {
  const { headline, subheadline, paletteKey = "dark" } = req.body;

  const jobId = newJobId();

  jobs.set(jobId, {
    id: jobId,
    status: "queued",
    phase: "queued",
    filename: `template01_${paletteKey}.mp4`
  });

  queue = queue.then(async () => {
    updateJob(jobId, { status: "running" });
    try {
      const outPath = await renderMp4({
        jobId,
        headline,
        subheadline,
        paletteKey
      });
      updateJob(jobId, { status: "done", phase: "done", outPath });
      console.log("[MP4] DONE", jobId);
    } catch (err) {
      updateJob(jobId, { status: "error", phase: "error", error: err.message });
      console.error("[MP4] ERROR", err);
    }
  });

  res.json({ ok: true, jobId });
});

app.get("/render/mp4/status/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ ok: false });
  res.json({ ok: true, job });
});

app.get("/render/mp4/download/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== "done")
    return res.status(409).json({ ok: false });

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Disposition", `attachment; filename="${job.filename}"`);
  createReadStream(job.outPath).pipe(res);
});

/* =======================
   START
======================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Render service listening on :${PORT}`);
});
