import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/ArticleShell";
import {
  articles,
  getArticle,
  getRelatedArticles,
} from "@/lib/library";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Not found — Nuu" };
  return {
    title: `${article.title} — Nuu`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = getRelatedArticles(slug);
  return <ArticleShell article={article} related={related} />;
}
