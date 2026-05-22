import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleShell, type RelatedLink } from "@/components/ArticleShell";
import { ArticleRenderer } from "@/components/ArticleRenderer";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import {
  getLibraryArticle,
  getLibraryEntries,
  curatedSlugs,
} from "@/lib/library-server";

type Params = { slug: string };

// Curated articles are statically generated; published member articles render
// on demand (dynamicParams defaults to true).
export async function generateStaticParams(): Promise<Params[]> {
  return curatedSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await getLibraryArticle(slug);
  if (!resolved) return { title: "Not found — Nuu" };
  const { title, excerpt } = resolved.article;
  return { title: `${title} — Nuu`, description: excerpt };
}

async function relatedLinks(slug: string): Promise<RelatedLink[]> {
  const entries = await getLibraryEntries();
  return entries
    .filter((e) => e.slug !== slug)
    .slice(0, 2)
    .map((e) => ({
      slug: e.slug,
      title: e.title,
      tag: e.tag,
      readMinutes: e.readMinutes,
    }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const resolved = await getLibraryArticle(slug);
  if (!resolved) notFound();
  const related = await relatedLinks(slug);

  if (resolved.kind === "curated") {
    const a = resolved.article;
    return (
      <ArticleShell
        title={a.title}
        tag={a.tag}
        readMinutes={a.readMinutes}
        author={a.author}
        date={a.date}
        content={<ArticleRenderer blocks={a.body} />}
        related={related}
      />
    );
  }

  const a = resolved.article;
  return (
    <ArticleShell
      title={a.title}
      tag={a.tag}
      readMinutes={a.readMinutes}
      author={a.author}
      date={a.date}
      byline="member contribution"
      content={<MarkdownArticle body={a.bodyMd} />}
      related={related}
    />
  );
}
