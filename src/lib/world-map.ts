// Shared world metadata for the minimap / full map. Keep POI coordinates in
// sync with the POIS array in src/game/KhuralScene.ts.
export const WORLD_W = 1800;
export const WORLD_H = 1200;
export const HARBOUR_H = 230;
export const BEACH_H = 64;
export const SPAWN = { x: WORLD_W / 2, y: WORLD_H * 0.58 };

export type MapMarker = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: "poi" | "npc";
};

export const MAP_MARKERS: MapMarker[] = [
  { id: "notice-board", label: "About", x: 900, y: 300, kind: "poi" },
  { id: "salon", label: "Customize", x: 1240, y: 360, kind: "poi" },
  { id: "pavilion", label: "Events", x: 1500, y: 680, kind: "poi" },
  { id: "bookshelf", label: "Library", x: 300, y: 640, kind: "poi" },
  { id: "portal", label: "Discord", x: 900, y: 980, kind: "poi" },
  { id: "obi", label: "Obi", x: 600, y: 440, kind: "npc" },
];
