import "../../Brand/fonts.css";

export const metadata = {
  title: "Branded Creative Tool",
  description: "Brand-safe creative generator"
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head />
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
