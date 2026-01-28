async function getScene(projectId: string) {
  const res = await fetch(
    `https://test-design-tool.vercel.app/api/projects/get?projectId=${encodeURIComponent(projectId)}`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function ProjectPage({
  params
}: {
  params: { projectId: string };
}) {
  const data = await getScene(params.projectId);

  return (
    <main style={{ padding: 32 }}>
      <h1>Project</h1>
      <p>
        <strong>projectId:</strong> {params.projectId}
      </p>

      <h3>Scene (JSON)</h3>
      <pre
        style={{
          background: "#f6f6f6",
          padding: 12,
          borderRadius: 8,
          overflow: "auto"
        }}
      >
        {JSON.stringify(data.scene, null, 2)}
      </pre>

      <p style={{ color: "#666" }}>
        Nota: per ora lo storage è in-memory (MVP). Più avanti lo mettiamo su Supabase.
      </p>
    </main>
  );
}
