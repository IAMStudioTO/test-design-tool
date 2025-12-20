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

// log requests
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;

const PALETTES = {
  dark: { background: "#0b0f19", headline: "#ffffff", subheadline: "#e5e7eb" },
  blue: { background: "#0a2540", headline: "#ffffff", subheadline: "#dbeafe" },
  light: { background: "#f9fafb", headline: "#0b0f19", subheadline: "#374151" }
};

app.get("/", (_req, res) => res.status(200).send("OK"));

app.get("/health", (_req, res) => {
  console.log(`[${new Date().toISOString()}] HEALTH_OK`);
  res.json({ ok: true, service: "render", ts: new Date().toISOString() });
});

app.post("/render/mp4", async (req, res) => {
  const startedAt = Date.now();

  const {
    headline = "Branded Creative Tool",
    subheadline = "MP4 test",
    paletteKey = "dark",
    fps = 30,
    durationInFrames = 30
  } = req.body || {};

  const palette = PALETTES[paletteKey] || PALETTES.dark;

  // Remotion entry fisso
  const entryPoint = path.join(process.cwd(), "remotion", "entry.jsx");

  // workspace temporaneo
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "bct-frames-"));
  const framesDir = path.join(workdir, "frames");
  await fs.mkdir(framesDir, { recursive: true });

  const out = path.join(workdir, `out_${Date.now()}.mp4`);

  try {
    console.log(`[MP4] start job`);
    console.log(`[MP4] entryPoint: ${entryPoint}`);
    console.log(`[MP4] bundling...`);

    const bundleLocation = await bundle({
      entryPoint,
      outDir: path.join(process.cwd(), ".remotion-bundle"),
      enableCaching: true
    });

    console.log(`[MP4] bundle ok: ${bundleLocation}`);

    // Nota: in entry.jsx la Composition si chiama "Template01"
    // Renderizziamo frame PNG
    console.log(`[MP4] rendering frames...`);
    await renderFrames({
      composition: "Template01",
      serveUrl: bundleLocation,
      outputDir: framesDir,
      inputProps: {
        headline: String(headline),
        subheadline: String(subheadline),
        palette
      },
      // riduce rischio hang su Free
      concurrency: 1,
      imageFormat: "png",
      chromiumOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    });

    console.log(`[MP4] frames ok, stitching video...`);

    await stitchFramesToVideo({
      fps: Number(fps),
      framesDir,
      outputLocation: out,
      // codec più compatibile
      codec: "h264"
    });

    console.log(`[MP4] stitch ok, checking video...`);
    const meta = await getVideoMetadata(out);
    console.log(`[MP4] done in ${Date.now() - startedAt}ms`, meta);

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
      error: "Render failed",
      details: String(err?.message || err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Render service listening on :${PORT}`);
});
