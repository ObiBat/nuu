"use client";

import { useEffect, useRef, useState } from "react";
import { gameEvents } from "@/game/events";
import { useSupabaseUser } from "@/lib/supabase/use-user";
import {
  fetchMyProfile,
  characterFromProfile,
  presetFromProfile,
} from "@/lib/supabase/profile";
import type { PresenceIdentity } from "@/game/presence";
import type { CharacterPalette } from "@/lib/character";
import { savePreset, type NinjaPreset } from "@/lib/ninja-preset";

// Resolves the signed-in member's identity and feeds it to the Phaser scene,
// which owns the realtime channel. Renders the global chat input while playing.
// Signed-out visitors walk solo — they see others but don't broadcast.
export function PresenceLayer({ playing }: { playing: boolean }) {
  const { user, loading } = useSupabaseUser();
  const identityRef = useRef<PresenceIdentity | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (loading) return;
    let active = true;

    if (!user) {
      identityRef.current = null;
      setSignedIn(false);
      gameEvents.presenceIdentity(null);
      return;
    }

    (async () => {
      const profile = await fetchMyProfile();
      if (!active) return;
      if (!profile) {
        identityRef.current = null;
        setSignedIn(false);
        gameEvents.presenceIdentity(null);
        return;
      }
      const preset = presetFromProfile(profile);
      const identity: PresenceIdentity = {
        userId: profile.user_id,
        slug: profile.slug,
        memberNumber: profile.member_number,
        displayName:
          profile.display_name || `Member #${profile.member_number}`,
        palette: characterFromProfile(profile),
        preset,
      };
      identityRef.current = identity;
      setSignedIn(true);
      // Make the local player match the profile's saved character.
      savePreset(preset);
      gameEvents.presetUpdated(preset);
      gameEvents.presenceIdentity(identity);
    })();

    return () => {
      active = false;
    };
  }, [user, loading]);

  // Re-broadcast identity when the signed-in member updates their character.
  useEffect(() => {
    const onChar = (e: Event) => {
      const palette = (e as CustomEvent<CharacterPalette>).detail;
      const cur = identityRef.current;
      if (!cur) return;
      const next: PresenceIdentity = {
        ...cur,
        palette,
        displayName: palette.displayName || cur.displayName,
      };
      identityRef.current = next;
      gameEvents.presenceIdentity(next);
    };
    const onPreset = (e: Event) => {
      const preset = (e as CustomEvent<NinjaPreset>).detail;
      const cur = identityRef.current;
      if (!cur || cur.preset === preset) return;
      const next: PresenceIdentity = { ...cur, preset };
      identityRef.current = next;
      gameEvents.presenceIdentity(next);
    };
    gameEvents.addEventListener("character:update", onChar);
    gameEvents.addEventListener("preset:update", onPreset);
    return () => {
      gameEvents.removeEventListener("character:update", onChar);
      gameEvents.removeEventListener("preset:update", onPreset);
    };
  }, []);

  if (!playing || !signedIn) return null;
  return <ChatBar />;
}

function ChatBar() {
  const [text, setText] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim().slice(0, 140);
    if (!t) return;
    gameEvents.sendChat(t);
    setText("");
  };

  return (
    <form
      onSubmit={send}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-background/95 backdrop-blur-sm border border-border rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)] animate-[fadeIn_0.3s_ease-out]"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => gameEvents.setTyping(true)}
        onBlur={() => gameEvents.setTyping(false)}
        maxLength={140}
        placeholder="Say something to the khural…"
        aria-label="Send a message to everyone in the khural"
        className="w-56 sm:w-72 bg-transparent text-sm text-foreground placeholder:text-muted/70 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="inline-flex items-center h-7 px-3 text-[11px] font-medium bg-foreground text-background rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-subtle transition-colors"
      >
        Send
      </button>
    </form>
  );
}
