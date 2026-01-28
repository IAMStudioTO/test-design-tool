export const metadata = {
  title: "Test Design Tool",
  description: "Figma → editable layers → motion → render"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        }}
      >
        {children}
      </body>
    </html>
  );
}
