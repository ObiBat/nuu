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

  // Presence (members walking the khural) stays; chat was removed.
  void playing;
  void signedIn;
  return null;
}
