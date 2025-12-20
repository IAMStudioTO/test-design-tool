export const metadata = {
  title: "Branded Creative Tool",
  description: "Branded Creative Tool – MVP"
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
