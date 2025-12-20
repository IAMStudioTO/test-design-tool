"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";

const HEADLINE_MAX = 40;
const SUBHEADLINE_MAX = 90;

const PALETTES = {
  dark: {
    name: "Dark",
    background: "#0b0f19",
    headline: "#ffffff",
    subheadline: "#e5e7eb",
    meta: "#9ca3af"
  },
  blue: {
    name: "Blue",
    background: "#0a2540",
    headline: "#ffffff",
    subheadline: "#dbeafe",
    meta: "#93c5fd"
  },
  light: {
    name: "Light",
    background: "#f9fafb",
    headline: "#0b0f19",
    subheadline: "#374151",
    meta: "#6b7280"
  }
};

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export default function Home() {
  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [paletteKey, setPaletteKey] = useState("dark");
  const [isExporting, setIsExporting] = useState(false);

  const palette = PALETTES[paletteKey];
  const canvasRef = useRef(null);

  const exportPng = async () => {
    if (!canvasRef.current) return;

    try {
      setIsExporting(true);

      // 1080x1080 già in CSS.
      // pixelRatio 1 = 1080px effettivi; 2 = 2160px (più nitido).
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 1
      });

      downloadDataUrl(
        dataUrl,
        `template01_${paletteKey}.png`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main
      style={{
        fontFamily: "system-ui",
        padding: 24,
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: 24,
        alignItems: "start"
      }}
    >
      {/* Pannello controlli */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>Contenuti</h2>

        {/* Headline */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Headline</label>
          <input
            value={headline}
            maxLength={HEADLINE_MAX}
            onChange={(e) => setHeadline(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #d1d5db"
            }}
          />
          <div style={{ fontSize: 11, marginTop: 4, color: "#6b7280" }}>
            {headline.length}/{HEADLINE_MAX} caratteri
          </div>
        </div>

        {/* Subheadline */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Subheadline</label>
          <textarea
            value={subheadline}
            maxLength={SUBHEADLINE_MAX}
            onChange={(e) => setSubheadline(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              marginTop: 4,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              resize: "none"
            }}
          />
          <div style={{ fontSize: 11, marginTop: 4, color: "#6b7280" }}>
            {subheadline.length}/{SUBHEADLINE_MAX} caratteri
          </div>
        </div>

        {/* Palette */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Palette colore</label>
          <select
            value={paletteKey}
            onChange={(e) => setPaletteKey(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #d1d5db"
            }}
          >
            {Object.entries(PALETTES).map(([key, p]) => (
              <option key={key} value={key}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Export */}
        <button
          onClick={exportPng}
          disabled={isExporting}
          style={{
            marginTop: 24,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: isExporting ? "#6b7280" : "#111827",
            color: "white",
            fontWeight: 600,
            cursor: isExporting ? "not-allowed" : "pointer"
          }}
        >
          {isExporting ? "Esportazione..." : "Esporta PNG (1080×1080)"}
        </button>

        <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
          Nota: l’export è client-side (browser).
        </div>
      </section>

      {/* Canvas 1080×1080 */}
      <section style={{ overflow: "auto" }}>
        <div
          ref={canvasRef}
          style={{
            width: 1080,
            height: 1080,
            background: palette.background,
            borderRadius: 24,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
          }}
        >
          <div style={{ fontSize: 28, color: palette.meta }}>TEMPLATE 01</div>

          <div>
            <div
              style={{
                fontSize: 88,
                lineHeight: 1.05,
                fontWeight: 700,
                color: palette.headline,
                wordBreak: "break-word"
              }}
            >
              {headline}
            </div>

            <div
              style={{
                marginTop: 32,
                fontSize: 36,
                color: palette.subheadline,
                wordBreak: "break-word"
              }}
            >
              {subheadline}
            </div>
          </div>

          <div style={{ fontSize: 28, color: palette.meta }}>iamstudio.to</div>
        </div>
      </section>
    </main>
  );
}
