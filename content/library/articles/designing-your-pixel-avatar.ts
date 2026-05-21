import type { Article } from "@/lib/library";

export const article: Article = {
  slug: "designing-your-pixel-avatar",
  title: "Designing your pixel avatar",
  excerpt:
    "The sprite system, the customization options today, and what's coming. A short guide to making the version of yourself who walks the khural.",
  tag: "Guide",
  author: "Obi",
  date: "2026-05-15",
  readMinutes: 3,
  body: [
    {
      type: "intro",
      text: "Every member of Nuu has a pixel character that walks the khural. This guide is how to make yours yours.",
    },
    { type: "h2", text: "The sprite system" },
    {
      type: "p",
      text: "Each character is a 16×22 pixel sprite. There is one shared body template — the silhouette — and a palette layered on top. Changing the palette changes the character without changing the underlying art, which is what lets us have hundreds of distinct members from a single piece of source.",
    },
    {
      type: "p",
      text: "Six color slots are exposed today: skin, hair, shirt, pants, shoes, and eyes. There is also a body toggle (standard or flat) that swaps a single row of pixels in the lower body. More layers — hair style, accessories, expressions — are planned.",
    },
    { type: "h2", text: "How to customize" },
    {
      type: "p",
      text: "Three paths to the same panel:",
    },
    {
      type: "ul",
      items: [
        "Walk to the Salon — the wardrobe with the mirror, just northeast of spawn. Press E or click the building.",
        "Hit ⌘K and search for \"You\" or \"Customize\".",
        "Click \"You\" in the top nav or the bottom chip strip.",
      ],
    },
    {
      type: "p",
      text: "Pick a swatch in each section. The preview at the top updates instantly. Hit Save. Your character in the world swaps texture in place — no reload.",
    },
    { type: "h2", text: "Where your character lives" },
    {
      type: "p",
      text: "Right now: localStorage under the key nuu:character/v1. That means your character lives on this browser, on this device, and will follow you across page reloads but not across devices or browsers.",
    },
    {
      type: "p",
      text: "When Discord login lands (Phase 2 of the roadmap) your character will sync to your member profile. You'll see it from any device, and other members will see it on your member card.",
    },
    { type: "h2", text: "Tips" },
    {
      type: "ul",
      items: [
        "Pick a hair color you'd actually wear. People remember silhouettes.",
        "Match shirt to your usual energy. Cream reads thoughtful. Red reads warm. Blurple reads chronically online.",
        "Don't overthink it. You can change everything any time, and we'll add more options soon.",
      ],
    },
    { type: "h2", text: "What's coming" },
    {
      type: "p",
      text: "Hair styles (short, long, bun, buzz). Accessories (glasses, scarf, hat). Facial expressions (default, smile, focused). Pose variations. All planned. None here yet. If you'd like one specific addition, drop a note in #intros on Discord.",
    },
  ],
};
