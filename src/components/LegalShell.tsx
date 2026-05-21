import Link from "next/link";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

type Props = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalShell({ eyebrow, title, lastUpdated, children }: Props) {
  return (
    <>
      <Nav />
      <main id="main" className="pt-14 bg-background min-h-screen flex flex-col">
        <article className="mx-auto w-full max-w-2xl px-6 py-16 md:py-24 flex-1">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-foreground inline-flex items-center gap-2 mb-12"
          >
            <span aria-hidden>←</span>
            <span>back to nuu</span>
          </Link>
          <header className="border-b border-border pb-8 mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-3">
              {eyebrow}
            </p>
            <h1 className="font-[family-name:var(--font-pixel)] text-4xl md:text-5xl tracking-tight">
              {title}
            </h1>
            <p className="mt-4 font-mono text-xs text-muted">
              Last updated {lastUpdated}
            </p>
          </header>
          <div className="text-foreground leading-relaxed space-y-5 [&_h2]:font-[family-name:var(--font-pixel)] [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:tracking-tight [&_h2]:mt-14 [&_h2]:mb-4 [&_h3]:font-medium [&_h3]:text-base [&_h3]:mt-8 [&_h3]:mb-2 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-border-strong [&_a:hover]:decoration-foreground [&_strong]:font-semibold [&_ul]:space-y-2 [&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-5 [&_li]:leading-relaxed [&_code]:font-mono [&_code]:text-sm [&_code]:bg-border/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed">
      <span className="text-muted mt-2 text-[8px] leading-none" aria-hidden>
        ▪
      </span>
      <span>{children}</span>
    </li>
  );
}
