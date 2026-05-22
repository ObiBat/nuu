import Link from "next/link";
import { NewsletterSignup } from "./NewsletterSignup";

const cols = [
  {
    heading: "Community",
    links: [
      { label: "About", href: "/#about" },
      { label: "Members", href: "/#members" },
      { label: "Code of Conduct", href: "/code-of-conduct" },
    ],
  },
  {
    heading: "Build",
    links: [
      { label: "Library", href: "/#library" },
      { label: "Events", href: "/#events" },
      { label: "Open source", href: "#" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Discord", href: "/#badge" },
      { label: "GitHub", href: "#" },
      { label: "X", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <NewsletterSignup />
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 py-16 grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-pixel)] text-base"
          >
            nuu
          </Link>
          <p className="font-mono text-xs text-muted">Нүү — your move.</p>
        </div>
        {cols.map((c) => (
          <div key={c.heading} className="flex flex-col gap-3">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted">
              {c.heading}
            </h4>
            <ul className="flex flex-col gap-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-foreground hover:text-muted transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs text-muted">© 2026 Nuu</span>
          <div className="flex items-center gap-4 font-mono text-xs text-muted">
            <Link
              href="/code-of-conduct"
              className="hover:text-foreground transition-colors"
            >
              Code of Conduct
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <span aria-hidden>·</span>
            <span>v0.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
