"use client";

import { useMemo, useRef, useState } from "react";
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

const FORMATS = [
  { key: "ig_post_1_1", group: "Instagram", name: "Instagram Post (1:1)", width: 1080, height: 1080 },
  { key: "ig_post_4_5", group: "Instagram", name: "Instagram Post (4:5)", width: 1080, height: 1350 },
  { key: "ig_story_9_16", group: "Instagram", name: "Instagram Stories / Reels (9:16)", width: 1080, height: 1920 },

  { key: "fb_post_1_1", group: "Facebook", name: "Facebook Post (1:1)", width: 1080, height: 1080 },
  { key: "fb_link_1_91_1", group: "Facebook", name: "Facebook Link (1.91:1)", width: 1200, height: 628 },
  { key: "fb_cover_page", group: "Facebook", name: "Facebook Page Cover", width: 820, height: 312 },
  { key: "fb_story_9_16", group: "Facebook", name: "Facebook Stories / Reels (9:16)", width: 1080, height: 1920 },

  { key: "yt_thumb_16_9", group: "YouTube", name: "YouTube Thumbnail (16:9)", width: 1280, height: 720 },
  { key: "yt_shorts_9_16", group: "YouTube", name: "YouTube Shorts (9:16)", width: 1080, height: 1920 },
  { key: "yt_channel_banner", group: "YouTube", name: "YouTube Channel Banner", width: 2560, height: 1440 },

  { key: "li_post_1_1", group: "LinkedIn", name: "LinkedIn Post (1:1)", width: 1080, height: 1080 },
  { key: "li_link_1_91_1", group: "LinkedIn", name: "LinkedIn Link (1.91:1)", width: 1200, height: 627 },
  { key: "li_profile_banner", group: "LinkedIn", name: "LinkedIn Profile Banner", width: 1128, height: 191 },
  { key: "li_company_banner", group: "LinkedIn", name: "LinkedIn Company Banner", width: 1584, height: 396 },

  { key: "tt_video_9_16", group: "TikTok", name: "TikTok Video (9:16)", width: 1080, height: 1920 },

  { key: "x_post_16_9", group: "X (Twitter)", name: "X Post (16:9)", width: 1200, height: 675 },
  { key: "x_video_16_9", group: "X (Twitter)", name: "X Video (16:9)", width: 1600, height: 900 },

  { key: "meta_feed_1_1", group: "META Ads", name: "META Feed Ad (1:1)", width: 1080, height: 1080 },
  { key: "meta_feed_4_5", group: "META Ads", name: "META Feed Ad (4:5)", width: 1080, height: 1350 },
  { key: "meta_stories_9_16", group: "META Ads", name: "META Stories / Reels Ad (9:16)", width: 1080, height: 1920 },
  { key: "meta_link_1_91_1", group: "META Ads", name: "META Link Ad (1.91:1)", width: 1200, height: 628 },
  { key: "meta_carousel_1_1", group: "META Ads", name: "META Carousel Card (1:1)", width: 1080, height: 1080 },
  { key: "meta_carousel_4_5", group: "META Ads", name: "META Carousel Card (4:5)", width: 1080, height: 1350 },
  { key: "meta_collection_cover_1_1", group: "META Ads", name: "META Collection Cover (1:1)", width: 1080, height: 1080 },
  { key: "meta_messenger_1_1", group: "META Ads", name: "META Messenger Inbox Ad (1:1)", width: 1080, height: 1080 },
  { key: "meta_right_column_1_91_1", group: "META Ads", name: "META Right Column Ad (1.91:1)", width: 1200, height: 628 },
  { key: "meta_instant_experience_9_16", group: "META Ads", name: "META Instant Experience (9:16)", width: 1080, height: 1920 }
];

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function isNineSixteen(width, height) {
  return width === 1080 && height === 1920;
}

/**
 * Safe area 9:16 (valori in px su 1080x1920).
 * Questi sono valori "protettivi" per evitare UI overlay (username/top, CTA/bottom).
 * Li affiniamo nello step successivo se vuoi.
 */
