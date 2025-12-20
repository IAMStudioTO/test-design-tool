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

export default function Home() {
  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [paletteKey, setPaletteKey] = useState("dark");

  const palette = PALETTES[paletteKey];
  const canvasRef = useRef(null);

  const exportPng = async () => {
    if (!canvasRef.current) return;

    const dataUrl = await toPng(canvasRef.current, {
      pixelRatio: 2
    });

    const link = document.createElement("a");
    link.download = "branded-template.png";
    link.href = dataUrl;
    link.click();
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
          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Palette colore
          </label>
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
          style={{
            marginTop: 24,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "white",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Esporta PNG
        </button>
      </section>

      {/* Canvas */}
      <section>
        <div
          ref={canvasRef}
          style={{
            width: 1080,
            height: 1080,
            background: palette.background,
            borderRadius: 24,
            padding: 80,
            color: palette.headline,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ fontSize: 28, color: palette.meta }}>
            TEMPLATE 01
          </div>

          <div>
            <div
              style={{
                fontSize: 88,
                lineHe

