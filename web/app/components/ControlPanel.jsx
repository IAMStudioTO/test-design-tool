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
        borderRadius: 16,
        padding: 16,
        background: "#fff",
        position: "sticky",
        top: 16,
        alignSelf: "start",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Contenuti</h2>

      <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Template</label>
      <select
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          marginBottom: 14,
        }}
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Heading</label>
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #d1d5db",
        }}
      />

      <label style={{ display: "block", fontSize: 12, marginBottom: 6, marginTop: 12 }}>
        Sub heading
      </label>
      <textarea
        value={subheadline}
        onChange={(e) => setSubheadline(e.target.value)}
        rows={2}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #d1d5db",
        }}
      />

      <label style={{ display: "block", fontSize: 12, marginBottom: 6, marginTop: 12 }}>
        Corpo
      </label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #d1d5db",
        }}
      />

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />

      <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Palette colore</label>
      <select
        value={paletteKey}
        onChange={(e) => setPaletteKey(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          marginBottom: 14,
        }}
      >
        {paletteKeys.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Motion preset</label>
      <select
        value={motionKey}
        onChange={(e) => setMotionKey(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          marginBottom: 14,
        }}
      >
        {motionKeys.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Destinazione</label>
      <select
        value={formatKey}
        onChange={(e) => setFormatKey(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          marginBottom: 14,
        }}
      >
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

      <button
        onClick={onExportPng}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #111827",
          background: "#111827",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Esporta PNG ({selectedFormat.width}×{selectedFormat.height})
      </button>

      <button
        onClick={onExportMp4}
        disabled={mp4State.loading}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #111827",
          background: "#fff",
          color: "#111827",
          fontWeight: 700,
          cursor: mp4State.loading ? "not-allowed" : "pointer",
          marginTop: 10,
        }}
      >
        {mp4State.loading ? `Export MP4… (${mp4State.phase || "..."})` : "Esporta MP4"}
      </button>

      {mp4State.error ? (
        <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 13 }}>
          Errore export MP4: {mp4State.error}
        </div>
      ) : null}

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>Backend: {renderUrl}</div>
    </section>
  );
}
