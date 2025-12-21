"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

// ✅ BRAND (single-tenant)
import brandConfig from "../../Brand/brand.config.json";
import brandColors from "../../Brand/colors.json";
import brandFonts from "../../Brand/fonts.json";

const HEADLINE_MAX = 40;
const SUBHEADLINE_MAX = 90;

const FORMATS = [
  { key: "ig_post_1_1", name: "Instagram Post (1:1)", width: 1080, height: 1080 },
  { key: "ig_story_9_16", name: "Instagram Stories / Reels (9:16)", width: 1080, height: 1920 }
];

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
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

function cssFontFamily(family) {
  // Supporta font con spazi e fallback
  if (!family) return "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
  return `${family}, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
}

function TemplateCanvas({ width, height, palette, headline, subheadline, fonts }) {
  const shortSide = Math.min(width, height);
  const basePad = Math.round(shortSide * 0.074);
  const metaSize = Math.round(shortSide * 0.026);
  const headlineSize = Math.round(shortSide * 0.081);
  const subheadlineSize = Math.round(shortSide * 0.033);
  const gap = Math.round(shortSide * 0.03);
  const radius = Math.round(shortSide * 0.022);

  return (
    <div
      style={{
        width,
        height,
        background: palette.background,
        borderRadius: radius,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: basePad
      }}
    >
      <div style={{ fontSize: metaSize, color: palette.subheadline, opacity: 0.7 }}>
        TEMPLATE 01
      </div>

      <div>
        <div
          style={{
            fontFamily: cssFontFamily(fonts?.headline?.family),
            fontSize: headlineSize,
            lineHeight: 1.05,
            fontWeight: fonts?.headline?.weight ?? 700,
            letterSpacing: (fonts?.headline?.letterSpacing ?? 0) + "px",
            color: palette.headline,
            wordBreak: "break-word"
          }}
        >
          {headline}
        </div>

        <div
          style={{
            marginTop: gap,
            fontFamily: cssFontFamily(fonts?.subheadline?.family),
            fontSize: subheadlineSize,
            fontWeight: fonts?.subheadline?.weight ?? 400,
            letterSpacing: (fonts?.subheadline?.letterSpacing ?? 0) + "px",
            color: palette.subheadline,
            wordBreak: "break-word"
          }}
        >
          {subheadline}
        </div>
      </div>

      <div style={{ fontSize: metaSize, color: palette.subheadline, opacity: 0.6 }}>
        iamstudio.to
      </div>
    </div>
  );
}

export default function Home() {
  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [formatKey, setFormatKey] = useState("ig_post_1_1");

  // ✅ palette brand-driven
  const paletteKeys = Object.keys(brandColors);
  const [paletteKey, setPaletteKey] = useState(brandConfig.defaultPalette || paletteKeys[0]);

  const [isExportingPng, setIsExportingPng] = useState(false);

  const [isExportingMp4, setIsExportingMp4] = useState(false);
  const [mp4Status, setMp4Status] = useState("");
  const [mp4Error, setMp4Error] = useState("");

  const selectedFormat = useMemo(() => {
    return FORMATS.find((f) => f.key === formatKey) || FORMATS[0];
  }, [formatKey]);

  const palette = useMemo(() => {
    return brandColors[paletteKey] || brandColors[paletteKeys[0]];
  }, [paletteKey, paletteKeys]);

  const previewMax = 540;
  const previewScale = useMemo(() => {
    const longSide = Math.max(selectedFormat.width, selectedFormat.height);
    return previewMax / longSide;
  }, [selectedFormat.width, selectedFormat.height]);

  const exportRef = useRef(null);

  const exportPng = async () => {
    if (!exportRef.current) return;
    try {
      setIsExportingPng(true);
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 1 });
      downloadDataUrl(dataUrl, `template01_${formatKey}_${paletteKey}.png`);
    } finally {
      setIsExportingPng(false);
    }
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const exportMp4 = async () => {
    try {
      setMp4Error("");
      setMp4Status("");
      setIsExportingMp4(true);

      const baseUrl = process.env.NEXT_PUBLIC_RENDER_URL || "http://localhost:3000";

      setMp4Status("Avvio render…");
      const startRes = await fetch(`${baseUrl}/render/mp4/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, subheadline, paletteKey })
      });

      if (!startRes.ok) throw new Error(`Errore export MP4 (${startRes.status})`);

      const { jobId } = await startRes.json();
      if (!jobId) throw new Error("Job ID mancante");

      for (let i = 0; i < 120; i++) {
        const stRes = await fetch(`${baseUrl}/render/mp4/status/${jobId}`);
        const st = await stRes.json();
        const status = st?.job?.status;
        const phase = st?.job?.phase;

        setMp4Status(
          phase === "bundling"
            ? "Preparazione template…"
            : phase === "compositions"
            ? "Preparazione scene…"
            : phase === "rendering"
            ? "Rendering video…"
            : "In coda…"
        );

        if (status === "done") {
          setMp4Status("Download…");
          const dlRes = await fetch(`${baseUrl}/render/mp4/download/${jobId}`);
          const blob = await dlRes.blob();
          downloadBlob(blob, `template01_${paletteKey}.mp4`);
          setMp4Status("Fatto ✅");
          return;
        }

        if (status === "error") throw new Error(st?.job?.error || "Errore rendering");

        await sleep(2000);
      }

      throw new Error("Timeout: riprova.");
    } catch (e) {
      setMp4Error(e?.message || "Errore sconosciuto");
      setMp4Status("");
    } finally {
      setIsExportingMp4(false);
    }
  };

  return (
    <main
      style={{
        fontFamily: "system-ui",
        padding: 24,
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: 24,
        alignItems: "start"
      }}
    >
      <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Contenuti — {brandConfig.name}</h2>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Headline</label>
          <input
            value={headline}
            maxLength={HEADLINE_MAX}
            onChange={(e) => setHeadline(e.target.value)}
            style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Subheadline</label>
          <textarea
            value={subheadline}
            maxLength={SUBHEADLINE_MAX}
            onChange={(e) => setSubheadline(e.target.value)}
            rows={3}
            style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db", resize: "none" }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Palette colore (Brand)</label>
          <select
            value={paletteKey}
            onChange={(e) => setPaletteKey(e.target.value)}
            style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
          >
            {paletteKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Destinazione</label>
          <select
            value={formatKey}
            onChange={(e) => setFormatKey(e.target.value)}
            style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
          >
            {FORMATS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.name} — {f.width}×{f.height}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={exportPng}
          disabled={isExportingPng || isExportingMp4}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "white",
            fontWeight: 600
          }}
        >
          {isExportingPng ? "Esportazione..." : "Esporta PNG"}
        </button>

        <button
          onClick={exportMp4}
          disabled={isExportingMp4 || isExportingPng}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #111827",
            background: "white",
            color: "#111827",
            fontWeight: 600
          }}
        >
          {isExportingMp4 ? "Render in corso..." : "Esporta MP4"}
        </button>

        {mp4Status ? <div style={{ marginTop: 10, fontSize: 12 }}>{mp4Status}</div> : null}
        {mp4Error ? <div style={{ marginTop: 10, fontSize: 12, color: "#b91c1c" }}>{mp4Error}</div> : null}
      </section>

      <section style={{ overflow: "auto" }}>
        <div style={{ display: "inline-block", transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
          <TemplateCanvas
            width={selectedFormat.width}
            height={selectedFormat.height}
            palette={palette}
            fonts={brandFonts}
            headline={headline}
            subheadline={subheadline}
          />
        </div>

        <div style={{ position: "absolute", left: -100000, top: 0 }}>
          <div ref={exportRef}>
            <TemplateCanvas
              width={selectedFormat.width}
              height={selectedFormat.height}
              palette={palette}
              fonts={brandFonts}
              headline={headline}
              subheadline={subheadline}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
