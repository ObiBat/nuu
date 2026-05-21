import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SpritePortrait } from "@/components/SpritePortrait";
import { DEFAULT_CHARACTER, type CharacterPalette } from "@/lib/character";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Members",
  description:
    "The Nuu directory — Mongolian builders, breakers, and shippers around the world.",
  alternates: { canonical: "/members" },
  openGraph: {
    title: "Members — nuu",
    description: "The Nuu directory of Mongolian builders.",
    url: "/members",
  },
};

export const revalidate = 60;

type MemberCard = {
  slug: string | null;
  member_number: number;
  display_name: string;
  role: string;
  location: string;
  bio: string;
  character: CharacterPalette | Record<string, never>;
};

export default async function MembersPage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("profiles")
    .select("slug,member_number,display_name,role,location,bio,character")
    .order("member_number", { ascending: true });

  const members = (data ?? []) as MemberCard[];
  const named = members.filter((m) => m.display_name.trim().length > 0);

  return (
    <>
      <Nav />
      <main id="main" className="min-h-screen flex flex-col bg-background pt-14">
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-3">
              the khural
            </p>
            <h1 className="font-[family-name:var(--font-pixel)] text-3xl md:text-5xl tracking-tight">
              Members
            </h1>
            <p className="mt-4 max-w-xl text-muted text-sm leading-relaxed">
              Every member who&rsquo;s claimed their seat. Walk into the world,
              customize your character, and your card lands here.
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted">
              {named.length} member{named.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        {named.length === 0 ? (
          <section className="border-b border-border">
            <div className="mx-auto max-w-[1200px] px-6 py-16 text-center">
              <p className="text-muted text-sm">
                No members yet. Be the first —{" "}
                <Link
                  href="/#customize"
                  className="text-foreground underline underline-offset-4 hover:text-accent-subtle"
                >
                  customize your character
                </Link>
                .
              </p>
            </div>
          </section>
        ) : (
          <section className="flex-1">
            <ul className="mx-auto max-w-[1200px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
              {named.map((m) => {
                const palette = paletteOrDefault(m.character);
                const href = `/members/${m.slug ?? m.member_number}`;
                return (
                  <li key={m.member_number} className="bg-background">
                    <Link
                      href={href}
                      className="group block h-full p-6 hover:bg-border/20 transition-colors"
                    >
                      <article className="flex flex-col gap-4">
                        <SpritePortrait palette={palette} scale={4} />
                        <div>
                          <div className="flex items-baseline gap-2">
                            <h2 className="font-[family-name:var(--font-pixel)] text-base">
                              {m.display_name}
                            </h2>
                            <span className="font-mono text-[10px] text-muted">
                              #{String(m.member_number).padStart(4, "0")}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                            {m.role || "member"}
                            {m.location ? ` · ${m.location}` : ""}
                          </p>
                        </div>
                        {m.bio && (
                          <p className="text-sm text-muted leading-relaxed line-clamp-3">
                            {m.bio}
                          </p>
                        )}
                      </article>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function paletteOrDefault(c: MemberCard["character"]): CharacterPalette {
  if (!c || typeof c !== "object" || Object.keys(c).length === 0) {
    return DEFAULT_CHARACTER;
  }
  return { ...DEFAULT_CHARACTER, ...(c as Partial<CharacterPalette>) };
}
