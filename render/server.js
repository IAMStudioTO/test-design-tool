import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createReadStream, existsSync, mkdirSync } from "fs";
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

// ✅ Cache directory (persistente durante la vita dell’istanza)
const CACHE_DIR = path.join(os.tmpdir(), "remotion-cache");
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

const PALETTES = {
  dark: { background: "#0b0f19", headline: "#ffffff", subheadline: "#e5e7eb" },
  blue: { background: "#0a2540", headline: "#ffffff", subheadline: "#dbeafe" },
  light: { background: "#f9fafb", headline: "#0b0f19", subheadline: "#374151" }
};

app.get("/", (_req, res) => {
  res.status(200).send("Branded Creative Tool Render Service ✅");
});

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

  // ✅ rispondiamo come “stream” (niente buffering reverse proxy)
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="template01_${paletteKey}.mp4"`
  );
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");

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
    const compositions = await getCompositions(bundleLocation, {
      // ✅ evita download ripetuti del browser
      browserExecutable: undefined,
      // Remotion usa cache in tmp; forziamo una dir stabile
      // (Remotion usa env var; questa cache aiuta la durata dell’istanza)
    });

    const composition = compositions.find((c) => c.id === "Template01");
    if (!composition) throw new Error("Composition Template01 not found");

    console.log("[MP4] rendering MP4…", {
      width: composition.width,
      height: composition.height,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames
    });

    // ✅ forza cache dir per Chromium
    process.env.REMOTION_BROWSER_CACHE_DIRECTORY = CACHE_DIR;

    await renderMedia({
      serveUrl: bundleLocation,
      composition,
      codec: "h264",
      outputLocation: out,
      inputProps: { headline, subheadline, palette },
      chromiumOptions: { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
    });

    console.log("[MP4] DONE in", Date.now() - startedAt, "ms");

    createReadStream(out).pipe(res);
  } catch (err) {
    console.error("[MP4] ERROR:", err);
    // se abbiamo già iniziato a mandare header video, chiudiamo con 500 JSON non ha senso
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Render service listening on :${PORT}`);
});
