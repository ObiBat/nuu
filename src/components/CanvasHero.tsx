"use client";

import { useEffect, useState } from "react";
import GameCanvas from "./GameCanvas";
import { gameEvents } from "@/game/events";

type Phase = "intro" | "playing";

export function CanvasHero() {
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    if (phase === "intro") {
      gameEvents.pauseWorld();
      gameEvents.setImmersed(false);
    } else {
      gameEvents.resumeWorld();
      gameEvents.setImmersed(true);
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      gameEvents.setImmersed(false);
    };
  }, []);

  useEffect(() => {
    if (phase !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" ||
        e.key === "Tab" ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.key === "/"
      )
        return;
      enter();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase]);

  const enter = () => setPhase("playing");
  const returnToIntro = () => setPhase("intro");

  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#6a9050" }}
      aria-label="Nuu pixel world"
    >
      <GameCanvas />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at center, transparent 55%, rgba(40,24,16,0.35) 100%)",
        }}
        aria-hidden
      />

      {phase === "intro" && <IntroOverlay onEnter={enter} />}
      {phase === "playing" && <PlayingHud onReturn={returnToIntro} />}
    </section>
  );
}

function IntroOverlay({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      className="absolute inset-0 z-20 bg-foreground/82 backdrop-blur-md flex items-center justify-center cursor-pointer animate-[fadeIn_0.35s_ease-out]"
      onClick={onEnter}
      role="button"
      aria-label="Click to enter the pixel world"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEnter();
        }
      }}
    >
      <div className="text-center text-background max-w-2xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-background/55 mb-7">
          Нүү · v0.1 · sydney
        </p>
        <h1 className="font-[family-name:var(--font-pixel)] text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight">
          Welcome to nuu.
        </h1>
        <p className="mt-7 mx-auto max-w-md text-base md:text-lg text-background/70 leading-relaxed">
          A community of Mongolian builders, breakers, and shippers — scattered
          across the world, gathered here.
        </p>
        <div
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onEnter}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-medium bg-background text-foreground rounded-full hover:bg-background/90 transition-colors"
          >
            Enter the world →
          </button>
          <a
            href="#mission"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-medium border border-background/30 text-background rounded-full hover:bg-background/10 transition-colors"
          >
            Scroll to content ↓
          </a>
        </div>
        <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-background/40">
          click anywhere · press any key
        </p>
      </div>
    </div>
  );
}

function PlayingHud({ onReturn }: { onReturn: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onReturn}
        className="absolute top-6 left-6 z-30 inline-flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-full pl-3 pr-4 py-2 text-sm font-medium text-foreground hover:bg-background transition-colors shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] animate-[fadeIn_0.3s_ease-out]"
        aria-label="Back to intro"
      >
        <span
          aria-hidden
          className="text-base leading-none flex items-center justify-center w-6 h-6 rounded-full bg-foreground/10"
        >
          ←
        </span>
        <span>Back to intro</span>
      </button>

      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 items-end animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 font-mono text-[11px] space-y-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)]">
          <HudKey k="WASD" desc="move" />
          <HudKey k="E" desc="interact" />
          <HudKey k="⌘K" desc="menu" />
        </div>
      </div>

      <BottomBar />
    </>
  );
}

function BottomBar() {
  const items: { label: string; href: string }[] = [
    { label: "About", href: "#about" },
    { label: "Members", href: "#members" },
    { label: "Events", href: "#events" },
    { label: "Library", href: "#library" },
    { label: "You", href: "#customize" },
    { label: "Join", href: "#badge" },
  ];
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-1.5 bg-background/95 backdrop-blur-sm border border-border rounded-full px-2 py-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)]">
        {items.map((it) => (
          <a
            key={it.href}
            href={it.href}
            className="inline-flex items-center h-7 px-3 text-[11px] font-medium text-foreground/80 hover:text-foreground hover:bg-border/50 rounded-full transition-colors"
          >
            {it.label}
          </a>
        ))}
      </div>
      <a
        href="#mission"
        className="font-mono text-[10px] uppercase tracking-widest text-background/65 hover:text-background flex items-center gap-1.5 transition-colors"
      >
        <span>scroll to content</span>
        <span className="motion-safe:animate-bounce">↓</span>
      </a>
    </div>
  );
}

function HudKey({ k, desc }: { k: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 text-foreground">
      <kbd className="inline-flex items-center justify-center min-w-[2.25rem] h-5 px-2 text-[10px] font-mono border border-border-strong rounded bg-background">
        {k}
      </kbd>
      <span className="text-muted">{desc}</span>
    </div>
  );
}
