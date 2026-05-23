import { createSupabaseBrowser } from "./client";

export type MyCounts = { signedIn: boolean; posts: number; rsvps: number };

// Lightweight counts for the signed-in member, used by the quests checklist.
export async function fetchMyCounts(): Promise<MyCounts> {
  const supabase = createSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { signedIn: false, posts: 0, rsvps: 0 };

  const [postsRes, rsvpRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id),
    supabase
      .from("event_rsvps")
      .select("event_id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  return {
    signedIn: true,
    posts: postsRes.count ?? 0,
    rsvps: rsvpRes.count ?? 0,
  };
}
