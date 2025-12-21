import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { bundle } from "@remotion/bundler";
import {
  getCompositions,
  renderFrames,
  stitchFramesToVideo,
  getVideoMetadata
} from "@remotion/renderer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// 🔎 Log ogni request (utile su Render Free)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;

// 🎨 Palette brand-safe
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

// Root test
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
    subheadline = "MP4 OK",
    paletteKey = "dark"
  } = req.body || {};

  const palette = PALETTES[paletteKey] || PALETTES.dark;

  // Entry Remotion FISSO (contiene registerRoot)
  const entryPoint = path.join(process.cwd(), "remotion", "entry.jsx");

  // Workspace temporaneo
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "bct-render-"));
  const framesDir = path.join(workdir, "frames");
  await fs.mkdir(framesDir, { recursive: true });

  const out = path.join(workdir, `out_${Date.now()}.mp4`);

  try {
    console.log("[MP4] bundling…");
    const bundleLocation = await bundle({
      entryPoint,
      outDir: path.join(process.cwd(), ".remotion-bundle"),
      enableCaching: true
    });

    console.log("[MP4] reading compositions…");
    const compositions = await getCompositions(bundleLocation);

    const composition = compositions.find(
      (c) => c.id === "Template01"
    );

    if (!composition) {
      throw new Error("Composition Template01 not found");
    }

    console.log("[MP4] rendering frames…", {
      width: composition.width,
      height: composition.height,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames
    });

    // 1️⃣ Render frames PNG
    await renderFrames({
      composition,
      serveUrl: bundleLocation,
      outputDir: framesDir,
      inputProps: {
        headline,
        subheadline,
        palette
      },
      concurrency: 1,
      imageFormat: "png",
      chromiumOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    });

    console.log("[MP4] stitching video…");

    // 2️⃣ Stitch MP4 (width/height OBBLIGATORI)
    await stitchFramesToVideo({
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
      framesDir,
      outputLocation: out,
      codec: "h264"
    });

    const meta = await getVideoMetadata(out);
    console.log("[MP4] DONE in", Date.now() - startedAt, "ms", meta);

    // 3️⃣ Stream risposta
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="template01_${paletteKey}.mp4"`
    );

    createReadStream(out).pipe(res);
  } catch (err) {
    console.error("[MP4] ERROR:", err);
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Render service listening on :${PORT}`);
});
