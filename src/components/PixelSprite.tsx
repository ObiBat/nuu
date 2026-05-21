import type { SpriteLegend } from "@/game/sprites";

type Props = {
  rows: string[];
  legend: SpriteLegend;
  scale?: number;
  className?: string;
  ariaLabel?: string;
};

export function PixelSprite({
  rows,
  legend,
  scale = 4,
  className = "",
  ariaLabel,
}: Props) {
  const w = rows[0].length;
  const h = rows.length;
  return (
    <div
      className={`pixelated grid gap-0 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${w}, ${scale}px)`,
        gridTemplateRows: `repeat(${h}, ${scale}px)`,
        width: w * scale,
        height: h * scale,
      }}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    >
      {rows.flatMap((row, y) =>
        Array.from({ length: w }, (_, x) => {
          const ch = row[x] ?? ".";
          const color = legend[ch];
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
