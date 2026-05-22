import "server-only";
import { createSupabaseServer } from "./server";
import { buildEventsView, type EventsClient, type EventsView } from "./events";

// Server-side fetch (RSC) — used for the home-page Events section.
export async function fetchEventsServer(): Promise<EventsView> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return buildEventsView(supabase as unknown as EventsClient, user?.id ?? null);
}
