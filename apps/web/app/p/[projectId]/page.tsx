async function getScene(projectId: string) {
  const res = await fetch(
    `https://test-design-tool.vercel.app/api/projects/get?projectId=${encodeURIComponent(projectId)}`,
    { cache: "no-store" }
  );
  return res.json();
}

function rgbaToCss01(bg: any) {
  if (!bg) return "transparent";
  const r = Math.round((bg.r ?? 0) * 255);
  const g = Math.round((bg.g ?? 0) * 255);
  const b = Math.round((bg.b ?? 0) * 255);
  const a = typeof bg.a === "number" ? bg.a : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function rgba255ToCss(bg: any) {
  if (!bg) return "rgba(17,17,17,1)";
  const r = typeof bg.r === "number" ? bg.r : 17;
  const g = typeof bg.g === "number" ? bg.g : 17;
  const b = typeof bg.b === "number" ? bg.b : 17;
  const a = typeof bg.a === "number" ? bg.a : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function computeLineHeightCss(lineHeight: any, fontSize: number) {
  if (!lineHeight || lineHeight.mode === "AUTO") return "normal";
  if (lineHeight.mode === "PX") return `${lineHeight.value}px`;
  if (lineHeight.mode === "PERCENT") return `${(lineHeight.value / 100) * fontSize}px`;
  return "normal";
}

function computeLetterSpacingCss(letterSpacing: any) {
  if (!letterSpacing) return "0px";
  if (letterSpacing.mode === "PX") return `${letterSpacing.value}px`;
  // percent in CSS è % della font-size, ma qui facciamo una approssimazione semplice:
  if (letterSpacing.mode === "PERCENT") return `${letterSpacing.value}%`;
  return "0px";
}

export default async function ProjectPage({
  params
}: {
  params: { projectId: string };
}) {
  const data = await getScene(params.projectId);
  const scene = data.scene;

  const frameW = scene?.frame?.width ?? 0;
  const frameH = scene?.frame?.height ?? 0;

  const maxPreviewW = 600;
  const scale = frameW > 0 ? Math.min(1, maxPreviewW / frameW) : 1;

  const bgCss = rgbaToCss01(scene?.frame?.background);

  return (
    <main style={{ padding: 32, display: "grid", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0 }}>Project</h1>
        <p style={{ margin: "8px 0 0" }}>
          <strong>projectId:</strong> {params.projectId}
        </p>
      </header>

      <section>
        <h3 style={{ margin: "0 0 10px" }}>Preview (text-styled)</h3>

        {scene ? (
          <div
            style={{
              width: Math.round(frameW * scale),
              height: Math.round(frameH * scale),
              background: bgCss,
              position: "relative",
              borderRadius: 12,
              border: "1px solid #ddd",
              overflow: "hidden"
            }}
          >
            {(scene.layers || []).map((layer: any) => {
              if (layer.type !== "TEXT") return null;

              const t = layer.text || {};
              const fontSize = typeof t.fontSize === "number" ? t.fontSize : 16;

              return (
                <div
                  key={layer.id}
                  style={{
                    position: "absolute",
                    left: Math.round((layer.x ?? 0) * scale),
                    top: Math.round((layer.y ?? 0) * scale),
                    width: Math.round((layer.width ?? 0) * scale),
                    height: Math.round((layer.height ?? 0) * scale),

                    fontFamily: t.fontFamily || "Inter, system-ui, sans-serif",
                    fontSize: Math.max(1, Math.round(fontSize * scale)),
                    lineHeight: computeLineHeightCss(t.lineHeight, fontSize),
                    letterSpacing: computeLetterSpacingCss(t.letterSpacing),

                    fontWeight: /bold/i.test(t.fontStyle || "") ? 700 : 400,
                    fontStyle: /italic/i.test(t.fontStyle || "") ? "italic" : "normal",

                    textAlign: (t.alignH || "LEFT").toLowerCase(),
                    color: rgba255ToCss(t.color),

                    whiteSpace: "pre-wrap",
                    overflow: "hidden"
                  }}
                  title={`${layer.name} — ${t.fontFamily} ${t.fontStyle}`}
                >
                  {layer.content}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: "#b00" }}>
            Nessuna scene trovata per questo projectId (storage in-memory).
          </div>
        )}
      </section>

      <section>
        <h3 style={{ margin: "0 0 10px" }}>Scene (JSON)</h3>
        <pre
          style={{
            background: "#f6f6f6",
            padding: 12,
            borderRadius: 8,
            overflow: "auto"
          }}
        >
          {JSON.stringify(scene, null, 2)}
        </pre>

        <p style={{ color: "#666" }}>
          Nota: per ora lo storage è in-memory (MVP). Più avanti lo mettiamo su Supabase.
        </p>
      </section>
    </main>
  );
}
