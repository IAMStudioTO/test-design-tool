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

const Player = dynamic(
  () => import("@remotion/player").then((m) => m.Player),
  { ssr: false }
);

/* =========================
   Motion primitives
   ========================= */

function AnimatedText({ children, start, preset, fromY = 30 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame: frame - start,
    fps,
    config: preset.text.spring,
    durationInFrames: 26,
  });

  const opacity = preset.text.type === "fade" ? p : Math.min(p * 1.2, 1);
  const translateY =
    preset.text.type.includes("up") ? (1 - p) * fromY : 0;

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
}

function Wipe({ start, color }) {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [start, start + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        height: 6,
        width: 240,
        background: color,
        borderRadius: 999,
        transformOrigin: "left center",
        transform: `scaleX(${w})`,
      }}
    />
  );
}

function Blob({ start, color }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame: frame - start,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        right: -200,
        top: -200,
        width: 480,
        height: 480,
        borderRadius: "50%",
        background: color,
        opacity: p * 0.18,
        transform: `scale(${0.8 + p * 0.2})`,
      }}
    />
  );
}

/* =========================
   Scene
   ========================= */

function MotionScene({ width, height, palette, content, brand, motionKey }) {
  const preset = brandMotion[motionKey] || brandMotion.standard;

  const headlineSize = Math.round(width * 0.075);
  const subSize = Math.round(width * 0.028);
  const bodySize = Math.round(width * 0.02);

  const start = 0;
  const stagger = preset.text.stagger;

  return (
    <AbsoluteFill style={{ background: palette.background, color: palette.headline }}>
      {preset.graphics.blob && (
        <Blob start={start + 4} color={palette.accent} />
      )}

      <div style={{ padding: 56, position: "relative" }}>
        <div style={{ fontSize: 14, opacity: 0.6 }}>
          {brand.templateLabel}
        </div>

        <div style={{ marginTop: 140 }}>
          <AnimatedText start={start} preset={preset}>
            <div style={{ fontSize: headlineSize, fontWeight: 700 }}>
              {content.headline}
            </div>
          </AnimatedText>

          <div style={{ marginTop: 14 }}>
            <AnimatedText start={start + stagger} preset={preset}>
              <div style={{ fontSize: subSize }}>
                {content.subheadline}
              </div>
            </AnimatedText>
          </div>

          <div style={{ marginTop: 18, maxWidth: width * 0.7 }}>
            <AnimatedText start={start + stagger * 2} preset={preset}>
              <div style={{ fontSize: bodySize }}>
                {content.body}
              </div>
            </AnimatedText>
          </div>

          {preset.graphics.wipe && (
            <div style={{ marginTop: 22 }}>
              <Wipe start={start + stagger} color={palette.accent} />
            </div>
          )}
        </div>

        <div style={{ position: "absolute", left: 56, bottom: 44, opacity: 0.6 }}>
          <img src={brand.footerLogoSrc} alt="logo" height={14} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* =========================
   Public component
   ========================= */

export default function VideoPreview({
  width,
  height,
  palette,
  content,
  brand,
  motionStyle,
}) {
  const fps = 30;

  const Scene = useMemo(
    () => () => (
      <MotionScene
        width={width}
        height={height}
        palette={palette}
        content={content}
        brand={brand}
        motionKey={motionStyle}
      />
    ),
    [width, height, palette, content, brand, motionStyle]
  );

  return (
    <Player
      component={Scene}
      durationInFrames={120}
      compositionWidth={width}
      compositionHeight={height}
      fps={fps}
      autoPlay
      loop
      controls
      style={{
        width: "min(980px, 100%)",
        borderRadius: 18,
        background: "#000",
      }}
    />
  );
}
