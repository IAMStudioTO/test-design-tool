import brandFonts from "../../../Brand/fonts.json";

export default function Template01({ width, height, palette, content, brand }) {
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
        overflow: "hidden",
        borderRadius: 0,
        boxShadow: "none",
        background: palette?.background || "#0b0f19",
        color: palette?.headline || "#ffffff",
        position: "relative",
      }}
    >
      <div style={{ padding: 48 }}>
        <div style={{ fontSize: 14, opacity: 0.65, color: palette?.meta || "#9ca3af" }}>
          {brand?.templateLabel || "TEMPLATE 01"}
        </div>

        <h1
          style={{
            ...headlineFontStyle,
            margin: "140px 0 0 0",
            fontSize: Math.round(width * 0.07),
            lineHeight: 1.04,
          }}
        >
          {content?.headline}
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
          {content?.subheadline}
        </p>

        <div
          style={{
            ...subheadlineFontStyle,
            margin: "18px 0 0 0",
            fontSize: Math.round(width * 0.018),
            lineHeight: 1.35,
            color: palette?.subheadline || "rgba(255,255,255,0.85)",
            maxWidth: Math.round(width * 0.72),
            opacity: 0.9,
          }}
        >
          {content?.body}
        </div>

        {/* Footer logo */}
        <div style={{ position: "absolute", left: 48, bottom: 40, opacity: 0.6 }}>
          <img
            src={brand?.footerLogoSrc || "/brand/logo.svg"}
            alt="Brand logo"
            style={{ height: 14, width: "auto", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
