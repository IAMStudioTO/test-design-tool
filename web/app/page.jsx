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

// Safe area semplice
function getSafeArea(formatKey, w, h) {
  if (formatKey.includes("9_16")) {
    const padX = Math.round(w * 0.06);
    const padY = Math.round(h * 0.08);
    return { x: padX, y: padY, w: w - padX * 2, h: h - padY * 2 };
  }
  return null;
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
  const keys = Object.keys(colorsObj || {});
  return keys.map((k) => {
    const v = colorsObj[k] || {};
    return { key: k, label: v.name || k };
  });
}

function motionOptionsFromBrandMotion(motionObj) {
  const keys = Object.keys(motionObj || {});
  return keys.map((k) => ({ key: k, label: motionObj[k]?.name || k }));
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
      {/* ✅ LOGO SVG — SCALABILE, DA /public/logo.svg */}
      <img
        src="/logo.svg"
        alt="Brand logo"
        style={{
          position: "absolute",
          top: 48,
          left: 48,
          width: Math.round(width * (brandConfig?.logoScale ?? 0.12)),
          height: "auto",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />

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

        <div
          style={{
            position: "absolute",
            left: 48,
            bottom: 40,
            fontSize: 14,
            opacity: 0.6,
            color: palette?.meta || "#9ca3af",
          }}
        >
          {brandConfig?.footerText || "iamstudio.to"}
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

  const defaultPaletteKey = paletteOptions[0]?.key || "void";
  const defaultMotionKey = motionOptions[0]?.key || "void";

  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [paletteKey, setPaletteKey] = useState(defaultPaletteKey);
  const [formatKey, setFormatKey] = useState(FORMATS[0].key);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [motionKey, setMotionKey] = useState(defaultMotionKey);

  const exportRef = useRef(null);

  const selectedFormat = FORMATS.find((f) => f.key === formatKey) || FORMATS[0];
  const palette = brandColors?.[paletteKey] || {};

  async function onExportPng() {
    const dataUrl = await toPng(exportRef.current, {
      cacheBust: true,
      pixelRatio: 1,
      width: selectedFormat.width,
      height: selectedFormat.height,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${brandConfig?.slug || "brand"}_${formatKey}.png`;
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
      <section />
      <section>
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
