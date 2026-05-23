// Nuu progression — "Make your move".
//
// Public XP / level / achievements are DERIVED from real activity (posts,
// RSVPs, published articles, profile completeness) so they can't be faked from
// the client. The personal onboarding quests + collectibles (below) are
// tracked locally per device — they're a getting-started nudge, not public XP.

export type ServerCounts = {
  joined: boolean; // has a profile
  profileComplete: boolean; // name + role + location + bio
  posts: number;
  rsvps: number;
  published: number; // published library contributions
};

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  xp: number;
  earned: boolean;
};

export type Level = {
  level: number;
  title: string;
  xp: number;
  intoLevel: number; // xp earned into current level
  span: number; // xp span of current level (0 if max)
  nextTitle: string | null;
};

const LEVELS: { min: number; title: string }[] = [
  { min: 0, title: "Newcomer" },
  { min: 80, title: "Settler" },
  { min: 220, title: "Builder" },
  { min: 450, title: "Shipper" },
  { min: 800, title: "Maker" },
  { min: 1300, title: "Elder" },
];

type Def = Omit<Achievement, "earned"> & {
  check: (c: ServerCounts) => boolean;
};

const DEFS: Def[] = [
  { id: "joined", title: "Took a seat", desc: "Joined the khural", icon: "🪧", xp: 50, check: (c) => c.joined },
  { id: "profile", title: "Introduced", desc: "Filled out your profile", icon: "📇", xp: 50, check: (c) => c.profileComplete },
  { id: "first_post", title: "First word", desc: "Posted on the notice board", icon: "📝", xp: 40, check: (c) => c.posts >= 1 },
  { id: "voice", title: "Regular voice", desc: "Posted 5 times", icon: "💬", xp: 80, check: (c) => c.posts >= 5 },
  { id: "first_rsvp", title: "Showing up", desc: "RSVP'd to an event", icon: "📅", xp: 40, check: (c) => c.rsvps >= 1 },
  { id: "regular", title: "Always there", desc: "RSVP'd to 3 events", icon: "🎟️", xp: 70, check: (c) => c.rsvps >= 3 },
  { id: "author", title: "Published", desc: "Got an article into the library", icon: "📚", xp: 120, check: (c) => c.published >= 1 },
  { id: "prolific", title: "Prolific", desc: "Published 3 articles", icon: "✍️", xp: 200, check: (c) => c.published >= 3 },
];

export function computeAchievements(c: ServerCounts): Achievement[] {
  return DEFS.map((d) => ({
    id: d.id,
    title: d.title,
    desc: d.desc,
    icon: d.icon,
    xp: d.xp,
    earned: d.check(c),
  }));
}

export function computeLevel(achievements: Achievement[]): Level {
  const xp = achievements.reduce((s, a) => s + (a.earned ? a.xp : 0), 0);
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  return {
    level: idx + 1,
    title: cur.title,
    xp,
    intoLevel: xp - cur.min,
    span: next ? next.min - cur.min : 0,
    nextTitle: next ? next.title : null,
  };
}

export function computeProgress(c: ServerCounts): {
  level: Level;
  achievements: Achievement[];
} {
  const achievements = computeAchievements(c);
  return { level: computeLevel(achievements), achievements };
}

// ---- Personal onboarding quests (local) -------------------------------

export type QuestState = {
  styled: boolean;
  metObi: boolean;
  explored: boolean; // visited every POI
  posted: boolean;
  rsvped: boolean;
  joinedDiscord: boolean;
};

export type Quest = {
  id: keyof QuestState;
  title: string;
  hint: string;
  href: string;
  done: boolean;
};

export const POI_IDS = [
  "notice-board",
  "salon",
  "pavilion",
  "bookshelf",
  "portal",
] as const;

export function buildQuests(s: QuestState): Quest[] {
  return [
    { id: "styled", title: "Choose your character", hint: "Open Customize and pick a look", href: "#customize", done: s.styled },
    { id: "metObi", title: "Meet Obi, the founder", hint: "Walk up to Obi and press E", href: "", done: s.metObi },
    { id: "explored", title: "Explore the whole khural", hint: "Visit every spot in the world", href: "", done: s.explored },
    { id: "posted", title: "Post on the notice board", hint: "Say something in About", href: "#about", done: s.posted },
    { id: "rsvped", title: "RSVP to an event", hint: "Pick a gathering in Events", href: "#events", done: s.rsvped },
    { id: "joinedDiscord", title: "Join the Discord", hint: "Step through the portal", href: "#badge", done: s.joinedDiscord },
  ];
}
