import "server-only";
import { createSupabaseServer } from "./supabase/server";
import {
  articles,
  curatedEntries,
  getArticle,
  type Article,
  type LibraryEntry,
} from "./library";

export type MemberArticle = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  authorSlug: string | null;
  date: string;
  readMinutes: number;
  bodyMd: string;
};

export type ResolvedArticle =
  | { kind: "curated"; article: Article }
  | { kind: "member"; article: MemberArticle };

type RawPublished = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  body_md: string;
  read_minutes: number;
  published_at: string | null;
  created_at: string;
  author: {
    display_name: string;
    slug: string | null;
    member_number: number;
  } | null;
};

async function fetchPublished(): Promise<RawPublished[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("contributions")
    .select(
      "slug,title,excerpt,tag,body_md,read_minutes,published_at,created_at,author:profiles(display_name,slug,member_number)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as RawPublished[];
}

function authorName(a: RawPublished["author"]): string {
  return (
    a?.display_name || (a ? `Member #${a.member_number}` : "A member")
  );
}

// Merged, date-sorted listing of curated + published member articles.
export async function getLibraryEntries(): Promise<LibraryEntry[]> {
  const published = await fetchPublished();
  const memberEntries: LibraryEntry[] = published.map((c) => ({
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    tag: c.tag,
    author: authorName(c.author),
    date: c.published_at ?? c.created_at,
    readMinutes: c.read_minutes,
    source: "member",
  }));
  return [...curatedEntries(), ...memberEntries].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

// Resolve a slug to either a curated article or a published member article.
export async function getLibraryArticle(
  slug: string,
): Promise<ResolvedArticle | null> {
  const curated = getArticle(slug);
  if (curated) return { kind: "curated", article: curated };

  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("contributions")
    .select(
      "slug,title,excerpt,tag,body_md,read_minutes,published_at,created_at,author:profiles(display_name,slug,member_number)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return null;
  const c = data as unknown as RawPublished;
  return {
    kind: "member",
    article: {
      slug: c.slug,
      title: c.title,
      excerpt: c.excerpt,
      tag: c.tag,
      author: authorName(c.author),
      authorSlug: c.author?.slug ?? null,
      date: c.published_at ?? c.created_at,
      readMinutes: c.read_minutes,
      bodyMd: c.body_md,
    },
  };
}

// Curated slugs remain statically generated; member articles render on demand.
export function curatedSlugs(): { slug: string }[] {
  return articles.map((a) => ({ slug: a.slug }));
}
