import membersData from "../../content/members.json";
import eventsData from "../../content/events.json";
import type { Member, Event, Poi } from "./types";

export const members: Member[] = membersData.members as Member[];
export const events: Event[] = eventsData.events as Event[];

export const pois: Poi[] = [
  { id: "notice-board", label: "Notice Board", glyph: "▤", href: "#about" },
  { id: "pavilion", label: "Pavilion", glyph: "△", href: "#events" },
  { id: "bookshelf", label: "Bookshelf", glyph: "▦", href: "#library" },
  { id: "portal", label: "Portal", glyph: "◇", href: "#join" },
];

export const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Members", href: "/members" },
  { label: "Events", href: "/#events" },
  { label: "Library", href: "/#library" },
  { label: "You", href: "/#customize" },
];
