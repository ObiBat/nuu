"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { members } from "@/lib/content";
import { articles, articleDateFormat } from "@/lib/library";
import { HeroLanyard } from "./HeroLanyard";
import { SpritePortrait } from "./SpritePortrait";
import {
  BODY_OPTIONS,
  DEFAULT_CHARACTER,
  EYE_OPTIONS,
  HAIR_OPTIONS,
  IDENTITY_LIMITS,
  PANTS_OPTIONS,
  SHIRT_OPTIONS,
  SHOES_OPTIONS,
  SKIN_OPTIONS,
  loadCharacter,
  saveCharacter,
  type BodyType,
  type CharacterPalette,
} from "@/lib/character";
import { gameEvents } from "@/game/events";
import { EventsBoard } from "./EventsBoard";
import { useSupabaseUser } from "@/lib/supabase/use-user";
import {
  characterFromProfile,
  fetchMyProfile,
  saveMyProfile,
  shouldMigrateLocal,
  type ProfileRow,
} from "@/lib/supabase/profile";

type PanelKey =
  | "about"
  | "members"
  | "events"
  | "library"
  | "badge"
  | "customize";

const PANELS: Record<PanelKey, { title: string; subtitle: string }> = {
  about: { title: "About Nuu", subtitle: "Нүү · your move" },
  members: { title: "Members", subtitle: "Founders & friends" },
  events: { title: "Events", subtitle: "Upcoming gatherings" },
  library: { title: "Library", subtitle: "Read & build" },
  badge: { title: "Your ID", subtitle: "Drag · click to flip" },
  customize: { title: "Customize", subtitle: "Your character" },
};

const VALID = new Set<PanelKey>([
  "about",
  "members",
  "events",
  "library",
  "badge",
  "customize",
]);

export function PanelHost() {
  const [panel, setPanel] = useState<PanelKey | null>(null);

  const close = useCallback(() => {
    if (typeof window !== "undefined") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    setPanel(null);
  }, []);

  useEffect(() => {
    const update = () => {
      const h = window.location.hash.slice(1).toLowerCase() as PanelKey;
      setPanel(VALID.has(h) ? h : null);
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel, close]);

  if (!panel) return null;
  const meta = PANELS[panel];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4 bg-foreground/55 backdrop-blur-sm animate-[fadeIn_0.18s_ease-out]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      <div
        className="relative w-full max-w-3xl bg-background border border-border-strong rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-7 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2
              id="panel-title"
              className="font-[family-name:var(--font-pixel)] text-2xl tracking-tight"
            >
              {meta.title}
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted mt-1">
              {meta.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground border border-border rounded-full px-3 py-1.5"
            aria-label="Close panel"
          >
            esc
          </button>
        </header>

        <div className="overflow-y-auto px-7 py-7">
          {panel === "about" && <AboutPanel />}
          {panel === "members" && <MembersPanel />}
          {panel === "events" && <EventsPanel />}
          {panel === "library" && <LibraryPanel />}
          {panel === "badge" && <BadgePanel />}
          {panel === "customize" && <CustomizePanel />}
        </div>
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <div className="space-y-6">
      <p className="font-[family-name:var(--font-pixel)] text-3xl md:text-4xl tracking-tight">
        Your move.
      </p>
      <div className="space-y-4 text-foreground leading-relaxed">
        <p>
          Nuu (нүү) is the verb shatar players use when they make their move.
          We borrowed it for a community of Mongolian builders, breakers, and
          shippers — scattered across the world, gathered here.
        </p>
        <p>
          The diaspora is global. The conversation isn’t. Nuu is the room.
        </p>
        <p>
          Walk the khural. Talk to people. When you’re ready, flip the badge
          and step through the portal into Discord.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-muted pt-2 border-t border-border">
        <span>v0.1</span>
        <span aria-hidden>·</span>
        <span>Sydney</span>
        <span aria-hidden>·</span>
        <span>Ulaanbaatar</span>
        <span aria-hidden>·</span>
        <span>Open source soon</span>
      </div>
    </div>
  );
}

function MembersPanel() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
      {members.map((m) =>
        m.ghost ? (
          <li key={m.id} className="bg-background p-5">
            <div className="border border-dashed border-border-strong rounded-lg p-4 h-full flex flex-col gap-3">
              <div className="w-14 h-14 rounded border border-dashed border-border-strong" aria-hidden />
              <div>
                <h3 className="font-[family-name:var(--font-pixel)] text-sm text-muted">
                  Coming soon
                </h3>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted/60 mt-1">
                  seat reserved
                </p>
              </div>
            </div>
          </li>
        ) : (
          <li key={m.id} className="bg-background p-5">
            <article className="flex flex-col gap-3">
              <SpritePortrait scale={3} />
              <div>
                <h3 className="font-[family-name:var(--font-pixel)] text-base">
                  {m.displayName}
                </h3>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted mt-1">
                  {m.role}
                </p>
              </div>
              {m.bio && (
                <p className="text-sm text-muted leading-relaxed line-clamp-3">
                  {m.bio}
                </p>
              )}
            </article>
          </li>
        ),
      )}
    </ul>
  );
}

