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
   FONT PROXY (Google Drive)
   Buffer-based (no streaming issues)
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
  const { fontId } = req.params;
  const entry = FONT_MAP[fontId];

  if (!entry) return res.status(404).send("Font not found");

  const driveUrl = `https://drive.google.com/uc?export=download&id=${entry.driveId}`;

  try {
    const r = await fetch(driveUrl, { redirect: "follow" });

    if (!r.ok) {
      throw new Error(`Drive fetch failed (${r.status})`);
    }

    const ab = await r.arrayBuffer();
    const buf = Buffer.from(ab);

    // CORS (fondamentale per @font-face cross-origin)
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Headers “puliti”
    res.setHeader("Content-Type", entry.contentType);
    res.setHeader("Content-Disposition", `inline; filename="${entry.filename}"`);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    res.status(200).end(buf);
  } catch (err) {
    console.error("Font proxy error:", err);
    res.status(500).send("Font proxy error");
  }
});

/* =======================
   REMOTION SETUP
======================= */

const REMOTION_ENTRY = path.join(process.cwd(), "render", "remotion", "entry.jsx");

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

/* =======================
   START MP4 RENDER
======================= */

app.post("/render/mp4/start", async (req, res) => {
  const { headline, subheadline, paletteKey, motionStyle } = req.body;

  const jobId = `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  jobs.set(jobId, { status: "queued", phase: "bundling" });
  res.json({ jobId });

  try {
    const bundleLocation = await bundleOnce();
    jobs.set(jobId, { status: "working", phase: "compositions" });

    const compositions = await getCompositions(bundleLocation, {
      inputProps: { headline, subheadline, paletteKey, motionStyle },
    });

    const composition = compositions.find((c) => c.id === "Template01");
    if (!composition) throw new Error("Composition not found");

    jobs.set(jobId, { status: "working", phase: "rendering" });

    const outPath = path.join(os.tmpdir(), `${jobId}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outPath,
      inputProps: { headline, subheadline, paletteKey, motionStyle },
      timeoutInMilliseconds: 600000,
    });

    jobs.set(jobId, { status: "done", phase: "done", file: outPath });
  } catch (err) {
    console.error("[MP4] JOB ERROR", err);
    jobs.set(jobId, { status: "error", error: err.message });
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

/* =======================
   START SERVER
======================= */

app.listen(PORT, () => {
  console.log("Render service listening on :", PORT);
});
