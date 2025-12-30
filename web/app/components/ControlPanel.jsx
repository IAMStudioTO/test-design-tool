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

  formatsByGroup,
  formatKey,
  setFormatKey,
  selectedFormat,

  onExportPng,
  onExportMp4,
  mp4State,
  renderUrl,
}) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 20,
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* TITLE */}
      <h2
        style={{
          margin: "0 0 20px 0",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Contenuti
      </h2>

      {/* TEMPLATE */}
      <label style={labelStyle}>Template</label>
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} style={inputStyle}>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {/* HEADING */}
      <label style={labelStyle}>Heading</label>
      <input value={headline} onChange={(e) => setHeadline(e.target.value)} style={inputStyle} />

      {/* SUB HEADING */}
      <label style={labelStyle}>Sub heading</label>
      <textarea
        value={subheadline}
        onChange={(e) => setSubheadline(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      {/* BODY */}
      <label style={labelStyle}>Corpo</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      <hr style={dividerStyle} />

      {/* PALETTE */}
      <label style={labelStyle}>Palette colore</label>
      <select value={paletteKey} onChange={(e) => setPaletteKey(e.target.value)} style={inputStyle}>
        {paletteKeys.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      {/* MOTION */}
      <label style={labelStyle}>Motion preset</label>
      <select value={motionKey} onChange={(e) => setMotionKey(e.target.value)} style={inputStyle}>
        {motionKeys.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      {/* FORMAT */}
      <label style={labelStyle}>Destinazione</label>
      <select value={formatKey} onChange={(e) => setFormatKey(e.target.value)} style={inputStyle}>
        {Object.entries(formatsByGroup).map(([group, items]) => (
          <optgroup key={group} label={group}>
            {items.map((f) => (
              <option key={f.key} value={f.key}>
                {f.name} — {f.width}×{f.height}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* EXPORT BUTTONS */}
      <button onClick={onExportPng} style={primaryButtonStyle}>
        Esporta PNG ({selectedFormat.width}×{selectedFormat.height})
      </button>

      <button onClick={onExportMp4} disabled={mp4State.loading} style={secondaryButtonStyle}>
        {mp4State.loading ? `Export MP4… (${mp4State.phase || "..."})` : "Esporta MP4"}
      </button>

      {mp4State.error && (
        <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 14 }}>
          Errore export MP4: {mp4State.error}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 13, opacity: 0.6 }}>
        Backend: {renderUrl}
      </div>
    </section>
  );
}

/* ===== STYLES ===== */

const labelStyle = {
  display: "block",
  fontSize: 14,
  fontWeight: 500,
  marginTop: 14,
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
  margin: "20px 0",
};

const primaryButtonStyle = {
  width: "100%",
  marginTop: 16,
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
  marginTop: 10,
  padding: "14px",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 14,
  border: "1px solid #111827",
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
};
