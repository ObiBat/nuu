import Phaser from "phaser";

export type SpriteLegend = Record<string, string | null>;

export function createPixelTexture(
  scene: Phaser.Scene,
  key: string,
  rows: string[],
  legend: SpriteLegend,
) {
  if (scene.textures.exists(key)) return;
  const h = rows.length;
  const w = rows[0].length;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x] ?? ".";
      const color = legend[ch];
      const i = (y * w + x) * 4;
      if (color == null) {
        img.data[i + 3] = 0;
        continue;
      }
      const hex = color.replace("#", "");
      img.data[i] = parseInt(hex.slice(0, 2), 16);
      img.data[i + 1] = parseInt(hex.slice(2, 4), 16);
      img.data[i + 2] = parseInt(hex.slice(4, 6), 16);
      img.data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  tex.refresh();
}

const OUTLINE = "#2a1810";
const OUTLINE_SOFT = "#4a3018";
const CREAM = "#f4e8c8";
const CREAM_SHADOW = "#d4c498";

export const CHAR_TEMPLATE = [
  "................",
  ".....KKKKKK.....",
  "....KhhhhhhK....",
  "....KhhhhhhK....",
  "....KhsssshK....",
  "....KsKssKsK....",
  "....KssssssK....",
  "....KsSSS ssK...",
  ".....KssssK.....",
  "....KKttttKK....",
  "...KttttttttK...",
  "...KtttttttK....",
  "...KtttttttK....",
  "...KtttttttK....",
  "....KttttttK....",
  "....KppppppK....",
  "....KppppppK....",
  "....KppoooppK...",
  "....Kp....pK....",
  "....Kp....pK....",
  "....Kx....xK....",
  ".....x....x.....",
];

export const CHAR_WALK_TEMPLATE = [
  "................",
  ".....KKKKKK.....",
  "....KhhhhhhK....",
  "....KhhhhhhK....",
  "....KhsssshK....",
  "....KsKssKsK....",
  "....KssssssK....",
  "....KsSSS ssK...",
  ".....KssssK.....",
  "....KKttttKK....",
  "...KttttttttK...",
  "...KtttttttK....",
  "...KtttttttK....",
  "...KtttttttK....",
  "....KttttttK....",
  "....KppppppK....",
  "....KppppppK....",
  "....KppoooppK...",
  "...Kp...p..K....",
  "...Kp...p..K....",
  "...Kx...x..K....",
  "....xx....x.....",
];

function buildLegend(opts: {
  skin: string;
  skinShadow: string;
  hair: string;
  shirt: string;
  shirtShadow: string;
  pants: string;
  shoes: string;
}): SpriteLegend {
  return {
    ".": null,
    " ": null,
    K: OUTLINE,
    s: opts.skin,
    S: opts.skinShadow,
    h: opts.hair,
    t: opts.shirt,
    o: opts.shirtShadow,
    p: opts.pants,
    x: opts.shoes,
  };
}

const PALETTES = {
  player: buildLegend({
    skin: "#f5d4b3",
    skinShadow: "#c89878",
    hair: "#2a1810",
    shirt: "#f4e8c8",
    shirtShadow: "#c8b88a",
    pants: "#5a3a20",
    shoes: "#2a1810",
  }),
  obi: buildLegend({
    skin: "#e8c399",
    skinShadow: "#b8946e",
    hair: "#1a0e08",
    shirt: "#3a3a3a",
    shirtShadow: "#1f1f1f",
    pants: "#2a1810",
    shoes: "#1a0e08",
  }),
  ruby: buildLegend({
    skin: "#f5d4b3",
    skinShadow: "#c89878",
    hair: "#5a2814",
    shirt: "#c5302c",
    shirtShadow: "#8a1f1f",
    pants: "#3a2818",
    shoes: "#2a1810",
  }),
  azure: buildLegend({
    skin: "#f0c896",
    skinShadow: "#b8946e",
    hair: "#2a1810",
    shirt: "#2a6dbf",
    shirtShadow: "#1e4a85",
    pants: "#3a2818",
    shoes: "#2a1810",
  }),
  forest: buildLegend({
    skin: "#e8c399",
    skinShadow: "#b8946e",
    hair: "#3a2410",
    shirt: "#5a8a36",
    shirtShadow: "#3e6a2a",
    pants: "#3a2818",
    shoes: "#2a1810",
  }),
  sand: buildLegend({
    skin: "#f5d4b3",
    skinShadow: "#c89878",
    hair: "#b08a4a",
    shirt: "#e8b22e",
    shirtShadow: "#a8821f",
    pants: "#5a3a20",
    shoes: "#2a1810",
  }),
};

