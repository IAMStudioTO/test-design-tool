import "./brand-fonts.css";

export const metadata = {
  title: "Branded Creative Tool",
  description: "Brand-safe creative generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head />
      <body
        style={{
          margin: 0,
          fontFamily: '"OMNI Display", system-ui, -apple-system, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
