"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

import brandColors from "../../Brand/colors.json";
import brandFonts from "../../Brand/fonts.json";
import brandMotion from "../../Brand/motion.json";
import brandConfig from "../../Brand/brand.config.json";

const HEADLINE_MAX = 40;
const SUBHEADLINE_MAX = 90;

const RENDER_URL =
  process.env.NEXT_PUBLIC_RENDER_URL || "https://test-design-tool.onrender.com";

const FORMATS = [
  { key: "ig_post_1_1", group: "Instagram", name: "Instagram Post (1:1)", width: 1080, height: 1080 },
  { key: "ig_post_4_5", group: "Instagram", name: "Instagram Post (4:5)", width: 1080, height: 1350 },
  { key: "ig_story_9_16", group: "Instagram", name: "Instagram Story (9:16)", width: 1080, height: 1920 },
  { key: "reel_9_16", group: "Video", name: "Reel / TikTok (9:16)", width: 1080, height: 1920 },
  { key: "yt_short_9_16", group: "Video", name: "YouTube Short (9:16)", width: 1080, height: 1920 },
  { key: "li_square", group: "LinkedIn", name: "LinkedIn Square (1:1)", width: 1080, height: 1080 },
  { key: "li_landscape", group: "LinkedIn", name: "LinkedIn Landscape (1.91:1)", width: 1200, height: 628 },
  { key: "li_banner", group: "LinkedIn", name: "LinkedIn Profile Banner", width: 1128, height: 191 },
  { key: "x_post", group: "X / Twitter", name: "X Post (16:9)", width: 1200, height: 675 },
];

function groupedFormats() {
  const groups = {};
  for (const f of FORMATS) {
    if (!groups[f.group]) groups[f.group] = [];
    groups[f.group].push(f);
  }
  return groups;
}

function paletteOptionsFromBrandColors(colorsObj) {
  return Object.keys(colorsObj || {}).map((k) => ({
    key: k,
    label: colorsObj[k]?.name || k,
  }));
}

function motionOptionsFromBrandMotion(motionObj) {
  return Object.keys(motionObj || {}).map((k) => ({
    key: k,
    label: motionObj[k]?.name || k,
  }));
}

function TemplateCanvas({
  width,
  height,
  palette,
  headline,
  subheadline,
  showSafeAreaOverlay,
  formatKey,
}) {
  const headlineFontStyle = {
    fontFamily: `"${brandFonts?.headline?.family}", system-ui, sans-serif`,
    fontWeight: brandFonts?.headline?.weight,
    letterSpacing: `${brandFonts?.headline?.letterSpacing}px`,
  };

  const subheadlineFontStyle = {
    fontFamily: `"${brandFonts?.subheadline?.family}", monospace`,
    fontWeight: brandFonts?.subheadline?.weight,
    letterSpacing: `${brandFonts?.subheadline?.letterSpacing}px`,
  };

  return (
    <div
      style={{
        width,
        height,
        background: palette?.background,
        color: palette?.headline,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* LOGO — SEMPRE DA /public/logo.svg */}
      <img
        src="/logo.svg"
        alt="Brand logo"
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          width: Math.round(width * (brandConfig?.logoScale ?? 0.12)),
          height: "auto",
          opacity: 0.9,
        }}
      />

      <div style={{ padding: 48 }}>
        <div style={{ fontSize: 14, opacity: 0.6, color: palette?.meta }}>
          {brandConfig?.templateLabel || "TEMPLATE 01"}
        </div>

        <h1
          style={{
            ...headlineFontStyle,
            margin: "140px 0 0 0",
            fontSize: Math.round(width * 0.07),
            lineHeight: 1.04,
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            ...subheadlineFontStyle,
            margin: "18px 0 0 0",
            fontSize: Math.round(width * 0.024),
            lineHeight: 1.25,
            color: palette?.subheadline,
          }}
        >
          {subheadline}
        </p>

        <div
          style={{
            position: "absolute",
            left: 48,
            bottom: 40,
            fontSize: 14,
            opacity: 0.6,
            color: palette?.meta,
          }}
        >
          {brandConfig?.footerText || "iamstudio.to"}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const formatsByGroup = useMemo(() => groupedFormats(), []);
  const paletteOptions = useMemo(() => paletteOptionsFromBrandColors(brandColors), []);
  const motionOptions = useMemo(() => motionOptionsFromBrandMotion(brandMotion), []);

  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [paletteKey, setPaletteKey] = useState(paletteOptions[0]?.key);
  const [formatKey, setFormatKey] = useState(FORMATS[0].key);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [motionKey, setMotionKey] = useState(motionOptions[0]?.key);

  const exportRef = useRef(null);

  const selectedFormat = FORMATS.find((f) => f.key === formatKey);
  const palette = brandColors?.[paletteKey];

  async function onExportPng() {
    const dataUrl = await toPng(exportRef.current, {
      cacheBust: true,
      width: selectedFormat.width,
      height: selectedFormat.height,
      pixelRatio: 1,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `export_${formatKey}.png`;
    a.click();
  }

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "420px 1fr",
        gap: 24,
        padding: 24,
      }}
    >
      {/* LEFT */}
      <section style={{ background: "#fff", padding: 16, borderRadius: 16 }}>
        <h2>Contenuti</h2>

        <label>Headline</label>
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} />

        <label>Subheadline</label>
        <textarea value={subheadline} onChange={(e) => setSubheadline(e.target.value)} />

        <label>Palette colore</label>
        <select value={paletteKey} onChange={(e) => setPaletteKey(e.target.value)}>
          {paletteOptions.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>

        <label>Destinazione</label>
        <select value={formatKey} onChange={(e) => setFormatKey(e.target.value)}>
          {Object.entries(formatsByGroup).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <button onClick={onExportPng}>Esporta PNG</button>
      </section>

      {/* RIGHT */}
      <section style={{ display: "flex", justifyContent: "center" }}>
        <div ref={exportRef}>
          <TemplateCanvas
            width={selectedFormat.width}
            height={selectedFormat.height}
            palette={palette}
            headline={headline}
            subheadline={subheadline}
            showSafeAreaOverlay={showSafeArea}
            formatKey={formatKey}
          />
        </div>
      </section>
    </main>
  );
}
