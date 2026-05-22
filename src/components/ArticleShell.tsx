import type { ReactNode } from "react";
import Link from "next/link";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { articleDateFormat } from "@/lib/library";

export type RelatedLink = {
  slug: string;
  title: string;
  tag: string;
  readMinutes: number;
};

type Props = {
  title: string;
  tag: string;
  readMinutes: number;
  author: string;
  date: string;
  byline?: string;
  content: ReactNode;
  related: RelatedLink[];
};

export function ArticleShell({
  title,
  tag,
  readMinutes,
  author,
  date,
  byline,
  content,
  related,
}: Props) {
  return (
    <>
      <Nav />
      <main id="main" className="pt-14 bg-background min-h-screen flex flex-col">
        <article className="mx-auto w-full max-w-2xl px-6 py-16 md:py-24 flex-1">
          <Link
            href="/library"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground inline-flex items-center gap-2 mb-12"
          >
            <span aria-hidden>←</span>
            <span>back to library</span>
          </Link>

          <header className="border-b border-border pb-8 mb-10">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-4">
              <span>{tag}</span>
              <span aria-hidden>·</span>
              <span>{readMinutes} min read</span>
              {byline && (
                <>
                  <span aria-hidden>·</span>
                  <span>{byline}</span>
                </>
              )}
            </div>
            <h1 className="font-[family-name:var(--font-pixel)] text-4xl md:text-5xl tracking-tight leading-[1.05]">
              {title}
            </h1>
            <p className="mt-5 font-mono text-xs text-muted">
              {author} ·{" "}
              <time dateTime={date}>
                {articleDateFormat.format(new Date(date))}
              </time>
            </p>
          </header>

          {content}

          {related.length > 0 && (
            <section className="mt-20 pt-10 border-t border-border">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-6">
                More from the library
              </h2>
              <ul>
                {related.map((r) => (
                  <li key={r.slug} className="border-b border-border last:border-b-0">
                    <Link
                      href={`/library/${r.slug}`}
                      className="group flex items-baseline justify-between gap-6 py-5 hover:bg-border/20 -mx-3 px-3 rounded transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-[family-name:var(--font-pixel)] text-base group-hover:translate-x-0.5 transition-transform">
                          {r.title}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1.5">
                          {r.tag} · {r.readMinutes} min
                        </p>
                      </div>
                      <span
                        className="text-muted group-hover:text-foreground transition-colors shrink-0"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
