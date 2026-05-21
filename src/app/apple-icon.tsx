import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2a1810",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f4e8c8",
          fontSize: 110,
          fontWeight: 700,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          letterSpacing: "-0.06em",
        }}
      >
        n
      </div>
    ),
    { ...size },
  );
}
