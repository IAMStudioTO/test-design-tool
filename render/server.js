import express from "express";
import cors from "cors";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia } from "@remotion/renderer";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

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

app.get("/health", (_req, res) => {
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

  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "bct-render-"));
  const entry = path.join(workdir, "entry.jsx");
  const rootFile = path.join(workdir, "remotionRoot.jsx");
  const out = path.join(workdir, "out.mp4");

  const rootCode = `
import React from "react";
import {Composition, AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

const Template = ({headline, subheadline, palette}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const titleY = interpolate(frame, [0, 18], [40, 0], {extrapolateRight: "clamp"});
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: "clamp"});
  const subOpacity = interpolate(frame, [12, 28], [0, 1], {extrapolateRight: "clamp"});

  const shortSide = Math.min(width, height);
  const pad = Math.round(shortSide * 0.074);
  const metaSize = Math.round(shortSide * 0.026);
  const headlineSize = Math.round(shortSide * 0.081);
  const subSize = Math.round(shortSide * 0.033);

  return (
    <AbsoluteFill style={{
      backgroundColor: palette.background,
      fontFamily: "system-ui",
      padding: pad,
      boxSizing: "border-box",
      justifyContent: "space-between"
    }}>
      <div style={{fontSize: metaSize, color: palette.meta}}>TEMPLATE 01</div>

      <div>
        <div style={{
          fontSize: headlineSize,
          fontWeight: 700,
          lineHeight: 1.05,
          color: palette.headline,
          opacity: titleOpacity,
          transform: \`translateY(\${titleY}px)\`,
          wordBreak: "break-word"
        }}>
          {headline}
        </div>

        <div style={{
          marginTop: Math.round(shortSide * 0.03),
          fontSize: subSize,
          color: palette.subheadline,
          opacity: subOpacity,
          wordBreak: "break-word"
        }}>
          {subheadline}
        </div>
      </div>

      <div style={{fontSize: metaSize, color: palette.meta}}>iamstudio.to</div>
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Template01"
        component={Template}
        durationInFrames={${Number(durationInFrames)}}
        fps={${Number(fps)}}
        width={${Number(width)}}
        height={${Number(height)}}
        defaultProps={{
          headline: ${JSON.stringify(String(headline))},
          subheadline: ${JSON.stringify(String(subheadline))},
          palette: ${JSON.stringify(palette)}
        }}
      />
    </>
  );
};
`;

  // Entry con registerRoot (in chiaro, per il validator)
  const entryCode = `
import { registerRoot } from "remotion";
import { RemotionRoot } from "./remotionRoot.jsx";

registerRoot(RemotionRoot);
`;

  try {
    await fs.writeFile(rootFile, rootCode, "utf8");
    await fs.writeFile(entry, entryCode, "utf8");

    const bundleLocation = await bundle({
      entryPoint: entry,
      outDir: path.join(workdir, "bundle"),
      enableCaching: true,
      // ✅ Fix: evita blocco del validator in ambiente server-side dinamico
      ignoreRegisterRootWarning: true
    });

    await renderMedia({
      codec: "h264",
      composition: "Template01",
      serveUrl: bundleLocation,
      outputLocation: out,
      inputProps: {
        headline: String(headline),
        subheadline: String(subheadline),
        palette
      }
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

