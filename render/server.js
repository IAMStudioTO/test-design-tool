import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { bundle } from "@remotion/bundler";
import {
  renderFrames,
  stitchFramesToVideo,
  getVideoMetadata
} from "@remotion/renderer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// 🔎 Log di ogni request (debug + wake free tier)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;

// 🎨 Palette condivise con frontend
const PALETTES = {
  dark: {
    background: "#0b0f19",
    headline: "#ffffff",
    subheadline: "#e5e7eb"
  },
  blue: {
    background: "#0a2540",
    headline: "#ffffff",
    subheadline: "#dbeafe"
  },
  light: {
    background: "#f9fafb",
    headline: "#0b0f19",
    subheadline: "#374151"
  }
};

// Root (debug rapido)
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Health check
app.get("/health", (_req, res) => {
  console.log(`[${new Date().toISOString()}] HEALTH_OK`);
  res.json({ ok: true, service: "render", ts: new Date().toISOString() });
});

// 🎬 Render MP4
app.post("/render/mp4", async (req, res) => {
  const startedAt = Date.now();

  const {
    headline = "Branded Creative Tool",
    subheadline = "MP4 test",
    paletteKey = "dark",
    width = 1080,
    height = 1080,
    fps = 30,
    durationInFrames = 30
  } = req.body || {};

  const palette = PALETTES[paletteKey] || PALETTES.dark;

  // Entry Remotion FISSO (contiene registerRoot)
  const entryPoint = path.join(process.cwd(), "remotion", "entry.jsx");

  // Workspace temporaneo (obbligatorio su Render Free)
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "bct-render-"));
  const framesDir = path.join(workdir, "frames");
  await fs.mkdir(framesDir, { recursive: true });

  const out = path.join(workdir, `out_${Date.now()}.mp4`);

  try {
    console.log("[MP4] start job");
    console.log("[MP4] entryPoint:", entryPoint);
    console.log("[MP4] props:", {
      headline,
      subheadline,
      paletteKey,
      width,
      height,
      fps,
      durationInFrames
    });

    // 1️⃣ Bundle Remotion
    console.log("[MP4] bundling...");
    const bundleLocation = await bundle({
      entryPoint,
      outDir: path.join(process.cwd(), ".remotion-bundle"),
      enableCaching: true
    });
    console.log("[MP4] bundle ok:", bundleLocation);

    // 2️⃣ Render frames PNG
    console.log("[MP4] rendering frames...");
    await renderFrames({
      composition: "Template01",
      serveUrl: bundleLocation,
      outputDir: framesDir,
      width: Number(width),
      height: Number(height),
      inputProps: {
        headline: String(headline),
        subheadline: String(subheadline),
        palette
      },
      concurrency: 1, // fondamentale su Free
      imageFormat: "png",
      chromiumOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    });
    console.log("[MP4] frames ok");

    // 3️⃣ Stitch MP4
    console.log("[MP4] stitching video...");
    await stitchFramesToVideo({
      fps: Number(fps),
      framesDir,
      outputLocation: out,
      codec: "h264"
    });

    const meta = await getVideoMetadata(out);
    console.log("[MP4] done in", Date.now() - startedAt, "ms", meta);

    // 4️⃣ Stream risposta
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="template01_${paletteKey}_${width}x${height}.mp4"`
    );

    createReadStream(out).pipe(res);
  } catch (err) {
    console.error("[MP4] ERROR:", err);
    res.status(500).json({
      ok: false,
      error: "Render failed",
      details: String(err?.message || err)
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Render service listening on :${PORT}`);
});
