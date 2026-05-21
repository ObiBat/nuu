import { ImageResponse } from "next/og";
import { articles, getArticle, articleDateFormat } from "@/lib/library";
import { OG_FONTS, PALETTE } from "@/lib/og-fonts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "nuu library article";

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticleOG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: PALETTE.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Geist Pixel",
            fontSize: 96,
            color: PALETTE.text,
          }}
        >
          nuu library
        </div>
      ),
      { ...size, fonts: OG_FONTS },
    );
  }

  const titleSize =
    article.title.length > 40 ? 92 : article.title.length > 24 ? 116 : 144;

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
            alignItems: "center",
            justifyContent: "space-between",
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
          <span>
            {article.readMinutes} min read ·{" "}
            {articleDateFormat.format(new Date(article.date))}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 36,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 26px",
              borderRadius: 999,
              border: `1.5px solid ${PALETTE.text}`,
              fontFamily: "Geist Mono",
              fontSize: 20,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.32em",
              color: PALETTE.text,
            }}
          >
            {article.tag}
          </div>

          <div
            style={{
              fontFamily: "Geist Pixel",
              fontSize: titleSize,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              maxWidth: 1040,
              color: PALETTE.text,
            }}
          >
            {article.title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
            borderTop: `1px solid ${PALETTE.border}`,
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: "Geist Mono",
                fontSize: 14,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.32em",
                color: PALETTE.textMuted,
              }}
            >
              by
            </span>
            <span
              style={{
                fontFamily: "Geist Pixel",
                fontSize: 28,
                letterSpacing: "-0.01em",
                color: PALETTE.text,
              }}
            >
              {article.author}
            </span>
          </div>
          <div
            style={{
              fontFamily: "Geist Mono",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: PALETTE.textMuted,
            }}
          >
            nuu.community
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: OG_FONTS },
  );
}
