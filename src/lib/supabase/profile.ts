import { createSupabaseBrowser } from "./client";
import { DEFAULT_CHARACTER, type CharacterPalette } from "@/lib/character";

export type ProfileRow = {
  user_id: string;
  member_number: number;
  display_name: string;
  role: string;
  location: string;
  bio: string;
  slug: string | null;
  character: CharacterPalette;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

function isEmptyCharacter(c: unknown): boolean {
  if (!c || typeof c !== "object") return true;
  return Object.keys(c as object).length === 0;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export async function fetchMyProfile(): Promise<ProfileRow | null> {
  const supabase = createSupabaseBrowser();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as ProfileRow;
}

export function characterFromProfile(
  profile: ProfileRow | null,
): CharacterPalette {
  if (!profile) return DEFAULT_CHARACTER;
  const palette = isEmptyCharacter(profile.character)
    ? DEFAULT_CHARACTER
    : { ...DEFAULT_CHARACTER, ...profile.character };
  return {
    ...palette,
    displayName: profile.display_name || palette.displayName,
    role: profile.role || palette.role,
    location: profile.location || palette.location,
  };
}

export async function saveMyProfile(palette: CharacterPalette) {
  const supabase = createSupabaseBrowser();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false as const, reason: "not_signed_in" };

  const { data: current } = await supabase
    .from("profiles")
    .select("slug, member_number")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  let slug = current?.slug ?? null;
  if (!slug && palette.displayName) {
    const base = slugify(palette.displayName);
    if (base) {
      const suffixed =
        current?.member_number != null
          ? `${base}-${current.member_number}`
          : base;
      slug = suffixed;
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: palette.displayName,
      role: palette.role,
      location: palette.location,
      character: palette,
      slug,
    })
    .eq("user_id", auth.user.id);

  if (error) return { ok: false as const, reason: error.message };
  return { ok: true as const };
}

export function shouldMigrateLocal(
  profile: ProfileRow | null,
  local: CharacterPalette,
): boolean {
  if (!profile) return false;
  if (!isEmptyCharacter(profile.character)) return false;
  const hasLocal =
    local.displayName !== "" ||
    local.role !== "" ||
    local.location !== "" ||
    local.skin !== DEFAULT_CHARACTER.skin ||
    local.hair !== DEFAULT_CHARACTER.hair ||
    local.shirt !== DEFAULT_CHARACTER.shirt ||
    local.pants !== DEFAULT_CHARACTER.pants ||
    local.shoes !== DEFAULT_CHARACTER.shoes ||
    local.eyes !== DEFAULT_CHARACTER.eyes ||
    local.body !== DEFAULT_CHARACTER.body;
  return hasLocal;
}
