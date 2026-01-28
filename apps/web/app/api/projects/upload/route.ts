import { getStore } from "../../_store";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, scene } = body;

    if (!projectId || !scene) {
      return new Response(JSON.stringify({ ok: false, error: "Missing projectId or scene" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const store = getStore();
    store.set(projectId, scene);

    return new Response(JSON.stringify({ ok: true, projectId, received: true, saved: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
