figma.showUI(__html__, { width: 360, height: 320 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "CREATE_PROJECT") {
    try {
      const res = await fetch("https://test-design-tool.vercel.app/api/projects/create", {
        method: "POST"
      });

      const data = await res.json();

      figma.ui.postMessage({ type: "PROJECT_CREATED", data });
    } catch (e: any) {
      figma.ui.postMessage({ type: "ERROR", error: String(e?.message || e) });
    }
  }
};
