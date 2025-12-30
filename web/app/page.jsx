"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

import brandColors from "../../Brand/colors.json";
import brandConfig from "../../Brand/brand.config.json";
import brandMotion from "../../Brand/motion.json";

import ControlPanel from "./components/ControlPanel";
import { TEMPLATE_LIST, getTemplateById } from "./components/templates";

const HEADLINE_MAX = 40;
const SUBHEAD_MAX = 90;
const BODY_MAX = 220;

const RENDER_URL =
  process.env.NEXT_PUBLIC_RENDER_URL || "https://test-design-tool.onrender.com";

const FORMATS = [
  { key: "ig_post_1_1", group: "Instagram", name: "Instagram Post (1:1)", width: 1080, height: 1080 },
  { key: "ig_post_4_5", group: "Instagram", name: "Instagram Post (4:5)", width: 1080, height: 1350 },
  { key: "ig_story_9_16", group: "Instagram", name: "Instagram Story (9:16)", width: 1080, height: 1920 },
  { key: "reel_9_16", group: "Video", name: "Reel / TikTok (9:16)", width: 1080, height: 1920 },
  { key: "yt_short_9_16", group: "Video", name: "YouTube Short (9:16)", width: 1080, height: 1920 },
  { key: "li_square", group: "LinkedIn", name: "LinkedIn Square (1:1)", width: 1080, height: 1080 },
  { key: "li_landscape", group: "LinkedIn", name: "LinkedIn Landscape (1.91:1)", width: 1200, height: 628 },
  { key: "li_banner", group: "LinkedIn", name: "LinkedIn Profile Banner", width: 1128, height: 191 },
  { key: "x_post", group: "X / Twitter", name: "X Post (16:9)", width: 1200, height: 675 },
];

