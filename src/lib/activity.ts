// Local (per-device) activity tracking for onboarding quests + collectibles.
// Public XP/level live server-side; this is the personal getting-started layer.
import { POI_IDS } from "./gamification";

export type Activity = {
  pois: string[]; // visited POI ids
  metObi: boolean;
  joinedDiscord: boolean;
  styled: boolean; // used the character picker
  collectibles: string[]; // collected piece ids
};

const KEY = "nuu:activity/v1";
const EMPTY: Activity = {
  pois: [],
  metObi: false,
  joinedDiscord: false,
  styled: false,
  collectibles: [],
};

export const COLLECTIBLE_TOTAL = 6;

export function getActivity(): Activity {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function save(a: Activity) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
    window.dispatchEvent(new CustomEvent("nuu:activity", { detail: a }));
  } catch {
    /* ignore */
  }
}

export function visitedAllPois(a: Activity): boolean {
  return POI_IDS.every((id) => a.pois.includes(id));
}

export function markPoiVisited(id: string) {
  const a = getActivity();
  if (id === "obi") {
    if (a.metObi) return;
    a.metObi = true;
  } else {
    if (a.pois.includes(id)) return;
    a.pois = [...a.pois, id];
  }
  save(a);
}

export function markDiscordJoined() {
  const a = getActivity();
  if (a.joinedDiscord) return;
  a.joinedDiscord = true;
  save(a);
}

export function markStyled() {
  const a = getActivity();
  if (a.styled) return;
  a.styled = true;
  save(a);
}

export function markCollectible(id: string): boolean {
  const a = getActivity();
  if (a.collectibles.includes(id)) return false;
  a.collectibles = [...a.collectibles, id];
  save(a);
  return true;
}
