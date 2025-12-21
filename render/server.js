import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = Number(process.env.PORT);
if (!PORT) {
  console.error("Missing process.env.PORT (Render provides this).");
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

app.get("/", (_req, res) => res.status(200).send("Branded Creative Tool Render Service ✅"));
app.get("/health", (_req, res) => res.json({ ok: true }));

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

async function renderMp4ToFile({ jobId, headline, subheadline, paletteKey }) {
  const palette = PALETTES[paletteKey] || PALETTES.dark;

  const entryPoint = path.join(process.cwd(), "remotion", "entry.jsx");
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "bct-video-"));
  const out = path.join(outDir, `out_${Date.now()}.mp4`);

  updateJob(jobId, { phase: "bundling" });
  console.log("[MP4] bundling…");

  const bundleLocation = await bundle({
    entryPoint,
    outDir: path.join(process.cwd(), ".remotion-bundle"),
    enableCaching: true
  });

  updateJob(jobId, { phase: "compositions" });
  console.log("[MP4] reading compositions…");

  // ✅ IMPORTANTE: niente onBrowserDownload (evita crash)
  const compositions = await getCompositions(bundleLocation);

  const composition = compositions.find((c) => c.id === "Template01");
  if (!composition) throw new Error("Composition Template01 not found");

  updateJob(jobId, { phase: "rendering" });
  console.log("[MP4] rendering MP4…");

  await renderMedia({
    serveUrl: bundleLocation,
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

app.post("/render/mp4/start", async (req, res) => {
  const {
    headline = "Branded Creative Tool",
    subheadline = "MP4 OK 🚀",
    paletteKey = "dark"
  } = req.body || {};

  const jobId = newJobId();

  jobs.set(jobId, {
    id: jobId,
    status: "queued", // queued | running | done | error
    phase: "queued",  // queued | bundling | compositions | rendering | done | error
    createdAt: Date.now(),
    updatedAt: Date.now(),
    filename: `template01_${paletteKey}.mp4`,
    outPath: null,
    error: null
  });

  queue = queue.then(async () => {
    const job = jobs.get(jobId);
    if (!job) return;

    updateJob(jobId, { status: "running", phase: "queued" });

    try {
      const outPath = await renderMp4ToFile({ jobId, headline, subheadline, paletteKey });
      updateJob(jobId, { status: "done", phase: "done", outPath });
      console.log("[MP4] JOB DONE", jobId);
    } catch (err) {
      updateJob(jobId, {
        status: "error",
        phase: "error",
        error: err?.message || "Unknown error"
      });
      console.error("[MP4] JOB ERROR", jobId, err?.message || err);
    }
  });

  res.json({ ok: true, jobId });
});

app.get("/render/mp4/status/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ ok: false, error: "Job not found" });

  res.json({
    ok: true,
    job: {
      id: job.id,
      status: job.status,
      phase: job.phase,
      filename: job.filename,
      error: job.error
    }
  });
});

app.get("/render/mp4/download/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ ok: false, error: "Job not found" });
  if (job.status !== "done" || !job.outPath) {
    return res.status(409).json({ ok: false, error: "Job not ready" });
  }

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Disposition", `attachment; filename="${job.filename}"`);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");

  createReadStream(job.outPath).pipe(res);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Render service listening on :${PORT}`);
});