function EventsPanel() {
  return <EventsBoard />;
}

function LibraryPanel() {
  return (
    <div className="flex flex-col gap-5">
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-lg overflow-hidden">
        {articles.map((a) => (
          <li key={a.slug} className="bg-background">
            <Link
              href={`/library/${a.slug}`}
              className="group h-full p-5 flex flex-col gap-3 hover:bg-border/20 transition-colors"
            >
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                <span>{a.tag}</span>
                <span aria-hidden>·</span>
                <span>{a.readMinutes} min</span>
              </div>
              <h3 className="font-[family-name:var(--font-pixel)] text-lg group-hover:translate-x-0.5 transition-transform">
                {a.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed line-clamp-3">
                {a.excerpt}
              </p>
              <span className="mt-auto pt-2 font-mono text-[10px] uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">
                Read →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/library"
        className="self-end font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground inline-flex items-center gap-1"
      >
        <span>Open full library</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function BadgePanel() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center max-w-sm text-muted text-sm leading-relaxed">
        Every member gets a pixel ID with a unique number. Drag to swing it.
        Click to flip. Scan the back to join the Discord.
      </p>
      <HeroLanyard />
      <a
        href="#customize"
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
      >
        <span>customize your character</span>
        <span aria-hidden>↗</span>
      </a>
    </div>
  );
}

function CustomizePanel() {
  const { user, loading: authLoading } = useSupabaseUser();
  const [palette, setPalette] = useState<CharacterPalette>(DEFAULT_CHARACTER);
  const [savedPalette, setSavedPalette] =
    useState<CharacterPalette>(DEFAULT_CHARACTER);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    (async () => {
      const local = loadCharacter();

      if (!user) {
        if (cancelled) return;
        setPalette(local);
        setSavedPalette(local);
        setProfile(null);
        return;
      }

      const prof = await fetchMyProfile();
      if (cancelled) return;

      if (prof && shouldMigrateLocal(prof, local)) {
        const merged: CharacterPalette = {
          ...local,
          displayName: local.displayName || prof.display_name,
          role: local.role || prof.role,
          location: local.location || prof.location,
        };
        const result = await saveMyProfile(merged);
        if (cancelled) return;
        if (result.ok) {
          const refreshed = await fetchMyProfile();
          if (cancelled) return;
          const fromDB = characterFromProfile(refreshed);
          setProfile(refreshed);
          setPalette(fromDB);
          setSavedPalette(fromDB);
          saveCharacter(fromDB);
          gameEvents.characterUpdated(fromDB);
          return;
        }
      }

      const fromDB = characterFromProfile(prof);
      setProfile(prof);
      setPalette(fromDB);
      setSavedPalette(fromDB);
      saveCharacter(fromDB);
      gameEvents.characterUpdated(fromDB);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const dirty = useMemo(
    () => JSON.stringify(palette) !== JSON.stringify(savedPalette),
    [palette, savedPalette],
  );

  const update = (key: keyof CharacterPalette, value: string) =>
    setPalette((p) => ({ ...p, [key]: value }));

  const save = async () => {
    saveCharacter(palette);
    gameEvents.characterUpdated(palette);
    setSavedPalette(palette);

    if (!user) return;
    setSaving(true);
    setSaveError(null);
    const result = await saveMyProfile(palette);
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.reason);
    }
  };

  const reset = () => setPalette(DEFAULT_CHARACTER);

  const random = () => {
    const pick = <T,>(arr: { color: string }[]): string =>
      arr[Math.floor(Math.random() * arr.length)].color;
    setPalette((p) => ({
      ...p,
      skin: pick(SKIN_OPTIONS),
      hair: pick(HAIR_OPTIONS),
      shirt: pick(SHIRT_OPTIONS),
      pants: pick(PANTS_OPTIONS),
      shoes: pick(SHOES_OPTIONS),
      eyes: pick(EYE_OPTIONS),
      body:
        BODY_OPTIONS[Math.floor(Math.random() * BODY_OPTIONS.length)]
          .value,
    }));
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-center bg-border/30 rounded-xl py-10">
        <SpritePortrait palette={palette} scale={9} />
      </div>

      <section>
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
          Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr] gap-3">
          <TextField
            label="Display name"
            value={palette.displayName}
            placeholder="your name"
            maxLength={IDENTITY_LIMITS.displayName}
            onChange={(v) => update("displayName", v)}
          />
          <TextField
            label="Role"
            value={palette.role}
            placeholder="builder"
            maxLength={IDENTITY_LIMITS.role}
            onChange={(v) => update("role", v)}
          />
          <TextField
            label="Location"
            value={palette.location}
            placeholder="city"
            maxLength={IDENTITY_LIMITS.location}
            onChange={(v) => update("location", v)}
          />
        </div>
      </section>

      <SwatchSection
        title="Skin"
        options={SKIN_OPTIONS}
        selected={palette.skin}
        onSelect={(c) => update("skin", c)}
      />
      <SwatchSection
        title="Hair"
        options={HAIR_OPTIONS}
        selected={palette.hair}
        onSelect={(c) => update("hair", c)}
      />
      <SwatchSection
        title="Shirt"
        options={SHIRT_OPTIONS}
        selected={palette.shirt}
        onSelect={(c) => update("shirt", c)}
      />
      <SwatchSection
        title="Pants"
        options={PANTS_OPTIONS}
        selected={palette.pants}
        onSelect={(c) => update("pants", c)}
      />
      <SwatchSection
        title="Shoes"
        options={SHOES_OPTIONS}
        selected={palette.shoes}
        onSelect={(c) => update("shoes", c)}
      />
      <SwatchSection
        title="Eyes"
        options={EYE_OPTIONS}
        selected={palette.eyes}
        onSelect={(c) => update("eyes", c)}
      />

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Body
          </h3>
          <span className="font-mono text-[10px] text-muted">
            {BODY_OPTIONS.find((o) => o.value === palette.body)?.label ?? "—"}
          </span>
        </div>
        <div className="flex gap-2">
          {BODY_OPTIONS.map((opt) => {
            const isSelected = opt.value === palette.body;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setPalette((p) => ({ ...p, body: opt.value as BodyType }))
                }
                className={`h-9 px-4 text-xs font-medium rounded-full border transition-all ${
                  isSelected
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:border-border-strong"
                }`}
                aria-pressed={isSelected}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center gap-3 pt-5 border-t border-border">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center h-10 px-5 text-sm font-medium bg-foreground text-background rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-subtle transition-colors"
        >
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
        <button
          type="button"
          onClick={random}
          className="inline-flex items-center h-10 px-4 text-sm font-medium border border-border rounded-full hover:border-border-strong transition-colors"
        >
          Randomize
        </button>
        <button
          type="button"
          onClick={reset}
          className="ml-auto inline-flex items-center h-10 px-4 text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>

      {saveError && (
        <p className="text-xs text-[#c5302c] text-center">{saveError}</p>
      )}

      <p className="font-mono text-[10px] uppercase tracking-widest text-muted text-center">
        {user
          ? profile
            ? `member · #${String(profile.member_number).padStart(4, "0")}`
            : "synced to your profile"
          : "stored locally · sign in to claim your member number"}
      </p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors"
      />
    </label>
  );
}

function SwatchSection({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: { color: string; label: string }[];
  selected: string;
  onSelect: (color: string) => void;
}) {
  const currentLabel = options.find((o) => o.color === selected)?.label ?? "—";
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {title}
        </h3>
        <span className="font-mono text-[10px] text-muted">
          {currentLabel}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = opt.color === selected;
          return (
            <button
              key={opt.color}
              type="button"
              onClick={() => onSelect(opt.color)}
              className={`w-8 h-8 rounded-full transition-all ${
                isSelected
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                  : "ring-1 ring-border hover:ring-border-strong"
              }`}
              style={{ backgroundColor: opt.color }}
              aria-label={`${title}: ${opt.label}`}
              aria-pressed={isSelected}
              title={opt.label}
            />
          );
        })}
      </div>
    </section>
  );
}
