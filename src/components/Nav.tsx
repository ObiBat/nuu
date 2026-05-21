"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/content";
import { gameEvents } from "@/game/events";

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [overDark, setOverDark] = useState(isHome);
  const [immersed, setImmersed] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setOverDark(false);
      return;
    }
    const update = () => {
      const threshold =
        typeof window !== "undefined" ? window.innerHeight - 80 : 0;
      setOverDark(window.scrollY < threshold);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome) {
      setImmersed(false);
      return;
    }
    const onImmersed = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setImmersed(ce.detail);
    };
    gameEvents.addEventListener("ui:immersed", onImmersed);
    return () => gameEvents.removeEventListener("ui:immersed", onImmersed);
  }, [isHome]);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ease-out ${
        immersed
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      } ${
        overDark
          ? "bg-foreground/30 backdrop-blur-md border-b border-background/10"
          : "bg-background/85 backdrop-blur-md border-b border-border/60"
      }`}
      aria-hidden={immersed}
    >
      <div className="mx-auto max-w-[1200px] px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className={`font-[family-name:var(--font-pixel)] text-base tracking-wide transition-colors ${
            overDark ? "text-background" : "text-foreground"
          }`}
          aria-label="Nuu home"
        >
          nuu
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${
                overDark
                  ? "text-background/65 hover:text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <kbd
            className={`hidden md:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono border rounded transition-colors ${
              overDark
                ? "text-background/70 border-background/25"
                : "text-muted border-border"
            }`}
          >
            <span>⌘</span>
            <span>K</span>
          </kbd>
          <Link
            href="/#badge"
            className={`inline-flex items-center h-8 px-4 text-sm font-medium rounded-full transition-colors ${
              overDark
                ? "bg-background text-foreground hover:bg-background/90"
                : "bg-foreground text-background hover:bg-accent-subtle"
            }`}
          >
            Join
          </Link>
        </div>
      </div>
    </nav>
  );
}
