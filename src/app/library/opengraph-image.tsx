import { ImageResponse } from "next/og";
import { articles } from "@/lib/library";
import { OG_FONTS, PALETTE } from "@/lib/og-fonts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "nuu library — essays, primers, and guides";

export default function LibraryOG() {
  const featured = articles.slice(0, 3);
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
              repeating-linear-gradient(0deg, transparent 0px, transparent 38px, rgba(0,0,0,0.03) 38px, rgba(0,0,0,0.03) 40px),
              repeating-linear-gradient(90deg, transparent 0px, transparent 38px, rgba(0,0,0,0.03) 38px, rgba(0,0,0,0.03) 40px)
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
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: PALETTE.textMuted,
            zIndex: 1,
          }}
        >
          <span>nuu · library</span>
          <span>{articles.length} pieces</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Geist Pixel",
              fontSize: 168,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: PALETTE.text,
            }}
          >
            Library
          </div>
          <div
            style={{
              fontFamily: "Geist Sans",
              fontSize: 32,
              lineHeight: 1.3,
              color: PALETTE.textSoft,
              maxWidth: 800,
            }}
          >
            Essays, primers, and guides from the community.
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 16,
              borderTop: `1px solid ${PALETTE.border}`,
            }}
          >
            {featured.map((a) => (
              <div
                key={a.slug}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 18,
                  padding: "14px 0",
                  borderBottom: `1px solid ${PALETTE.border}`,
                }}
              >
                <span
                  style={{
                    fontFamily: "Geist Mono",
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.28em",
                    color: PALETTE.textMuted,
                    minWidth: 120,
                  }}
                >
                  {a.tag}
                </span>
                <span
                  style={{
                    fontFamily: "Geist Pixel",
                    fontSize: 28,
                    letterSpacing: "-0.01em",
                    color: PALETTE.text,
                  }}
                >
                  {a.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Geist Mono",
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: PALETTE.textMuted,
            zIndex: 1,
          }}
        >
          <span>read · build · share</span>
          <span>nuu.community/library</span>
        </div>
      </div>
    ),
    { ...size, fonts: OG_FONTS },
  );
}
