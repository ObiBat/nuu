import { fetchEventsServer } from "@/lib/supabase/events-server";
import { EventsBoard } from "./EventsBoard";

export async function EventsList() {
  const view = await fetchEventsServer();
  const upcoming = view.events.filter((e) => !e.isPast).length;

  return (
    <section
      id="events-section"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-2">
              gatherings
            </p>
            <h2 className="font-[family-name:var(--font-pixel)] text-2xl md:text-4xl tracking-tight">
              Events
            </h2>
          </div>
          <span className="font-mono text-xs text-muted">
            {upcoming} upcoming
          </span>
        </div>
        <EventsBoard initialData={view} />
      </div>
    </section>
  );
}
