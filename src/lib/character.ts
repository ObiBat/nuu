export type BodyType = "standard" | "flat";

export type CharacterPalette = {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  shoes: string;
  eyes: string;
  body: BodyType;
  displayName: string;
  role: string;
  location: string;
};

export const DEFAULT_CHARACTER: CharacterPalette = {
  skin: "#f5d4b3",
  hair: "#2a1810",
  shirt: "#f4e8c8",
  pants: "#5a3a20",
  shoes: "#2a1810",
  eyes: "#2a1810",
  body: "standard",
  displayName: "",
  role: "",
  location: "",
};

export const IDENTITY_LIMITS = {
  displayName: 24,
  role: 32,
  location: 32,
};

export const BODY_OPTIONS: { value: BodyType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "flat", label: "Flat" },
];

export const SKIN_OPTIONS: { color: string; label: string }[] = [
  { color: "#fce0c0", label: "Porcelain" },
  { color: "#f5d4b3", label: "Light" },
  { color: "#e8c399", label: "Warm" },
  { color: "#d4a884", label: "Tan" },
  { color: "#b88a6a", label: "Bronze" },
  { color: "#8a5e3e", label: "Walnut" },
  { color: "#6a4628", label: "Chestnut" },
  { color: "#3e2818", label: "Espresso" },
];

export const HAIR_OPTIONS: { color: string; label: string }[] = [
  { color: "#2a1810", label: "Black" },
  { color: "#5a3a20", label: "Brown" },
  { color: "#8a5e3e", label: "Light brown" },
  { color: "#c0884a", label: "Dirty blond" },
  { color: "#e8b22e", label: "Blond" },
  { color: "#f4e8c8", label: "Platinum" },
  { color: "#9a9a9a", label: "Grey" },
  { color: "#5a2814", label: "Auburn" },
  { color: "#c5302c", label: "Red" },
  { color: "#5a8a36", label: "Green" },
  { color: "#2a6dbf", label: "Blue" },
  { color: "#7a3a8a", label: "Purple" },
];

export const SHIRT_OPTIONS: { color: string; label: string }[] = [
  { color: "#f4e8c8", label: "Cream" },
  { color: "#ffffff", label: "White" },
  { color: "#d4d4d4", label: "Stone" },
  { color: "#9a9a9a", label: "Grey" },
  { color: "#3a3a3a", label: "Charcoal" },
  { color: "#1a1a1a", label: "Black" },
  { color: "#c5302c", label: "Red" },
  { color: "#a83820", label: "Rust" },
  { color: "#2a6dbf", label: "Blue" },
  { color: "#1e4a85", label: "Navy" },
  { color: "#5a8a36", label: "Green" },
  { color: "#3e6a24", label: "Forest" },
  { color: "#e8b22e", label: "Yellow" },
  { color: "#c89620", label: "Gold" },
  { color: "#5865F2", label: "Blurple" },
  { color: "#7a3a8a", label: "Purple" },
];

export const PANTS_OPTIONS: { color: string; label: string }[] = [
  { color: "#5a3a20", label: "Brown" },
  { color: "#2a1810", label: "Dark brown" },
  { color: "#3a2818", label: "Walnut" },
  { color: "#1f1f1f", label: "Black" },
  { color: "#1e2a3a", label: "Indigo" },
  { color: "#2a3848", label: "Slate" },
  { color: "#5a4838", label: "Tan" },
  { color: "#b8a878", label: "Sand" },
];

export const SHOES_OPTIONS: { color: string; label: string }[] = [
  { color: "#2a1810", label: "Dark brown" },
  { color: "#1a1a1a", label: "Black" },
  { color: "#5a3a20", label: "Brown" },
  { color: "#c5302c", label: "Red" },
  { color: "#2a6dbf", label: "Blue" },
  { color: "#ffffff", label: "White" },
];

export const EYE_OPTIONS: { color: string; label: string }[] = [
  { color: "#2a1810", label: "Dark" },
  { color: "#3a2818", label: "Brown" },
  { color: "#5a8a36", label: "Green" },
  { color: "#2a6dbf", label: "Blue" },
  { color: "#7a3a8a", label: "Violet" },
];

const STORAGE_KEY = "nuu:character/v1";

export function loadCharacter(): CharacterPalette {
  if (typeof window === "undefined") return DEFAULT_CHARACTER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CHARACTER;
    const parsed = JSON.parse(raw) as Partial<CharacterPalette>;
    return { ...DEFAULT_CHARACTER, ...parsed };
  } catch {
    return DEFAULT_CHARACTER;
  }
}

export function saveCharacter(palette: CharacterPalette) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function darken(hex: string, amount = 0.32): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const fn = (c: number) =>
    Math.max(0, Math.min(255, Math.floor(c * (1 - amount))));
  return `#${fn(r).toString(16).padStart(2, "0")}${fn(g)
    .toString(16)
    .padStart(2, "0")}${fn(b).toString(16).padStart(2, "0")}`;
}

export function paletteToLegend(
  palette: CharacterPalette,
): Record<string, string | null> {
  return {
    ".": null,
    " ": null,
    K: "#2a1810",
    s: palette.skin,
    S: darken(palette.skin, 0.28),
    h: palette.hair,
    t: palette.shirt,
    o: darken(palette.shirt, 0.32),
    p: palette.pants,
    x: palette.shoes,
    E: palette.eyes,
  };
}
