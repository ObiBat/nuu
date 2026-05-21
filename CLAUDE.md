@AGENTS.md

# Nuu — Context for Claude Code

A pixel-art tech community for the Mongolian diaspora. A single-screen
Phaser world embedded in a Next.js 16 site. Every member has a
customizable character that walks the central **khural** (gathering),
talks to other members, and walks through a portal into Discord. Real
long-form articles live at `/library`.

Founder: **Obi Batbileg** ([obicreative.dev](https://obicreative.dev) · [craefto.com](https://craefto.com)).

---

## Current state (last session: 2026-05-21)

| Phase | Status |
|---|---|
| **v0.1 — World** | ✅ shipped |
| **v0.2 — Public** | ✅ deployed to Vercel + GitHub + CI/CD |
| **v0.3 — Identity** | 🔨 scaffold done, runtime wiring in progress |
| v0.4–v0.9 | future |

Live: **https://nuu-gules.vercel.app** (and **https://nuu.today** once Spaceship A record is fixed).
Repo: **https://github.com/ObiBat/nuu** (public, MIT).
Vercel project: `obis-projects-ce997674/nuu`.
Supabase project ref: `lbdwwhhrvefcqeulbbla` (Sydney region).

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind v4 (CSS vars in `src/app/globals.css`) |
| Fonts | Geist Sans / Mono / Pixel (Square + Triangle) via `geist` npm |
| Game engine | Phaser 4 (lazy-loaded inside `GameCanvas.tsx`) |
| Drag | `@use-gesture/react` |
| Cmd-K | `cmdk` |
| OG images | `@vercel/og` (Satori) — TTFs pre-converted from Geist woff2 |
| Auth + DB | Supabase (`@supabase/ssr`) — scaffolded, wiring in progress |
| Analytics | `@vercel/analytics` + `@vercel/speed-insights` |
| Hosting | Vercel (Fluid Compute, Node 24) |

**Important framework notes** (Next 16 has breaking changes — see `AGENTS.md`):
- App Router params are `Promise<{ ... }>` — must `await params` in `page.tsx` / `route.ts`
- Use `vercel.ts` over `vercel.json` if config grows
- Middleware supports full Node.js (Fluid Compute)
- OG images via `next/og` (`ImageResponse`) — set `export const runtime = "nodejs"` for `fs` access

---

## Architecture map

```
nuu/
├── content/
│   ├── members.json          # Placeholder members (will be replaced by Supabase profiles in v0.3)
│   ├── events.json
│   ├── dialogue.json         # POI dialogue (CTAs: # = panel, / = route, http = external)
│   └── library/
│       ├── index.ts          # Registry
│       └── articles/         # One TS module per article
├── public/
│   └── pieces/               # Cburnett SVG chess pieces (CC-BY-SA 3.0, bundled from lichess-org/lila)
├── supabase/
│   └── migrations/
│       └── 0001_init.sql     # Profiles table + RLS + auto-create trigger (NOT YET RUN ON REMOTE)
├── scripts/
│   └── convert-og-fonts.mjs  # One-time woff2→ttf for Satori
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Metadata defaults, Analytics, SpeedInsights, JSON-LD, PanelHost mount
│   │   ├── page.tsx          # Nav + CanvasHero (everything else lives in panels/canvas)
│   │   ├── icon.tsx + apple-icon.tsx
│   │   ├── opengraph-image.tsx + twitter-image.tsx
│   │   ├── sitemap.ts + robots.ts
│   │   ├── auth/{callback,sign-out}/route.ts
│   │   ├── code-of-conduct/ + privacy/
│   │   ├── library/page.tsx + [slug]/page.tsx + opengraph-image.tsx
│   │   └── members/          # NEW v0.3 route (in progress)
│   ├── components/
│   │   ├── CanvasHero.tsx    # 100vh canvas section, intro/playing state machine, HUD
│   │   ├── GameCanvas.tsx    # Phaser host (client-only, dynamic import)
│   │   ├── HeroLanyard.tsx   # ID badge — CSS pendulum (NOT matter.js), 3D parallax, click-flip
│   │   ├── PanelHost.tsx     # Hash-routed modals: about/members/events/library/badge/customize
│   │   ├── Nav.tsx           # Fixed top, scroll-aware, hides on immersed=true, AuthMenu integration WIP
│   │   ├── CommandPalette.tsx # ⌘K — searches members, POIs, events, library articles, pages
│   │   ├── DialogueOverlay.tsx # In-world dialogue with typewriter effect
│   │   ├── ArticleShell.tsx + ArticleRenderer.tsx
│   │   ├── SpritePortrait.tsx + PixelSprite.tsx # Pixel rendering helpers
│   │   ├── HeroLanyard / LanyardSection / etc.
│   │   └── AuthMenu.tsx      # NEW v0.3 (in progress) — sign-in/out dropdown
│   ├── game/
│   │   ├── KhuralScene.ts    # The Phaser scene — player, NPCs, POIs, props, depth-sorted
│   │   ├── sprites.ts        # String-encoded pixel sprites + createPixelTexture utility
│   │   └── events.ts         # gameEvents bus (dialogue, world pause, character update, ui immersed)
│   └── lib/
│       ├── character.ts      # CharacterPalette type + localStorage + curated swatch options
│       ├── library.ts + shatar.ts  # Content registries + types
│       ├── content.ts        # nav + POI lists
│       ├── og-fonts.ts + og-fonts/*.ttf  # Brand fonts for OG images
│       └── supabase/
│           ├── client.ts     # Browser client (cookies via @supabase/ssr)
│           ├── server.ts     # Server client (RSC + actions)
│           ├── types.ts      # Generated DB types (currently hand-written)
│           ├── profile.ts    # NEW (WIP) — fetchMyProfile, saveMyProfile, characterFromProfile
│           └── use-user.ts   # NEW (WIP) — client hook
└── src/middleware.ts         # Supabase session refresh, no-ops without env vars
```

---

## Brand & visual conventions

- **Palette**: white/black/grey monochrome only. The warm earthy palette
  is used INSIDE the Phaser canvas (steppe atmosphere), but the site
  chrome and OG images are strictly monochrome.
- **Typography**:
  - Geist Pixel Square for display headlines + wordmarks (`nuu.`, titles)
  - Geist Sans for body
  - Geist Mono uppercase letter-spaced for meta/labels (`SYDNEY · v0.2`)
- **OG images**: pure white bg, dark text, subtle grid pattern. Per-route
  generated via `@vercel/og` using `OG_FONTS` from `src/lib/og-fonts.ts`.
- **Khural canvas palette** (different from site chrome):
  - Grass `#6a9050`, sandstone `#d8c498`/`#b8a878`, outline `#2a1810`
  - Discord blurple `#5865F2` for Portal POI
- **Visual hierarchy in canvas** (last change made):
  - Player = full-scale + gold **YOU** pill
  - Obi NPC = full-scale + dark **★ FOUNDER** chip
  - POIs = building sprites + cream label chips, hover-scale, press-E prompt when in range
  - Ambient NPCs = **0.85× scale, 0.88α**, no label
  - Ambient speech bubbles = italic 8px, translucent cream, no tail (overheard chatter, not callouts)
  - POI press-E prompt + DialogueOverlay = assertive white cards

---

## Patterns

- **Hash-routed panels**: `#about`, `#members`, `#events`, `#library`, `#badge`, `#customize`
  open modal panels via `PanelHost` listening to `hashchange`. Nav + bottom-strip
  chip + Cmd-K all route through this.
- **DialogueOverlay CTA hrefs**: 3 types — `#hash` → opens panel, `/path` → routes
  internally (closes dialogue), `https://` → opens in new tab.
- **Character system**:
  - `CharacterPalette` type in `src/lib/character.ts`
  - `loadCharacter()` / `saveCharacter()` use `localStorage` key `nuu:character/v1`
  - Identity OR-fallback: empty stored values fall back to defaults (so founder defaults surface for new visitors who haven't customized)
  - `gameEvents.characterUpdated(palette)` re-renders player sprite in canvas
  - In v0.3: writes will also go to Supabase profile when authed
- **Sprite system**: string-encoded grids (`"...oW#Wo..."`) + legend mapping char → color.
  See `sprites.ts`. Renderable via `PixelSprite` (HTML grid) or `createPixelTexture` (Phaser canvas texture).
- **Event bus** (`gameEvents`): `dialogue:open/close`, `world:pause/resume`,
  `character:update`, `ui:immersed`. Used to cross between React DOM and Phaser scene.

---

## Outstanding TODOs to resume v0.3 cleanly

### Must-do externally (you)
1. **DNS A record at Spaceship**: change `216.150.1.1` → `76.76.21.21` (Vercel apex IP). CNAME is already correct.
2. **Run migration** on Supabase remote: paste `supabase/migrations/0001_init.sql` into the dashboard SQL editor at https://supabase.com/dashboard/project/lbdwwhhrvefcqeulbbla/sql/new
3. **Create Discord OAuth app** at https://discord.com/developers/applications, enable Discord provider in Supabase Auth → Providers, set redirect URLs (`https://nuu-gules.vercel.app/auth/callback` + `http://localhost:3000/auth/callback`).
4. **Restart Claude Code + `claude /mcp`** to authenticate the Supabase MCP. Once tools surface, migration + queries can run via MCP directly.

### Code wire-up (in progress, mid-session by you)
- `AuthMenu.tsx` — sign-in / sign-out dropdown (referenced by `Nav.tsx` import)
- `src/lib/supabase/profile.ts` — `fetchMyProfile`, `saveMyProfile`, `characterFromProfile`, `shouldMigrateLocal`
- `src/lib/supabase/use-user.ts` — `useSupabaseUser()` hook
- `CustomizePanel` — when authed, Save writes to profile; otherwise localStorage. First login: migrate local → profile if empty.
- `/members` (index) — fetch real profiles from DB, render grid
- `/members/[slug]` — individual profile page with sprite, bio, links, last-seen
- Replace hardcoded `#0001` badge number with real `member_number` from profile

### Placeholders to swap before public launch
- `https://discord.gg/nuu` → real invite (in `HeroLanyard.tsx` + `content/dialogue.json`)
- `hello@nuu.community` → real contact email (in `/code-of-conduct`, `/privacy`, `README.md`, `Footer.tsx`)
- `@obicreative` Twitter handle in `src/app/layout.tsx` — confirm or update
- `NEXT_PUBLIC_SITE_URL` env var on Vercel is set to `https://nuu.today` (good once DNS resolves)

---

## Useful commands (from `/Users/obi/nuu/`)

```bash
npm run dev                          # local dev server
npm run build                        # production build (TypeScript validates)
git push                             # triggers Vercel auto-deploy
npx vercel --prod                    # manual production deploy
npx vercel env add NAME production   # set env var (or use dashboard)
npx vercel env pull .env.local       # pull production env vars locally
node scripts/convert-og-fonts.mjs    # regenerate Geist TTFs after upgrade
claude /mcp                          # auth Supabase MCP (browser OAuth)
gh repo view ObiBat/nuu --web        # open repo in browser
```

---

## Founder profile (don't override with placeholders)

| | |
|---|---|
| Display name | Obi Batbileg |
| Role | Design Technologist · Founder |
| Location | Sydney |
| Bio | Bridging design and development. Three.js, React, AI orchestration. Runs Craefto from Sydney. |
| Site | https://obicreative.dev |
| Studio | https://craefto.com |
| Email | obi@craefto.com |
| LinkedIn | linkedin.com/in/obibatbileg |

The founder identity is in `content/members.json` for the member record
and in `DEFAULT_CHARACTER` is empty (no founder defaults — new visitors
see placeholder "set your details ↗"). Founder is referenced everywhere
his profile shows.

---

## Roadmap (post v0.3)

- **v0.4** — Supabase Realtime: see other members walk the khural live, in-world chat
- **v0.5** — Events CRUD, Notice Board posts, library contributions, newsletter
- **v0.6** — Collisions, mobile touch, 4-direction sprites + walk frames, multi-map (garden / arcade), day/night
- **v0.7** — World-class pixel art (Kenney Tiny Town pack or commissioned)
- **v0.8** — Achievements, inventory, playable shatar mini-game at Arcade POI
- **v0.9** — Ecosystem (MAS-NSW, Bayan Mongol, sponsor slots)

Critical path: v0.3 (identity) → v0.4 (presence) → the rest is iteration.

---

## Persistent decisions (don't re-litigate)

- **Single-screen**: canvas fills 100vh, scroll content lives below
  (panels for quick views, scroll for deep reading)
- **Monochrome chrome, warm canvas**: site is black/white, the inner
  Phaser world is the warm Mongolian palette
- **Hash-routed panels over dedicated routes**: keeps the immersive feel,
  exceptions for `/library` (deep content) and v0.3 `/members` (deep linking)
- **Cburnett chess pieces** for shatar article (CC-BY-SA, bundled locally)
- **No matter.js**: badge uses CSS pendulum (matter caused string-card
  desync bugs across viewport sizes)
- **Brand stays monochrome**: per user feedback, OG images are pure
  white/black with subtle grid pattern (no warm sand/brown)
