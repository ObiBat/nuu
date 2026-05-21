import { events } from "@/lib/content";

const fmt = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function EventsList() {
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
            {events.length} upcoming
          </span>
        </div>
        <ul className="border-t border-border">
          {events.map((e) => (
            <li
              key={e.id}
              className="border-b border-border grid grid-cols-[100px_1fr_auto] md:grid-cols-[140px_1fr_120px_auto] items-center gap-4 py-5 hover:bg-border/20 transition-colors px-2 -mx-2 rounded"
            >
              <time className="font-mono text-xs text-muted" dateTime={e.date}>
                {fmt.format(new Date(e.date))}
              </time>
              <span className="font-medium">{e.title}</span>
              <span className="font-mono text-xs text-muted hidden md:inline">
                {e.city}
              </span>
              <a
                href={e.rsvpUrl}
                className="inline-flex items-center h-8 px-4 text-xs font-medium border border-border rounded-full hover:border-border-strong transition-colors"
              >
                RSVP
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
