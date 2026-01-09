"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import brandMotion from "../../../Brand/motion.json";
import { SlotProvider } from "./templates/TemplateSlots";

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
      text: {
        type: "slide-up",
        stagger: 6,
        spring: { damping: 16, stiffness: 140 },
      },
      graphics: { blob: true, wipe: true },
    }
  );
}

function MotionSlotWrapper({ name, children, preset }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const order = ["meta", "headline", "subheadline", "body", "accent", "logo"];
  const index = Math.max(0, order.indexOf(name));
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
      ? interpolate(p, [0, 1], [1.03, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px) scale(${overshoot})` }}>
      {children}
    </div>
  );
}

function MotionScene({ TemplateComponent, templateProps, motionKey }) {
  const preset = getPreset(motionKey);

  const renderSlot = useMemo(() => {
    return (name, children) => (
      <MotionSlotWrapper name={name} preset={preset}>
        {children}
      </MotionSlotWrapper>
    );
  }, [preset]);

  if (!TemplateComponent) {
    // ✅ errore super chiaro se TemplateComponent non arriva
    throw new Error("VideoPreview: TemplateComponent is undefined/null");
  }

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <SlotProvider renderSlot={renderSlot}>
        <TemplateComponent {...templateProps} />
      </SlotProvider>
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
      <div style={{ fontWeight: 800, marginBottom: 10 }}>
        ❌ Errore nella preview video (Remotion)
      </div>
      <div style={{ opacity: 0.9, marginBottom: 10 }}>
        {String(error?.message || error)}
      </div>
      {error?.stack ? (
        <div style={{ opacity: 0.7 }}>
          {String(error.stack)}
        </div>
      ) : null}
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
      // ✅ MOSTRA L’ERRORE A SCHERMO
      errorFallback={({ error }) => <ErrorFallback error={error} />}
      // ✅ utile per vedere anche in console
      onError={(err) => {
        // eslint-disable-next-line no-console
        console.error("Remotion Player error:", err);
      }}
      style={{
        width: "min(980px, 100%)",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "#000",
      }}
    />
  );
}
