import type Phaser from "phaser";
import { createPixelTexture, CHAR_TEMPLATE, CHAR_WALK_TEMPLATE } from "./sprites";
import { paletteToLegend, type CharacterPalette } from "@/lib/character";

export type Dir = "down" | "up" | "side";

// Back-of-head head rows (all hair, no face). Body identical to the front
// silhouette so the four directions read as one consistent character.
const UP_HEAD = [
  "................",
  ".....KKKKKK.....",
  "....KhhhhhhK....",
  "....KhhhhhhK....",
  "....KhhhhhhK....",
  "....KhhhhhhK....",
  "....KhhhhhhK....",
  "....KhhhhhhK....",
  ".....KhhhhK.....",
];

// Rows 9..21 of the front idle/walk templates are the body; reuse them so the
// up view shares the exact torso/legs of the front view.
function bodyRows(template: string[]): string[] {
  return template.slice(9);
}

const UP_IDLE = [...UP_HEAD, ...bodyRows(CHAR_TEMPLATE)];
const UP_WALK = [...UP_HEAD, ...bodyRows(CHAR_WALK_TEMPLATE)];

// Side view = front silhouette with a single eye toward the facing edge
// (a subtle 3/4 turn). Left is the same texture mirrored.
function sideOf(template: string[]): string[] {
  return template.map((row, i) => (i === 5 ? "....KssssKsK...." : row));
}
const SIDE_IDLE = sideOf(CHAR_TEMPLATE);
const SIDE_WALK = sideOf(CHAR_WALK_TEMPLATE);

const FRAMES: Record<Dir, [string[], string[]]> = {
  down: [CHAR_TEMPLATE, CHAR_WALK_TEMPLATE],
  up: [UP_IDLE, UP_WALK],
  side: [SIDE_IDLE, SIDE_WALK],
};

// Flat body: collapse the hip flare row so slimmer characters read right.
function applyBody(rows: string[], body: "standard" | "flat"): string[] {
  if (body !== "flat") return rows;
  return rows.map((row, i) => (i === 17 ? "....KppppppK...." : row));
}

export function characterTextureKey(prefix: string, dir: Dir, frame: 0 | 1) {
  return `${prefix}-${dir}-${frame}`;
}

// Register the 6 textures (3 directions × idle/walk) for one character.
export function registerCharacterTextures(
  scene: Phaser.Scene,
  prefix: string,
  palette: CharacterPalette,
) {
  const legend = paletteToLegend(palette);
  (Object.keys(FRAMES) as Dir[]).forEach((dir) => {
    FRAMES[dir].forEach((rows, frame) => {
      const key = characterTextureKey(prefix, dir, frame as 0 | 1);
      if (scene.textures.exists(key)) scene.textures.remove(key);
      createPixelTexture(scene, key, applyBody(rows, palette.body), legend);
    });
  });
}

export function removeCharacterTextures(scene: Phaser.Scene, prefix: string) {
  (["down", "up", "side"] as Dir[]).forEach((dir) => {
    [0, 1].forEach((frame) => {
      const key = characterTextureKey(prefix, dir, frame as 0 | 1);
      if (scene.textures.exists(key)) scene.textures.remove(key);
    });
  });
}

// Resolve a movement/heading vector to a facing direction + horizontal flip.
export function vectorToFacing(dx: number, dy: number): {
  dir: Dir;
  flip: boolean;
} {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { dir: "side", flip: dx < 0 };
  }
  return { dir: dy < 0 ? "up" : "down", flip: false };
}
