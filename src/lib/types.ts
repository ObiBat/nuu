export type Member = {
  id: string;
  ghost: boolean;
  displayName: string;
  role: string;
  bio?: string;
  spriteLayers?: { base: number; hair: number; outfit: number; accessory: number };
  spawnPoint?: { map: string; x: number; y: number };
  dialogue?: string[];
  links?: {
    x?: string;
    github?: string;
    site?: string;
    linkedin?: string;
    email?: string;
  };
  currentProject?: string;
};

export type Poi = {
  id: string;
  label: string;
  glyph: string;
  href: string;
};
