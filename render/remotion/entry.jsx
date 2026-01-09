import React, { useMemo } from "react";
import { Composition, registerRoot, AbsoluteFill } from "remotion";

import brandColors from "../Brand/colors.json";
import brandConfig from "../Brand/brand.config.json";
import brandMotion from "../Brand/motion.json";

// ✅ Importiamo i template DAL WEB (così design/video/export restano identici)
// Se il tuo folder render/ è allo stesso livello di web/ questo path è giusto.
import Template01 from "../web/app/components/templates/template-01";
import Template02 from "../web/app/components/templates/template-02";
import Template03 from "../web/app/components/templates/template-03";
import Template04 from "../web/app/components/templates/template-04";

const FORMATS = {
  ig_post_1_1: { width: 1080, height: 1080 },
  ig_post_4_5: { width: 1080, height: 1350 },
  ig_story_9_16: { width: 1080, height: 1920 },
  reel_9_16: { width: 1080, height: 1920 },
  yt_short_9_16: { width: 1080, height: 1920 },
  li_square: { width: 1080, height: 1080 },
  li_landscape: { width: 1200, height: 628 },
  li_banner: { width: 1128, height: 191 },
  x_post: { width: 1200, height: 675 },
};

const TEMPLATES = {
  "template-01": Template01,
  "template-02": Template02,
  "template-03": Template03,
  "template-04": Template04,
};

function getPreset(motionKey) {
  return (
    (brandMotion && brandMotion[motionKey]) ||
    (brandMotion && brandMotion.standard) || {
      text: { type: "slide-up", stagger: 6, spring: { damping: 16, stiffness: 140 } },
      graphics: { blob: true, wipe: true },
    }
  );
}

function MotionWrap({ index, preset, children, frame, fps }) {
  // implementiamo spring senza hook (compatibile ovunque)
  const { spring } = require("remotion");

  const delay = index * (preset?.text?.stagger ?? 6);

  const p = spring({
    frame: frame - delay,
    fps,
    config: preset?.text?.spring || { damping: 16, stiffness: 140 },
    durationInFrames: 26,
  });

  const type = preset?.text?.type || "slide-up";
  const opacity = type === "fade" ? p : Math.min(1, p * 1.2);
  const translateY = type.includes("up") ? (1 - p) * 32 : 0;

  const scale = type === "slide-up-overshoot" ? 1 + (1 - p) * 0.03 : 1;

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px) scale(${scale})` }}>
      {children}
    </div>
  );
}

function FadeOnly({ startFrame, duration, maxOpacity, children, frame }) {
  const { interpolate } = require("remotion");

  const o = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <div style={{ opacity: o * maxOpacity }}>{children}</div>;
}

function BrandVideo(props) {
  const { useCurrentFrame, useVideoConfig } = require("remotion");

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const templateId = props?.templateId || "template-01";
  const formatKey = props?.formatKey || "ig_post_1_1";
  const paletteKey = props?.paletteKey || brandConfig?.defaultPalette;
  const motionStyle = props?.motionStyle || "standard";

  const content = props?.content || { headline: "Ciao", subheadline: "Come stai?", body: "" };

  const fmt = FORMATS[formatKey] || FORMATS.ig_post_1_1;
  const TemplateComponent = TEMPLATES[templateId] || TEMPLATES["template-01"];

  const palette = (brandColors && brandColors[paletteKey]) || {};

  const preset = getPreset(motionStyle);

  // stesso ordine usato in web
  const order = ["headline", "subheadline", "body"];

  const render = useMemo(() => {
    const identity = (n) => n;

    const animateText = (slotName) => (node) => (
      <MotionWrap
        index={Math.max(0, order.indexOf(slotName))}
        preset={preset}
        frame={frame}
        fps={fps}
      >
        {node}
      </MotionWrap>
    );

    return {
      meta: identity,
      headline: animateText("headline"),
      subheadline: animateText("subheadline"),
      body: animateText("body"),

      // accent solo fade (per non alterare grafica: barra/border/blob sempre identici)
      accent: (node) => (
        <FadeOnly startFrame={6} duration={16} maxOpacity={templateId === "template-02" ? 0.9 : 1} frame={frame}>
          {node}
        </FadeOnly>
      ),

      // logo solo fade, fermo
      logo: (node) => (
        <FadeOnly startFrame={18} duration={16} maxOpacity={0.6} frame={frame}>
          {node}
        </FadeOnly>
      ),
    };
  }, [frame, fps, preset, templateId]);

  const templateProps = {
    templateId,
    width: fmt.width,
    height: fmt.height,
    palette,
    content,
    brand: {
      id: brandConfig?.id || "brand",
      templateLabel: brandConfig?.templateLabel || "TEMPLATE",
      footerLogoSrc: "/brand/logo.svg",
    },
    formatKey,
    motionStyle,
    render, // ✅ il punto chiave
  };

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <TemplateComponent {...templateProps} />
    </AbsoluteFill>
  );
}

export const RemotionRoot = () => {
  return (
    <Composition
      id="BrandVideo"
      component={BrandVideo}
      durationInFrames={120}
      fps={30}
      width={1080}
      height={1080}
      // inputProps arrivano dal renderer (server.js) e decidono template/format/color/motion/content
      defaultProps={{
        templateId: "template-01",
        formatKey: "ig_post_1_1",
        paletteKey: brandConfig?.defaultPalette || "void",
        motionStyle: "standard",
        content: { headline: "Ciao", subheadline: "Come stai?", body: "" },
      }}
    />
  );
};

registerRoot(RemotionRoot);
