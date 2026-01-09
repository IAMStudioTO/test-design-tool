import brandFonts from "../../../../Brand/fonts.json";

export default function Template04({
  width,
  height,
  palette,
  content,
  brand,
  render,
}) {
  // ✅ render di default = identity (design preview)
  const r = render || {
    meta: (n) => n,
    headline: (n) => n,
    subheadline: (n) => n,
    body: (n) => n,
    accent: (n) => n,
    logo: (n) => n,
  };

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
    <div
      style={{
        width,
        height,
        background: palette?.background || "#0b0f19",
        color: palette?.headline || "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ACCENT BLOB */}
      {r.accent(
        <div
          style={{
            position: "absolute",
            right: -180,
            top: -180,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: palette?.accent || "#7C3AED",
            opacity: 0.18,
          }}
        />
      )}

      <div style={{ padding: 64 }}>
        {/* META */}
        {r.meta(
          <div style={{ fontSize: 14, opacity: 0.65, color: palette?.meta || "#9ca3af" }}>
            {brand?.templateLabel || "TEMPLATE 04"}
          </div>
        )}

        {/* HEADLINE */}
        {r.headline(
          <h1
            style={{
              ...H,
              margin: "120px 0 0 0",
              fontSize: Math.round(width * 0.076),
              lineHeight: 1.02,
            }}
          >
            {content?.headline}
          </h1>
        )}

        {/* SUBHEADLINE */}
        {r.subheadline(
          <p
            style={{
              ...S,
              margin: "14px 0 0 0",
              fontSize: Math.round(width * 0.025),
              color: palette?.subheadline || "#e5e7eb",
            }}
          >
            {content?.subheadline}
          </p>
        )}

        {/* BODY */}
        {r.body(
          <div
            style={{
              ...S,
              marginTop: 22,
              fontSize: Math.round(width * 0.018),
              lineHeight: 1.4,
              color: palette?.subheadline || "#cbd5e1",
              maxWidth: Math.round(width * 0.72),
            }}
          >
            {content?.body}
          </div>
        )}

        {/* LOGO */}
        {r.logo(
          <div style={{ position: "absolute", left: 48, bottom: 40, opacity: 0.6 }}>
            <img
              src={brand?.footerLogoSrc || "/brand/logo.svg"}
              alt="Brand logo"
              style={{ height: 14, width: "auto" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
