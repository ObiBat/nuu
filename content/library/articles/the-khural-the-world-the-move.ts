import type { Article } from "@/lib/library";

export const article: Article = {
  slug: "the-khural-the-world-the-move",
  title: "The khural, the world, the move",
  excerpt:
    "Why Nuu is a world to walk in rather than another Discord server with extra steps. A short design memo.",
  tag: "Design",
  author: "Obi",
  date: "2026-05-12",
  readMinutes: 5,
  body: [
    {
      type: "intro",
      text: "The most reasonable thing to do for a small online community is to start a Discord server. We have one. But the public face of Nuu is a tiny pixel-art world you can walk in. This is why.",
    },
    { type: "h2", text: "The problem with chat" },
    {
      type: "p",
      text: "Chat is excellent for synchronous bursts and async DM threads. It is bad at one specific thing: making people feel that the community exists in space. You can be in a Discord with five thousand people and feel completely alone, because chat is a stream — a thing you tap into and out of, not a place you go to.",
    },
    {
      type: "p",
      text: "Communities that have a sense of place tend to be communities that last. A persistent room. A bar where the regulars sit. A plaza that looks the same on Tuesday as it did on Sunday.",
    },
    { type: "h2", text: "Rooms you can walk in" },
    {
      type: "p",
      text: "There is a genre of internet thing that mostly disappeared between 2008 and 2020 and is quietly coming back: shared persistent spaces with character avatars that can move around in them. Habbo Hotel (2000). Club Penguin (2005). The Sims Online (2002). The reference set is older than most web designers working today.",
    },
    {
      type: "p",
      text: "Stardew Valley brought the aesthetic back. Vampire Survivors normalized small dense pixel-art screens. A Short Hike showed it could fit in a browser. The format is ready again. The diaspora is the use case.",
    },
    { type: "h2", text: "The constraint: stay small" },
    {
      type: "p",
      text: "Most virtual world projects fail because they try to be everything. Land sales. Persistent inventories. Voice chat. Trading. We are doing none of that.",
    },
    {
      type: "p",
      text: "The Nuu khural is 1000×580 pixels. It fits on one screen. There is one map. There are four buildings, one NPC who is me, and a small number of placeholder neighbors. Customizing your character is the only persistent state. That is the whole thing.",
    },
    {
      type: "p",
      text: "Smallness is the design. Smallness is what makes it possible to actually ship.",
    },
    { type: "h2", text: "The move" },
    {
      type: "p",
      text: "Walk in. Talk to one person. Make one move. Come back tomorrow.",
    },
    {
      type: "quote",
      text: "The smallest unit of a community is two people who recognize each other.",
    },
  ],
};
