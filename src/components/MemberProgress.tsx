import type { Achievement, Level } from "@/lib/gamification";

// Presentational progression block for a member profile.
export function MemberProgress({
  level,
  achievements,
}: {
  level: Level;
  achievements: Achievement[];
}) {
  const earned = achievements.filter((a) => a.earned);
  const pct = level.span > 0 ? Math.round((level.intoLevel / level.span) * 100) : 100;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Level {level.level}
          </p>
          <p className="font-[family-name:var(--font-pixel)] text-xl">
            {level.title}
          </p>
        </div>
        <p className="font-mono text-xs text-muted">
          {level.xp} XP
          {level.nextTitle ? ` · next: ${level.nextTitle}` : " · max"}
        </p>
      </div>

      <div className="h-2 rounded-full bg-border/50 overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
          Achievements · {earned.length}/{achievements.length}
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {achievements.map((a) => (
            <li
              key={a.id}
              title={a.desc}
              className={`flex items-center gap-2.5 rounded-lg border p-2.5 ${
                a.earned
                  ? "border-border bg-border/20"
                  : "border-border/50 opacity-45"
              }`}
            >
              <span
                className="text-lg leading-none"
                style={a.earned ? undefined : { filter: "grayscale(1)" }}
                aria-hidden
              >
                {a.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium truncate">
                  {a.title}
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-muted">
                  {a.earned ? `+${a.xp} xp` : "locked"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
