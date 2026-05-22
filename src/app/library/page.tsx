import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { articleDateFormat } from "@/lib/library";
import { getLibraryEntries } from "@/lib/library-server";

export const metadata: Metadata = {
  title: "Library — Nuu",
  description:
    "Essays, primers, and guides from the Nuu community of Mongolian builders.",
};

export default async function LibraryIndexPage() {
  const articles = await getLibraryEntries();
  return (
    <>
      <Nav />
      <main
        id="main"
        className="pt-14 bg-background min-h-screen flex flex-col"
      >
        <section className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24 flex-1">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground inline-flex items-center gap-2 mb-12"
          >
            <span aria-hidden>←</span>
            <span>back to nuu</span>
          </Link>

          <header className="border-b border-border pb-8 mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-3">
              read · build · share
            </p>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-[family-name:var(--font-pixel)] text-4xl md:text-5xl tracking-tight">
                Library
              </h1>
              <Link
                href="/library/contribute"
                className="shrink-0 mt-1 inline-flex items-center h-9 px-4 text-xs font-medium border border-border rounded-full hover:border-border-strong transition-colors"
              >
                Contribute →
              </Link>
            </div>
            <p className="mt-4 text-muted text-lg leading-relaxed">
              Essays, primers, and guides from the community.
            </p>
          </header>

          <ul>
            {articles.map((a) => (
              <li key={a.slug} className="border-b border-border last:border-b-0">
                <Link
                  href={`/library/${a.slug}`}
                  className="group flex flex-col gap-3 py-7 -mx-3 px-3 rounded hover:bg-border/20 transition-colors"
                >
                  <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
                    <span>{a.tag}</span>
                    <span aria-hidden>·</span>
                    <span>{a.readMinutes} min</span>
                    <span aria-hidden>·</span>
                    <time dateTime={a.date}>
                      {articleDateFormat.format(new Date(a.date))}
                    </time>
                  </div>
                  <h2 className="font-[family-name:var(--font-pixel)] text-2xl md:text-3xl tracking-tight group-hover:translate-x-0.5 transition-transform">
                    {a.title}
                  </h2>
                  <p className="text-muted leading-relaxed">{a.excerpt}</p>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted group-hover:text-foreground transition-colors mt-1">
                    <span>{a.author}</span>
                    <span aria-hidden>→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