export const CHAR_SPRITES = {
  playerIdle: { rows: CHAR_TEMPLATE, legend: PALETTES.player },
  playerWalk: { rows: CHAR_WALK_TEMPLATE, legend: PALETTES.player },
  obiIdle: { rows: CHAR_TEMPLATE, legend: PALETTES.obi },
  obiWalk: { rows: CHAR_WALK_TEMPLATE, legend: PALETTES.obi },
  rubyIdle: { rows: CHAR_TEMPLATE, legend: PALETTES.ruby },
  azureIdle: { rows: CHAR_TEMPLATE, legend: PALETTES.azure },
  forestIdle: { rows: CHAR_TEMPLATE, legend: PALETTES.forest },
  sandIdle: { rows: CHAR_TEMPLATE, legend: PALETTES.sand },
};

export const PLAYER_SPRITE = CHAR_TEMPLATE;
export const PLAYER_LEGEND = PALETTES.player;
export const NPC_OBI_SPRITE = CHAR_TEMPLATE;
export const NPC_OBI_LEGEND = PALETTES.obi;

export const POI_NOTICE_SPRITE = [
  "................................",
  "................................",
  "...oooooooooooooooooooooooooo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oWoooooooWWWoooooooooWWWWo...",
  "...oWoooooooWWWoooooooooWWWWo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oWoooooWWWWWWWWoooooooWWWo...",
  "...oWoooooWWWWWWWWoooooooWWWo...",
  "...oWoooooWWWWWWWWoooooooWWWo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oWoooooWWWWooooooooWWWWWWo...",
  "...oWoooooWWWWooooooooWWWWWWo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oWoooooooWWWoooooooooWWWWo...",
  "...oWoooooooWWWoooooooooWWWWo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oooooooooooooooooooooooooo...",
  "..............oooo..............",
  "..............oggo..............",
  "..............oggo..............",
  "..............oggo..............",
  "..............oggo..............",
  "..............oggo..............",
  "..............oggo..............",
  "..............oggo..............",
  "............oogggoo.............",
  "...........oggggggo.............",
  "..........oggoooooggo...........",
  "..........oggoooooggo...........",
  "..........oooooooooooo..........",
  "................................",
];

export const POI_NOTICE_LEGEND: SpriteLegend = {
  ".": null,
  o: OUTLINE,
  W: CREAM,
  g: "#785030",
};

export const POI_PAVILION_SPRITE = [
  "................................",
  "................oo..............",
  "...............oRRo.............",
  "..............ooRRoo............",
  ".............oRRRRRRo...........",
  "............oRRRRRRRRo..........",
  "...........oRRRBRRRBRRo.........",
  "..........oRRBRRRRRRRRBRo.......",
  ".........oRRRRRRBRRRRRRRRo......",
  "........oRRRBRRRRRRRRBRRRRRo....",
  ".......oRRRRRRRRRBRRRRRRRRRRo...",
  "......oRRRRBRRRRRRRRRRRRBRRRRo..",
  ".....ooooooooooooooooooooooooo..",
  ".....oCCCCCCCCCCCCCCCCCCCCCCCo..",
  ".....oWWWWWWWWWWWWWWWWWWWWWWWo..",
  ".....oWWWWWWWWWWWWWWWWWWWWWWWo..",
  ".....oWWWWWWWWWoooooooWWWWWWWo..",
  ".....oWWWWWWWWoDDDDDDDoWWWWWWo..",
  ".....oWWWWWWWWoDDDDDDDoWWWWWWo..",
  ".....oWWWWWWWWoDDDDDDDoWWWWWWo..",
  ".....oWWWWWWWWoDDDDDDDoWWWWWWo..",
  ".....oWWWWWWWWoDDDDDDDoWWWWWWo..",
  ".....oWWWWWWWWoDDDDDDDoWWWWWWo..",
  ".....oWWWWWWWWoDDDDDDDoWWWWWWo..",
  ".....oooooooooooooooooooooooooo.",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
];

