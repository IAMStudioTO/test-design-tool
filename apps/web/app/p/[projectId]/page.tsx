export default function ProjectPage({
  params
}: {
  params: { projectId: string };
}) {
  return (
    <main style={{ padding: 32 }}>
      <h1>Project</h1>
      <p>
        <strong>projectId:</strong> {params.projectId}
      </p>
      <p>Qui arriveranno canvas, layers, effetti e render.</p>
    </main>
  );
}
