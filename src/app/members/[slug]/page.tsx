import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { facesetUrl, NINJA_PRESETS, type NinjaPreset } from "@/lib/ninja-preset";
import { fetchMemberProgress } from "@/lib/supabase/gamification-server";
import { MemberProgress } from "@/components/MemberProgress";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const revalidate = 60;

type MemberProfile = {
  user_id: string;
  slug: string | null;
  member_number: number;
  display_name: string;
  role: string;
  location: string;
  bio: string;
  character_preset: string;
  created_at: string;
};

async function loadProfile(slugOrNumber: string): Promise<MemberProfile | null> {
  const supabase = await createSupabaseServer();
  const asNumber = Number.parseInt(slugOrNumber, 10);
  const isNumeric = Number.isFinite(asNumber) && /^\d+$/.test(slugOrNumber);

  const query = supabase
    .from("profiles")
    .select(
      "user_id,slug,member_number,display_name,role,location,bio,character_preset,created_at",
    );

  const { data } = isNumeric
    ? await query.eq("member_number", asNumber).maybeSingle()
    : await query.eq("slug", slugOrNumber).maybeSingle();

  if (!data) return null;
  return data as MemberProfile;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await loadProfile(slug);
  if (!profile) return { title: "Member not found" };
  const name = profile.display_name || `Member #${profile.member_number}`;
  return {
    title: name,
    description: profile.bio || `${name} on Nuu.`,
    alternates: { canonical: `/members/${profile.slug ?? profile.member_number}` },
    openGraph: {
      title: `${name} — nuu`,
      description: profile.bio || `${name} on Nuu.`,
      url: `/members/${profile.slug ?? profile.member_number}`,
    },
  };
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await loadProfile(slug);
  if (!profile) notFound();

  const progress = await fetchMemberProgress(profile.user_id);
  const preset = presetOf(profile.character_preset);
  const numberLabel = `#${String(profile.member_number).padStart(4, "0")}`;
  const joined = new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "numeric",
  }).format(new Date(profile.created_at));

  return (
    <>
      <Nav />
      <main id="main" className="min-h-screen flex flex-col bg-background pt-14">
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-16">
            <Link
              href="/members"
              className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground inline-flex items-center gap-1.5"
            >
              <span aria-hidden>←</span>
              <span>all members</span>
            </Link>
          </div>
        </section>

        <section className="flex-1 border-b border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-10 md:py-14 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center justify-center bg-border/30 rounded-xl p-8 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={facesetUrl(preset)}
                  alt={profile.display_name || "Member"}
                  width={152}
                  height={152}
                  className="w-[152px] h-[152px]"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                joined {joined}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="font-[family-name:var(--font-pixel)] text-3xl md:text-4xl tracking-tight">
                  {profile.display_name || `Member ${numberLabel}`}
                </h1>
                <span className="font-mono text-xs text-muted">
                  {numberLabel}
                </span>
              </div>

              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {profile.role || "member"}
                {profile.location ? ` · ${profile.location}` : ""}
              </p>

              {profile.bio && (
                <p className="text-foreground leading-relaxed max-w-prose pt-2">
                  {profile.bio}
                </p>
              )}

              <div className="mt-4 pt-6 border-t border-border">
                <MemberProgress
                  level={progress.level}
                  achievements={progress.achievements}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function presetOf(value: string): NinjaPreset {
  return (NINJA_PRESETS as readonly string[]).includes(value)
    ? (value as NinjaPreset)
    : "Boy";
}
