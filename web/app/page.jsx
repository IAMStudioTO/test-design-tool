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

// Formati (puoi aggiungerne quanti vuoi)
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

// Safe area molto semplice (puoi raffinarla più avanti)
function getSafeArea(formatKey, w, h) {
  // esempio: story/reel più “safe” ai bordi
  if (formatKey.includes("9_16")) {
    const padX = Math.round(w * 0.06);
    const padY = Math.round(h * 0.08);
    return { x: padX, y: padY, w: w - padX * 2, h: h - padY * 2 };
  }
  // default: nessuna safe area
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
  // colorsObj: { void: {...}, signal: {...} } ecc.
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

  // ✅ Font styles dal Brand
  const headlineFontStyle = {
    fontFamily: `"${brandFonts?.headline?.family || "OMNI Display"}", system-ui, -apple-system, sans-serif`,
    fontWeight: brandFonts?.headline?.weight ?? 600,
    letterSpacing: `${brandFonts?.headline?.letterSpacing ?? 0}px`,
  };

  const subheadlineFontStyle = {
    fontFamily: `"${brandFonts?.subheadline?.family || "OMNI Mono"}", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
    fontWeight: brandFonts?.subheadline?.weight ?? 400,
    letterSpacing: `${brandFonts?.subheadline?.letterSpacing ?? 0}px`,
  };

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 24,
        overflow: "hidden",
        background: palette?.background || "#0b0f19",
        color: palette?.headline || "#ffffff",
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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

  const paletteOptions = useMemo(
    () => paletteOptionsFromBrandColors(brandColors),
    []
  );

  const motionOptions = useMemo(
    () => motionOptionsFromBrandMotion(brandMotion),
    []
  );

  const defaultPaletteKey = paletteOptions[0]?.key || "void";
  const defaultMotionKey = motionOptions[0]?.key || "void";

  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [paletteKey, setPaletteKey] = useState(defaultPaletteKey);
  const [formatKey, setFormatKey] = useState(FORMATS[0].key);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [motionKey, setMotionKey] = useState(defaultMotionKey);

  const [mp4State, setMp4State] = useState({
    loading: false,
    phase: "",
    error: "",
  });

  const canvasRef = useRef(null);

  const selectedFormat = useMemo(() => {
    return FORMATS.find((f) => f.key === formatKey) || FORMATS[0];
  }, [formatKey]);

  const palette = useMemo(() => {
    return brandColors?.[paletteKey] || {};
  }, [paletteKey]);

  async function onExportPng() {
    setMp4State((s) => ({ ...s, error: "" }));
    if (!canvasRef.current) return;

    const dataUrl = await toPng(canvasRef.current, {
      cacheBust: true,
      pixelRatio: 2,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${brandConfig?.slug || "brand"}_${formatKey}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function onExportMp4() {
    setMp4State({ loading: true, phase: "starting", error: "" });

    try {
      const payload = {
        headline,
        subheadline,
        paletteKey,
        motionStyle: motionKey,
      };

      const startRes = await fetch(`${RENDER_URL}/render/mp4/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!startRes.ok) {
        throw new Error(`Start MP4 failed (${startRes.status})`);
      }

      const { jobId } = await startRes.json();
      if (!jobId) throw new Error("No jobId returned");

      // polling
      const poll = async () => {
        const statusRes = await fetch(`${RENDER_URL}/render/mp4/status/${jobId}`);
        if (!statusRes.ok) throw new Error(`Status failed (${statusRes.status})`);

        const data = await statusRes.json();
        const job = data?.job;

        if (!job) throw new Error("Invalid status payload");

        if (job.status === "error") {
          throw new Error(job.error || "Render error");
        }

        if (job.status === "done") {
          return "done";
        }

        setMp4State({ loading: true, phase: job.phase || "working", error: "" });
        return "continue";
      };

      const startTime = Date.now();
      const TIMEOUT_MS = 10 * 60 * 1000; // 10 min

      while (true) {
        if (Date.now() - startTime > TIMEOUT_MS) {
          throw new Error("Timeout MP4 render");
        }

        const r = await poll();
        if (r === "done") break;

        // attesa breve
        await new Promise((res) => setTimeout(res, 1200));
      }

      setMp4State({ loading: true, phase: "downloading", error: "" });

      const fileRes = await fetch(`${RENDER_URL}/render/mp4/download/${jobId}`);
      if (!fileRes.ok) throw new Error(`Download failed (${fileRes.status})`);

      const blob = await fileRes.blob();
      downloadBlob(blob, `${brandConfig?.slug || "brand"}_${formatKey}.mp4`);

      setMp4State({ loading: false, phase: "", error: "" });
    } catch (e) {
      setMp4State({ loading: false, phase: "", error: e?.message || "MP4 error" });
    }
  }

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "420px 1fr",
        gap: 24,
        padding: 24,
        alignItems: "start",
      }}
    >
      {/* LEFT PANEL */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Contenuti</h2>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Headline
        </label>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value.slice(0, HEADLINE_MAX))}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #d1d5db",
          }}
        />
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6, marginBottom: 14 }}>
          {headline.length}/{HEADLINE_MAX} caratteri
        </div>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Subheadline
        </label>
        <textarea
          value={subheadline}
          onChange={(e) => setSubheadline(e.target.value.slice(0, SUBHEADLINE_MAX))}
          rows={3}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #d1d5db",
          }}
        />
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6, marginBottom: 14 }}>
          {subheadline.length}/{SUBHEADLINE_MAX} caratteri
        </div>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Palette colore
        </label>
        <select
          value={paletteKey}
          onChange={(e) => setPaletteKey(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #d1d5db",
            marginBottom: 14,
          }}
        >
          {paletteOptions.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Destinazione
        </label>
        <select
          value={formatKey}
          onChange={(e) => setFormatKey(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #d1d5db",
            marginBottom: 10,
          }}
        >
          {Object.entries(formatsByGroup).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.name} — {f.width}×{f.height}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Motion preset
        </label>
        <select
          value={motionKey}
          onChange={(e) => setMotionKey(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #d1d5db",
            marginBottom: 10,
          }}
        >
          {motionOptions.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <input
            type="checkbox"
            checked={showSafeArea}
            onChange={(e) => setShowSafeArea(e.target.checked)}
          />
          Mostra safe area
        </label>

        <button
          onClick={onExportPng}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #111827",
            background: "#111827",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Esporta PNG
        </button>

        <button
          onClick={onExportMp4}
          disabled={mp4State.loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #111827",
            background: "#fff",
            color: "#111827",
            fontWeight: 700,
            cursor: mp4State.loading ? "not-allowed" : "pointer",
            marginTop: 10,
          }}
        >
          {mp4State.loading ? `Export MP4… (${mp4State.phase || "..."})` : "Esporta MP4"}
        </button>

        {mp4State.error ? (
          <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 13 }}>
            Errore export MP4: {mp4State.error}
          </div>
        ) : null}

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
          Backend: {RENDER_URL}
        </div>
      </section>

      {/* RIGHT PREVIEW */}
      <section style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            ref={canvasRef}
            style={{
              transform: "scale(0.8)",
              transformOrigin: "top center",
            }}
          >
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
        </div>
      </section>
    </main>
  );
}
