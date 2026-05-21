import type { ArticleBlock } from "@/lib/library";
import {
  SHATAR_PIECES,
  SHATAR_OPENING_SETUP,
  SHATAR_MOVES,
  pieceImage,
  type ShatarPiece,
} from "@/lib/shatar";

export function ArticleRenderer({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="text-foreground leading-relaxed">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "intro":
      return (
        <p className="text-lg md:text-xl text-foreground leading-relaxed mb-10 pb-6 border-b border-border">
          {block.text}
        </p>
      );
    case "p":
      return <p className="mb-5 leading-relaxed">{block.text}</p>;
    case "h2":
      return (
        <h2 className="font-[family-name:var(--font-pixel)] text-2xl md:text-3xl tracking-tight mt-14 mb-5">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-medium text-base mt-8 mb-2">{block.text}</h3>
      );
    case "ul":
      return (
        <ul className="mb-6 space-y-2.5">
          {block.items.map((item, j) => (
            <li key={j} className="flex gap-3 leading-relaxed">
              <span
                className="text-muted mt-2 text-[8px] leading-none shrink-0"
                aria-hidden
              >
                ▪
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="my-8 pl-5 border-l-2 border-foreground/40 italic text-muted">
          <p className="text-lg leading-relaxed">{block.text}</p>
          {block.cite && (
            <cite className="block mt-3 text-xs font-mono uppercase not-italic tracking-widest text-muted">
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );
    case "shatar-pieces":
      return <ShatarPiecesGallery />;
    case "shatar-board":
      return <ShatarBoardDiagram caption={block.caption} />;
    case "shatar-move":
      return (
        <ShatarMoveDiagram pieceId={block.pieceId} caption={block.caption} />
      );
  }
}

function ChessPiece({
  piece,
  side = "w",
  size,
}: {
  piece: ShatarPiece;
  side?: "w" | "b";
  size: number;
}) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={pieceImage(piece.pieceCode, side)}
      alt={piece.english}
      width={size}
      height={size}
      className="select-none pointer-events-none"
      draggable={false}
    />
  );
}

function ShatarPiecesGallery() {
  return (
    <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden not-prose">
      {SHATAR_PIECES.map((piece) => (
        <figure
          key={piece.id}
          className="bg-background p-5 flex gap-5 items-start"
        >
          <div
            className="shrink-0 flex items-center justify-center rounded-lg bg-[#f4ead0] border border-border"
            style={{ width: 104, height: 104 }}
          >
            <ChessPiece piece={piece} side="w" size={84} />
          </div>
          <figcaption className="flex flex-col gap-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="font-[family-name:var(--font-pixel)] text-lg leading-none">
                {piece.english}
              </h3>
              <span className="font-mono text-[10px] text-muted">
                {piece.script}
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {piece.movement}
            </p>
            <p className="text-sm text-muted leading-relaxed mt-2">
              {piece.description}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function ShatarBoardDiagram({ caption }: { caption?: string }) {
  const pieceMap = Object.fromEntries(SHATAR_PIECES.map((p) => [p.id, p]));
  return (
    <figure className="my-10 not-prose flex flex-col items-center">
      <div className="bg-[#2a1810] p-3 rounded-xl inline-block">
        <div
          className="grid bg-[#2a1810] gap-0 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
        >
          {SHATAR_OPENING_SETUP.flatMap((row, y) =>
            row.map((pieceId, x) => {
              const isLight = (x + y) % 2 === 0;
              const piece = pieceId ? pieceMap[pieceId] : null;
              const side: "w" | "b" = y < 2 ? "b" : "w";
              return (
                <div
                  key={`${y}-${x}`}
                  className="relative flex items-center justify-center"
                  style={{
                    backgroundColor: isLight ? "#e8d4a0" : "#a08560",
                    width: 48,
                    height: 48,
                  }}
                >
                  {piece && <ChessPiece piece={piece} side={side} size={40} />}
                </div>
              );
            }),
          )}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function ShatarMoveDiagram({
  pieceId,
  caption,
}: {
  pieceId: string;
  caption?: string;
}) {
  const piece = SHATAR_PIECES.find((p) => p.id === pieceId);
  if (!piece) return null;
  const moveSet = SHATAR_MOVES[pieceId];
  if (!moveSet) return null;

  const CENTER = 3;
  const SIZE = 7;
  const CELL = 44;

  const inBounds = (x: number, y: number) =>
    x >= 0 && x < SIZE && y >= 0 && y < SIZE;

  const moveSquares = new Set(
    moveSet.moves
      .map(([dx, dy]) => [CENTER + dx, CENTER + dy] as [number, number])
      .filter(([x, y]) => inBounds(x, y))
      .map(([x, y]) => `${x},${y}`),
  );
  const captureSquares = new Set(
    (moveSet.captures ?? [])
      .map(([dx, dy]) => [CENTER + dx, CENTER + dy] as [number, number])
      .filter(([x, y]) => inBounds(x, y))
      .map(([x, y]) => `${x},${y}`),
  );

  const cells = Array.from({ length: SIZE * SIZE }, (_, i) => {
    const x = i % SIZE;
    const y = Math.floor(i / SIZE);
    return { x, y };
  });

  return (
    <figure className="my-10 not-prose flex flex-col items-center">
      <div className="bg-[#2a1810] p-3 rounded-xl inline-block">
        <div
          className="grid bg-[#2a1810] gap-0 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)` }}
        >
          {cells.map(({ x, y }) => {
            const isLight = (x + y) % 2 === 0;
            const isCenter = x === CENTER && y === CENTER;
            const isMove = moveSquares.has(`${x},${y}`);
            const isCapture = captureSquares.has(`${x},${y}`);
            return (
              <div
                key={`${x}-${y}`}
                className="relative flex items-center justify-center"
                style={{
                  backgroundColor: isLight ? "#e8d4a0" : "#a08560",
                  width: CELL,
                  height: CELL,
                }}
              >
                {isCenter && <ChessPiece piece={piece} side="w" size={36} />}
                {isMove && !isCenter && (
                  <span
                    className="absolute inset-0 m-auto rounded-full opacity-70"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#3a7a3a",
                      boxShadow: "0 0 0 1px #2a1810",
                    }}
                    aria-hidden
                  />
                )}
                {isCapture && !isCenter && (
                  <span
                    className="absolute inset-0 m-auto rounded-full opacity-80"
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: "transparent",
                      border: "2px solid #c5302c",
                    }}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted text-center max-w-md">
          {caption}
        </figcaption>
      )}
      {captureSquares.size > 0 && (
        <p className="mt-2 font-mono text-[10px] text-muted text-center">
          <span className="inline-block w-2 h-2 rounded-full bg-[#3a7a3a] mr-1.5 align-middle" />
          move
          <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-[#c5302c] mx-1.5 align-middle" />
          capture only
        </p>
      )}
    </figure>
  );
}
