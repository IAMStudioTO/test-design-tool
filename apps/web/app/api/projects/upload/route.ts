export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { projectId, scene } = body;

    if (!projectId || !scene) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing projectId or scene"
        }),
        { status: 400 }
      );
    }

    // Per ora non salviamo da nessuna parte (MVP)
    // Qui in futuro andrà Supabase / storage
    console.log("📦 Received scene for project:", projectId);
    console.log(scene);

    return Response.json({
      ok: true,
      projectId,
      received: true
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Invalid JSON payload"
      }),
      { status: 400 }
    );
  }
}
