import brandFonts from "../../Brand/fonts.json";

function pickGoogleFamilies(fonts) {
  const families = new Set();
  const add = (fam) => {
    if (!fam) return;
    // metti solo famiglie “google-like”, lasciamo passare e basta
    families.add(fam.trim());
  };
  add(fonts?.headline?.family);
  add(fonts?.subheadline?.family);
  return Array.from(families);
}

function googleFontsHref(families) {
  // costruiamo una URL Google Fonts semplice
  // (wght default: 400,600,700 per test)
  const qs = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${qs}&display=swap`;
}

export default function BrandFonts() {
  const families = pickGoogleFamilies(brandFonts);
  if (families.length === 0) return null;

  const href = googleFontsHref(families);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={href} rel="stylesheet" />
    </>
  );
}
