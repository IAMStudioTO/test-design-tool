import React from "react";
import { registerRoot } from "remotion";
import { Composition, AbsoluteFill } from "remotion";

const Template01 = ({ headline, subheadline, palette }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette?.background ?? "#0b0f19",
        color: palette?.headline ?? "#ffffff",
        fontFamily: "system-ui",
        justifyContent: "center",
        padding: 80,
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
        {headline ?? "Branded Creative Tool"}
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 32,
          color: palette?.subheadline ?? "#e5e7eb",
        }}
      >
        {subheadline ?? "MP4 test"}
      </div>
    </AbsoluteFill>
  );
};

const Root = () => {
  return (
    <>
      <Composition
        id="Template01"
        component={Template01}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          headline: "Branded Creative Tool",
          subheadline: "Render MP4 ✅",
          palette: {
            background: "#0b0f19",
            headline: "#ffffff",
            subheadline: "#e5e7eb",
          },
        }}
      />
    </>
  );
};

registerRoot(Root);
