import Link from "next/link";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { ArticleRenderer } from "./ArticleRenderer";
import { articleDateFormat, type Article } from "@/lib/library";

type Props = {
  article: Article;
  related: Article[];
};

export function ArticleShell({ article, related }: Props) {
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
              <span>{article.tag}</span>
              <span aria-hidden>·</span>
              <span>{article.readMinutes} min read</span>
            </div>
            <h1 className="font-[family-name:var(--font-pixel)] text-4xl md:text-5xl tracking-tight leading-[1.05]">
              {article.title}
            </h1>
            <p className="mt-5 font-mono text-xs text-muted">
              {article.author} ·{" "}
              <time dateTime={article.date}>
                {articleDateFormat.format(new Date(article.date))}
              </time>
            </p>
          </header>

          <ArticleRenderer blocks={article.body} />

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
