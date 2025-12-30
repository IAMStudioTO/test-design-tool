import brandFonts from "../../../Brand/fonts.json";

export default function Template02({ width, height, palette, content, brand }) {
  const H = {
    fontFamily: `"${brandFonts?.headline?.family || "OMNI Display"}", system-ui, sans-serif`,
    fontWeight: brandFonts?.headline?.weight ?? 600,
    letterSpacing: `${brandFonts?.headline?.letterSpacing ?? 0}px`,
  };
  const S = {
    fontFamily: `"${brandFonts?.subheadline?.family || "OMNI Mono"}", ui-monospace, monospace`,
    fontWeight: brandFonts?.subheadline?.weight ?? 400,
    letterSpacing: `${brandFonts?.subheadline?.letterSpacing ?? 0}px`,
  };

  return (
    <div style={{ width, height, background: palette?.background || "#0b0f19", position: "relative", overflow: "hidden" }}>
      {/* banda */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 18, height: "100%", background: palette?.accent || "#7C3AED", opacity: 0.9 }} />

      <div style={{ padding: 64, color: palette?.headline || "#fff" }}>
        <div style={{ fontSize: 14, opacity: 0.65, color: palette?.meta || "#9ca3af" }}>
          {brand?.templateLabel || "TEMPLATE 02"}
        </div>

        <h1 style={{ ...H, margin: "120px 0 0 0", fontSize: Math.round(width * 0.075), lineHeight: 1.03 }}>
          {content?.headline}
        </h1>

        <p style={{ ...S, margin: "16px 0 0 0", fontSize: Math.round(width * 0.025), color: palette?.subheadline || "#e5e7eb" }}>
          {content?.subheadline}
        </p>

        <div style={{ ...S, marginTop: 22, fontSize: Math.round(width * 0.018), lineHeight: 1.4, color: palette?.subheadline || "#cbd5e1", maxWidth: Math.round(width * 0.7) }}>
          {content?.body}
        </div>

        <div style={{ position: "absolute", left: 48, bottom: 40, opacity: 0.6 }}>
          <img src={brand?.footerLogoSrc || "/brand/logo.svg"} alt="Brand logo" style={{ height: 14, width: "auto" }} />
        </div>
      </div>
    </div>
  );
}
