"use client";

export default function ControlPanel({
  templates,
  templateId,
  setTemplateId,

  headline,
  setHeadline,
  subheadline,
  setSubheadline,
  body,
  setBody,

  onExportPng,
  onExportMp4,
  mp4State,
}) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 24,
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* TITLE */}
      <h2
        style={{
          margin: "0 0 24px 0",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Contenuti
      </h2>

      {/* TEMPLATE */}
      <label style={labelStyle}>Template</label>
      <select
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        style={inputStyle}
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {/* HEADING */}
      <label style={labelStyle}>Heading</label>
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Inserisci il titolo"
        style={inputStyle}
      />

      {/* SUB HEADING */}
      <label style={labelStyle}>Sub heading</label>
      <textarea
        value={subheadline}
        onChange={(e) => setSubheadline(e.target.value)}
        placeholder="Inserisci il sottotitolo"
        rows={2}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      {/* BODY */}
      <label style={labelStyle}>Corpo</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Inserisci il testo del corpo"
        rows={4}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      <hr style={dividerStyle} />

      {/* EXPORT */}
      <button onClick={onExportPng} style={primaryButtonStyle}>
        Esporta PNG
      </button>

      <button
        onClick={onExportMp4}
        disabled={mp4State.loading}
        style={{
          ...secondaryButtonStyle,
          opacity: mp4State.loading ? 0.6 : 1,
          cursor: mp4State.loading ? "not-allowed" : "pointer",
        }}
      >
        {mp4State.loading ? `Export MP4…` : "Esporta MP4"}
      </button>

      {mp4State.error && (
        <div style={{ marginTop: 14, color: "#b91c1c", fontSize: 14 }}>
          Errore export MP4: {mp4State.error}
        </div>
      )}
    </section>
  );
}

/* =======================
   STYLES (UX-oriented)
   ======================= */

const labelStyle = {
  display: "block",
  fontSize: 14,
  fontWeight: 500,
  marginTop: 16,
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 16,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  outline: "none",
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "24px 0",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "14px",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 14,
  border: "none",
  background: "#111827",
  color: "#ffffff",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  width: "100%",
  marginTop: 12,
  padding: "14px",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 14,
  border: "1px solid #111827",
  background: "#ffffff",
  color: "#111827",
};
