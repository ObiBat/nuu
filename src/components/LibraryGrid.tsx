import Link from "next/link";
import { articles } from "@/lib/library";

export function LibraryGrid() {
  const featured = articles.slice(0, 3);
  return (
    <section
      id="library-section"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-2">
              read · build
            </p>
            <h2 className="font-[family-name:var(--font-pixel)] text-2xl md:text-4xl tracking-tight">
              Library
            </h2>
          </div>
          <Link
            href="/library"
            className="font-mono text-xs text-muted hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <span>View all {articles.length}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {featured.map((s) => (
            <li key={s.slug} className="bg-background">
              <Link
                href={`/library/${s.slug}`}
                className="group h-full p-6 flex flex-col gap-3 hover:bg-border/20 transition-colors"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {s.tag} · {s.readMinutes} min
                </span>
                <h3 className="font-[family-name:var(--font-pixel)] text-lg group-hover:translate-x-0.5 transition-transform">
                  {s.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed line-clamp-3">
                  {s.excerpt}
                </p>
                <span className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">
                  Read →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
