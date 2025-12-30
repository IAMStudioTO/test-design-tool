"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

import brandColors from "../../Brand/colors.json";
import brandFonts from "../../Brand/fonts.json";
import brandMotion from "../../Brand/motion.json";
import brandConfig from "../../Brand/brand.config.json";

const HEADLINE_MAX = 40;
const SUBHEADLINE_MAX = 90;

// Backend Render URL
const RENDER_URL =
  process.env.NEXT_PUBLIC_RENDER_URL || "https://test-design-tool.onrender.com";

// Formati
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

// Safe area
function getSafeArea(formatKey, w, h) {
  if (formatKey.includes("9_16")) {
    const padX = Math.round(w * 0.06);
    const padY = Math.round(h * 0.08);
    return { x: padX, y: padY, w: w - padX * 2, h: h - padY * 2 };
  }
  return null;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
  const safe = getSafeArea(formatKey, width, height);

  const headlineFontStyle = {
    fontFamily: `"${brandFonts?.headline?.family || "OMNI Display"}", system-ui, sans-serif`,
    fontWeight: brandFonts?.headline?.weight ?? 600,
    letterSpacing: `${brandFonts?.headline?.letterSpacing ?? 0}px`,
  };

  const subheadlineFontStyle = {
    fontFamily: `"${brandFonts?.subheadline?.family || "OMNI Mono"}", monospace`,
    fontWeight: brandFonts?.subheadline?.weight ?? 400,
    letterSpacing: `${brandFonts?.subheadline?.letterSpacing ?? 0}px`,
  };

  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        borderRadius: 0,
        boxShadow: "none",
        background: palette?.background || "#0b0f19",
        color: palette?.headline || "#ffffff",
        position: "relative",
      }}
    >
      <div style={{ padding: 48 }}>
        <div style={{ fontSize: 14, opacity: 0.65, color: palette?.meta || "#9ca3af" }}>
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
            color: palette?.subheadline || "rgba(255,255,255,0.9)",
          }}
        >
          {subheadline}
        </p>

        {/* FOOTER LOGO */}
        <div
          style={{
            position: "absolute",
            left: 48,
            bottom: 40,
            opacity: 0.6,
          }}
        >
          <img
            src="/brand/logo.svg"
            alt="Brand logo"
            style={{
              height: 14,
              width: "auto",
              display: "block",
            }}
          />
        </div>
      </div>

      {showSafeAreaOverlay && safe ? (
        <div
          style={{
            position: "absolute",
            left: safe.x,
            top: safe.y,
            width: safe.w,
            height: safe.h,
            border: "2px dashed rgba(255,255,255,0.35)",
            borderRadius: 12,
            pointerEvents: "none",
          }}
        />
      ) : null}
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

  const [mp4State, setMp4State] = useState({ loading: false, phase: "", error: "" });

  const exportRef = useRef(null);

  const selectedFormat = FORMATS.find((f) => f.key === formatKey);
  const palette = brandColors?.[paletteKey];

  const previewScale = useMemo(() => {
    const maxPreviewWidth = 700;
    const s = maxPreviewWidth / selectedFormat.width;
    return Math.min(1, Math.max(0.25, s));
  }, [selectedFormat.width]);

  async function onExportPng() {
    const dataUrl = await toPng(exportRef.current, {
      cacheBust: true,
      pixelRatio: 1,
      width: selectedFormat.width,
      height: selectedFormat.height,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "export.png";
    a.click();
  }

  async function onExportMp4() {
    setMp4State({ loading: true, phase: "starting", error: "" });

    try {
      const startRes = await fetch(`${RENDER_URL}/render/mp4/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          subheadline,
          paletteKey,
          motionStyle: motionKey,
        }),
      });

      const { jobId } = await startRes.json();

      while (true) {
        const res = await fetch(`${RENDER_URL}/render/mp4/status/${jobId}`);
        const data = await res.json();
        if (data.job.status === "done") break;
        if (data.job.status === "error") throw new Error(data.job.error);
        await new Promise((r) => setTimeout(r, 1200));
      }

      const fileRes = await fetch(`${RENDER_URL}/render/mp4/download/${jobId}`);
      const blob = await fileRes.blob();
      downloadBlob(blob, "export.mp4");

      setMp4State({ loading: false, phase: "", error: "" });
    } catch (e) {
      setMp4State({ loading: false, phase: "", error: e.message });
    }
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

        <input value={headline} onChange={(e) => setHeadline(e.target.value)} />
        <textarea value={subheadline} onChange={(e) => setSubheadline(e.target.value)} />

        <select value={paletteKey} onChange={(e) => setPaletteKey(e.target.value)}>
          {paletteOptions.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>

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
        <button onClick={onExportMp4}>Esporta MP4</button>
      </section>

      {/* RIGHT */}
      <section style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top center" }}>
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

      {/* EXPORT HIDDEN */}
      <div style={{ position: "absolute", left: -99999, top: 0 }}>
        <div ref={exportRef}>
          <TemplateCanvas
            width={selectedFormat.width}
            height={selectedFormat.height}
            palette={palette}
            headline={headline}
            subheadline={subheadline}
            showSafeAreaOverlay={false}
            formatKey={formatKey}
          />
        </div>
      </div>
    </main>
  );
}
