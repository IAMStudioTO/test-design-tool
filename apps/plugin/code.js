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

function toCssColorFromSolidPaint(p
