import express from "express";
import cors from "cors";
import path from "path";
import { createReadStream } from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia } from "@remotion/renderer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ✅ LOG DI OGNI REQUEST (così Live tail si muove)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;

const PALETTES = {
  dark: {
    background: "#0b0f19",
    headline: "#ffffff",
    subheadline: "#e5e7eb",
    meta: "#9ca3af"
  },
  blue: {
    background: "#0a2540",
    headline: "#ffffff",
    subheadline: "#dbeafe",
    meta: "#93c5fd"
  },
  light: {
    background: "#f9fafb",
    headline: "#0b0f19",
    subheadline: "#374151",
    meta: "#6b7280"
  }
};

// ✅ Root route (utile per test rapido)
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/health", (_req, res) => {
  // ✅ log esplicito health
  console.log(`[${new Date().toISOString()}] HEALTH_OK`);
  res.json({ ok: true, service: "render", ts: new Date().toISOString() });
});

app.post("/render/mp4", async (req, res) => {
  const {
    headline = "Ciao",
    subheadline = "Come stai?",
    paletteKey = "dark",
    width = 1080,
    height = 1080,
    fps = 30,
    durationInFrames = 120
  } = req.body || {};

  const palette = PALETTES[paletteKey] || PALETTES.dark;

  try {
    const entryPoint = path.join(process.cwd(), "remotion", "entry.jsx");

    const bundleLocation = await bundle({
      entryPoint,
      outDir: path.join(process.cwd(), ".remotion-bundle"),
      enableCaching: true
    });

    const out = path.join(process.cwd(), `out_${Date.now()}.mp4`);

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
        durationInFrames
      },
      chromiumOptions: { disableWebSecurity: true }
    });

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="template01_${paletteKey}_${width}x${height}.mp4"`
    );

    createReadStream(out).pipe(res);
  } catch (err) {
    console.error(err);
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
