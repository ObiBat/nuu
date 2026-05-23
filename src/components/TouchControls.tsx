"use client";

import { useEffect, useRef, useState } from "react";
import { gameEvents } from "@/game/events";

// On-screen controls for touch devices: a left thumb-stick that feeds the
// scene's movement vector, and a right interact button (same as pressing E).
export function TouchControls() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setShow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      gameEvents.setTouch(0, 0);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none">
      <Joystick />
      <button
        type="button"
        aria-label="Interact"
        onPointerDown={(e) => {
          e.preventDefault();
          gameEvents.touchInteract();
        }}
        className="pointer-events-auto absolute bottom-10 right-8 w-20 h-20 rounded-full bg-background/90 border border-border-strong text-foreground font-[family-name:var(--font-pixel)] text-lg shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)] active:scale-95 active:bg-border/60 transition-transform flex items-center justify-center"
      >
        E
      </button>
    </div>
  );
}

function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const R = 44; // max knob travel (px)

  const apply = (e: React.PointerEvent) => {
    if (!active.current || !baseRef.current) return;
    const r = baseRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(dist, R);
    const kx = (dx / dist) * clamped;
    const ky = (dy / dist) * clamped;
    setKnob({ x: kx, y: ky });
    // Small dead zone, then -1..1.
    const mag = clamped / R;
    const out = mag < 0.18 ? 0 : mag;
    gameEvents.setTouch((dx / dist) * out, (dy / dist) * out);
  };

  const start = (e: React.PointerEvent) => {
    active.current = true;
    baseRef.current?.setPointerCapture(e.pointerId);
    apply(e);
  };
  const end = () => {
    active.current = false;
    setKnob({ x: 0, y: 0 });
    gameEvents.setTouch(0, 0);
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={start}
      onPointerMove={apply}
      onPointerUp={end}
      onPointerCancel={end}
      className="pointer-events-auto absolute bottom-10 left-8 w-32 h-32 rounded-full bg-background/40 border border-border-strong/60 backdrop-blur-sm touch-none"
    >
      <div
        className="absolute top-1/2 left-1/2 w-14 h-14 -ml-7 -mt-7 rounded-full bg-background/90 border border-border-strong shadow"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
