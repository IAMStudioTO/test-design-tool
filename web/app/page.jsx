"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

import brandColors from "../../Brand/colors.json";
import brandConfig from "../../Brand/brand.config.json";
import brandMotion from "../../Brand/motion.json";

import ControlPanel from "./components/ControlPanel";
import { TEMPLATE_LIST, getTemplateById } from "./components/templates";

const HEADLINE_MAX = 40;
const SUBHEAD_MAX = 90;
const BODY_MAX = 220;

// Backend Render URL
const RENDER_URL =
  process.env.NEXT_PUBLIC_RENDER_URL || "https://test-design-tool.onrender.com";

// Formati
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

  // Brand controls (puoi anche nasconderli all’utente in futuro)
  const [paletteKey, setPaletteKey] = useState(
    brandConfig?.defaultPalette || paletteKeys[0] || "void"
  );
  const [motionKey, setMotionKey] = useState(motionKeys[0] || "void");

  const [mp4State, setMp4State] = useState({ loading: false, phase: "", error: "" });

  const exportRef = useRef(null);

  const selectedFormat = useMemo(() => {
    return FORMATS.find((f) => f.key === formatKey) || FORMATS[0];
  }, [formatKey]);

  const palette = useMemo(() => {
    return brandColors?.[paletteKey] || {};
  }, [paletteKey]);

  const SelectedTemplate = useMemo(() => {
    return getTemplateById(templateId)?.Component;
  }, [templateId]);

  const previewScale = useMemo(() => {
    const maxPreviewWidth = 980;
    const s = maxPreviewWidth / selectedFormat.width;
    return Math.min(1, Math.max(0.25, s));
  }, [selectedFormat.width]);

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

  async function onExportMp4() {
    setMp4State({ loading: true, phase: "starting", error: "" });

    try {
      const payload = {
        templateId,
        formatKey,
        paletteKey,
        motionStyle: motionKey,
        content: {
          headline,
          subheadline,
          body,
        },
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

        setMp4State({ loading: true, phase: job.phase || "working", error: "" });
        await new Promise((res) => setTimeout(res, 1200));
      }

      setMp4State({ loading: true, phase: "downloading", error: "" });

      const fileRes = await fetch(`${RENDER_URL}/render/mp4/download/${jobId}`);
      if (!fileRes.ok) throw new Error(`Download failed (${fileRes.status})`);

      const blob = await fileRes.blob();
      downloadBlob(blob, `${brandConfig?.id || "brand"}_${templateId}_${formatKey}.mp4`);

      setMp4State({ loading: false, phase: "", error: "" });
    } catch (e) {
      setMp4State({ loading: false, phase: "", error: e?.message || "MP4 error" });
    }
  }

  return (
    <>
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "420px minmax(520px, 1fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          <ControlPanel
            templates={TEMPLATE_LIST}
            templateId={templateId}
            setTemplateId={setTemplateId}
            headline={headline}
            setHeadline={(v) => setHeadline(v.slice(0, HEADLINE_MAX))}
            subheadline={subheadline}
            setSubheadline={(v) => setSubheadline(v.slice(0, SUBHEAD_MAX))}
            body={body}
            setBody={(v) => setBody(v.slice(0, BODY_MAX))}
            paletteKeys={paletteKeys}
            paletteKey={paletteKey}
            setPaletteKey={setPaletteKey}
            motionKeys={motionKeys}
            motionKey={motionKey}
            setMotionKey={setMotionKey}
            formatsByGroup={formatsByGroup}
            formatKey={formatKey}
            setFormatKey={setFormatKey}
            selectedFormat={selectedFormat}
            onExportPng={onExportPng}
            onExportMp4={onExportMp4}
            mp4State={mp4State}
            renderUrl={RENDER_URL}
          />

          <section
            style={{
              display: "flex",
              justifyContent: "center",
              minHeight: "calc(100vh - 48px)",
              paddingTop: 8,
            }}
          >
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top center" }}>
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
        @media (max-width: 980px) {
          main > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
