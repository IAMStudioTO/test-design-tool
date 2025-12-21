import "../../Brand/fonts.css";
import BrandFonts from "./brand-fonts";

export const metadata = {
  title: "Branded Creative Tool",
  description: "Brand-safe creative generator"
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        {/* ✅ carica i font del brand leggendo Brand/fonts.json */}
        <BrandFonts />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
