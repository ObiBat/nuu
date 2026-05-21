import { members } from "@/lib/content";
import type { Member } from "@/lib/types";
import { SpritePortrait } from "./SpritePortrait";

export function MembersGrid() {
  return (
    <section
      id="members-section"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-2">
              builders
            </p>
            <h2 className="font-[family-name:var(--font-pixel)] text-2xl md:text-4xl tracking-tight">
              Members
            </h2>
          </div>
          <span className="font-mono text-xs text-muted">
            {members.filter((m) => !m.ghost).length} ·{" "}
            {members.filter((m) => m.ghost).length} pending
          </span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {members.map((m) => (
            <li key={m.id} className="bg-background">
              {m.ghost ? <GhostCard /> : <MemberCard member={m} />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function MemberCard({ member }: { member: Member }) {
  return (
    <article className="group p-6 h-full flex flex-col gap-4 hover:bg-border/20 transition-colors">
      <SpritePortrait scale={4} />
      <div className="flex flex-col gap-1">
        <h3 className="font-[family-name:var(--font-pixel)] text-base">
          {member.displayName}
        </h3>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {member.role}
        </p>
      </div>
      {member.bio && (
        <p className="text-sm text-muted leading-relaxed line-clamp-3">
          {member.bio}
        </p>
      )}
    </article>
  );
}

function GhostCard() {
  return (
    <article className="p-6 h-full flex flex-col gap-4">
      <div
        className="w-16 h-16 rounded border border-dashed border-border-strong/60"
        aria-hidden
      />
      <div className="flex flex-col gap-1">
        <h3 className="font-[family-name:var(--font-pixel)] text-base text-muted">
          Coming soon
        </h3>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted/60">
          seat reserved
        </p>
      </div>
    </article>
  );
}
