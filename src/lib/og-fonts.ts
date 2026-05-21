import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Brand fonts for OG images. Satori (the renderer behind @vercel/og) only
 * accepts TTF/OTF, while Geist ships as woff2 — so we keep pre-converted
 * TTFs in src/lib/og-fonts/. Run `node scripts/convert-og-fonts.mjs` after
 * a Geist upgrade to regenerate.
 */
const DIR = join(process.cwd(), "src/lib/og-fonts");

const geistPixelSquare = readFileSync(join(DIR, "GeistPixel-Square.ttf"));
const geistMonoRegular = readFileSync(join(DIR, "GeistMono-Regular.ttf"));
const geistMonoMedium = readFileSync(join(DIR, "GeistMono-Medium.ttf"));
const geistSansRegular = readFileSync(join(DIR, "Geist-Regular.ttf"));
const geistSansMedium = readFileSync(join(DIR, "Geist-Medium.ttf"));

export const OG_FONTS = [
  {
    name: "Geist Pixel",
    data: geistPixelSquare,
    style: "normal" as const,
    weight: 500 as const,
  },
  {
    name: "Geist Mono",
    data: geistMonoRegular,
    style: "normal" as const,
    weight: 400 as const,
  },
  {
    name: "Geist Mono",
    data: geistMonoMedium,
    style: "normal" as const,
    weight: 500 as const,
  },
  {
    name: "Geist Sans",
    data: geistSansRegular,
    style: "normal" as const,
    weight: 400 as const,
  },
  {
    name: "Geist Sans",
    data: geistSansMedium,
    style: "normal" as const,
    weight: 500 as const,
  },
];

export const PALETTE = {
  bg: "#ffffff",
  surface: "#fafafa",
  border: "#e5e5e5",
  borderStrong: "#d4d4d4",
  text: "#0a0a0a",
  textSoft: "#1a1a1a",
  textMuted: "#6b7280",
};
