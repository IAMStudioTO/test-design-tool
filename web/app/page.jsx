"use client";

import { useState } from "react";

const HEADLINE_MAX = 40;
const SUBHEADLINE_MAX = 90;

export default function Home() {
  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");

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

        <div style={{ marginTop: 16, fontSize: 14 }}>
          <div>
            <strong>Formato:</strong> 1080×1080
          </div>
          <div>
            <strong>Template:</strong> 01 (static)
          </div>
        </div>
      </section>

      {/* Anteprima template */}
      <section>
        <div
          style={{
            width: 540,
            aspectRatio: "1 / 1",
            background: "#0b0f19",
            borderRadius: 24,
            padding: 40,
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.8 }}>TEMPLATE 01</div>

          <div>
            <div
              style={{
                fontSize: 44,
                lineHeight: 1.05,
                fontWeight: 700,
                wordBreak: "break-word"
              }}
            >
              {headline}
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 18,
                opacity: 0.9,
                wordBreak: "break-word"
              }}
            >
              {subheadline}
            </div>
          </div>

          <div style={{ fontSize: 14, opacity: 0.8 }}>iamstudio.to</div>
        </div>
      </section>
    </main>
  );
}
