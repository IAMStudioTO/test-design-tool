import express from "express";
import cors from "cors";
import path from "path";
import { createReadStream } from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia } from "@remotion/renderer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ✅ log di ogni request
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;

const PALETTES = {
  dark: { background: "#0b0f19", headline: "#ffffff", subheadline: "#e5e7eb" },
  blue: { background: "#0a2540", headline: "#ffffff", subheadline: "#dbeafe" },
  light: { background: "#f9fafb", headline: "#0b0f19", subheadline: "#374151" },
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
    width = 1080,
    height = 1080,
    fps = 30,
    durationInFrames = 30,
  } = req.body || {};

  const palette = PALETTES[paletteKey] || PALETTES.dark;

  try {
    console.log(`[MP4] start job`);
    console.log(
      `[MP4] props: ${JSON.stringify({ headline, subheadline, paletteKey, width, height, fps, durationInFrames })}`
    );

    const entryPoint = path.join(process.cwd(), "remotion", "entry.jsx");
    console.log(`[MP4] entryPoint: ${entryPoint}`);

    console.log(`[MP4] bundling...`);
    const bundleLocation = await bundle({
      entryPoint,
      outDir: path.join(process.cwd(), ".remotion-bundle"),
      enableCaching: true,
    });
    console.log(`[MP4] bundle ok: ${bundleLocation}`);

    const out = path.join(process.cwd(), `out_${Date.now()}.mp4`);
    console.log(`[MP4] rendering to: ${out}`);

    await renderMedia({
      codec: "h264",
      composition: "Template01",
      serveUrl: bundleLocation,
      outputLocation: out,
      inputProps: {
        headline: String(headline),
        subheadline: String(subheadline),
        palette,
        width,
        height,
        fps,
        durationInFrames,
      },
      chromiumOptions: {
        // spesso utile su ambienti cloud
        disableWebSecurity: true,
      },
    });

    console.log(`[MP4] render ok in ${Date.now() - startedAt}ms`);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="template01_${paletteKey}.mp4"`);
    createReadStream(out).pipe(res);
  } catch (err) {
    console.error("[MP4] ERROR:", err);
    res.status(500).json({
      ok: false,
      error: "Render failed",
      details: String(err?.message || err),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Render service listening on :${PORT}`);
});

