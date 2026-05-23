"use client";

import { useEffect, useRef, useState } from "react";
import { gameEvents } from "@/game/events";

// Transient notifications (collectibles, unlocks) dispatched via gameEvents.toast.
export function Toast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMsg(null), 2600);
    };
    gameEvents.addEventListener("toast", on);
    return () => {
      gameEvents.removeEventListener("toast", on);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!msg) return null;
  return (
    <div className="pointer-events-none fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-foreground text-background rounded-full px-5 py-2.5 text-sm font-medium shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]">
        {msg}
      </div>
    </div>
  );
}
