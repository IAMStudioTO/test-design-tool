figma.showUI(__html__, { width: 360, height: 420 });

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { raw: text };
  }

  return { httpOk: res.ok, status: res.status, result: data };
}

function buildSceneFromFrame(frameNode) {
  const scene = {
    frame: {
      name: frameNode.name,
      width: Math.round(frameNode.width),
      height: Math.round(frameNode.height)
    },
    layers: []
  };

  try {
    const fills = frameNode.fills;
    if (fills && fills.length > 0 && fills[0].type === "SOLID") {
      const c = fills[0].color;
      scene.frame.background = {
        r: c.r, g: c.g, b: c.b,
        a: typeof fills[0].opacity === "number" ? fills[0].opacity : 1
      };
    }
  } catch (e) {}

  function walk(node) {
    if (node && node.type === "TEXT") {
      scene.layers.push({
        id: node.id,
        type: "TEXT",
        name: node.name,
        x: Math.round(node.x),
        y: Math.round(node.y),
        width: Math.round(node.width),
        height: Math.round(node.height),
        content: node.characters
      });
    }
    if (node && node.children) {
      for (const child of node.children) walk(child);
    }
  }

  walk(frameNode);
  return scene;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "CREATE_PROJECT") {
    try {
      const data = await postJson("https://test-design-tool.vercel.app/api/projects/create", {});
      figma.ui.postMessage({ type: "PROJECT_CREATED", data });

      // Apertura automatica dell’editor (comodo)
      if (data && data.result && data.result.editorUrl) {
        figma.openExternal(data.result.editorUrl);
      }
    } catch (e) {
      figma.ui.postMessage({ type: "ERROR", error: String(e && e.message ? e.message : e) });
    }
  }

  if (msg.type === "OPEN_EDITOR") {
    try {
      if (!msg.url) throw new Error("Missing url");
      figma.openExternal(msg.url);
    } catch (e) {
      figma.ui.postMessage({ type: "ERROR", error: String(e && e.message ? e.message : e) });
    }
  }

  if (msg.type === "SEND_SCENE") {
    try {
      const projectId = msg.projectId;
      if (!projectId) throw new Error("Missin
