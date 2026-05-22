import { articles as allArticles } from "../../content/library";

export type ArticleBlock =
  | { type: "intro"; text: string }
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "shatar-pieces" }
  | { type: "shatar-board"; caption?: string }
  | { type: "shatar-move"; pieceId: string; caption?: string };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  date: string;
  readMinutes: number;
  body: ArticleBlock[];
};

export const articles: Article[] = [...allArticles].sort(
  (a, b) => b.date.localeCompare(a.date),
);

// A normalized listing item spanning both curated (TS) articles and published
// member contributions (DB). Used by the library index, home grid, and search.
export type LibraryEntry = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  date: string;
  readMinutes: number;
  source: "curated" | "member";
};

export function curatedEntries(): LibraryEntry[] {
  return articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    tag: a.tag,
    author: a.author,
    date: a.date,
    readMinutes: a.readMinutes,
    source: "curated",
  }));
}

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, count = 2): Article[] {
  return articles.filter((a) => a.slug !== slug).slice(0, count);
}

export const articleDateFormat = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
