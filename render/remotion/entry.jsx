import React from "react";
import { registerRoot } from "remotion";
import { Composition, AbsoluteFill } from "remotion";

// Brand data (single-tenant)
import brandColors from "../../Brand/colors.json";
import brandFonts from "../../Brand/fonts.json";

// Deve combaciare con i formati del frontend
const FORMATS = [
  { key: "ig_post_1_1", width: 1080, height: 1080 },
  { key: "ig_post_4_5", width: 1080, height: 1350 },
  { key: "ig_story_9_16", width: 1080, height: 1920 },

  { key: "reel_9_16", width: 1080, height: 1920 },
  { key: "yt_short_9_16", width: 1080, height: 1920 },

  { key: "li_square", width: 1080, height: 1080 },
  { key: "li_landscape", width: 1200, height: 628 },
  { key: "li_banner", width: 1128, height: 191 },

  { key: "x_post", width: 1200, height: 675 },
];

const FPS = 30;
const DURATION_IN_FRAMES = 120;

const FONT_DISPLAY = brandFonts?.headline?.family || "OMNI Display";
const FONT_MONO = brandFonts?.subheadline?.family || "OMNI Mono";

// Font via proxy (stesso dominio Render, ok in Chromium)
const FONT_CSS = `
@font-face{
  font-family:"${FONT_DISPLAY}";
  src:url("https://test-design-tool.onrender.com/fonts/omni-display") format("truetype");
  font-weight:400;
  font-style:normal;
  font-display:swap;
}
@font-face{
  font-family:"${FONT_MONO}";
  src:url("https://test-design-tool.onrender.com/fonts/omni-mono") format("truetype");
  font-weight:400;
  font-style:normal;
  font-display:swap;
}
`;

const Template01 = ({ headline, subheadline, paletteKey }) => {
  const palette = brandColors?.[paletteKey] || brandColors?.[Object.keys(brandColors)[0]] || {};

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette?.background ?? "#0b0f19",
        color: palette?.headline ?? "#ffffff",
        justifyContent: "center",
        padding: 80,
        boxSizing: "border-box",
      }}
    >
      <style>{FONT_CSS}</style>

      <div style={{ fontSize: 28, opacity: 0.6, marginBottom: 24, color: palette?.meta ?? "#9ca3af" }}>
        TEMPLATE 01
      </div>

      <div
        style={{
          fontFamily: `"${FONT_DISPLAY}", system-ui, -apple-system, sans-serif`,
          fontWeight: brandFonts?.headline?.weight ?? 600,
          letterSpacing: `${brandFonts?.headline?.letterSpacing ?? 0}px`,
          fontSize: 110,
          lineHeight: 1.05,
          marginBottom: 28,
          color: palette?.headline ?? "#fff",
        }}
      >
        {headline}
      </div>

      <div
        style={{
          fontFamily: `"${FONT_MONO}", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
          fontWeight: brandFonts?.subheadline?.weight ?? 400,
          letterSpacing: `${brandFonts?.subheadline?.letterSpacing ?? 0}px`,
          fontSize: 44,
          lineHeight: 1.25,
          color: palette?.subheadline ?? "#e5e7eb",
          opacity: 0.95,
        }}
      >
        {subheadline}
      </div>

      <div style={{ position: "absolute", left: 80, bottom: 60, opacity: 0.6, color: palette?.meta ?? "#9ca3af" }}>
        iamstudio.to
      </div>
    </AbsoluteFill>
  );
};

const Root = () => {
  return (
    <>
      {FORMATS.map((f) => (
        <Composition
          key={f.key}
          id={`Template01_${f.key}`}
          component={Template01}
          durationInFrames={DURATION_IN_FRAMES}
          fps={FPS}
          width={f.width}
          height={f.height}
          defaultProps={{
            headline: "Branded Creative Tool",
            subheadline: "Render MP4 ✅",
            paletteKey: Object.keys(brandColors)[0] || "void",
          }}
        />
      ))}
    </>
  );
};

registerRoot(Root);
