import "server-only";
import { createSupabaseServer } from "./server";
import {
  computeProgress,
  type ServerCounts,
  type Achievement,
  type Level,
} from "@/lib/gamification";

async function counts(userId: string): Promise<ServerCounts> {
  const supabase = await createSupabaseServer();
  const [profileRes, postsRes, rsvpRes, pubRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,role,location,bio")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId),
    supabase
      .from("event_rsvps")
      .select("event_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("contributions")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .eq("status", "published"),
  ]);
  const p = profileRes.data;
  const complete = !!(
    p &&
    p.display_name?.trim() &&
    p.role?.trim() &&
    p.location?.trim() &&
    p.bio?.trim()
  );
  return {
    joined: !!p,
    profileComplete: complete,
    posts: postsRes.count ?? 0,
    rsvps: rsvpRes.count ?? 0,
    published: pubRes.count ?? 0,
  };
}

export async function fetchMemberProgress(
  userId: string,
): Promise<{ level: Level; achievements: Achievement[] }> {
  return computeProgress(await counts(userId));
}
