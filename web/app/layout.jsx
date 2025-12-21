export const metadata = {
  title: "Branded Creative Tool",
  description: "Brand-safe creative generator"
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        {/* ✅ Carica i font (Google Fonts) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
