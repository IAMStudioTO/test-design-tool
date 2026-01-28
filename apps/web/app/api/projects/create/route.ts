export const runtime = "nodejs";

function createId(prefix = "proj") {
  // id semplice, va bene per MVP (senza DB)
  const rand = Math.random().toString(16).slice(2);
  const ts = Date.now().toString(16);
  return `${prefix}_${ts}_${rand}`;
}

export async function POST() {
  const projectId = createId();
  const editorUrl = `https://test-design-tool.vercel.app/p/${projectId}`;

  return Response.json({
    ok: true,
    projectId,
    editorUrl
  });
}
