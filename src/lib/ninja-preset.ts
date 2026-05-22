// Ninja Adventure character presets — the source of truth shared by the game
// scene and the React customizer.
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

// Community-flavoured labels for the picker.
export const PRESET_LABELS: Record<NinjaPreset, string> = {
  Boy: "Builder",
  Woman: "Designer",
  Villager: "Nomad",
  Villager2: "Shipper",
  Noble: "Founder",
  OldMan: "Elder",
  Monk: "Maker",
  Hunter: "Scout",
};

export function facesetUrl(p: NinjaPreset): string {
  return `/art/ninja/char/${p}/Faceset.png`;
}

const KEY = "nuu:preset/v1";

export function loadPreset(): NinjaPreset {
  if (typeof window === "undefined") return "Boy";
  const v = window.localStorage.getItem(KEY) as NinjaPreset | null;
  return v && NINJA_PRESETS.includes(v) ? v : "Boy";
}

export function savePreset(p: NinjaPreset) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, p);
  } catch {
    /* ignore quota */
  }
}
