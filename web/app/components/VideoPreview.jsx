"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ✅ Player caricato SOLO lato browser
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

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function getPreset(motionStyle) {
  switch (motionStyle) {
    case "soft":
      return {
        stagger: 6,
        springCfg: { damping: 18, stiffness: 110, mass: 1 },
        wipeDur: 16,
        floatAmp: 10,
      };
    case "snappy":
      return {
        stagger: 4,
        springCfg: { damping: 14, stiffness: 180, mass: 0.9 },
        wipeDur: 12,
        floatAmp: 7,
      };
    default:
      return {
        stagger: 5,
        springCfg: { damping: 16, stiffness: 150, mass: 1 },
        wipeDur: 14,
        floatAmp: 8,
      };
  }
}

function TextIn({ children, start = 0, fromY = 32, preset }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame: frame - start,
    fps,
    config: preset.springCfg,
    durationInFrames: 22,
  });

  const translateY = (1 - p) * fromY;
  const opacity = clamp(p, 0, 1);

  return <div style={{ transform: `translateY(${translateY}px)`, opacity }}>{children}</div>;
}

function WipeBar({ start = 0, preset, color }) {
  const frame = useCurrentFrame();

  const prog = interpolate(frame, [start, start + preset.wipeDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        height: 6,
        width: 260,
        borderRadius: 999,
        background: color,
        transformOrigin: "left center",
        transform: `scaleX(${prog})`,
        opacity: 0.9,
      }}
    />
  );
}

function FloatingBlob({ start = 0, preset, accent }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame: frame - start,
    fps,
    config: preset.springCfg,
    durationInFrames: 24,
  });

  const t = (frame - (start + 20)) / fps;
  const float = Math.sin(t * 1.2) * preset.floatAmp;

  const opacity = clamp(p, 0, 1) * 0.18;
  const scale = 0.85 + 0.15 * p;

  return (
    <div
      style={{
        position: "absolute",
        right: -220,
        top: -220,
        width: 520,
        height: 520,
        borderRadius: 999,
        background: accent,
        opacity,
        transform: `translateY(${float}px) scale(${scale})`,
      }}
    />
  );
}

function FooterLogo({ brand, start = 0 }) {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [start, start + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ position: "absolute", left: 56, bottom: 44, opacity: op * 0.7 }}>
      <img
        src={brand?.footerLogoSrc || "/brand/logo.svg"}
        alt="Brand logo"
        style={{ height: 14, width: "auto", display: "block" }}
      />
    </div>
  );
}

function SceneImpl({ width, height, palette, content, brand, motionStyle }) {
  const preset = getPreset(motionStyle);

  const headlineSize = Math.round(width * 0.075);
  const subSize = Math.round(width * 0.028);
  const bodySize = Math.round(width * 0.020);

  const accent = palette?.accent || "#7C3AED";
  const metaColor = palette?.meta || "rgba(255,255,255,0.6)";
  const subColor = palette?.subheadline || "rgba(255,255,255,0.88)";
  const bg = palette?.background || "#0b0f19";

  const start = 0;

  return (
    <AbsoluteFill style={{ background: bg, color: palette?.headline || "#fff" }}>
      <FloatingBlob start={start + 2} preset={preset} accent={accent} />

      <div style={{ padding: 56, position: "relative", height: "100%" }}>
        <div style={{ fontSize: 14, opacity: 0.75, color: metaColor }}>
          {brand?.templateLabel || "TEMPLATE"}
        </div>

        <div style={{ marginTop: 140 }}>
          <TextIn start={start + 0} fromY={42} preset={preset}>
            <div style={{ fontSize: headlineSize, fontWeight: 700, lineHeight: 1.03 }}>
              {content?.headline}
            </div>
          </TextIn>

          <div style={{ marginTop: 14 }}>
            <TextIn start={start + preset.stagger} fromY={28} preset={preset}>
              <div style={{ fontSize: subSize, lineHeight: 1.2, color: subColor }}>
                {content?.subheadline}
              </div>
            </TextIn>
          </div>

          <div style={{ marginTop: 18, maxWidth: Math.round(width * 0.74) }}>
            <TextIn start={start + preset.stagger * 2} fromY={22} preset={preset}>
              <div style={{ fontSize: bodySize, lineHeight: 1.4, color: subColor, opacity: 0.95 }}>
                {content?.body}
              </div>
            </TextIn>
          </div>

          <div style={{ marginTop: 22 }}>
            <WipeBar start={start + preset.stagger} preset={preset} color={accent} />
          </div>
        </div>

        <FooterLogo brand={brand} start={start + preset.stagger * 2} />
      </div>
    </AbsoluteFill>
  );
}

export default function VideoPreview({
  width,
  height,
  palette,
  content,
  brand,
  motionStyle,
}) {
  const fps = 30;
  const durationInFrames = 120;

  const Scene = useMemo(() => {
    return function SceneComponent() {
      return (
        <SceneImpl
          width={width}
          height={height}
          palette={palette}
          content={content}
          brand={brand}
          motionStyle={motionStyle}
        />
      );
    };
  }, [width, height, palette, content, brand, motionStyle]);

  return (
    <Player
      component={Scene}
      durationInFrames={durationInFrames}
      compositionWidth={width}
      compositionHeight={height}
      fps={fps}
      controls
      loop
      autoPlay
      style={{
        width: "min(980px, 100%)",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "#000",
      }}
    />
  );
}