function groupedFormats() {
  const groups = {};
  for (const f of FORMATS) {
    if (!groups[f.group]) groups[f.group] = [];
    groups[f.group].push(f);
  }
  return groups;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const formatsByGroup = useMemo(() => groupedFormats(), []);
  const paletteKeys = useMemo(() => Object.keys(brandColors || {}), []);
  const motionKeys = useMemo(() => Object.keys(brandMotion || {}), []);

  const [templateId, setTemplateId] = useState(TEMPLATE_LIST[0]?.id || "template-01");
  const [formatKey, setFormatKey] = useState(FORMATS[0].key);

  // ✅ SOLO questi 3 sono editabili dall’utente
  const [headline, setHeadline] = useState("Ciao");
  const [subheadline, setSubheadline] = useState("Come stai?");
  const [body, setBody] = useState("Testo corpo opzionale…");

  // ✅ L’utente può scegliere colore (palette)
  const [paletteKey, setPaletteKey] = useState(
    brandConfig?.defaultPalette || paletteKeys[0] || "void"
  );

  // Motion (puoi tenerlo nascosto o mostrarlo più avanti)
  const [motionKey, setMotionKey] = useState(motionKeys[0] || "void");

  const exportRef = useRef(null);

  // ====== Preview Video ======
  const [previewMode, setPreviewMode] = useState("design"); // "design" | "video"
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(""); // object URL
  const [videoState, setVideoState] = useState({ loading: false, phase: "", error: "" });

  // Pulizia objectURL
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const selectedFormat = useMemo(() => {
    return FORMATS.find((f) => f.key === formatKey) || FORMATS[0];
  }, [formatKey]);

  const palette = useMemo(() => {
    return brandColors?.[paletteKey] || {};
  }, [paletteKey]);

  const SelectedTemplate = useMemo(() => {
    return getTemplateById(templateId)?.Component;
  }, [templateId]);

  // ===== Responsive preview scale (fit-to-container) =====
  const previewWrapRef = useRef(null);
  const [previewBox, setPreviewBox] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (!previewWrapRef.current) return;
    const el = previewWrapRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect?.width || 800;
        const h = e.contentRect?.height || 600;
        setPreviewBox({ w, h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const previewScale = useMemo(() => {
    const canvasW = selectedFormat.width;
    const canvasH = selectedFormat.height;
    const pad = 28;

    const availableW = Math.max(320, previewBox.w - pad * 2);
    const availableH = Math.max(320, previewBox.h - pad * 2);

    const sW = availableW / canvasW;
    const sH = availableH / canvasH;
    const s = Math.min(sW, sH);

    return Math.min(1.35, Math.max(0.2, s));
  }, [previewBox.w, previewBox.h, selectedFormat.width, selectedFormat.height]);

  async function onExportPng() {
    if (!exportRef.current) return;

    const dataUrl = await toPng(exportRef.current, {
      cacheBust: true,
      pixelRatio: 1,
      width: selectedFormat.width,
      height: selectedFormat.height,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${brandConfig?.id || "brand"}_${templateId}_${formatKey}_${selectedFormat.width}x${selectedFormat.height}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function renderMp4AndGetBlob({ forPreview }) {
    // stessa pipeline per export e preview
    const payload = {
      templateId,
      formatKey,
      paletteKey,
      motionStyle: motionKey,
      content: { headline, subheadline, body },
      // flag “future-proof”: se vuoi, poi lo useremo sul backend per preview più veloce
      preview: Boolean(forPreview),
    };

    const startRes = await fetch(`${RENDER_URL}/render/mp4/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!startRes.ok) throw new Error(`Start MP4 failed (${startRes.status})`);

    const { jobId } = await startRes.json();
    if (!jobId) throw new Error("No jobId returned");

    const startTime = Date.now();
    const TIMEOUT_MS = 10 * 60 * 1000;

    while (true) {
      if (Date.now() - startTime > TIMEOUT_MS) throw new Error("Timeout MP4 render");

      const statusRes = await fetch(`${RENDER_URL}/render/mp4/status/${jobId}`);
      if (!statusRes.ok) throw new Error(`Status failed (${statusRes.status})`);

      const data = await statusRes.json();
      const job = data?.job;

      if (!job) throw new Error("Invalid status payload");
      if (job.status === "error") throw new Error(job.error || "Render error");
      if (job.status === "done") break;

      if (forPreview) {
        setVideoState({ loading: true, phase: job.phase || "working", error: "" });
      }
      await new Promise((res) => setTimeout(res, 1200));
    }

    const fileRes = await fetch(`${RENDER_URL}/render/mp4/download/${jobId}`);
    if (!fileRes.ok) throw new Error(`Download failed (${fileRes.status})`);

    return await fileRes.blob();
  }

  async function onExportMp4() {
    try {
      // mantenuto “export classico”
      const blob = await renderMp4AndGetBlob({ forPreview: false });
      downloadBlob(blob, `${brandConfig?.id || "brand"}_${templateId}_${formatKey}.mp4`);
    } catch (e) {
      // lasciamo error handling sul pannello (se vuoi lo aggiungiamo dopo)
      alert(e?.message || "MP4 error");
    }
  }

  async function onGenerateVideoPreview() {
    // Genera MP4 e lo mostra nel player
    setVideoState({ loading: true, phase: "starting", error: "" });

    try {
      // pulizia vecchia preview
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl("");
      }

      const blob = await renderMp4AndGetBlob({ forPreview: true });
      const url = URL.createObjectURL(blob);

      setVideoPreviewUrl(url);
      setPreviewMode("video");
      setVideoState({ loading: false, phase: "", error: "" });
    } catch (e) {
      setVideoState({ loading: false, phase: "", error: e?.message || "Preview error" });
    }
  }

  function onClearVideoPreview() {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl("");
    setPreviewMode("design");
    setVideoState({ loading: false, phase: "", error: "" });
  }

  return (
    <>
      <main className="layoutRoot">
        <div className="layoutGrid">
          <div className="leftCol">
            <ControlPanel
              // template + copy
              templates={TEMPLATE_LIST}
              templateId={templateId}
              setTemplateId={setTemplateId}
              headline={headline}
              setHeadline={(v) => setHeadline(v.slice(0, HEADLINE_MAX))}
              subheadline={subheadline}
              setSubheadline={(v) => setSubheadline(v.slice(0, SUBHEAD_MAX))}
              body={body}
              setBody={(v) => setBody(v.slice(0, BODY_MAX))}

              // colore
              paletteKeys={paletteKeys}
              paletteKey={paletteKey}
              setPaletteKey={setPaletteKey}

              // export + preview
              onExportPng={onExportPng}
              onExportMp4={onExportMp4}
              onGenerateVideoPreview={onGenerateVideoPreview}
              onClearVideoPreview={onClearVideoPreview}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              videoState={videoState}
              hasVideoPreview={Boolean(videoPreviewUrl)}
            />
          </div>

          <section ref={previewWrapRef} className="rightCol">
            <div className="previewCenter">
              {/* ====== PREVIEW MODE SWITCH ====== */}
              {previewMode === "video" ? (
                <div className="videoWrap">
                  {videoPreviewUrl ? (
                    <video
                      src={videoPreviewUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: "min(980px, 100%)",
                        borderRadius: 18,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "#000",
                      }}
                    />
                  ) : (
                    <div className="videoPlaceholder">
                      {videoState.loading ? (
                        <div style={{ fontSize: 14, opacity: 0.8 }}>
                          Sto generando la preview video… {videoState.phase ? `(${videoState.phase})` : ""}
                        </div>
                      ) : (
                        <div style={{ fontSize: 14, opacity: 0.8 }}>
                          Nessuna preview ancora. Premi “Genera anteprima video”.
                        </div>
                      )}
                      {videoState.error ? (
                        <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 14 }}>
                          Errore: {videoState.error}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="previewScaled"
                  style={{ transform: `scale(${previewScale})` }}
                >
                  {SelectedTemplate ? (
                    <SelectedTemplate
                      width={selectedFormat.width}
                      height={selectedFormat.height}
                      palette={palette}
                      content={{ headline, subheadline, body }}
                      brand={{
                        id: brandConfig?.id || "brand",
                        templateLabel: brandConfig?.templateLabel || "TEMPLATE",
                        footerLogoSrc: "/brand/logo.svg",
                      }}
                      formatKey={formatKey}
                      motionStyle={motionKey}
                    />
                  ) : null}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* EXPORT CANVAS HIDDEN */}
        <div style={{ position: "absolute", left: -99999, top: 0 }}>
          <div ref={exportRef}>
            {SelectedTemplate ? (
              <SelectedTemplate
                width={selectedFormat.width}
                height={selectedFormat.height}
                palette={palette}
                content={{ headline, subheadline, body }}
                brand={{
                  id: brandConfig?.id || "brand",
                  templateLabel: brandConfig?.templateLabel || "TEMPLATE",
                  footerLogoSrc: "/brand/logo.svg",
                }}
                formatKey={formatKey}
                motionStyle={motionKey}
              />
            ) : null}
          </div>
        </div>
      </main>

      <style>{`
        .layoutRoot {
          max-width: 2200px;
          margin: 0 auto;
          padding: 24px;
        }

        .layoutGrid {
          display: grid;
          gap: 24px;
          grid-template-columns: clamp(360px, 34vw, 720px) minmax(520px, 1fr);
          align-items: start;
        }

        .leftCol {
          position: sticky;
          top: 16px;
          align-self: start;
        }

        .rightCol {
          height: calc(100svh - 48px);
          overflow: hidden;
          display: flex;
        }

        .previewCenter {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 8px;
          position: relative;
        }

        .previewScaled {
          transform-origin: top center;
          will-change: transform;
        }

        .videoWrap {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 18px;
          box-sizing: border-box;
        }

        .videoPlaceholder {
          width: min(980px, 100%);
          border-radius: 18px;
          border: 1px dashed rgba(0,0,0,0.2);
          padding: 18px;
          background: rgba(0,0,0,0.02);
        }

        @media (max-width: 1100px) {
          .layoutGrid {
            grid-template-columns: 1fr;
          }
          .leftCol {
            position: relative;
            top: auto;
          }
          .rightCol {
            height: auto;
            min-height: 60svh;
          }
        }
      `}</style>
    </>
  );
}
