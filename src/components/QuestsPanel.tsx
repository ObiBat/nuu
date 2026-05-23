"use client";

import { useEffect, useState } from "react";
import { buildQuests, type Quest } from "@/lib/gamification";
import {
  getActivity,
  visitedAllPois,
  COLLECTIBLE_TOTAL,
} from "@/lib/activity";
import { fetchMyCounts } from "@/lib/supabase/gamification";

// Personal onboarding tracker — "First Moves". Local activity + the signed-in
// member's own post/RSVP counts.
export function QuestsPanel() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [collected, setCollected] = useState(0);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const a = getActivity();
      const counts = await fetchMyCounts();
      if (!active) return;
      setCollected(a.collectibles.length);
      setQuests(
        buildQuests({
          styled: a.styled,
          metObi: a.metObi,
          explored: visitedAllPois(a),
          posted: counts.posts >= 1,
          rsvped: counts.rsvps >= 1,
          joinedDiscord: a.joinedDiscord,
        }),
      );
    };
    refresh();
    const onActivity = () => void refresh();
    window.addEventListener("nuu:activity", onActivity);
    return () => {
      active = false;
      window.removeEventListener("nuu:activity", onActivity);
    };
  }, []);

  const done = quests.filter((q) => q.done).length;
  const pct = quests.length ? Math.round((done / quests.length) * 100) : 0;

  const go = (href: string) => {
    if (!href) return;
    if (href.startsWith("#")) {
      window.location.hash = "";
      window.location.hash = href;
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <p className="text-sm text-muted leading-relaxed max-w-md">
            Your first moves in the khural. Finish them to settle in.
          </p>
          <span className="font-mono text-xs text-muted shrink-0">
            {done}/{quests.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-border/50 overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {quests.map((q) => (
          <li key={q.id} className="py-3 flex items-center gap-3">
            <span
              className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[11px] ${
                q.done
                  ? "bg-foreground text-background border-foreground"
                  : "border-border-strong text-transparent"
              }`}
              aria-hidden
            >
              ✓
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block text-sm font-medium ${q.done ? "line-through text-muted" : ""}`}
              >
                {q.title}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted">
                {q.hint}
              </span>
            </span>
            {!q.done && q.href && (
              <button
                type="button"
                onClick={() => go(q.href)}
                className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground"
              >
                Go →
              </button>
            )}
          </li>
        ))}
      </ul>

      <section className="rounded-xl border border-border p-4 flex items-center justify-between">
        <div>
          <p className="font-[family-name:var(--font-pixel)] text-base">
            Hidden tokens
          </p>
          <p className="text-sm text-muted">
            Find all {COLLECTIBLE_TOTAL} scattered across the world.
          </p>
        </div>
        <span className="font-mono text-lg">
          {collected}/{COLLECTIBLE_TOTAL}
        </span>
      </section>
    </div>
  );
}