export const POI_PAVILION_LEGEND: SpriteLegend = {
  ".": null,
  o: OUTLINE,
  R: "#a85838",
  B: "#7c3a1f",
  W: CREAM,
  C: "#c5302c",
  D: "#5a3a20",
};

export const POI_BOOKSHELF_SPRITE = [
  "................................",
  "...oooooooooooooooooooooooooo...",
  "...oRRRRRRRRRRRRRRRRRRRRRRRRo...",
  "...oRoooooooooooooooooooooRRo...",
  "...oRoWWWoWWoWWWoWWoWWWoWWoRo...",
  "...oRoWWWoWWoWWWoWWoWWWoWWoRo...",
  "...oRoWWWoWWoWWWoWWoWWWoWWoRo...",
  "...oRoooooooooooooooooooooRRo...",
  "...oRRRRRRRRRRRRRRRRRRRRRRRRo...",
  "...oRoooooooooooooooooooooRRo...",
  "...oRoWWoWWWoWoWWoWWWoWWWoWRo...",
  "...oRoWWoWWWoWoWWoWWWoWWWoWRo...",
  "...oRoWWoWWWoWoWWoWWWoWWWoWRo...",
  "...oRoooooooooooooooooooooRRo...",
  "...oRRRRRRRRRRRRRRRRRRRRRRRRo...",
  "...oRoooooooooooooooooooooRRo...",
  "...oRoWWWoWWoWoWWoWWWoWWoWWRo...",
  "...oRoWWWoWWoWoWWoWWWoWWoWWRo...",
  "...oRoWWWoWWoWoWWoWWWoWWoWWRo...",
  "...oRoooooooooooooooooooooRRo...",
  "...oRRRRRRRRRRRRRRRRRRRRRRRRo...",
  "...oRoooooooooooooooooooooRRo...",
  "...oRoWWWoWWWoWWoWWoWoWWWoWRo...",
  "...oRoWWWoWWWoWWoWWoWoWWWoWRo...",
  "...oRoWWWoWWWoWWoWWoWoWWWoWRo...",
  "...oRoooooooooooooooooooooRRo...",
  "...oRRRRRRRRRRRRRRRRRRRRRRRRo...",
  "...oooooooooooooooooooooooooo...",
  "................................",
  "................................",
  "................................",
  "................................",
];

export const POI_BOOKSHELF_LEGEND: SpriteLegend = {
  ".": null,
  o: OUTLINE,
  R: "#7c5530",
  W: "#e8b22e",
};

export const POI_PORTAL_SPRITE = [
  "................................",
  "................................",
  "........BBBBBBBBBBBBBBBB........",
  "......BBBBBBBBBBBBBBBBBBBB......",
  ".....BBBBBBBBBBBBBBBBBBBBBB.....",
  "....BBBBBBBBBBBBBBBBBBBBBBBB....",
  "...BBBBBBBBBBBBBBBBBBBBBBBBBB...",
  "..BBBBBBBBBBBBBBBBBBBBBBBBBBBB..",
  "..BBBBBWWWWBBBBBBBBBBWWWWBBBBB..",
  "..BBBBWWWWWWBBBBBBBBWWWWWWBBBB..",
  "..BBBBWWWWWWBBBBBBBBWWWWWWBBBB..",
  "..BBBBWWWWWWBBBBBBBBWWWWWWBBBB..",
  "..BBBBWWWWWWBBBBBBBBWWWWWWBBBB..",
  "..BBBBWWWWWWBBBBBBBBWWWWWWBBBB..",
  "..BBBBBWWWWBBBBBBBBBBWWWWBBBBB..",
  "..BBBBBBBBBBBBBBBBBBBBBBBBBBBB..",
  "..BBBBBBBBBBBBBBBBBBBBBBBBBBBB..",
  "..BBBBBBBBBBBBBBBBBBBBBBBBBBBB..",
  "..BBBBBBBBBBBBBBBBBBBBBBBBBBBB..",
  "...BBBBBBBBBBBBBBBBBBBBBBBBBB...",
  "....BBBBBBBBBBBBBBBBBBBBBBBB....",
  ".....BBBBBBBB......BBBBBBBB.....",
  ".....BBBBBBBB......BBBBBBBB.....",
  "......BBBBBBB......BBBBBBB......",
  "......BBBBBB........BBBBBB......",
  ".......BBBBB........BBBBB.......",
  "........BBBB........BBBB........",
  ".........BB..........BB.........",
  "................................",
  "................................",
  "................................",
  "................................",
];

