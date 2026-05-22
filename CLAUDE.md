@AGENTS.md

# Nuu — Context for Claude Code

A pixel-art tech community for the Mongolian diaspora. A single-screen
Phaser world embedded in a Next.js 16 site. Every member has a
customizable character that walks the central **khural** (gathering),
talks to other members, and walks through a portal into Discord. Real
long-form articles live at `/library`.

Founder: **Obi Batbileg** ([obicreative.dev](https://obicreative.dev) · [craefto.com](https://craefto.com)).

---

## Current state (last verified: 2026-05-22)

| Phase | Status |
|---|---|
| **v0.1 — World** | ✅ shipped |
| **v0.2 — Public** | ✅ deployed to Vercel + GitHub + CI/CD |
| **v0.3 — Identity** | ✅ shipped (magic-link auth, profiles, /members, customize→DB) — 0 real signups yet |
| **v0.4 — Presence** | 🚀 deployed (Supabase Realtime: live members walk khural + global chat) — **live-unverified**: needs a 2-session sign-in test |
| v0.5–v0.9 | future |

Live: **https://nuu.today** (DNS resolved, A=76.76.21.21, HTTP 200) and **https://nuu-gules.vercel.app**.
Repo: **https://github.com/ObiBat/nuu** (public, MIT).
Vercel project: `obis-projects-ce997674/nuu` — latest production deployment READY (commit `9f7f610`).
Supabase project ref: `lbdwwhhrvefcqeulbbla` (Sydney). Migrations `0001_init` + `0002_harden_functions` applied. `public.profiles` live, RLS on, 0 rows.

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
│   ├── migrations/           # ALL APPLIED ON REMOTE
│   │   ├── 0001_init.sql     # Profiles table + RLS + auto-create trigger
│   │   ├── 0002_harden_functions.sql  # Pin search_path + revoke EXECUTE on handle_new_user
│   │   └── 0003_revoke_event_trigger_execute.sql  # Revoke EXECUTE on rls_auto_enable event trigger
│   └── email-templates/
│       └── magic-link.html   # Branded sign-in email — MUST be pasted into Supabase Dashboard manually
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
│   │   ├── AuthMenu.tsx      # v0.3 — email magic-link sign-in + signed-in dropdown
│   │   └── PresenceLayer.tsx # NEW v0.4 — resolves signed-in identity → scene, renders global chat input
│   ├── game/
│   │   ├── KhuralScene.ts    # The Phaser scene — player, NPCs, POIs, props, depth-sorted, + v0.4 remote players/chat/ambient-fade
│   │   ├── presence.ts       # NEW v0.4 — KhuralPresence: Supabase Realtime channel wrapper (join/track, sendMove, sendChat)
│   │   ├── sprites.ts        # String-encoded pixel sprites + createPixelTexture utility
│   │   └── events.ts         # gameEvents bus (dialogue, world pause, character update, ui immersed, + v0.4 presence:identity/chat:send/chat:typing + lastIdentity cache)
│   └── lib/
│       ├── character.ts      # CharacterPalette type + localStorage + curated swatch options
│       ├── library.ts + shatar.ts  # Content registries + types
│       ├── content.ts        # nav + POI lists
│       ├── og-fonts.ts + og-fonts/*.ttf  # Brand fonts for OG images
│       └── supabase/
│           ├── client.ts     # Browser client (cookies via @supabase/ssr)
│           ├── server.ts     # Server client (RSC + actions)
│           ├── types.ts      # Generated DB types (currently hand-written)
│           ├── profile.ts    # v0.3 — fetchMyProfile, saveMyProfile, characterFromProfile, shouldMigrateLocal, slugify
│           └── use-user.ts   # v0.3 — useSupabaseUser() client hook
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

## v0.3 — DONE (verified 2026-05-22)

All external blockers cleared and code wired:
- ✅ DNS resolved (`nuu.today` A=76.76.21.21, both URLs HTTP 200)
- ✅ Migrations applied (`0001_init` + `0002_harden_functions`), `profiles` table live with RLS
- ✅ Supabase MCP authed (queries/migrations run via MCP)
- ✅ `AuthMenu.tsx` — email magic-link sign-in (`signInWithOtp`) + signed-in dropdown
- ✅ `src/lib/supabase/profile.ts` — `fetchMyProfile`, `saveMyProfile`, `characterFromProfile`, `shouldMigrateLocal`, `slugify`
- ✅ `src/lib/supabase/use-user.ts` — `useSupabaseUser()` hook
- ✅ `CustomizePanel` (in `PanelHost.tsx`) — authed Save writes to DB, local→profile migration on first login
- ✅ `/members` index — fetches real profiles, grid with sprite portraits, empty-state
- ✅ `/members/[slug]` — individual profile pages (slug or member_number lookup)

**Decision change:** Discord OAuth was dropped in favor of **email magic-link** (simpler, no third-party app to maintain). Discord remains the *destination* (Portal POI), not the auth provider.

### v0.3 cleanup remaining (small)
1. **Hardcoded badge `#0001`** in `HeroLanyard.tsx:284` — still static; swap for real `member_number` when the badge belongs to a signed-in member (currently the badge is a marketing/hero element, so may stay `#0001` intentionally — confirm intent).
2. ~~Security advisor WARN on `rls_auto_enable()`~~ ✅ fixed in `0003` migration (advisors now clean).
3. **Branded magic-link email** — HTML template at `supabase/email-templates/magic-link.html` must be pasted into Supabase Dashboard → Auth → Email Templates → Magic Link (manual, can't be done via MCP).

## v0.4 — DEPLOYED (live-unverified, 2026-05-22)

Supabase Realtime presence is in production. Architecture:
- **Scene owns the channel.** `KhuralScene` instantiates `KhuralPresence` (`src/game/presence.ts`) on a single Realtime channel `"khural"`. **Presence** tracks identity + last position (so late joiners see everyone); **broadcast** carries throttled movement (~10Hz, `move` event) and `chat` lines.
- **React→scene bridge.** `PresenceLayer.tsx` resolves the signed-in member's identity (`useSupabaseUser` + `fetchMyProfile`), dispatches `gameEvents.presenceIdentity(...)`, re-emits on `character:update`, and renders the global chat input. `gameEvents.lastIdentity` cache means the scene connects regardless of mount order.
- **Rendering.** Remote members render as sprites built from their palette, interpolated toward broadcast targets, with walk-frame animation, a `name #NNNN` tag, and chat speech bubbles. Ambient NPCs fade to `0.22` alpha when ≥1 real member is present. Chat input focus blocks WASD/E via `chat:typing`.
- **Scope decisions** (don't re-litigate): **signed-in members only** (signed-out visitors see others but don't broadcast); **global** khural chat (not proximity); ambient NPCs **fade** when real people join (not removed).

### v0.4 verification still owed
- **2-session live test**: sign in via magic-link from two browsers/devices, confirm avatars appear, movement syncs, chat bubbles cross sessions, ambient NPCs fade, and sign-out removes the avatar. Built + deploys clean but NOT yet verified end-to-end with two real members (0 signups so far).
- The `"khural"` broadcast channel has no row-level gating — any signed-in member can join (intended for v0.4).

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

## Roadmap (post v0.4)

- ~~**v0.4** — Supabase Realtime: see other members walk the khural live, in-world chat~~ 🚀 deployed (live-unverified)
- **v0.5 — Content & contribution (NEXT)** — Events CRUD, Notice Board posts, library contributions, newsletter
- **v0.6** — Collisions, mobile touch, 4-direction sprites + walk frames, multi-map (garden / arcade), day/night
- **v0.7** — World-class pixel art (Kenney Tiny Town pack or commissioned)
- **v0.8** — Achievements, inventory, playable shatar mini-game at Arcade POI
- **v0.9** — Ecosystem (MAS-NSW, Bayan Mongol, sponsor slots)

Critical path: ~~v0.3 (identity)~~ ✅ → ~~v0.4 (presence)~~ 🚀 → **v0.5 (content) — NEXT** → the rest is iteration.

### v0.5 scope (tee-up)

The theme is **members create, not just exist** — give the community things to post and read. Likely slices, smallest-first:

1. ~~**Notice Board posts**~~ ✅ **SHIPPED** (2026-05-22) — `posts` table (`0005_notice_board.sql`: author_id → profiles, body 1–500 chars, RLS public-read / authed-insert-as-self / delete-own-or-admin). `posts.ts` (browser) fetches with `author:profiles(...)` embed + current user/admin for delete rights. `NoticeBoard.tsx` (compose box when signed in, post list with author link + relative time, delete own/admin) mounts in the About panel (`#about`). Not realtime — refetches on mount + after post/delete.
2. ~~**Events CRUD**~~ ✅ **SHIPPED** (2026-05-22) — `events` + `event_rsvps` tables (`0004_events.sql`), `profiles.is_admin` flag (founder auto-promoted on signup by email in `handle_new_user`). Admins create/edit/delete; any signed-in member RSVPs (capacity + spots-left tracking). Data layer split: `events.ts` (browser) + `events-server.ts` (RSC, `server-only`); `buildEventsView` shared. UI: `EventsBoard.tsx` (RSVP toggle w/ optimistic update + admin composer) used by both `EventsList` (home section, SSR initial data) and the `#events` panel. **Note:** the home `/` route is now dynamic (server-fetches events). CommandPalette still searches the stale static `content/events.json` — minor cleanup, not wired to DB.
3. **Library contributions** — let members submit articles (currently TS modules in `content/library/`). Bigger lift: needs a DB-backed article store + a writing/markdown flow + moderation. Could defer to v0.5.x.
4. **Newsletter** — capture emails (Supabase table or a provider like Resend/Buttondown). Lowest urgency.

**Open questions for v0.5 kickoff** (decide before building):
- Moderation model: open-post + after-the-fact removal, or approval queue? Drives whether we need an admin role now.
- Library contributions in v0.5 or pushed to v0.5.x (it's the heaviest piece)?
- Realtime for the Notice Board (live-updating posts via the existing channel pattern) or simple revalidate-on-load?

**Prereq carried from v0.4:** finish the 2-session live verification before piling v0.5 on top, so we're not debugging presence and new CRUD at once.

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
- **Magic-link over Discord OAuth**: v0.3 dropped Discord as the auth
  provider in favor of email magic-link (simpler, no third-party app to
  maintain). Discord remains the *destination* (Portal POI), not login.
- **Realtime: scene owns the channel**: the Phaser scene (not React)
  holds the Supabase Realtime channel — it already has player position,
  sprite rendering, and bubbles. React only feeds identity + chat in via
  `gameEvents`. Presence = identity + last position; broadcast = movement
  + chat. Signed-in members only; global (not proximity) chat.
