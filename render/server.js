import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { bundle } from "@remotion/bundler";
import {
  getCompositions,
  renderMedia
} from "@remotion/renderer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;

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

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/render/mp4", async (req, res) => {
  const startedAt = Date.now();

  const {
    headline = "Branded Creative Tool",
    subheadline = "MP4 OK 🚀",
    paletteKey = "dark"
  } = req.body || {};

  const palette = PALETTES[paletteKey] || PALETTES.dark;

  const entryPoint = path.join(process.cwd(), "remotion", "entry.jsx");
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "bct-video-"));
  const out = path.join(outDir, `out_${Date.now()}.mp4`);

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

    console.log("[MP4] rendering MP4…", {
      width: composition.width,
      height: composition.height,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames
    });

    await renderMedia({
      serveUrl: bundleLocation,
      composition,
      codec: "h264",
      outputLocation: out,
      inputProps: {
        headline,
        subheadline,
        palette
      },
      chromiumOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    });

    console.log("[MP4] DONE in", Date.now() - startedAt, "ms");

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

app.listen(PORT, () => {
  console.log(`Render service listening on :${PORT}`);
});
