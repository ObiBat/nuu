import Markdown from "react-markdown";
import type { Components } from "react-markdown";

// Renders member-submitted Markdown. react-markdown does NOT render raw HTML
// (no rehype-raw here) and sanitizes URLs by default, so this is XSS-safe for
// untrusted input. Styled to match the curated ArticleRenderer.
const components: Components = {
  h1: ({ children }) => (
    <h2 className="font-[family-name:var(--font-pixel)] text-2xl md:text-3xl tracking-tight mt-14 mb-5">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="font-[family-name:var(--font-pixel)] text-2xl md:text-3xl tracking-tight mt-14 mb-5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-medium text-base mt-8 mb-2">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-5 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-6 space-y-2.5 list-none">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-6 space-y-2.5 list-decimal pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="underline underline-offset-4 hover:text-accent-subtle"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 pl-5 border-l-2 border-foreground/40 italic text-muted">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="font-mono text-[0.85em] bg-border/50 rounded px-1.5 py-0.5">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 p-4 bg-border/40 rounded-lg overflow-x-auto font-mono text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-10 border-border" />,
  img: () => null, // member articles are text-only for now
};

export function MarkdownArticle({ body }: { body: string }) {
  return (
    <div className="text-foreground leading-relaxed">
      <Markdown components={components}>{body}</Markdown>
    </div>
  );
}
