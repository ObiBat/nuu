"use client";

import { useEffect, useState } from "react";
import {
  createEvent,
  deleteEvent,
  fetchEventsBrowser,
  setRsvp,
  type EventItem,
  type EventsView,
} from "@/lib/supabase/events";

const fmt = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const EMPTY: EventsView = { events: [], signedIn: false, isAdmin: false };

export function EventsBoard({
  initialData,
}: {
  initialData?: EventsView;
}) {
  const [view, setView] = useState<EventsView>(initialData ?? EMPTY);
  const [loading, setLoading] = useState(!initialData);
  const [composerOpen, setComposerOpen] = useState(false);

  const refresh = async () => {
    const next = await fetchEventsBrowser();
    setView(next);
  };

  useEffect(() => {
    let active = true;
    // Always refresh on mount so per-user RSVP/admin state is current, even
    // when the home section seeded us with anonymous server data.
    fetchEventsBrowser()
      .then((next) => {
        if (active) setView(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onToggle = async (ev: EventItem) => {
    const going = !ev.isGoing;
    // Optimistic update.
    setView((v) => ({
      ...v,
      events: v.events.map((e) =>
        e.id === ev.id
          ? { ...e, isGoing: going, rsvpCount: e.rsvpCount + (going ? 1 : -1) }
          : e,
      ),
    }));
    const result = await setRsvp(ev.id, going);
    if (!result.ok) {
      await refresh(); // revert to truth on failure
    }
  };

  const onDelete = async (ev: EventItem) => {
    if (!confirm(`Delete “${ev.title}”? This can’t be undone.`)) return;
    const result = await deleteEvent(ev.id);
    if (result.ok) await refresh();
    else alert(`Couldn’t delete: ${result.reason}`);
  };

  const { events, signedIn, isAdmin } = view;

  return (
    <div className="flex flex-col gap-5">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setComposerOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 h-8 px-4 text-xs font-medium border border-border rounded-full hover:border-border-strong transition-colors"
          >
            {composerOpen ? "Close" : "+ New event"}
          </button>
        </div>
      )}

      {isAdmin && composerOpen && (
        <EventComposer
          onCreated={async () => {
            setComposerOpen(false);
            await refresh();
          }}
        />
      )}

      {events.length === 0 ? (
        <p className="text-sm text-muted py-6">
          {loading ? "Loading events…" : "No events scheduled yet."}
        </p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {events.map((ev) => (
            <EventRow
              key={ev.id}
              event={ev}
              signedIn={signedIn}
              isAdmin={isAdmin}
              onToggle={() => onToggle(ev)}
              onDelete={() => onDelete(ev)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function EventRow({
  event: ev,
  signedIn,
  isAdmin,
  onToggle,
  onDelete,
}: {
  event: EventItem;
  signedIn: boolean;
  isAdmin: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const spotsLeft = ev.capacity > 0 ? Math.max(0, ev.capacity - ev.rsvpCount) : null;
  const full = ev.capacity > 0 && ev.rsvpCount >= ev.capacity && !ev.isGoing;

  return (
    <li
      className={`grid grid-cols-1 md:grid-cols-[180px_1fr_auto] items-start gap-3 md:gap-4 py-5 ${
        ev.isPast ? "opacity-55" : ""
      }`}
    >
      <time
        className="font-mono text-xs text-muted pt-0.5"
        dateTime={ev.startsAt}
      >
        {fmt.format(new Date(ev.startsAt))}
      </time>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-medium">{ev.title}</span>
          {ev.city && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {ev.city}
            </span>
          )}
        </div>
        {ev.description && (
          <p className="text-sm text-muted leading-relaxed max-w-prose">
            {ev.description}
          </p>
        )}
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">
          {ev.rsvpCount} going
          {spotsLeft !== null && !ev.isPast ? ` · ${spotsLeft} left` : ""}
        </p>
      </div>

      <div className="flex items-center gap-3 md:justify-end">
        {ev.isPast ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Past
          </span>
        ) : !signedIn ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Sign in to RSVP
          </span>
        ) : ev.isGoing ? (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 h-8 px-4 text-xs font-medium bg-foreground text-background rounded-full hover:bg-accent-subtle transition-colors"
          >
            Going ✓
          </button>
        ) : full ? (
          <span className="inline-flex items-center h-8 px-4 text-xs font-medium border border-border rounded-full text-muted">
            Full
          </span>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center h-8 px-4 text-xs font-medium border border-border rounded-full hover:border-border-strong transition-colors"
          >
            RSVP
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={onDelete}
            className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-[#c5302c] transition-colors"
            aria-label={`Delete ${ev.title}`}
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

function EventComposer({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startsAt || status === "saving") return;
    setStatus("saving");
    setErrorMsg("");
    const result = await createEvent({
      title: title.trim(),
      city: city.trim(),
      startsAt: new Date(startsAt).toISOString(),
      capacity: Number.parseInt(capacity, 10) || 0,
      description: description.trim(),
    });
    if (result.ok) {
      setTitle("");
      setCity("");
      setStartsAt("");
      setCapacity("0");
      setDescription("");
      setStatus("idle");
      onCreated();
    } else {
      setErrorMsg(result.reason);
      setStatus("error");
    }
  };

  const field =
    "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors";
  const label =
    "block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5";

  return (
    <form
      onSubmit={submit}
      className="border border-border rounded-xl p-5 flex flex-col gap-4 bg-border/10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="sm:col-span-2">
          <span className={label}>Title</span>
          <input
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
            placeholder="Builders Night"
          />
        </label>
        <label>
          <span className={label}>City</span>
          <input
            className={field}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={64}
            placeholder="Sydney"
          />
        </label>
        <label>
          <span className={label}>Starts</span>
          <input
            type="datetime-local"
            className={field}
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </label>
        <label>
          <span className={label}>Capacity (0 = unlimited)</span>
          <input
            type="number"
            min={0}
            className={field}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </label>
        <label className="sm:col-span-2">
          <span className={label}>Description</span>
          <textarea
            className={`${field} min-h-[72px] resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="What is this gathering about?"
          />
        </label>
      </div>

      {status === "error" && (
        <p className="text-xs text-[#c5302c]">{errorMsg}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === "saving" || !title.trim() || !startsAt}
          className="inline-flex items-center h-9 px-5 text-sm font-medium bg-foreground text-background rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-subtle transition-colors"
        >
          {status === "saving" ? "Creating…" : "Create event"}
        </button>
      </div>
    </form>
  );
}
