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
/**
 * 🔴 FIX QUI
 * Prima: path.join(process.cwd(), "render", "remotion", "entry.jsx")
 * Ora:    path.join(process.cwd(), "remotion", "entry.jsx")
 */
const REMOTION_ENTRY = path.join(
  process.cwd(),
  "remotion",
  "entry.jsx"
);

let bundled = null;

async function bundleOnce() {
  if (bundled) return bundled;

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "remotion-bundle-"));
  bundled = await bundle({
    entryPoint: REMOTION_ENTRY,
    outDir: tmpDir,
  });

  return bundled;
}

/* =======================
   JOB STATE
======================= */
const jobs = new Map();

/* =======================
   START MP4
======================= */
app.post("/render/mp4/start", async (req, res) => {
  const { headline, subheadline, paletteKey, motionStyle, formatKey } = req.body;

  const jobId = `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  jobs.set(jobId, { status: "queued", phase: "bundling" });
  res.json({ jobId });

  try {
    const serveUrl = await bundleOnce();

    const compositions = await getCompositions(serveUrl, {
      inputProps: { headline, subheadline, paletteKey, motionStyle, formatKey },
    });

    const compositionId = `Template01_${formatKey}`;
    const composition = compositions.find((c) => c.id === compositionId);

    if (!composition) {
      throw new Error(`Composition not found: ${compositionId}`);
    }

    const outPath = path.join(os.tmpdir(), `${jobId}.mp4`);

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outPath,
      inputProps: { headline, subheadline, paletteKey, motionStyle, formatKey },
    });

    jobs.set(jobId, { status: "done", file: outPath });
  } catch (e) {
    console.error(e);
    jobs.set(jobId, { status: "error", error: e.message });
  }
});

/* =======================
   STATUS
======================= */
app.get("/render/mp4/status/:jobId", (req, res) => {
  res.json({ job: jobs.get(req.params.jobId) });
});

/* =======================
   DOWNLOAD
======================= */
app.get("/render/mp4/download/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== "done") return res.sendStatus(404);

  res.setHeader("Content-Type", "video/mp4");
  createReadStream(job.file).pipe(res);
});

app.listen(PORT, () => {
  console.log("Render service listening on :", PORT);
});
