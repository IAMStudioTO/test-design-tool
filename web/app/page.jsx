"use client";

import { useMemo, useState } from "react";

import brandFonts from "../../Brand/fonts.json";
import brandColors from "../../Brand/colors.json";

export default function Page() {
  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [paletteKey, setPaletteKey] = useState(Object.keys(brandColors)[0] || "void");

  const palette = useMemo(() => {
    return brandColors[paletteKey] || {};
  }, [paletteKey]);

  const headlineStyle = useMemo(() => {
    return {
      fontFamily: `"${brandFonts.headline.family}", system-ui, -apple-system, sans-serif`,
      fontWeight: brandFonts.headline.weight ?? 600,
      letterSpacing: (brandFonts.headline.letterSpacing ?? 0) + "px",
    };
  }, []);

  const subheadlineStyle = useMemo(() => {
    return {
      fontFamily: `"${brandFonts.subheadline.family}", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
      fontWeight: brandFonts.subheadline.weight ?? 400,
      letterSpacing: (brandFonts.subheadline.letterSpacing ?? 0) + "px",
    };
  }, []);

  return (
    <main style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 24, padding: 24 }}>
      <section style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Contenuti</h2>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Headline</label>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db", marginBottom: 16 }}
        />

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Subheadline</label>
        <textarea
          value={subheadline}
          onChange={(e) => setSubheadline(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db", marginBottom: 16 }}
        />

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Palette colore</label>
        <select
          value={paletteKey}
          onChange={(e) => setPaletteKey(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db" }}
        >
          {Object.keys(brandColors).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </section>

      <section
        style={{
          borderRadius: 24,
          padding: 48,
          minHeight: 520,
          background: palette.background || "#0b0f17",
          color: palette.text || "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ opacity: 0.6, fontSize: 14, marginBottom: 24 }}>TEMPLATE 01</div>

        {/* ✅ Headline = Grotesk */}
        <h1 style={{ ...headlineStyle, margin: 0, fontSize: 72, lineHeight: 1.05 }}>
          {headline}
        </h1>

        {/* ✅ Subheadline = Mono */}
        <p style={{ ...subheadlineStyle, marginTop: 16, marginBottom: 0, fontSize: 24, opacity: 0.85 }}>
          {subheadline}
        </p>

        <div style={{ marginTop: 48, fontSize: 14, opacity: 0.6 }}>iamstudio.to</div>
      </section>
    </main>
  );
}
