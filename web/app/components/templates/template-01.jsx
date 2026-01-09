import brandFonts from "../../../../Brand/fonts.json";
import { Slot } from "./TemplateSlots";

export default function Template01({ width, height, palette, content, brand }) {
  const headlineStyle = {
    fontFamily: `"${brandFonts?.headline?.family || "sans-serif"}"`,
    fontWeight: 700,
    fontSize: Math.round(width * 0.075),
    lineHeight: 1.03,
  };

  const subStyle = {
    fontFamily: `"${brandFonts?.subheadline?.family || "sans-serif"}"`,
    fontSize: Math.round(width * 0.028),
    lineHeight: 1.2,
  };

  const bodyStyle = {
    fontSize: Math.round(width * 0.02),
    lineHeight: 1.4,
    maxWidth: width * 0.7,
  };

  return (
    <div
      style={{
        width,
        height,
        background: palette.background,
        color: palette.headline,
        padding: 56,
        position: "relative",
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.6 }}>
        {brand.templateLabel}
      </div>

      <div style={{ marginTop: 140 }}>
        <Slot name="headline">
          <div style={headlineStyle}>{content.headline}</div>
        </Slot>

        <div style={{ marginTop: 14 }}>
          <Slot name="subheadline">
            <div style={subStyle}>{content.subheadline}</div>
          </Slot>
        </div>

        <div style={{ marginTop: 18 }}>
          <Slot name="body">
            <div style={bodyStyle}>{content.body}</div>
          </Slot>
        </div>

        <Slot name="accent">
          <div
            style={{
              marginTop: 22,
              width: 240,
              height: 6,
              background: palette.accent,
              borderRadius: 999,
            }}
          />
        </Slot>
      </div>

      <Slot name="logo">
        <div style={{ position: "absolute", left: 56, bottom: 44, opacity: 0.6 }}>
          <img src={brand.footerLogoSrc} height={14} alt="logo" />
        </div>
      </Slot>
    </div>
  );
}
