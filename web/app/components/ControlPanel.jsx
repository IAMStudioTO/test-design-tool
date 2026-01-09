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

  motionKeys,
  motionKey,
  setMotionKey,

  previewMode,
  setPreviewMode,

  onExportPng,
  onExportMp4,

  // opzionale: se in futuro vuoi mostrare loading/error MP4
  mp4State,
}) {
  // ✅ default “safe” per evitare crash in prerender/build
  const safeMp4State = mp4State || { loading: false, phase: "", error: "" };

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
          type="button"
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
          type="button"
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

      <label style={labelStyle}>Colore</label>
      <select
        value={paletteKey}
        onChange={(e) => setPaletteKey(e.target.value)}
        style={inputStyle}
      >
        {paletteKeys.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <label style={labelStyle}>Motion</label>
      <select
        value={motionKey}
        onChange={(e) => setMotionKey(e.target.value)}
        style={inputStyle}
      >
        {motionKeys.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <label style={labelStyle}>Heading</label>
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        style={inputStyle}
      />

      <label style={labelStyle}>Sub heading</label>
      <textarea
        value={subheadline}
        onChange={(e) => setSubheadline(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      <label style={labelStyle}>Corpo</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      <hr style={dividerStyle} />

      <button type="button" onClick={onExportPng} style={primaryButtonStyle}>
        Esporta PNG
      </button>

      <button
        type="button"
        onClick={onExportMp4}
        disabled={safeMp4State.loading}
        style={{
          ...secondaryButtonStyle,
          opacity: safeMp4State.loading ? 0.6 : 1,
          cursor: safeMp4State.loading ? "not-allowed" : "pointer",
        }}
      >
        {safeMp4State.loading ? `Export MP4… ${safeMp4State.phase ? `(${safeMp4State.phase})` : ""}` : "Esporta MP4"}
      </button>

      {safeMp4State.error ? (
        <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 14 }}>
          Errore MP4: {safeMp4State.error}
        </div>
      ) : null}
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
