"use client";

import { useEffect, useRef, useState } from "react";

type PhaserGame = import("phaser").Game;

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    if (!containerRef.current) return;

    let game: PhaserGame | null = null;
    let cancelled = false;

    (async () => {
      const [{ default: Phaser }, { KhuralScene }] = await Promise.all([
        import("phaser"),
        import("@/game/KhuralScene"),
      ]);
      if (cancelled || !containerRef.current) return;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        backgroundColor: "#6a9050",
        scale: {
          mode: Phaser.Scale.RESIZE,
          width: "100%",
          height: "100%",
        },
        pixelArt: true,
        roundPixels: true,
        antialias: false,
        scene: [KhuralScene],
      });
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
      game?.destroy(true);
      setLoaded(false);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: "#6a9050", color: "#2a1810" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest opacity-70">
          motion paused · use ⌘K to explore
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0"
        aria-label="Pixel world canvas — use WASD or arrow keys to move"
      />
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: "#6a9050", color: "#2a1810" }}
        >
          <p className="font-mono text-xs uppercase tracking-widest opacity-70">
            loading the world…
          </p>
        </div>
      )}
    </>
  );
}
