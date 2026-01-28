async function getScene(projectId: string) {
  const res = await fetch(
    `https://test-design-tool.vercel.app/api/projects/get?projectId=${encodeURIComponent(projectId)}`,
    { cache: "no-store" }
  );
  return res.json();
}

function rgbaToCss(bg: any) {
  if (!bg) return "transparent";
  const r = Math.round((bg.r ?? 0) * 255);
  const g = Math.round((bg.g ?? 0) * 255);
  const b = Math.round((bg.b ?? 0) * 255);
  const a = typeof bg.a === "number" ? bg.a : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
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

  // preview scalata (max 600px di larghezza)
  const maxPreviewW = 600;
  const scale = frameW > 0 ? Math.min(1, maxPreviewW / frameW) : 1;

  const bgCss = rgbaToCss(scene?.frame?.background);

  return (
    <main style={{ padding: 32, display: "grid", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0 }}>Project</h1>
        <p style={{ margin: "8px 0 0" }}>
          <strong>projectId:</strong> {params.projectId}
        </p>
      </header>

      <section>
        <h3 style={{ margin: "0 0 10px" }}>Preview</h3>

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
              return (
                <div
                  key={layer.id}
                  style={{
                    position: "absolute",
                    left: Math.round((layer.x ?? 0) * scale),
                    top: Math.round((layer.y ?? 0) * scale),
                    width: Math.round((layer.width ?? 0) * scale),
                    height: Math.round((layer.height ?? 0) * scale),
                    fontSize: Math.max(10, Math.round(18 * scale)),
                    lineHeight: 1.1,
                    color: "#111",
                    whiteSpace: "pre-wrap"
                  }}
                  title={layer.name}
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
