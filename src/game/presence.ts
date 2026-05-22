import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { CharacterPalette } from "@/lib/character";

export type Facing = 1 | -1;

export type PresenceIdentity = {
  userId: string;
  slug: string | null;
  memberNumber: number;
  displayName: string;
  palette: CharacterPalette;
  preset: string;
};

export type RemoteMember = PresenceIdentity & {
  x: number;
  y: number;
  facing: Facing;
};

type Callbacks = {
  onRoster: (members: RemoteMember[]) => void;
  onMove: (userId: string, x: number, y: number, facing: Facing) => void;
  onChat: (userId: string, text: string) => void;
};

const CHANNEL = "khural";

// Wraps a single Supabase Realtime channel for the khural. Presence carries
// identity + last-known position (so late joiners see everyone); broadcast
// carries high-frequency movement and chat. Signed-in members only — the
// caller never instantiates this without a resolved profile identity.
export class KhuralPresence {
  private readonly supabase = createSupabaseBrowser();
  private channel: RealtimeChannel | null = null;
  private pos: { x: number; y: number; facing: Facing };

  constructor(
    private readonly identity: PresenceIdentity,
    spawn: { x: number; y: number },
    private readonly cb: Callbacks,
  ) {
    this.pos = { x: spawn.x, y: spawn.y, facing: 1 };
  }

  join() {
    const ch = this.supabase.channel(CHANNEL, {
      config: { presence: { key: this.identity.userId } },
    });

    ch.on("presence", { event: "sync" }, () => this.emitRoster(ch));

    ch.on("broadcast", { event: "move" }, ({ payload }) => {
      const p = payload as { userId: string; x: number; y: number; facing: Facing };
      if (p.userId === this.identity.userId) return;
      this.cb.onMove(p.userId, p.x, p.y, p.facing);
    });

    ch.on("broadcast", { event: "chat" }, ({ payload }) => {
      const p = payload as { userId: string; text: string };
      if (p.userId === this.identity.userId) return;
      this.cb.onChat(p.userId, p.text);
    });

    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") void this.track();
    });

    this.channel = ch;
  }

  private async track() {
    await this.channel?.track({
      ...this.identity,
      x: this.pos.x,
      y: this.pos.y,
      facing: this.pos.facing,
    });
  }

  private emitRoster(ch: RealtimeChannel) {
    const state = ch.presenceState<RemoteMember>();
    const members: RemoteMember[] = [];
    for (const key of Object.keys(state)) {
      const meta = state[key]?.[0] as RemoteMember | undefined;
      if (meta && meta.userId !== this.identity.userId) members.push(meta);
    }
    this.cb.onRoster(members);
  }

  sendMove(x: number, y: number, facing: Facing) {
    this.pos = { x, y, facing };
    void this.channel?.send({
      type: "broadcast",
      event: "move",
      payload: { userId: this.identity.userId, x, y, facing },
    });
  }

  // Periodically re-track so the presence snapshot late joiners receive
  // reflects the player's current position, not their spawn point.
  syncPosition() {
    void this.track();
  }

  sendChat(text: string) {
    void this.channel?.send({
      type: "broadcast",
      event: "chat",
      payload: { userId: this.identity.userId, text },
    });
  }

  leave() {
    if (!this.channel) return;
    void this.supabase.removeChannel(this.channel);
    this.channel = null;
  }
}
