import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ContributeBoard } from "@/components/ContributeBoard";

export const metadata: Metadata = {
  title: "Contribute — Nuu",
  description: "Write an article for the Nuu library.",
};

export default function ContributePage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-14 bg-background min-h-screen flex flex-col">
        <section className="mx-auto w-full max-w-2xl px-6 py-16 md:py-24 flex-1">
          <Link
            href="/library"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground inline-flex items-center gap-2 mb-12"
          >
            <span aria-hidden>←</span>
            <span>back to library</span>
          </Link>

          <header className="border-b border-border pb-8 mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-3">
              read · build · share
            </p>
            <h1 className="font-[family-name:var(--font-pixel)] text-4xl md:text-5xl tracking-tight">
              Contribute
            </h1>
            <p className="mt-4 text-muted text-lg leading-relaxed">
              Write something for the community. Save a draft, submit it for
              review, and an editor will publish it to the library.
            </p>
          </header>

          <ContributeBoard />
        </section>
      </main>
      <Footer />
    </>
  );
}
