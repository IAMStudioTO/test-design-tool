"use client";

import {
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import brandMotion from "../../../Brand/motion.json";

export function MotionSlot({ name, children, motionKey, index }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = brandMotion[motionKey] || brandMotion.standard;

  const delay = index * preset.text.stagger;

  const p = spring({
    frame: frame - delay,
    fps,
    config: preset.text.spring,
  });

  const opacity = preset.text.type === "fade" ? p : Math.min(p * 1.2, 1);
  const translateY = preset.text.type.includes("up") ? (1 - p) * 32 : 0;

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
}
