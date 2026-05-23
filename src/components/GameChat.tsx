"use client";

import { useEffect, useRef, useState } from "react";
import { gameEvents } from "@/game/events";

const EMOTES = ["👋", "❤️", "😂", "🎉", "🔥", "✨"];
const QUICK = ["Sain uu! 👋", "GG", "Welcome!", "Coffee? ☕", "Shipping 🚀"];

type LogEntry = { id: number; name: string; text: string; kind: "chat" | "emote" };

// In-world game chat: a fading recent-messages feed (everyone sees it), plus
// emote buttons, one-tap quick phrases, and a text input (signed-in members).
export function GameChat({ signedIn }: { signedIn: boolean }) {
  const [feed, setFeed] = useState<LogEntry[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<Omit<LogEntry, "id">>).detail;
      const id = nextId.current++;
      setFeed((f) => [...f, { ...d, id }].slice(-6));
      // Expire this entry after a few seconds.
      setTimeout(() => setFeed((f) => f.filter((x) => x.id !== id)), 7000);
    };
    gameEvents.addEventListener("chat:log", on);
    return () => gameEvents.removeEventListener("chat:log", on);
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-[min(92vw,440px)]">
      {feed.length > 0 && (
        <ul className="w-full flex flex-col gap-1 items-start">
          {feed.map((m) => (
            <li
              key={m.id}
              className="max-w-full bg-foreground/85 text-background rounded-full px-3 py-1 text-xs animate-[fadeIn_0.2s_ease-out]"
            >
              <span className="font-mono text-[10px] opacity-70 mr-1.5">
                {m.name}
              </span>
              <span className={m.kind === "emote" ? "text-base" : ""}>
                {m.text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {signedIn && <Controls />}
    </div>
  );
}

function Controls() {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim().slice(0, 140);
    if (!t) return;
    gameEvents.sendChat(t);
    setText("");
  };

  return (
    <div className="pointer-events-auto w-full flex flex-col gap-2 animate-[fadeIn_0.3s_ease-out]">
      {/* Emotes */}
      <div className="flex justify-center gap-1.5">
        {EMOTES.map((emo) => (
          <button
            key={emo}
            type="button"
            aria-label={`Send ${emo}`}
            onClick={() => gameEvents.sendEmote(emo)}
            className="w-9 h-9 rounded-full bg-background/95 border border-border text-lg leading-none hover:bg-border/60 active:scale-90 transition-transform"
          >
            {emo}
          </button>
        ))}
      </div>

      {/* Quick phrases (toggle) */}
      {open && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => gameEvents.sendChat(q)}
              className="px-3 h-7 rounded-full bg-background/95 border border-border text-xs font-medium hover:border-border-strong transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={send}
        className="flex items-center gap-1.5 bg-background/95 backdrop-blur-sm border border-border rounded-full pl-3 pr-1.5 py-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)]"
      >
        <button
          type="button"
          aria-label="Quick phrases"
          onClick={() => setOpen((o) => !o)}
          className={`shrink-0 w-7 h-7 rounded-full border text-xs ${
            open
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted"
          }`}
        >
          ⚡
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => gameEvents.setTyping(true)}
          onBlur={() => gameEvents.setTyping(false)}
          maxLength={140}
          placeholder="Say something to the khural…"
          aria-label="Send a message to everyone in the khural"
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted/70 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="shrink-0 inline-flex items-center h-7 px-3 text-[11px] font-medium bg-foreground text-background rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-subtle transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