export const POI_PORTAL_LEGEND: SpriteLegend = {
  ".": null,
  B: "#5865F2",
  W: "#ffffff",
};

export const PROP_LAMP_SPRITE = [
  "............",
  "....oooo....",
  "...oYYYYo...",
  "...oYGGYo...",
  "...oYGGYo...",
  "...oYYYYo...",
  "....oooo....",
  ".....oo.....",
  ".....oo.....",
  ".....oo.....",
  ".....oo.....",
  ".....oo.....",
  ".....oo.....",
  ".....oo.....",
  "....oooo....",
  "...oooooo...",
  "............",
];

export const PROP_LAMP_LEGEND: SpriteLegend = {
  ".": null,
  o: OUTLINE,
  G: "#e8b22e",
  Y: "#ffe89c",
};

export const PROP_PLANT_SPRITE = [
  "............",
  "....oooo....",
  "...oGGGGo...",
  "..oGGgGgGo..",
  "..oGgGGGGo..",
  "..oGGggGGo..",
  "..oGGGGGGo..",
  "...oGggGo...",
  "....oGGo....",
  ".....oo.....",
  "....oooo....",
  "...obbbbo...",
  "...obbbbo...",
  "...obbbbo...",
  "...obbbbo...",
  "....oooo....",
  "............",
];

export const PROP_PLANT_LEGEND: SpriteLegend = {
  ".": null,
  o: OUTLINE,
  G: "#5a8a36",
  g: "#3e6a24",
  b: "#5a3a20",
};

export const PROP_TREE_SPRITE = [
  "................",
  "................",
  ".......oo.......",
  "......oGGo......",
  ".....oGGGGo.....",
  ".....oGggGo.....",
  "....oGGGGGGo....",
  "....oGgggGGo....",
  "...oGGGGGGGGo...",
  "...oGgggggGGo...",
  "..oGGGGGGGGGGo..",
  "..oGGgggggGGGo..",
  "..oGGGGGGGGGGo..",
  "...oGgggggGGo...",
  "....oGGGGGGo....",
  ".....oooooo.....",
  "......obbo......",
  "......obbo......",
  "......obbo......",
  "......obbo......",
  ".....oboboo.....",
  "....oobbbboo....",
  "................",
  "................",
];

export const PROP_TREE_LEGEND: SpriteLegend = {
  ".": null,
  o: OUTLINE,
  G: "#3e6a24",
  g: "#2a4a18",
  b: "#5a3a20",
};

export const PROP_ROCK_SPRITE = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "......oooo......",
  ".....oGGGGo.....",
  "....oGGggGGo....",
  "...oGgggGgGGo...",
  "..oGGggGGGgGGo..",
  ".oGgggGGggGgGGo.",
  ".oGGgGGgGGGggGo.",
  ".oGGgGGGggGgGGo.",
  "..ooooooooooooo.",
  "................",
  "................",
];

export const PROP_ROCK_LEGEND: SpriteLegend = {
  ".": null,
  o: OUTLINE,
  G: "#a89878",
  g: "#786850",
};

export const POI_SALON_SPRITE = [
  "................................",
  "................................",
  "...oooooooooooooooooooooooooo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oWWooooooooooooooooooooWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWoMMMMMMMMMMMMMMMMMMoWWo...",
  "...oWWooooooooooooooooooooWWo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oWWoDoooooooDoooooooDoWWWo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oWWoDoooooooDoooooooDoWWWo...",
  "...oWWWWWWWWWWWWWWWWWWWWWWWWo...",
  "...oooooooooooooooooooooooooo...",
  "...oo......................oo...",
  "...oo......................oo...",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
];

export const POI_SALON_LEGEND: SpriteLegend = {
  ".": null,
  o: OUTLINE,
  W: "#c8a878",
  M: "#b8d4e0",
  D: "#4a3018",
};

export function buildCharacterRows(
  walking: boolean,
  body: "standard" | "flat",
): string[] {
  const base = walking ? CHAR_WALK_TEMPLATE : CHAR_TEMPLATE;
  if (body === "flat") {
    return base.map((row, i) =>
      i === 17 ? "....KppppppK...." : row,
    );
  }
  return base;
}