function safeAreaForFormat(width, height) {
  if (isNineSixteen(width, height)) {
    return { top: 250, right: 60, bottom: 330, left: 60 };
  }
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

function TemplateCanvas({
  width,
  height,
  palette,
  headline,
  subheadline,
  showSafeAreaOverlay
}) {
  const shortSide = Math.min(width, height);
  const basePad = Math.round(shortSide * 0.074); // ~80px su 1080
  const metaSize = Math.round(shortSide * 0.026); // ~28px su 1080
  const headlineSize = Math.round(shortSide * 0.081); // ~88px su 1080
  const subheadlineSize = Math.round(shortSide * 0.033); // ~36px su 1080
  const gap = Math.round(shortSide * 0.03); // ~32px su 1080
  const radius = Math.round(shortSide * 0.022); // ~24px su 1080

  const safe = safeAreaForFormat(width, height);

  // Padding effettivo = padding base + safe area (protegge sempre il contenuto)
  const padTop = basePad + safe.top;
  const padRight = basePad + safe.right;
  const padBottom = basePad + safe.bottom;
  const padLeft = basePad + safe.left;

  const safeRect = {
    x: safe.left,
    y: safe.top,
    w: width - safe.left - safe.right,
    h: height - safe.top - safe.bottom
  };

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
        position: "relative",
        overflow: "hidden",
        paddingTop: padTop,
        paddingRight: padRight,
        paddingBottom: padBottom,
        paddingLeft: padLeft
      }}
    >
      {/* Overlay safe area (solo preview, non modifica export) */}
      {showSafeAreaOverlay && (safe.top || safe.right || safe.bottom || safe.left) ? (
        <>
          <div
            style={{
              position: "absolute",
              left: safeRect.x,
              top: safeRect.y,
              width: safeRect.w,
              height: safeRect.h,
              border: "3px dashed rgba(255,255,255,0.55)",
              borderRadius: 16,
              pointerEvents: "none"
            }}
          />
          <div
            style={{
              position: "absolute",
              left: safeRect.x + 16,
              top: safeRect.y + 12,
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              pointerEvents: "none"
            }}
          >
            SAFE AREA
          </div>
        </>
      ) : null}

      <div style={{ fontSize: metaSize, color: palette.meta }}>TEMPLATE 01</div>

      <div>
        <div
          style={{
            fontSize: headlineSize,
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
            marginTop: gap,
            fontSize: subheadlineSize,
            color: palette.subheadline,
            wordBreak: "break-word"
          }}
        >
          {subheadline}
        </div>
      </div>

      <div style={{ fontSize: metaSize, color: palette.meta }}>iamstudio.to</div>
    </div>
  );
}

export default function Home() {
  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [paletteKey, setPaletteKey] = useState("dark");
  const [formatKey, setFormatKey] = useState("ig_post_1_1");
  const [isExporting, setIsExporting] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);

  const palette = PALETTES[paletteKey];

  const selectedFormat = useMemo(() => {
    return FORMATS.find((f) => f.key === formatKey) || FORMATS[0];
  }, [formatKey]);

  const previewMax = 540;
  const previewScale = useMemo(() => {
    const longSide = Math.max(selectedFormat.width, selectedFormat.height);
    return previewMax / longSide;
  }, [selectedFormat.width, selectedFormat.height]);

  const exportRef = useRef(null);

  const exportPng = async () => {
    if (!exportRef.current) return;

    try {
      setIsExporting(true);
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 1 });
      const filename = `template01_${selectedFormat.key}_${paletteKey}.png`;
      downloadDataUrl(dataUrl, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const groupedFormats = useMemo(() => {
    const map = new Map();
    for (const f of FORMATS) {
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group).push(f);
    }
    return Array.from(map.entries());
  }, []);

  const safe = safeAreaForFormat(selectedFormat.width, selectedFormat.height);
  const hasSafe = safe.top || safe.right || safe.bottom || safe.left;

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
      {/* Controls */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>Contenuti</h2>

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

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Destinazione</label>
          <select
            value={formatKey}
            onChange={(e) => setFormatKey(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #d1d5db"
            }}
          >
            {groupedFormats.map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.name} — {f.width}×{f.height}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Toggle safe area */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            id="safearea"
            type="checkbox"
            checked={showSafeArea}
            onChange={(e) => setShowSafeArea(e.target.checked)}
          />
          <label htmlFor="safearea" style={{ fontSize: 13 }}>
            Mostra safe area
          </label>
        </div>

        {hasSafe ? (
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Safe area attiva per questo formato (contenuto protetto).
          </div>
        ) : (
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Safe area non necessaria per questo formato.
          </div>
        )}

        <button
          onClick={exportPng}
          disabled={isExporting}
          style={{
            marginTop: 18,
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
          {isExporting ? "Esportazione..." : "Esporta PNG"}
        </button>
      </section>

      {/* Preview */}
      <section style={{ overflow: "auto" }}>
        <div
          style={{
            display: "inline-block",
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)"
          }}
        >
          <TemplateCanvas
            width={selectedFormat.width}
            height={selectedFormat.height}
            palette={palette}
            headline={headline}
            subheadline={subheadline}
            showSafeAreaOverlay={showSafeArea}
          />
        </div>

        {/* Canvas reale offscreen per export */}
        <div style={{ position: "absolute", left: -100000, top: 0 }}>
          <div ref={exportRef}>
            <TemplateCanvas
              width={selectedFormat.width}
              height={selectedFormat.height}
              palette={palette}
              headline={headline}
              subheadline={subheadline}
              showSafeAreaOverlay={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
