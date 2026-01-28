import { getStore } from "../../_store";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return new Response(JSON.stringify({ ok: false, error: "Missing projectId" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const store = getStore();
  const scene = store.get(projectId);

  return new Response(
    JSON.stringify({ ok: true, projectId, scene: scene || null }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}
