"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import brandMotion from "../../../Brand/motion.json";

const Player = dynamic(() => import("@remotion/player").then((m) => m.Player), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "min(980px, 100%)",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "#000",
        color: "#fff",
        padding: 16,
        fontSize: 14,
      }}
    >
      Caricamento preview video…
    </div>
  ),
});

function getPreset(motionKey) {
  return (
    (brandMotion && brandMotion[motionKey]) ||
    (brandMotion && brandMotion.standard) || {
      text: { type: "slide-up", stagger: 6, spring: { damping: 16, stiffness: 140 } },
      graphics: { blob: true, wipe: true },
    }
  );
}

function MotionWrap({ slotName, index, preset, children }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  const overshoot =
    type === "slide-up-overshoot"
      ? interpolate(p, [0, 1], [1.03, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px) scale(${overshoot})` }}>
      {children}
    </div>
  );
}

function MotionScene({ TemplateComponent, templateProps, motionKey }) {
  const preset = getPreset(motionKey);

  if (!TemplateComponent) {
    throw new Error("VideoPreview: TemplateComponent is undefined/null");
  }

  // Ordine “coerente” per lo stagger
  const slotOrder = ["meta", "headline", "subheadline", "body", "accent", "logo"];

  // ✅ render object che il template usa per wrappare i suoi pezzi
  const render = useMemo(() => {
    const make = (slotName) => (node) => (
      <MotionWrap
        slotName={slotName}
        index={Math.max(0, slotOrder.indexOf(slotName))}
        preset={preset}
      >
        {node}
      </MotionWrap>
    );

    return {
      meta: make("meta"),
      headline: make("headline"),
      subheadline: make("subheadline"),
      body: make("body"),
      accent: make("accent"),
      logo: make("logo"),
    };
  }, [preset]);

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <TemplateComponent {...templateProps} render={render} />
    </AbsoluteFill>
  );
}

function ErrorFallback({ error }) {
  return (
    <div
      style={{
        width: "min(980px, 100%)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "#0b0f19",
        color: "#fff",
        padding: 16,
        fontSize: 13,
        lineHeight: 1.35,
        whiteSpace: "pre-wrap",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>❌ Errore preview video</div>
      <div style={{ opacity: 0.9, marginBottom: 10 }}>{String(error?.message || error)}</div>
      {error?.stack ? <div style={{ opacity: 0.7 }}>{String(error.stack)}</div> : null}
    </div>
  );
}

export default function VideoPreview({ TemplateComponent, templateProps, motionStyle }) {
  const fps = 30;
  const durationInFrames = 120;

  const Scene = useMemo(() => {
    return function SceneComponent() {
      return (
        <MotionScene
          TemplateComponent={TemplateComponent}
          templateProps={templateProps}
          motionKey={motionStyle}
        />
      );
    };
  }, [TemplateComponent, templateProps, motionStyle]);

  return (
    <Player
      component={Scene}
      durationInFrames={durationInFrames}
      compositionWidth={templateProps?.width || 1080}
      compositionHeight={templateProps?.height || 1080}
      fps={fps}
      autoPlay
      loop
      controls
      errorFallback={({ error }) => <ErrorFallback error={error} />}
      style={{
        width: "min(980px, 100%)",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "#000",
      }}
    />
  );
}
