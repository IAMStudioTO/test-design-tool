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

function toCssColorFromSolidPaint(paint) {
  if (!paint || paint.type !== "SOLID") return null;
  const c = paint.color || { r: 0, g: 0, b: 0 };
  const a = typeof paint.opacity === "number" ? paint.opacity : 1;
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  return { r, g, b, a };
}

function normalizeLineHeight(lineHeight) {
  // Figma può dare: { unit: "PIXELS", value: number } oppure { unit: "PERCENT", value: number } oppure "AUTO"
  if (!lineHeight) return { mode: "AUTO" };
  if (lineHeight === "AUTO") return { mode: "AUTO" };
  if (typeof lineHeight === "object") {
    if (lineHeight.unit === "PIXELS") return { mode: "PX", value: lineHeight.value };
    if (lineHeight.unit === "PERCENT") return { mode: "PERCENT", value: lineHeight.value };
  }
  return { mode: "AUTO" };
}

function normalizeLetterSpacing(letterSpacing) {
  // può essere { unit: "PIXELS"|"PERCENT", value }
  if (!letterSpacing || typeof letterSpacing !== "object") return { mode: "PX", value: 0 };
  if (letterSpacing.unit === "PIXELS") return { mode: "PX", value: letterSpacing.value };
  if (letterSpacing.unit === "PERCENT") return { mode: "PERCENT", value: letterSpacing.value };
  return { mode: "PX", value: 0 };
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

  // background (solo SOLID)
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
  } catch (e) {}

  function walk(node) {
    if (node && node.type === "TEXT") {
      // NB: per fontName/fontSize, in alcuni casi Figma richiede che i font siano “available”.
      const fontName = node.fontName; // { family, style } oppure mixed
      const fontSize = node.fontSize; // number oppure mixed

      const fills = node.fills;
      const textColor = Array.isArray(fills) && fills.length > 0 ? toCssColorFromSolidPaint(fills[0]) : null;

      scene.layers.push({
        id: node.id,
        type: "TEXT",
        name: node.name,
        x: Math.round(node.x),
        y: Math.round(node.y),
        width: Math.round(node.width),
        height: Math.round(node.height),
        content: node.characters,
        text: {
          fontFamily: fontName && fontName.family ? fontName.family : "Inter",
          fontStyle: fontName && fontName.style ? fontName.style : "Regular",
          fontSize: typeof fontSize === "number" ? fontSize : 16,
          lineHeight: normalizeLineHeight(node.lineHeight),
          letterSpacing: normalizeLetterSpacing(node.letterSpacing),
          alignH: node.textAlignHorizontal,
          alignV: node.textAlignVertical,
          color: textColor
        }
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
      if (!projectId) throw new Error("Missing projectId (create project first)");

      const sel = figma.currentPage.selection;
      if (!sel || sel.length !== 1) throw new Error("Select exactly ONE Frame");
      const node = sel[0];
      if (node.type !== "FRAME") throw new Error("Selection must be a FRAME");

      const scene = buildSceneFromFrame(node);

      const data = await postJson("https://test-design-tool.vercel.app/api/projects/upload", {
        projectId,
        scene
      });

      figma.ui.postMessage({ type: "SCENE_SENT", data });
    } catch (e) {
      figma.ui.postMessage({ type: "ERROR", error: String(e && e.message ? e.message : e) });
    }
  }
};
