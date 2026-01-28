figma.showUI(__html__, { width: 360, height: 320 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "CREATE_PROJECT") {
    try {
      const res = await fetch("https://test-design-tool.vercel.app/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { raw: text };
      }

      figma.ui.postMessage({
        type: "PROJECT_CREATED",
        data: { httpOk: res.ok, status: res.status, result: data }
      });
    } catch (e) {
      figma.ui.postMessage({ type: "ERROR", error: String(e && e.message ? e.message : e) });
    }
  }
};
