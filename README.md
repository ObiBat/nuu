# nuu

> A community of Mongolian builders, breakers, and shippers — scattered across the world, gathered here. Нүү — make your move.

A pixel-art tech community you can walk in. Single-screen world, character customization, in-world dialogue, real long-form articles. Built as a small persistent room for the Mongolian diaspora.

**Live:** [nuu.community](https://nuu.community) (pending deploy)
**Founder:** [Obi Batbileg](https://obicreative.dev) · [Craefto](https://craefto.com)

---

## What's in the box

- **Khural** — the pixel-art world. WASD to move, E to interact, ⌘K to open the command palette. Five POIs (About, Events, Library, Discord, Salon), an NPC for the founder, six ambient member sprites with speech bubbles.
- **ID badge** — physics-feeling pendulum with 3D mouse parallax. Drag to swing, click to flip, scan the back to join Discord.
- **Salon** — customize your character (skin, hair, clothes, eyes, body type, identity). Saves to `localStorage`; will sync to Discord profile when auth lands.
- **Library** — long-form essays, guides, primers. Includes a substantive shatar primer with per-piece move diagrams using real CC-BY-SA chess art.
- **Single-page experience** — no scroll required to interact. Nav and content panels float over the world.
- **Real legal pages** — `/code-of-conduct` (Contributor Covenant-adapted) and `/privacy` (GDPR-aware, honest).

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind v4 + CSS variables |
| Fonts | Geist Sans / Mono / Pixel (Square + Triangle) |
| Game engine | Phaser 4 (lazy-loaded into the world section) |
| Drag interactions | @use-gesture/react |
| Command palette | cmdk |
| Analytics | Vercel Analytics + Speed Insights |
| Hosting | Vercel |

## Local development

```bash
git clone https://github.com/ObiBat/nuu.git
cd nuu
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploy to Vercel

```bash
vercel
```

Recommended environment variable:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Used by the sitemap, robots, and OpenGraph absolute URLs. Defaults to `https://nuu.community` when unset.

## Project structure

```
nuu/
├── content/
│   ├── members.json              # Member directory (founder + placeholders)
│   ├── events.json               # Upcoming gatherings
│   ├── dialogue.json             # POI dialogue content
│   └── library/
│       ├── index.ts              # Article registry
│       └── articles/             # One TS module per article
├── public/
│   └── pieces/                   # Cburnett chess piece SVGs (CC-BY-SA 3.0)
├── src/
│   ├── app/                      # Next.js App Router pages + metadata files
│   ├── components/               # React components
│   ├── game/                     # Phaser scene + sprites + event bus
│   └── lib/                      # Types, content loaders, character + library + shatar libs
```

## Attribution

- **Chess pieces** in the shatar article: [Cburnett SVG set](https://github.com/lichess-org/lila/tree/master/public/piece/cburnett) by Colin M.L. Burnett, licensed CC-BY-SA 3.0. Bundled locally in `/public/pieces/`.
- **Geist fonts** by Vercel, SIL OFL.
- All other sprites, world art, and copy by Obi Batbileg / nuu.

## Roadmap

- **v0.2 (now)** — ship publicly with proper meta, OG, analytics, legal pages
- **v0.3** — Discord OAuth + Supabase, real members table, profile editor
- **v0.4** — Live presence (see other members walking the khural in real time)
- **v0.5** — Events CRUD, library contributions, notice board
- **v0.6** — Collisions, mobile controls, multi-map, arcade with playable shatar
- **v0.7** — Commission/integrate pro pixel art
- **v0.8** — Achievements, inventory, daily quests
- **v0.9** — Ecosystem partners (MAS-NSW, Bayan Mongol, etc.)

## License

MIT. Chess piece assets retain their CC-BY-SA 3.0 license (see Attribution above).

## Contact

[hello@nuu.community](mailto:hello@nuu.community) (placeholder) · [obi@craefto.com](mailto:obi@craefto.com) (founder)
