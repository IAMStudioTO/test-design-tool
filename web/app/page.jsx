export default function Home() {
  return (
    <main
      style={{
        fontFamily: "system-ui",
        padding: 24,
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: 24,
        alignItems: "start"
      }}
    >
      {/* Pannello controlli (per ora solo placeholder) */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>Contenuti</h2>
        <p style={{ marginTop: 8, color: "#4b5563", fontSize: 14 }}>
          Nel prossimo step aggiungiamo gli input (headline, subheadline, ecc.).
        </p>

        <div style={{ marginTop: 16, fontSize: 14 }}>
          <div><strong>Formato:</strong> 1080×1080</div>
          <div><strong>Template:</strong> 01 (static)</div>
        </div>
      </section>

      {/* Anteprima template */}
      <section>
        <div
          style={{
            width: 540,
            aspectRatio: "1 / 1",
            background: "#0b0f19",
            borderRadius: 24,
            padding: 40,
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.8 }}>TEMPLATE 01</div>

          <div>
            <div style={{ fontSize: 44, lineHeight: 1.05, fontWeight: 700 }}>
              Titolo di esempio
            </div>
            <div style={{ marginTop: 16, fontSize: 18, opacity: 0.9 }}>
              Sottotitolo o descrizione breve, sempre dentro le regole.
            </div>
          </div>

          <div style={{ fontSize: 14, opacity: 0.8 }}>iamstudio.to</div>
        </div>
      </section>
    </main>
  );
}
