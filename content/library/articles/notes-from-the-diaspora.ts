import type { Article } from "@/lib/library";

export const article: Article = {
  slug: "notes-from-the-diaspora",
  title: "Notes from the diaspora",
  excerpt:
    "Mongolian builders abroad — patterns, struggles, and the case for a small persistent room where we can be ourselves out loud.",
  tag: "Essay",
  author: "Obi",
  date: "2026-05-18",
  readMinutes: 6,
  body: [
    {
      type: "intro",
      text: "I learned to introduce myself twice. Once in Mongolian, once in English. By the time I finished both, the conversation had usually moved on.",
    },
    { type: "h2", text: "The doubling" },
    {
      type: "p",
      text: "Diaspora life is the experience of always being slightly translated. The version of yourself you bring to work is not the version that calls home on Sunday. The jokes you make in one language die in the other. A part of you accumulates that has nowhere to land — the part that knew, without needing to explain, what naadam smells like, or what your aav meant when he said you needed to be more careful with money.",
    },
    {
      type: "p",
      text: "Most of the time this is fine. You're busy. The work is interesting. The new city is patient. But every now and then you meet another Mongolian in some place neither of you should be — a coworking space in Berlin, a queue in Tokyo, a bar in Sydney — and you both go quiet for a second because the doubling stops for a second. You can be one person for the length of the conversation.",
    },
    { type: "h2", text: "Builders abroad" },
    {
      type: "p",
      text: "I've started keeping a running list of Mongolian people building things outside Mongolia. The list is longer than I expected. A few patterns surface.",
    },
    {
      type: "ul",
      items: [
        "Almost always self-taught. The bootcamp-to-FAANG pipeline never really arrived in Ulaanbaatar; people learned by shipping.",
        "Strong on fundamentals, light on hype. The work tends to be quietly correct rather than loudly novel.",
        "Public very late. Most of the builders I respect ship in private for years and then surface with something almost done.",
        "Generous one-on-one. Stingy with public posts. The knowledge moves through DMs and dinners, not through Twitter.",
      ],
    },
    {
      type: "p",
      text: "None of these patterns are bad. They are, however, costly when the community is invisible to itself. A Mongolian working on a security product in Sydney does not know that another Mongolian is working on a security product in Toronto. They could have met. They didn't.",
    },
    { type: "h2", text: "Why now" },
    {
      type: "p",
      text: "The infrastructure for a tiny global diaspora to behave like a small town finally exists. Discord. Video calls. Async tools that don't punish you for being on the wrong time zone. Pixel art that looks good on phones. A site can host a persistent shared room without burning anyone's weekend.",
    },
    {
      type: "p",
      text: "And there are enough of us building now that a room won't echo. Not thousands. A few hundred, maybe. Enough.",
    },
    { type: "h2", text: "What Nuu is for" },
    {
      type: "p",
      text: "A persistent room. A place to be visible to each other without having to perform. Walk in. See who else is here. Make your move.",
    },
    {
      type: "quote",
      text: "If you've ever been the only Mongolian in a room and wished someone would just nod at you in the language — this is the room.",
    },
  ],
};
