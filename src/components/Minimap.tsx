"use client";

import { useEffect, useRef, useState } from "react";
import { gameEvents } from "@/game/events";
import {
  WORLD_W,
  WORLD_H,
  HARBOUR_H,
  BEACH_H,
  MAP_MARKERS,
} from "@/lib/world-map";

// Live minimap (corner) that expands to a full labelled map. The player dot is
// driven straight from gameEvents.playerPos via rAF (no React re-render churn).
export function Minimap() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA"].includes(t.tagName)) return;
      if (e.key === "m" || e.key === "M") setOpen((o) => !o);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open map"
        className="pointer-events-auto absolute top-6 right-6 z-20 rounded-lg overflow-hidden border border-border-strong bg-background/90 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] hover:border-foreground transition-colors animate-[fadeIn_0.3s_ease-out]"
      >
        <MapSvg width={150} labels={false} />
        <span className="block text-center font-mono text-[9px] uppercase tracking-widest text-muted py-1 border-t border-border">
          Map · M
        </span>
      </button>

      {open && (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Map"
        >
          <div
            className="bg-background border border-border-strong rounded-2xl p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-[family-name:var(--font-pixel)] text-lg">
                The Khural
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground"
              >
                Close · esc
              </button>
            </div>
            <MapSvg width={Math.min(620, typeof window !== "undefined" ? window.innerWidth - 80 : 620)} labels />
          </div>
        </div>
      )}
    </>
  );
}

function MapSvg({ width, labels }: { width: number; labels: boolean }) {
  const dot = useRef<SVGCircleElement>(null);
  const height = Math.round((width * WORLD_H) / WORLD_W);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (dot.current) {
        dot.current.setAttribute("cx", String(gameEvents.playerPos.x));
        dot.current.setAttribute("cy", String(gameEvents.playerPos.y));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const r = WORLD_W * 0.012; // marker radius in world units

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
      className="block rounded-md"
      style={{ imageRendering: "pixelated" }}
    >
      <rect x={0} y={0} width={WORLD_W} height={WORLD_H} fill="#73a234" />
      <rect x={0} y={0} width={WORLD_W} height={HARBOUR_H} fill="#71ddee" />
      <rect x={0} y={HARBOUR_H} width={WORLD_W} height={BEACH_H} fill="#f4cf8d" />
      <circle cx={WORLD_W / 2} cy={WORLD_H / 2} r={150} fill="#ead0a0" />

      {/* paths */}
      {MAP_MARKERS.filter((m) => m.kind === "poi").map((m) => (
        <line
          key={`p-${m.id}`}
          x1={WORLD_W / 2}
          y1={WORLD_H / 2}
          x2={m.x}
          y2={m.y}
          stroke="#e6c98a"
          strokeWidth={WORLD_W * 0.012}
        />
      ))}

      {MAP_MARKERS.map((m) => (
        <g key={m.id}>
          <circle
            cx={m.x}
            cy={m.y}
            r={r}
            fill={m.kind === "npc" ? "#e8b22e" : "#2a1810"}
            stroke="#fff"
            strokeWidth={r * 0.3}
          />
          {labels && (
            <text
              x={m.x}
              y={m.y - r - 8}
              fontSize={WORLD_W * 0.018}
              textAnchor="middle"
              fill="#2a1810"
              style={{ fontFamily: "monospace", fontWeight: 700 }}
            >
              {m.label}
            </text>
          )}
        </g>
      ))}

      {/* live player */}
      <circle
        ref={dot}
        cx={WORLD_W / 2}
        cy={WORLD_H * 0.58}
        r={r * 1.15}
        fill="#c5302c"
        stroke="#fff"
        strokeWidth={r * 0.4}
      />
    </svg>
  );
}
