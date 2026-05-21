import { ImageResponse } from "next/og";
import { OG_FONTS, PALETTE } from "@/lib/og-fonts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "nuu — A community of Mongolian builders, breakers, and shippers.";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PALETTE.bg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: PALETTE.text,
          fontFamily: "Geist Sans",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent 0px, transparent 38px, rgba(0,0,0,0.035) 38px, rgba(0,0,0,0.035) 40px),
              repeating-linear-gradient(90deg, transparent 0px, transparent 38px, rgba(0,0,0,0.035) 38px, rgba(0,0,0,0.035) 40px)
            `,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Geist Mono",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: PALETTE.textMuted,
            zIndex: 1,
          }}
        >
          <span>Нүү · v0.2</span>
          <span>nuu.community</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Geist Pixel",
              fontSize: 280,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: PALETTE.text,
            }}
          >
            nuu.
          </div>
          <div
            style={{
              fontFamily: "Geist Sans",
              fontSize: 38,
              fontWeight: 400,
              lineHeight: 1.3,
              maxWidth: 900,
              color: PALETTE.textSoft,
            }}
          >
            A community of Mongolian builders, breakers, and shippers —
            scattered across the world, gathered here.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
            borderTop: `1px solid ${PALETTE.border}`,
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontFamily: "Geist Pixel",
              fontSize: 48,
              color: PALETTE.text,
              letterSpacing: "-0.02em",
            }}
          >
            Your move.
          </div>
          <div
            style={{
              fontFamily: "Geist Mono",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: PALETTE.textMuted,
            }}
          >
            sydney · ulaanbaatar · everywhere
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: OG_FONTS },
  );
}
