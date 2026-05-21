import { HeroLanyard } from "./HeroLanyard";

export function LanyardSection() {
  return (
    <section
      id="badge-section"
      className="border-b border-border overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-28">
        <div className="text-center max-w-xl mx-auto mb-14 md:mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-3">
            member · id
          </p>
          <h2 className="font-[family-name:var(--font-pixel)] text-3xl md:text-5xl tracking-tight">
            Your ID badge.
          </h2>
          <p className="mt-5 text-muted leading-relaxed">
            Every member gets a pixel ID with a unique number. Drag to swing
            it. Click to flip. Scan the back to join the Discord.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <HeroLanyard />

          <a
            href="#customize"
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <span>customize your character</span>
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
