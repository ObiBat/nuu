"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { members, pois, navLinks } from "@/lib/content";
import { articles } from "@/lib/library";
import { fetchEventsBrowser, type EventItem } from "@/lib/supabase/events";

const eventDateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const router = useRouter();

  // Load live events the first time the palette opens.
  useEffect(() => {
    if (!open || eventsLoaded) return;
    let active = true;
    fetchEventsBrowser().then((view) => {
      if (!active) return;
      setEvents(view.events);
      setEventsLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [open, eventsLoaded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const inField =
        document.activeElement instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);

      if ((e.key === "k" && isMod) || (e.key === "/" && !inField)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      if (typeof window !== "undefined") {
        if (window.location.hash === href) {
          window.location.hash = "";
        }
        window.location.hash = href;
      }
    } else {
      router.push(href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-foreground/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <Command
        className="w-full max-w-xl mx-4 rounded-xl border border-border-strong bg-background shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        loop
      >
        <Command.Input
          autoFocus
          placeholder="Search members, places, events…"
          className="w-full px-4 py-4 bg-transparent text-foreground font-mono text-sm placeholder:text-muted outline-none border-b border-border"
        />
        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-muted font-mono text-xs">
            No results.
          </Command.Empty>

          <Command.Group
            heading="Members"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted"
          >
            {members
              .filter((m) => !m.ghost)
              .map((m) => (
                <PaletteItem
                  key={m.id}
                  value={`${m.displayName} ${m.role}`}
                  onSelect={() => go(`#members`)}
                  primary={m.displayName}
                  secondary={m.role}
                />
              ))}
          </Command.Group>

          <Command.Group
            heading="Places"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted"
          >
            {pois.map((p) => (
              <PaletteItem
                key={p.id}
                value={p.label}
                onSelect={() => go(p.href)}
                primary={p.label}
                secondary={p.glyph}
              />
            ))}
          </Command.Group>

          <Command.Group
            heading="Events"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted"
          >
            {events.map((e) => (
              <PaletteItem
                key={e.id}
                value={`${e.title} ${e.city}`}
                onSelect={() => go("#events")}
                primary={e.title}
                secondary={`${e.city} · ${eventDateFmt.format(
                  new Date(e.startsAt),
                )}`}
              />
            ))}
          </Command.Group>

          <Command.Group
            heading="Library"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted"
          >
            {articles.map((a) => (
              <PaletteItem
                key={a.slug}
                value={`${a.title} ${a.tag} ${a.excerpt}`}
                onSelect={() => go(`/library/${a.slug}`)}
                primary={a.title}
                secondary={`${a.tag} · ${a.readMinutes} min`}
              />
            ))}
          </Command.Group>

          <Command.Group
            heading="Pages"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted"
          >
            {navLinks.map((l) => (
              <PaletteItem
                key={l.href}
                value={l.label}
                onSelect={() => go(l.href)}
                primary={l.label}
                secondary={l.href}
              />
            ))}
          </Command.Group>
        </Command.List>

        <div className="border-t border-border px-3 py-2 flex items-center justify-between font-mono text-[10px] text-muted">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>nuu · ⌘K</span>
        </div>
      </Command>
    </div>
  );
}

function PaletteItem({
  value,
  onSelect,
  primary,
  secondary,
}: {
  value: string;
  onSelect: () => void;
  primary: string;
  secondary: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex items-center justify-between gap-3 px-3 py-2 rounded text-sm cursor-pointer aria-selected:bg-border/60 aria-selected:text-foreground"
    >
      <span>{primary}</span>
      <span className="font-mono text-[10px] text-muted">{secondary}</span>
    </Command.Item>
  );
}
