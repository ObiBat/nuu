import { createSupabaseBrowser } from "./client";
import { slugify } from "./profile";
import { articles as curatedArticles } from "@/lib/library";
import type { ContributionStatus } from "./types";

export const TAG_OPTIONS = [
  "Essay",
  "Primer",
  "Guide",
  "Notes",
  "Interview",
  "Story",
];

export type MyContribution = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  bodyMd: string;
  readMinutes: number;
  status: ContributionStatus;
  updatedAt: string;
  publishedAt: string | null;
};

export type ReviewItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  bodyMd: string;
  readMinutes: number;
  submittedAt: string;
  authorName: string;
  authorSlug: string | null;
};

export type ContributionInput = {
  title: string;
  excerpt: string;
  tag: string;
  bodyMd: string;
};

export type MyContributionsView = {
  contributions: MyContribution[];
  signedIn: boolean;
  isAdmin: boolean;
};

const curatedSlugs = new Set(curatedArticles.map((a) => a.slug));

export function computeReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

type Result =
  | { ok: true; id?: string; slug?: string }
  | { ok: false; reason: string };

export async function fetchMyContributions(): Promise<MyContributionsView> {
  const supabase = createSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { contributions: [], signedIn: false, isAdmin: false };

  const [{ data }, { data: profile }] = await Promise.all([
    supabase
      .from("contributions")
      .select(
        "id,slug,title,excerpt,tag,body_md,read_minutes,status,updated_at,published_at",
      )
      .eq("author_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle(),
  ]);

  const contributions: MyContribution[] = (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    tag: c.tag,
    bodyMd: c.body_md,
    readMinutes: c.read_minutes,
    status: c.status,
    updatedAt: c.updated_at,
    publishedAt: c.published_at,
  }));

  return { contributions, signedIn: true, isAdmin: !!profile?.is_admin };
}

async function freeSlug(
  supabase: ReturnType<typeof createSupabaseBrowser>,
  title: string,
): Promise<string> {
  const base = slugify(title) || "untitled";
  // Pull existing DB slugs that share the base, then pick the first opening,
  // also stepping over curated (TS) slugs so member articles never shadow them.
  const { data } = await supabase
    .from("contributions")
    .select("slug")
    .like("slug", `${base}%`);
  const taken = new Set([
    ...curatedSlugs,
    ...(data ?? []).map((r) => r.slug),
  ]);
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function createContribution(
  input: ContributionInput,
): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not_signed_in" };
  if (!input.title.trim()) return { ok: false, reason: "Title is required" };

  const slug = await freeSlug(supabase, input.title);
  const { data, error } = await supabase
    .from("contributions")
    .insert({
      author_id: user.id,
      slug,
      title: input.title.trim().slice(0, 140),
      excerpt: input.excerpt.trim(),
      tag: input.tag,
      body_md: input.bodyMd,
      read_minutes: computeReadMinutes(input.bodyMd),
      status: "draft",
    })
    .select("id,slug")
    .single();

  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: data.id, slug: data.slug };
}

export async function updateContribution(
  id: string,
  input: ContributionInput,
): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from("contributions")
    .update({
      title: input.title.trim().slice(0, 140),
      excerpt: input.excerpt.trim(),
      tag: input.tag,
      body_md: input.bodyMd,
      read_minutes: computeReadMinutes(input.bodyMd),
    })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function submitContribution(id: string): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from("contributions")
    .update({ status: "submitted" })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deleteContribution(id: string): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase.from("contributions").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ---- Admin moderation -------------------------------------------------

export async function fetchReviewQueue(): Promise<ReviewItem[]> {
  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from("contributions")
    .select(
      "id,slug,title,excerpt,tag,body_md,read_minutes,updated_at,author:profiles(display_name,slug,member_number)",
    )
    .eq("status", "submitted")
    .order("updated_at", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as RawReview[]).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    tag: c.tag,
    bodyMd: c.body_md,
    readMinutes: c.read_minutes,
    submittedAt: c.updated_at,
    authorName:
      c.author?.display_name ||
      (c.author ? `Member #${c.author.member_number}` : "Member"),
    authorSlug: c.author?.slug ?? null,
  }));
}

type RawReview = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  body_md: string;
  read_minutes: number;
  updated_at: string;
  author: {
    display_name: string;
    slug: string | null;
    member_number: number;
  } | null;
};

export async function publishContribution(id: string): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from("contributions")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function rejectContribution(id: string): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from("contributions")
    .update({ status: "rejected" })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
