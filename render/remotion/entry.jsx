import React from "react";
import { registerRoot } from "remotion";
import {
  Composition,
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  Img
} from "remotion";

/* =======================
   LOAD BRAND FILES
======================= */

import brandConfig from "../../Brand/brand.config.json";
import colors from "../../Brand/colors.json";
import fonts from "../../Brand/fonts.json";
import motionPresets from "../../Brand/motion.json";
import logo from "../../Brand/logo.svg";

/* =======================
   MOTION HELPERS
======================= */

const easingMap = {
  cubic: Easing.out(Easing.cubic),
  back: Easing.out(Easing.back(1.2)),
  linear: Easing.linear
};

function useEnterMotion({ startAt, preset }) {
  const frame = useCurrentFrame();

  const ease = easingMap[preset.easing] ?? Easing.out(Easing.cubic);

  const opacity = interpolate(
    frame,
    [startAt, startAt + preset.inFrames],
    [preset.opacityFrom ?? 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }
  );

  const translateY = interpolate(
    frame,
    [startAt, startAt + preset.inFrames],
    [preset.y ?? 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }
  );

  const scale = interpolate(
    frame,
    [startAt, startAt + preset.inFrames],
    [preset.scaleFrom ?? 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }
  );

  return {
    opacity,
    transform: `translateY(${translateY}px) scale(${scale})`
  };
}

/* =======================
   TEMPLATE
======================= */

const Template01 = ({
  headline,
  subheadline,
  paletteKey,
  motionStyle
}) => {
  const palette =
    colors[paletteKey] ?? colors[brandConfig.defaultPalette];

  const preset =
    motionPresets[motionStyle] ??
    motionPresets[brandConfig.allowedMotionStyles[0]];

  const headlineMotion = useEnterMotion({
    startAt: 12,
    preset
  });

  const subMotion = useEnterMotion({
    startAt: 12 + preset.stagger,
    preset
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.background,
        padding: 80,
        boxSizing: "border-box",
        fontFamily: fonts.headline.family,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >
      {/* LOGO */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 48,
          transform: `scale(${brandConfig.logoScale ?? 0.12})`,
          transformOrigin: "top left"
        }}
      >
        <Img src={logo} />
      </div>

      {/* HEADLINE */}
      <div
        style={{
          ...headlineMotion,
          fontSize: 84,
          fontWeight: fonts.headline.weight,
          letterSpacing: fonts.headline.letterSpacing,
          lineHeight: 1.05,
          color: palette.headline,
          maxWidth: 900
        }}
      >
        {headline}
      </div>

      {/* SUBHEADLINE */}
      <div
        style={{
          ...subMotion,
          marginTop: 20,
          fontFamily: fonts.subheadline.family,
          fontSize: 32,
          fontWeight: fonts.subheadline.weight,
          letterSpacing: fonts.subheadline.letterSpacing,
          color: palette.subheadline,
          maxWidth: 760
        }}
      >
        {subheadline}
      </div>
    </AbsoluteFill>
  );
};

/* =======================
   ROOT
======================= */

const Root = () => (
  <Composition
    id="Template01"
    component={Template01}
    width={1080}
    height={1080}
    fps={30}
    durationInFrames={120}
    defaultProps={{
      headline: "OMNI Intelligence",
      subheadline: "Infrastructure for autonomous systems",
      paletteKey: brandConfig.defaultPalette,
      motionStyle: brandConfig.allowedMotionStyles[0]
    }}
  />
);

registerRoot(Root);
