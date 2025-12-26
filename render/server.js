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
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 10000;

/* =======================
   HEALTH
======================= */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* =======================
   FONT PROXY (Google Drive) - buffer safe
======================= */
const FONT_MAP = {
  "omni-display": {
    driveId: "1fMgFTjZ0FjGXr1K2myhxkBPvw7eKf7ig",
    contentType: "font/ttf",
    filename: "omni-display.ttf",
  },
  "omni-mono": {
    driveId: "1AS6bTQUY_Yqkwrt-h0IwJvFPZo1cz-yN",
    contentType: "font/ttf",
    filename: "omni-mono.ttf",
  },
};

app.get("/fonts/:fontId", async (req, res) => {
  const entry = FONT_MAP[req.params.fontId];
  if (!entry) return res.status(404).send("Font not found");

  try {
    const r = await fetch(
      `https://drive.google.com/uc?export=download&id=${entry.driveId}`,
      { redirect: "follow" }
    );
    if (!r.ok) throw new Error(`Drive fetch failed (${r.status})`);

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", entry.contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.end(buf);
  } catch (e) {
    console.error(e);
    res.status(500).send("Font proxy error");
  }
});

/* =======================
   REMOTION SETUP
======================= */
const REMOTION_ENTRY = path.join(process.cwd(), "remotion", "entry.jsx");

let bundled = null;

async function bundleOnce() {
  if (bundled) return bundled;

  console.log("[BUNDLE] bundling once…");
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "remotion-bundle-"));

  bundled = await bundle({
    entryPoint: REMOTION_ENTRY,
    outDir: tmpDir,
    webpackOverride: (config) => config,
  });

  console.log("[BUNDLE] ready ✅");
  return bundled;
}

/* =======================
   JOB STATE
======================= */
const jobs = new Map();

const toIdSafe = (formatKey) => (formatKey || "ig_post_1_1").replaceAll("_", "-");

/* =======================
   START MP4 RENDER
======================= */
app.post("/render/mp4/start", async (req, res) => {
  const { headline, subheadline, paletteKey, motionStyle, formatKey } = req.body;

  const jobId = `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  jobs.set(jobId, { status: "queued", phase: "bundling" });
  res.json({ jobId });

  try {
    const serveUrl = await bundleOnce();
    jobs.set(jobId, { status: "working", phase: "compositions" });

    const compositions = await getCompositions(serveUrl, {
      inputProps: { headline, subheadline, paletteKey, motionStyle, formatKey },
    });

    const compositionId = `Template01-${toIdSafe(formatKey)}`;
    const composition = compositions.find((c) => c.id === compositionId);

    if (!composition) {
      const available = compositions.map((c) => c.id).slice(0, 30);
      throw new Error(`Composition not found: ${compositionId}. Available: ${available.join(", ")}`);
    }

    jobs.set(jobId, { status: "working", phase: "rendering" });

    const outPath = path.join(os.tmpdir(), `${jobId}.mp4`);

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outPath,
      inputProps: { headline, subheadline, paletteKey, motionStyle, formatKey },
      timeoutInMilliseconds: 600000,
    });

    jobs.set(jobId, { status: "done", phase: "done", file: outPath });
  } catch (e) {
    console.error("[MP4] JOB ERROR", e);
    jobs.set(jobId, { status: "error", error: e.message });
  }
});

/* =======================
   JOB STATUS
======================= */
app.get("/render/mp4/status/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({ job });
});

/* =======================
   DOWNLOAD MP4
======================= */
app.get("/render/mp4/download/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== "done") return res.status(404).send("File not ready");

  res.setHeader("Content-Type", "video/mp4");
  createReadStream(job.file).pipe(res);
});

app.listen(PORT, () => {
  console.log("Render service listening on :", PORT);
});
