"use client";

import { useState } from "react";
import { gameEvents } from "@/game/events";
import { saveMyPreset } from "@/lib/supabase/profile";
import { markStyled } from "@/lib/activity";
import {
  NINJA_PRESETS,
  PRESET_LABELS,
  facesetUrl,
  loadPreset,
  savePreset,
  type NinjaPreset,
} from "@/lib/ninja-preset";

// Pick your character — shows the 38px facesets and live-swaps the in-world
// sprite. Persists to localStorage; profile/presence sync comes later.
export function CharacterPicker() {
  const [selected, setSelected] = useState<NinjaPreset>(loadPreset);

  const choose = (p: NinjaPreset) => {
    setSelected(p);
    savePreset(p);
    markStyled(); // onboarding quest
    gameEvents.presetUpdated(p); // live-swap + PresenceLayer re-broadcasts
    void saveMyPreset(p); // persist to profile (no-op if signed out)
  };

  return (
    <section>
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
        Choose your character
      </h3>
      <ul className="grid grid-cols-4 gap-2">
        {NINJA_PRESETS.map((p) => {
          const active = p === selected;
          return (
            <li key={p}>
              <button
                type="button"
                onClick={() => choose(p)}
                aria-pressed={active}
                className={`w-full flex flex-col items-center gap-1.5 rounded-lg p-2 border transition-colors ${
                  active
                    ? "border-foreground bg-border/40"
                    : "border-border hover:border-border-strong"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={facesetUrl(p)}
                  alt={PRESET_LABELS[p]}
                  width={48}
                  height={48}
                  className="w-12 h-12"
                  style={{ imageRendering: "pixelated" }}
                  draggable={false}
                />
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
                  {PRESET_LABELS[p]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
