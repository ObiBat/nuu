"use client";

import { useEffect, useRef, useState } from "react";
import { gameEvents, type DialoguePayload } from "@/game/events";
import { markDiscordJoined } from "@/lib/activity";
import { members } from "@/lib/content";
import dialogueData from "../../content/dialogue.json";

type PoiContent = {
  title: string;
  subtitle: string;
  lines: string[];
  cta?: { label: string; href: string };
};

const TYPE_CHARS_PER_SECOND = 35;

export function DialogueOverlay() {
  const [payload, setPayload] = useState<DialoguePayload | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [reduced, setReduced] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<DialoguePayload>;
      setPayload(ce.detail);
      setLineIndex(0);
      setTypedCount(0);
    };
    gameEvents.addEventListener("dialogue:open", onOpen);
    return () => {
      gameEvents.removeEventListener("dialogue:open", onOpen);
    };
  }, []);

  const content = payload ? resolveContent(payload) : null;
  const lines = content?.lines ?? [];
  const currentLine = lines[lineIndex] ?? "";

  const close = () => {
    setPayload(null);
    setLineIndex(0);
    setTypedCount(0);
    gameEvents.closeDialogue();
  };

  const advance = () => {
    if (typedCount < currentLine.length) {
      setTypedCount(currentLine.length);
      return;
    }
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1);
      setTypedCount(0);
      return;
    }
    close();
  };

  useEffect(() => {
    if (!payload) return;
    if (reduced) {
      setTypedCount(currentLine.length);
      return;
    }
    if (typedCount >= currentLine.length) return;
    let start: number | null = null;
    const startCount = typedCount;
    const tick = (t: number) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      const next = Math.min(
        currentLine.length,
        startCount + Math.floor(elapsed * TYPE_CHARS_PER_SECOND),
      );
      setTypedCount(next);
      if (next < currentLine.length) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [payload, lineIndex, currentLine, reduced, typedCount]);

  useEffect(() => {
    if (!payload) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Enter" || e.key === " " || e.key === "e" || e.key === "E") {
        e.preventDefault();
        advance();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, lineIndex, typedCount, currentLine]);

  if (!payload || !content) return null;

  const isLastLine = lineIndex >= lines.length - 1;
  const isTyped = typedCount >= currentLine.length;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-8 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogue-title"
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-2xl bg-background border border-border-strong rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] p-6 md:p-7">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h3
              id="dialogue-title"
              className="font-[family-name:var(--font-pixel)] text-xl"
            >
              {content.title}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
              {content.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="font-mono text-[10px] text-muted hover:text-foreground"
            aria-label="Close dialogue"
          >
            esc
          </button>
        </div>

        <p
          className="min-h-[3.5rem] text-base leading-relaxed text-foreground"
          aria-live="polite"
        >
          {currentLine.slice(0, typedCount)}
          {!isTyped && <span className="opacity-50">▍</span>}
        </p>

        {content.cta && isLastLine && isTyped && (
          <div className="mt-5">
            {content.cta.href.startsWith("#") ? (
              <button
                type="button"
                onClick={() => {
                  const target = content.cta!.href;
                  close();
                  if (typeof window !== "undefined") {
                    if (window.location.hash === target) {
                      window.location.hash = "";
                    }
                    window.location.hash = target;
                  }
                }}
                className="inline-flex items-center h-9 px-4 text-xs font-medium bg-foreground text-background rounded-full hover:bg-accent-subtle transition-colors"
              >
                {content.cta.label}
              </button>
            ) : content.cta.href.startsWith("/") ? (
              <a
                href={content.cta.href}
                onClick={() => close()}
                className="inline-flex items-center h-9 px-4 text-xs font-medium bg-foreground text-background rounded-full hover:bg-accent-subtle transition-colors"
              >
                {content.cta.label}
              </a>
            ) : (
              <a
                href={content.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (content.cta!.href.includes("discord")) markDiscordJoined();
                }}
                className="inline-flex items-center h-9 px-4 text-xs font-medium bg-foreground text-background rounded-full hover:bg-accent-subtle transition-colors"
              >
                {content.cta.label}
              </a>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between font-mono text-[10px] text-muted">
          <span>
            {lineIndex + 1} / {lines.length}
          </span>
          <button
            type="button"
            onClick={advance}
            className="hover:text-foreground"
          >
            {!isTyped ? "↵ skip" : isLastLine ? "↵ close" : "↵ next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function resolveContent(payload: DialoguePayload): PoiContent | null {
  if (payload.type === "poi") {
    const data = (dialogueData as { pois: Record<string, PoiContent> }).pois[
      payload.id
    ];
    return data ?? null;
  }
  const m = members.find((x) => x.id === payload.id);
  if (!m) return null;
  return {
    title: m.displayName,
    subtitle: m.role,
    lines: m.dialogue ?? [m.bio ?? ""],
  };
}
