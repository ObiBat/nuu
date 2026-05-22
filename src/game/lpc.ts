import type Phaser from "phaser";

// LPC character presets — built by scripts/build_lpc.py into 576x256 walk
// sheets: 9 frames per row, rows = up, left, down, right (64px frames).
export const LPC_PRESETS = ["wanderer", "nomad", "steppe"] as const;
export type LpcPreset = (typeof LPC_PRESETS)[number];

export type Dir4 = "up" | "left" | "down" | "right";
const ROW: Record<Dir4, number> = { up: 0, left: 1, down: 2, right: 3 };
const COLS = 9;

export function lpcTextureKey(preset: LpcPreset): string {
  return `lpc-${preset}`;
}

export function preloadLpc(scene: Phaser.Scene) {
  for (const preset of LPC_PRESETS) {
    scene.load.spritesheet(lpcTextureKey(preset), `/art/characters/${preset}.png`, {
      frameWidth: 64,
      frameHeight: 64,
    });
  }
}

export function lpcWalkAnim(preset: LpcPreset, dir: Dir4): string {
  return `${preset}-walk-${dir}`;
}

// Register walk animations for a preset (idle is a single frame, set directly).
export function registerLpcAnims(scene: Phaser.Scene, preset: LpcPreset) {
  const key = lpcTextureKey(preset);
  (Object.keys(ROW) as Dir4[]).forEach((dir) => {
    const anim = lpcWalkAnim(preset, dir);
    if (scene.anims.exists(anim)) return;
    const start = ROW[dir] * COLS;
    scene.anims.create({
      key: anim,
      frames: scene.anims.generateFrameNumbers(key, {
        start: start + 1,
        end: start + COLS - 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
  });
}

// Idle frame index for a direction (the neutral standing pose, column 0).
export function lpcIdleFrame(dir: Dir4): number {
  return ROW[dir] * COLS;
}

export function vectorToDir4(dx: number, dy: number): Dir4 {
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}
