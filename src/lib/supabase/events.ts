import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowser } from "./client";
import type { Database } from "./types";

export type EventsClient = SupabaseClient<Database>;
type Client = EventsClient;

export type EventItem = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  city: string;
  startsAt: string;
  capacity: number; // 0 = unlimited
  rsvpCount: number;
  isGoing: boolean;
  isPast: boolean;
};

export type EventsView = {
  events: EventItem[];
  signedIn: boolean;
  isAdmin: boolean;
};

export type NewEventInput = {
  title: string;
  description: string;
  city: string;
  startsAt: string; // ISO string
  capacity: number;
};

type RawEvent = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  city: string;
  starts_at: string;
  capacity: number;
  event_rsvps: { count: number }[];
};

export async function buildEventsView(
  supabase: Client,
  userId: string | null,
): Promise<EventsView> {
  const { data, error } = await supabase
    .from("events")
    .select("id,slug,title,description,city,starts_at,capacity,event_rsvps(count)")
    .order("starts_at", { ascending: true });

  if (error || !data) {
    return { events: [], signedIn: !!userId, isAdmin: false };
  }

  let goingIds = new Set<string>();
  let isAdmin = false;

  if (userId) {
    const [{ data: myRsvps }, { data: profile }] = await Promise.all([
      supabase.from("event_rsvps").select("event_id").eq("user_id", userId),
      supabase.from("profiles").select("is_admin").eq("user_id", userId).maybeSingle(),
    ]);
    goingIds = new Set((myRsvps ?? []).map((r) => r.event_id));
    isAdmin = !!profile?.is_admin;
  }

  const now = Date.now();
  const events: EventItem[] = (data as unknown as RawEvent[]).map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    city: e.city,
    startsAt: e.starts_at,
    capacity: e.capacity,
    rsvpCount: e.event_rsvps?.[0]?.count ?? 0,
    isGoing: goingIds.has(e.id),
    isPast: new Date(e.starts_at).getTime() < now,
  }));

  return { events, signedIn: !!userId, isAdmin };
}

// Browser fetch — used by the panel and to refresh after a mutation.
// Server-side fetch lives in ./events-server (keeps next/headers out of the
// client bundle).
export async function fetchEventsBrowser(): Promise<EventsView> {
  const supabase = createSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return buildEventsView(supabase, user?.id ?? null);
}

type Result = { ok: true } | { ok: false; reason: string };

export async function setRsvp(eventId: string, going: boolean): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not_signed_in" };

  if (going) {
    const { error } = await supabase
      .from("event_rsvps")
      .insert({ event_id: eventId, user_id: user.id });
    if (error && error.code !== "23505") return { ok: false, reason: error.message };
  } else {
    const { error } = await supabase
      .from("event_rsvps")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);
    if (error) return { ok: false, reason: error.message };
  }
  return { ok: true };
}

export async function createEvent(input: NewEventInput): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not_signed_in" };

  const { error } = await supabase.from("events").insert({
    title: input.title,
    description: input.description,
    city: input.city,
    starts_at: input.startsAt,
    capacity: input.capacity,
    created_by: user.id,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deleteEvent(eventId: string): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
