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

  paletteKeys,
  paletteKey,
  setPaletteKey,

  onExportPng,
  onExportMp4,

  // preview video
  onGenerateVideoPreview,
  onClearVideoPreview,
  previewMode,
  setPreviewMode,
  videoState,
  hasVideoPreview,
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
      <h2 style={{ margin: "0 0 18px 0", fontSize: 20, fontWeight: 600 }}>
        Contenuti
      </h2>

      {/* Preview mode */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setPreviewMode("design")}
          style={{
            ...pillStyle,
            background: previewMode === "design" ? "#111827" : "#fff",
            color: previewMode === "design" ? "#fff" : "#111827",
          }}
        >
          Preview design
        </button>
        <button
          onClick={() => setPreviewMode("video")}
          style={{
            ...pillStyle,
            background: previewMode === "video" ? "#111827" : "#fff",
            color: previewMode === "video" ? "#fff" : "#111827",
          }}
        >
          Preview video
        </button>
      </div>

      {/* TEMPLATE */}
      <label style={labelStyle}>Template</label>
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} style={inputStyle}>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {/* COLORE */}
      <label style={labelStyle}>Colore</label>
      <select value={paletteKey} onChange={(e) => setPaletteKey(e.target.value)} style={inputStyle}>
        {paletteKeys.map((k) => (
          <option key={k} value={k}>
            {k}
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

      {/* VIDEO PREVIEW ACTIONS */}
      <button
        onClick={onGenerateVideoPreview}
        disabled={videoState.loading}
        style={{
          ...secondaryButtonStyle,
          opacity: videoState.loading ? 0.6 : 1,
          cursor: videoState.loading ? "not-allowed" : "pointer",
          marginTop: 0,
        }}
      >
        {videoState.loading ? `Genero anteprima… ${videoState.phase ? `(${videoState.phase})` : ""}` : "Genera anteprima video"}
      </button>

      <button
        onClick={onClearVideoPreview}
        disabled={!hasVideoPreview && previewMode !== "video"}
        style={{
          ...ghostButtonStyle,
          opacity: !hasVideoPreview && previewMode !== "video" ? 0.5 : 1,
          cursor: !hasVideoPreview && previewMode !== "video" ? "not-allowed" : "pointer",
        }}
      >
        Chiudi / reset anteprima
      </button>

      {videoState.error ? (
        <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 14 }}>
          Errore preview: {videoState.error}
        </div>
      ) : null}

      <hr style={dividerStyle} />

      {/* EXPORT */}
      <button onClick={onExportPng} style={primaryButtonStyle}>
        Esporta PNG
      </button>

      <button onClick={onExportMp4} style={secondaryButtonStyle}>
        Esporta MP4
      </button>
    </section>
  );
}

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
  margin: "18px 0",
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
  cursor: "pointer",
};

const ghostButtonStyle = {
  width: "100%",
  marginTop: 10,
  padding: "12px",
  fontSize: 15,
  fontWeight: 600,
  borderRadius: 14,
  border: "1px solid rgba(17,24,39,0.25)",
  background: "rgba(17,24,39,0.03)",
  color: "#111827",
};

const pillStyle = {
  flex: 1,
  padding: "10px 12px",
  fontSize: 14,
  fontWeight: 700,
  borderRadius: 999,
  border: "1px solid #111827",
  cursor: "pointer",
};
