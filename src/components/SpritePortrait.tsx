import {
  NPC_OBI_SPRITE,
  NPC_OBI_LEGEND,
  buildCharacterRows,
  type SpriteLegend,
} from "@/game/sprites";
import { paletteToLegend, type CharacterPalette } from "@/lib/character";

type Props = {
  palette?: CharacterPalette;
  rows?: string[];
  legend?: SpriteLegend;
  scale?: number;
  className?: string;
};

export function SpritePortrait({
  palette,
  rows,
  legend,
  scale = 4,
  className = "",
}: Props) {
  const resolvedRows = palette
    ? buildCharacterRows(false, palette.body)
    : rows ?? NPC_OBI_SPRITE;
  const resolvedLegend: SpriteLegend = palette
    ? paletteToLegend(palette)
    : legend ?? NPC_OBI_LEGEND;
  const w = resolvedRows[0].length;
  const h = resolvedRows.length;

  return (
    <div
      className={`pixelated grid gap-0 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${w}, ${scale}px)`,
        gridTemplateRows: `repeat(${h}, ${scale}px)`,
        width: w * scale,
        height: h * scale,
      }}
      aria-hidden
    >
      {resolvedRows.flatMap((row, y) =>
        Array.from({ length: w }, (_, x) => {
          const ch = row[x] ?? ".";
          const color = resolvedLegend[ch];
          return (
            <div
              key={`${y}-${x}`}
              style={{ background: color ?? "transparent" }}
            />
          );
        }),
      )}
    </div>
  );
}
