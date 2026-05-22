import { createSupabaseBrowser } from "./client";

export type PostItem = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorNumber: number;
  authorSlug: string | null;
  canDelete: boolean;
};

export type NoticeBoardView = {
  posts: PostItem[];
  signedIn: boolean;
};

type RawPost = {
  id: string;
  body: string;
  created_at: string;
  author:
    | {
        user_id: string;
        display_name: string;
        member_number: number;
        slug: string | null;
      }
    | null;
};

const POST_LIMIT = 50;
export const POST_MAX = 500;

export async function fetchPostsBrowser(): Promise<NoticeBoardView> {
  const supabase = createSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,body,created_at,author:profiles(user_id,display_name,member_number,slug)",
    )
    .order("created_at", { ascending: false })
    .limit(POST_LIMIT);

  if (error || !data) return { posts: [], signedIn: !!user };

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    isAdmin = !!profile?.is_admin;
  }

  const posts: PostItem[] = (data as unknown as RawPost[]).map((p) => ({
    id: p.id,
    body: p.body,
    createdAt: p.created_at,
    authorName:
      p.author?.display_name ||
      (p.author ? `Member #${p.author.member_number}` : "Member"),
    authorNumber: p.author?.member_number ?? 0,
    authorSlug: p.author?.slug ?? null,
    canDelete: !!user && (p.author?.user_id === user.id || isAdmin),
  }));

  return { posts, signedIn: !!user };
}

type Result = { ok: true } | { ok: false; reason: string };

export async function createPost(body: string): Promise<Result> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, reason: "empty" };

  const supabase = createSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not_signed_in" };

  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, body: trimmed.slice(0, POST_MAX) });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deletePost(id: string): Promise<Result> {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
