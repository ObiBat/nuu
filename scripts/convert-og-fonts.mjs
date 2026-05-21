#!/usr/bin/env node
/**
 * One-time conversion: Geist woff2 → TTF for use in OG image generation.
 * Satori (the renderer behind @vercel/og) only accepts TTF/OTF.
 *
 * Output: src/lib/og-fonts/*.ttf — committed to repo, loaded by OG image files.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import wawoff from "wawoff2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const fontsDir = join(root, "node_modules/geist/dist/fonts");
const outDir = join(root, "src/lib/og-fonts");

mkdirSync(outDir, { recursive: true });

const sources = [
  { in: "geist-pixel/GeistPixel-Square.woff2", out: "GeistPixel-Square.ttf" },
  { in: "geist-mono/GeistMono-Regular.woff2", out: "GeistMono-Regular.ttf" },
  { in: "geist-mono/GeistMono-Medium.woff2", out: "GeistMono-Medium.ttf" },
  { in: "geist-sans/Geist-Regular.woff2", out: "Geist-Regular.ttf" },
  { in: "geist-sans/Geist-Medium.woff2", out: "Geist-Medium.ttf" },
];

for (const src of sources) {
  const inputPath = join(fontsDir, src.in);
  const outputPath = join(outDir, src.out);
  const woff2 = readFileSync(inputPath);
  const ttf = await wawoff.decompress(new Uint8Array(woff2));
  writeFileSync(outputPath, Buffer.from(ttf));
  console.log(`✓ ${src.in} → ${src.out} (${(ttf.length / 1024).toFixed(1)} KB)`);
}

console.log("\nDone. Re-run if Geist updates.");
