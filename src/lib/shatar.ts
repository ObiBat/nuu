export type ShatarPiece = {
  id: string;
  english: string;
  mongolian: string;
  script: string;
  /** Chess piece code: K, Q, B, N, R, P (mapped to Cburnett SVG files) */
  pieceCode: "K" | "Q" | "B" | "N" | "R" | "P";
  movement: string;
  description: string;
};

export type Offset = [number, number];

export type PieceMoves = {
  /** Squares the piece can move TO (relative to center 3,3 on a 7x7 board) */
  moves: Offset[];
  /** Squares only reachable as captures (Khüü only — pawn diagonal captures) */
  captures?: Offset[];
};

/** Generate slider offsets along a direction up to `range` steps. */
function slide(dx: number, dy: number, range: number): Offset[] {
  const result: Offset[] = [];
  for (let i = 1; i <= range; i++) {
    result.push([dx * i, dy * i]);
  }
  return result;
}

const ORTHO_DIRS: Offset[] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];
const DIAG_DIRS: Offset[] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

export const SHATAR_PIECES: ShatarPiece[] = [
  {
    id: "noyon",
    english: "Noyon",
    mongolian: "Noyon",
    script: "нойон",
    pieceCode: "K",
    movement: "one square in any direction",
    description:
      "The lord. The piece you protect. Mate him and the game ends.",
  },
  {
    id: "bers",
    english: "Bers",
    mongolian: "Bers",
    script: "бэрс",
    pieceCode: "Q",
    movement: "diagonals, ranks, and files — any distance",
    description:
      "The companion. The most powerful piece on the board, moving like the queen of Western chess.",
  },
  {
    id: "tem",
    english: "Tem",
    mongolian: "Temee",
    script: "тэмээ",
    pieceCode: "B",
    movement: "any distance along a diagonal",
    description: "The camel. The bishop of the steppe — long-range, patient.",
  },
  {
    id: "morin",
    english: "Morin",
    mongolian: "Mor",
    script: "морь",
    pieceCode: "N",
    movement: "L-jump; the only piece that leaps",
    description:
      "The horse. Knight's move — two squares one direction, then one square perpendicular.",
  },
  {
    id: "tereg",
    english: "Tereg",
    mongolian: "Tereg",
    script: "тэрэг",
    pieceCode: "R",
    movement: "any distance along a rank or file",
    description: "The cart. The rook of the plains — straight, decisive.",
  },
  {
    id: "khuu",
    english: "Khüü",
    mongolian: "Khuu",
    script: "хүү",
    pieceCode: "P",
    movement: "one square forward; captures one diagonally forward",
    description:
      "The boy. The pawn. No two-square first move. Promotes only to a Bers.",
  },
];

export const SHATAR_MOVES: Record<string, PieceMoves> = {
  noyon: {
    moves: [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ],
  },
  bers: {
    moves: [
      ...slide(0, -1, 3),
      ...slide(0, 1, 3),
      ...slide(-1, 0, 3),
      ...slide(1, 0, 3),
      ...slide(-1, -1, 3),
      ...slide(1, -1, 3),
      ...slide(-1, 1, 3),
      ...slide(1, 1, 3),
    ],
  },
  tem: {
    moves: [
      ...slide(-1, -1, 3),
      ...slide(1, -1, 3),
      ...slide(-1, 1, 3),
      ...slide(1, 1, 3),
    ],
  },
  morin: {
    moves: [
      [-1, -2],
      [1, -2],
      [-2, -1],
      [2, -1],
      [-2, 1],
      [2, 1],
      [-1, 2],
      [1, 2],
    ],
  },
  tereg: {
    moves: [
      ...slide(0, -1, 3),
      ...slide(0, 1, 3),
      ...slide(-1, 0, 3),
      ...slide(1, 0, 3),
    ],
  },
  khuu: {
    moves: [[0, -1]],
    captures: [
      [-1, -1],
      [1, -1],
    ],
  },
};

export function pieceImage(code: ShatarPiece["pieceCode"], side: "w" | "b" = "w"): string {
  return `/pieces/${side}${code}.svg`;
}

export const SHATAR_OPENING_SETUP: string[][] = [
  ["tereg", "morin", "tem", "bers", "noyon", "tem", "morin", "tereg"],
  ["khuu", "khuu", "khuu", "khuu", "khuu", "khuu", "khuu", "khuu"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["khuu", "khuu", "khuu", "khuu", "khuu", "khuu", "khuu", "khuu"],
  ["tereg", "morin", "tem", "bers", "noyon", "tem", "morin", "tereg"],
];

// Suppress lint warning for ORTHO_DIRS / DIAG_DIRS which are intentionally
// exported-shaped constants kept for future expansion.
void ORTHO_DIRS;
void DIAG_DIRS;
