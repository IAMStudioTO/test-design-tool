import brandFonts from "../../../../Brand/fonts.json";

export default function Template01({ width, height, palette, content, brand, render }) {
  // ✅ render di default = identity (design mode)
  const r = render || {
    meta: (n) => n,
    headline: (n) => n,
    subheadline: (n) => n,
    body: (n) => n,
    accent: (n) => n,
    logo: (n) => n,
  };

  const headlineStyle = {
    fontFamily: `"${brandFonts?.headline?.family || "sans-serif"}"`,
    fontWeight: brandFonts?.headline?.weight ?? 700,
    letterSpacing: `${brandFonts?.headline?.letterSpacing ?? 0}px`,
    fontSize: Math.round(width * 0.075),
    lineHeight: 1.03,
  };

  const subStyle = {
    fontFamily: `"${brandFonts?.subheadline?.family || "sans-serif"}"`,
    fontWeight: brandFonts?.subheadline?.weight ?? 500,
    letterSpacing: `${brandFonts?.subheadline?.letterSpacing ?? 0}px`,
    fontSize: Math.round(width * 0.028),
    lineHeight: 1.2,
    color: palette?.subheadline || palette?.headline,
    opacity: 0.92,
  };

  const bodyStyle = {
    fontFamily: `"${brandFonts?.body?.family || "sans-serif"}"`,
    fontWeight: brandFonts?.body?.weight ?? 400,
    letterSpacing: `${brandFonts?.body?.letterSpacing ?? 0}px`,
    fontSize: Math.round(width * 0.02),
    lineHeight: 1.4,
    maxWidth: Math.round(width * 0.72),
    color: palette?.subheadline || palette?.headline,
    opacity: 0.9,
  };

  return (
    <div
      style={{
        width,
        height,
        background: palette?.background || "#0b0f19",
        color: palette?.headline || "#ffffff",
        padding: 56,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* META */}
      {r.meta(
        <div style={{ fontSize: 14, opacity: 0.6 }}>
          {brand?.templateLabel || "TEMPLATE"}
        </div>
      )}

      <div style={{ marginTop: 140 }}>
        {/* HEADLINE */}
        {r.headline(<div style={headlineStyle}>{content?.headline}</div>)}

        {/* SUB */}
        <div style={{ marginTop: 14 }}>
          {r.subheadline(<div style={subStyle}>{content?.subheadline}</div>)}
        </div>

        {/* BODY */}
        <div style={{ marginTop: 18 }}>
          {r.body(<div style={bodyStyle}>{content?.body}</div>)}
        </div>

        {/* ACCENT */}
        {r.accent(
          <div
            style={{
              marginTop: 22,
              width: 240,
              height: 6,
              background: palette?.accent || "#7C3AED",
              borderRadius: 999,
              opacity: 0.95,
            }}
          />
        )}
      </div>

      {/* LOGO */}
      {r.logo(
        <div style={{ position: "absolute", left: 56, bottom: 44, opacity: 0.6 }}>
          <img src={brand?.footerLogoSrc || "/brand/logo.svg"} height={14} alt="logo" />
        </div>
      )}
    </div>
  );
}
