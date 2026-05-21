"use client";

import { useEffect, useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { SpritePortrait } from "./SpritePortrait";
import {
  DEFAULT_CHARACTER,
  loadCharacter,
  type CharacterPalette,
} from "@/lib/character";
import { gameEvents } from "@/game/events";

const STAGE_W = 360;
const STAGE_H = 480;
const ROPE_HEIGHT = 80;
const CARD_W = 220;
const CARD_H = 300;
const MAX_TILT = 16;
const FLIP_MOVE_THRESHOLD = 6;
const DRAG_TO_TILT = 0.18;
const PARALLAX_MAX_YAW = 14;
const PARALLAX_MAX_PITCH = 8;

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export function HeroLanyard() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [flipPulse, setFlipPulse] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [palette, setPalette] = useState<CharacterPalette>(DEFAULT_CHARACTER);

  const idleTiltRef = useRef(0);
  const targetParallax = useRef({ yaw: 0, pitch: 0 });
  const currentParallax = useRef({ yaw: 0, pitch: 0 });
  const [, forceTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    setPalette(loadCharacter());
    const onCharacter = (e: Event) => {
      const ce = e as CustomEvent<CharacterPalette>;
      setPalette(ce.detail);
    };
    gameEvents.addEventListener("character:update", onCharacter);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMotion = () => setReduced(mq.matches);
    mq.addEventListener("change", onMotion);
    return () => {
      gameEvents.removeEventListener("character:update", onCharacter);
      mq.removeEventListener("change", onMotion);
    };
  }, []);

  useEffect(() => {
    if (!mounted || reduced) return;
    let raf: number;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      const idleAmp = hovered ? 0.7 : 1.4;
      idleTiltRef.current = Math.sin(elapsed * 0.9) * idleAmp;

      const lerp = 0.14;
      currentParallax.current.yaw +=
        (targetParallax.current.yaw - currentParallax.current.yaw) * lerp;
      currentParallax.current.pitch +=
        (targetParallax.current.pitch - currentParallax.current.pitch) * lerp;

      forceTick((n) => (n + 1) % 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted, reduced, hovered]);

  const bind = useDrag(
    ({ down, movement: [mx], tap, last }) => {
      if (
        tap ||
        (last && Math.hypot(mx, 0) < FLIP_MOVE_THRESHOLD && Math.abs(mx) < FLIP_MOVE_THRESHOLD)
      ) {
        triggerFlip();
        return;
      }
      if (down) {
        targetParallax.current = { yaw: 0, pitch: 0 };
        const t = clamp(mx * DRAG_TO_TILT, -MAX_TILT, MAX_TILT);
        setTilt(t);
      } else {
        setTilt(0);
      }
    },
    { filterTaps: true },
  );

  const triggerFlip = () => {
    setFlipped((f) => !f);
    setFlipPulse(true);
    window.setTimeout(() => setFlipPulse(false), 320);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cardTop = rect.top + 14 + ROPE_HEIGHT;
    const cardCenterY = cardTop + CARD_H / 2;
    const nx = (e.clientX - cx) / (CARD_W / 2);
    const ny = (e.clientY - cardCenterY) / (CARD_H / 2);
    targetParallax.current = {
      yaw: clamp(nx, -1.2, 1.2) * PARALLAX_MAX_YAW,
      pitch: clamp(ny, -1.2, 1.2) * PARALLAX_MAX_PITCH,
    };
  };

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => {
    setHovered(false);
    targetParallax.current = { yaw: 0, pitch: 0 };
  };

  const releaseTransition = reduced
    ? "none"
    : "transform 1s cubic-bezier(0.22, 1.6, 0.36, 1)";

  const effectiveSwing = tilt !== 0 ? tilt : idleTiltRef.current;
  const yaw = reduced || tilt !== 0 ? 0 : currentParallax.current.yaw;
  const pitch = reduced || tilt !== 0 ? 0 : currentParallax.current.pitch;
  const pulseScale = flipPulse ? 1.04 : 1;

  return (
    <div
      ref={stageRef}
      className="relative mx-auto select-none group"
      style={{ width: STAGE_W, height: STAGE_H }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
        width="20"
        height="20"
        aria-hidden
      >
        <circle cx="10" cy="10" r="5" fill="var(--foreground)" />
        <circle cx="10" cy="10" r="2" fill="var(--background)" />
      </svg>

      <div
        {...bind()}
        role="button"
        tabIndex={0}
        aria-label="Member ID badge — drag to swing, click or press Enter to flip"
        aria-pressed={flipped}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerFlip();
          }
        }}
        className="absolute left-1/2 cursor-grab active:cursor-grabbing focus:outline-none focus-visible:after:content-[''] focus-visible:after:absolute focus-visible:after:-inset-2 focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-foreground focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-background touch-none"
        style={{
          top: 14,
          width: CARD_W,
          marginLeft: -CARD_W / 2,
          transform: `rotate(${effectiveSwing}deg)`,
          transformOrigin: `${CARD_W / 2}px 0px`,
          transition: tilt === 0 ? releaseTransition : "none",
          willChange: "transform",
        }}
      >
        <div
          className="mx-auto bg-border-strong"
          style={{ width: 2, height: ROPE_HEIGHT }}
          aria-hidden
        />
        <div
          style={{
            width: CARD_W,
            height: CARD_H,
            perspective: 1200,
          }}
        >
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `rotateY(${-yaw}deg) rotateX(${-pitch}deg) scale(${pulseScale})`,
              transformStyle: "preserve-3d",
              transition:
                tilt !== 0
                  ? "transform 0.05s linear"
                  : flipPulse
                    ? "transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : "transform 0.3s ease-out",
            }}
          >
            <FlipCard flipped={flipped} palette={palette} hovered={hovered} />
          </div>
        </div>
      </div>

      <p
        className={`absolute left-1/2 -translate-x-1/2 bottom-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition-opacity duration-300 pointer-events-none ${
          hovered && !reduced ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        drag · click to flip
      </p>
    </div>
  );
}

function FlipCard({
  flipped,
  palette,
  hovered,
}: {
  flipped: boolean;
  palette: CharacterPalette;
  hovered: boolean;
}) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700 ease-out"
      style={{
        transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
    >
      <CardFace front palette={palette} hovered={hovered} />
      <CardFace palette={palette} hovered={hovered} />
    </div>
  );
}

function CardFace({
  front = false,
  palette,
  hovered,
}: {
  front?: boolean;
  palette: CharacterPalette;
  hovered: boolean;
}) {
  const shadow = hovered
    ? "0 32px 80px -20px rgba(0,0,0,0.28), 0 8px 20px -8px rgba(0,0,0,0.12)"
    : "0 24px 60px -20px rgba(0,0,0,0.22)";
  return (
    <div
      className="absolute inset-0 rounded-xl border border-border-strong bg-background p-5 flex flex-col transition-shadow duration-300"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: front ? undefined : "rotateY(180deg)",
        boxShadow: shadow,
      }}
    >
      {front ? <FrontContent palette={palette} /> : <BackContent />}
    </div>
  );
}

function FrontContent({ palette }: { palette: CharacterPalette }) {
  const name = palette.displayName.trim() || "Member";
  const metaParts = [palette.role.trim(), palette.location.trim()].filter(
    Boolean,
  );
  const meta = metaParts.join(" · ");
  const hasMeta = meta.length > 0;
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-pixel)] text-sm">nuu</span>
        <span className="font-mono text-[10px] text-muted">#0001</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <SpritePortrait palette={palette} scale={5} />
        <div className="text-center">
          <div className="font-[family-name:var(--font-pixel)] text-base">
            {name}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
            {hasMeta ? meta : "set your details ↗"}
          </div>
        </div>
      </div>
      <div className="font-mono text-[10px] text-muted text-center">
        member · нүү
      </div>
    </>
  );
}

function BackContent() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Discord
        </span>
        <span className="font-mono text-[10px] text-muted">/nuu</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <PixelQR />
        <a
          href="https://discord.gg/nuu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center h-9 px-4 text-xs font-medium bg-foreground text-background rounded-full hover:bg-accent-subtle hover:scale-[1.03] active:scale-[0.98] transition-transform"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          Join the Discord →
        </a>
      </div>
      <div className="font-mono text-[10px] text-muted text-center">
        scan or click
      </div>
    </>
  );
}

function PixelQR() {
  const size = 21;
  const cells = Array.from({ length: size * size }, (_, i) => {
    const x = i % size;
    const y = Math.floor(i / size);
    const inFinder = (fx: number, fy: number) => {
      const lx = x - fx;
      const ly = y - fy;
      if (lx < 0 || lx > 6 || ly < 0 || ly > 6) return null;
      const outer = lx === 0 || lx === 6 || ly === 0 || ly === 6;
      const inner = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return outer || inner;
    };
    const tl = inFinder(0, 0);
    if (tl !== null) return tl;
    const tr = inFinder(size - 7, 0);
    if (tr !== null) return tr;
    const bl = inFinder(0, size - 7);
    if (bl !== null) return bl;
    return (x * 7 + y * 13 + ((x * y) % 11)) % 5 > 2;
  });
  return (
    <div
      className="grid pixelated rounded-sm p-1 bg-background border border-border"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        width: 92,
        height: 92,
      }}
      aria-hidden
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-foreground" : "bg-background"} />
      ))}
    </div>
  );
}
