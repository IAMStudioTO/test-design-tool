figma.showUI(__html__, { width: 360, height: 360 });

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
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
  // MVP: solo frame size + lista TEXT (contenuto + posizione) + background
  const scene = {
    frame: {
      name: frameNode.name,
      width: Math.round(frameNode.width),
      height: Math.round(frameNode.height)
    },
    layers: []
  };

  // background (se esiste un fill solido)
  try {
    const fills = frameNode.fills;
    if (fills && fills.length > 0 && fills[0].type === "SOLID") {
      const c = fills[0].color;
      scene.frame.background = {
        r: c.r,
        g: c.g,
        b: c.b,
        a: typeof fills[0].opacity === "number" ? fills[0].opacity : 1
      };
    }
  } catch (e) {
    // ignore
  }

  // traversa children e prende solo TEXT (per ora)
  function walk(node) {
    if ("children" in node) {
      for (const child of node.children) walk(child);
    }
    if (node.type === "TEXT") {
      scene.layers.push({
        id: node.id,
        type: "TEXT",
        name: node.name,
        x: Math.round(node.x),
        y: Math.round(node.y),
        width: Math.round(node.width),
        height: Math.round(node.height),
        content: node.characters,
        style: {
          fontSize: node.fontSize,
          fontName: node.fontName,
          lineHeight: node.lineHeight,
          letterSpacing: node.letterSpacing,
          textAlignHorizontal: node.textAlignHorizontal,
          textAlignVertical: node.textAlignVertical
        }
      });
    }
  }

  walk(frameNode);
  return scene;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "CREATE_PROJECT") {
    try {
      const data = await postJson(
        "https://test-design-tool.vercel.app/api/projects/create",
        {}
      );
      figma.ui.postMessage({ type: "PROJECT_CREATED", data });
    } catch (e) {
      figma.ui.postMessage({ type: "ERROR", error: String(e && e.message ? e.message : e) });
    }
  }

  if (msg.type === "SEND_SCENE") {
    try {
      const projectId = msg.projectId;
      if (!projectId) throw new Error("Missing projectId (create project first)");

      const sel = figma.currentPage.selection;
      if (!sel || sel.length !== 1) throw new Error("Select exactly ONE Frame");

      const node = sel[0];
      if (node.type !== "FRAME") throw new Error("Selection must be a FRAME");

      const scene = buildSceneFromFrame(node);

      const data = await postJson(
        "https://test-design-tool.vercel.app/api/projects/upload",
        { projectId, scene }
      );

      figma.ui.postMessage({ type: "SCENE_SENT", data });
    } catch (e) {
      figma.ui.postMessage({ type: "ERROR", error: String(e && e.message ? e.message : e) });
    }
  }
};
