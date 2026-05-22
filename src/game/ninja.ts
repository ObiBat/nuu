import type Phaser from "phaser";

// Ninja Adventure (CC0) characters. Walk.png = 64x64, 16px frames, 4 cols
// (down, up, left, right) x 4 rows (walk frames). Idle.png = 64x16, 4 frames
// (one per direction). Faceset.png = 38x38 portrait.
export const NINJA_PRESETS = [
  "Boy",
  "Woman",
  "Villager",
  "Villager2",
  "Noble",
  "OldMan",
  "Monk",
  "Hunter",
] as const;
export type NinjaPreset = (typeof NINJA_PRESETS)[number];

export type Dir4 = "down" | "up" | "left" | "right";
const COL: Record<Dir4, number> = { down: 0, up: 1, left: 2, right: 3 };

export function ninjaWalkKey(p: NinjaPreset) {
  return `ninja-walk-${p}`;
}
export function ninjaIdleKey(p: NinjaPreset) {
  return `ninja-idle-${p}`;
}
export function ninjaFaceKey(p: NinjaPreset) {
  return `ninja-face-${p}`;
}
export function ninjaWalkAnim(p: NinjaPreset, dir: Dir4) {
  return `${p}-walk-${dir}`;
}

export function preloadNinja(scene: Phaser.Scene) {
  for (const p of NINJA_PRESETS) {
    scene.load.spritesheet(ninjaWalkKey(p), `/art/ninja/char/${p}/Walk.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });
    scene.load.spritesheet(ninjaIdleKey(p), `/art/ninja/char/${p}/Idle.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });
    scene.load.image(ninjaFaceKey(p), `/art/ninja/char/${p}/Faceset.png`);
  }
}

// Walk frames for a direction: that column across the 4 rows (row-major, 4 wide).
function walkFrames(dir: Dir4): number[] {
  const c = COL[dir];
  return [c, c + 4, c + 8, c + 12];
}

export function registerNinjaAnims(scene: Phaser.Scene, p: NinjaPreset) {
  (Object.keys(COL) as Dir4[]).forEach((dir) => {
    const key = ninjaWalkAnim(p, dir);
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: walkFrames(dir).map((f) => ({ key: ninjaWalkKey(p), frame: f })),
      frameRate: 8,
      repeat: -1,
    });
  });
}

export function ninjaIdleFrame(dir: Dir4): number {
  return COL[dir];
}

export function vectorToDir4(dx: number, dy: number): Dir4 {
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}
