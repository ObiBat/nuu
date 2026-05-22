import Phaser from "phaser";
import { gameEvents } from "./events";
import {
  createPixelTexture,
  CHAR_SPRITES,
  buildCharacterRows,
  POI_NOTICE_SPRITE,
  POI_NOTICE_LEGEND,
  POI_PAVILION_SPRITE,
  POI_PAVILION_LEGEND,
  POI_BOOKSHELF_SPRITE,
  POI_BOOKSHELF_LEGEND,
  POI_PORTAL_SPRITE,
  POI_PORTAL_LEGEND,
  POI_SALON_SPRITE,
  POI_SALON_LEGEND,
  PROP_LAMP_SPRITE,
  PROP_LAMP_LEGEND,
  PROP_PLANT_SPRITE,
  PROP_PLANT_LEGEND,
  PROP_TREE_SPRITE,
  PROP_TREE_LEGEND,
  PROP_ROCK_SPRITE,
  PROP_ROCK_LEGEND,
} from "./sprites";
import {
  loadCharacter,
  paletteToLegend,
  type CharacterPalette,
} from "@/lib/character";
import {
  KhuralPresence,
  type Facing,
  type PresenceIdentity,
  type RemoteMember,
} from "./presence";

const USER_IDLE_KEY = "char-user-idle";
const USER_WALK_KEY = "char-user-walk";

const WORLD_W = 1000;
const WORLD_H = 580;
const PLAYER_SPEED = 200;
const INTERACT_RADIUS = 92;
const SPRITE_SCALE = 2.8;

const BG_COLOR = 0x6a9050;
const GRASS_LIGHT = 0x7ab050;
const GRASS_DARK = 0x5a8038;
const STONE_LIGHT = 0xd8c498;
const STONE_DARK = 0xb8a878;
const STONE_LINE = 0x8a7a58;
const PATH_LIGHT = 0xc0a07a;

const SPAWN = { x: WORLD_W / 2, y: WORLD_H * 0.58 };

type InteractableData = {
  id: string;
  type: "poi" | "npc";
  x: number;
  y: number;
  label: string;
  spriteKey: string;
  scale?: number;
};

const POIS: InteractableData[] = [
  {
    id: "notice-board",
    type: "poi",
    x: 500,
    y: 130,
    label: "About",
    spriteKey: "poi-notice-board",
    scale: SPRITE_SCALE * 0.85,
  },
  {
    id: "pavilion",
    type: "poi",
    x: 830,
    y: 290,
    label: "Events",
    spriteKey: "poi-pavilion",
    scale: SPRITE_SCALE * 0.9,
  },
  {
    id: "bookshelf",
    type: "poi",
    x: 170,
    y: 290,
    label: "Library",
    spriteKey: "poi-bookshelf",
    scale: SPRITE_SCALE * 0.85,
  },
  {
    id: "portal",
    type: "poi",
    x: 500,
    y: 460,
    label: "Discord",
    spriteKey: "poi-portal",
    scale: SPRITE_SCALE * 1.05,
  },
  {
    id: "salon",
    type: "poi",
    x: 660,
    y: 180,
    label: "Salon",
    spriteKey: "poi-salon",
    scale: SPRITE_SCALE * 0.85,
  },
];

const OBI_NPC: InteractableData = {
  id: "obi",
  type: "npc",
  x: 340,
  y: 180,
  label: "Obi · Founder",
  spriteKey: "char-obi-idle",
  scale: SPRITE_SCALE,
};

type AmbientNpc = {
  id: string;
  x: number;
  y: number;
  spriteKey: string;
  lines: string[];
};

const AMBIENT_NPCS: AmbientNpc[] = [
  {
    id: "amb-1",
    x: 750,
    y: 250,
    spriteKey: "char-ruby-idle",
    lines: ["Sain bain uu!", "First move?", "From Ulaanbaatar."],
  },
  {
    id: "amb-2",
    x: 260,
    y: 440,
    spriteKey: "char-azure-idle",
    lines: ["Building from Berlin.", "Shipping today.", "Anyone in Melb?"],
  },
  {
    id: "amb-3",
    x: 760,
    y: 440,
    spriteKey: "char-forest-idle",
    lines: ["Trying shatar.", "Where's the library?", "TS or Rust?"],
  },
  {
    id: "amb-4",
    x: 410,
    y: 380,
    spriteKey: "char-sand-idle",
    lines: ["Good morning.", "Nice khural.", "Who's the founder?"],
  },
  {
    id: "amb-5",
    x: 620,
    y: 360,
    spriteKey: "char-ruby-idle",
    lines: ["GM nomads.", "Coffee somewhere?", "Stand-up in 5."],
  },
  {
    id: "amb-6",
    x: 880,
    y: 380,
    spriteKey: "char-azure-idle",
    lines: ["Just shipped.", "Anyone reviewing?", "Cmd-K!"],
  },
];

type PropKind = "lamp" | "plant" | "tree" | "rock";
const PROPS: { kind: PropKind; x: number; y: number; scale?: number }[] = [
  { kind: "tree", x: 50, y: 90 },
  { kind: "tree", x: 950, y: 90 },
  { kind: "tree", x: 50, y: 500 },
  { kind: "tree", x: 950, y: 500 },
  { kind: "tree", x: 90, y: 200 },
  { kind: "tree", x: 910, y: 200 },
  { kind: "tree", x: 90, y: 410 },
  { kind: "tree", x: 910, y: 410 },
  { kind: "lamp", x: 420, y: 230 },
  { kind: "lamp", x: 580, y: 230 },
  { kind: "lamp", x: 420, y: 360 },
  { kind: "lamp", x: 580, y: 360 },
  { kind: "rock", x: 240, y: 160 },
  { kind: "rock", x: 760, y: 160 },
  { kind: "rock", x: 260, y: 440 },
  { kind: "rock", x: 740, y: 440 },
  { kind: "rock", x: 350, y: 460 },
  { kind: "rock", x: 650, y: 460 },
  { kind: "plant", x: 300, y: 110 },
  { kind: "plant", x: 700, y: 110 },
  { kind: "plant", x: 300, y: 510 },
  { kind: "plant", x: 700, y: 510 },
  { kind: "plant", x: 200, y: 220 },
  { kind: "plant", x: 800, y: 220 },
  { kind: "plant", x: 200, y: 380 },
  { kind: "plant", x: 800, y: 380 },
];

type Interactable = Omit<InteractableData, "label"> & {
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  prompt: Phaser.GameObjects.Container;
  baseY: number;
  targetScale: number;
  currentScale: number;
};

type AmbientNpcState = AmbientNpc & {
  sprite: Phaser.GameObjects.Image;
  baseY: number;
  bubble: Phaser.GameObjects.Container | null;
  bubbleTimer: number;
  bubbleVisibleFor: number;
  lineIndex: number;
};

type RemotePlayerState = {
  id: string;
  sprite: Phaser.GameObjects.Image;
  nameTag: Phaser.GameObjects.Container;
  idleKey: string;
  walkKey: string;
  x: number;
  baseY: number;
  targetX: number;
  targetY: number;
  facing: Facing;
  walkFrame: number;
  walkTimer: number;
  walkPhase: number;
  bubble: Phaser.GameObjects.Container | null;
  bubbleVisibleFor: number;
};

export class KhuralScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerBaseY = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactables: Interactable[] = [];
  private ambient: AmbientNpcState[] = [];
  private currentTarget: string | null = null;
  private dialogueOpen = false;
  private worldPaused = true;
  private walkPhase = 0;
  private playerWalkFrame = 0;
  private playerWalkTimer = 0;

  private presence: KhuralPresence | null = null;
  private identity: PresenceIdentity | null = null;
  private remote = new Map<string, RemotePlayerState>();
  private moveSendTimer = 0;
  private posSyncTimer = 0;
  private lastSentFacing: Facing = 1;
  private ambientFaded = false;
  private typingBlocked = false;
  private playerBubble: Phaser.GameObjects.Container | null = null;
  private playerBubbleFor = 0;

  constructor() {
    super({ key: "KhuralScene" });
  }

  create() {
    this.cameras.main.setBackgroundColor(BG_COLOR);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    this.buildSprites();
    this.drawFloor();
    this.spawnProps();
    this.spawnInteractables();
    this.spawnAmbient();
    this.spawnPlayer();

    this.cursors = this.input.keyboard!.createCursorKeys();
    // enableCapture=false: letter keys never need preventDefault (they don't
    // scroll the page) and capturing them would swallow the same letters when
    // a DOM text field — e.g. the sign-in email input — is focused.
    this.wasd = this.input.keyboard!.addKeys(
      "W,A,S,D",
      false,
    ) as typeof this.wasd;
    this.interactKey = this.input.keyboard!.addKey("E", false);
    this.bindFocusGuards();

    this.fitCamera(this.scale.gameSize);
    this.scale.on("resize", this.fitCamera, this);

    gameEvents.addEventListener("dialogue:close", this.onDialogueClose);
    gameEvents.addEventListener("world:pause", this.onWorldPause);
    gameEvents.addEventListener("world:resume", this.onWorldResume);
    gameEvents.addEventListener("character:update", this.onCharacterUpdate);
    gameEvents.addEventListener("presence:identity", this.onPresenceIdentity);
    gameEvents.addEventListener("chat:send", this.onChatSend);
    gameEvents.addEventListener("chat:typing", this.onTyping);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.removeEventListener("dialogue:close", this.onDialogueClose);
      gameEvents.removeEventListener("world:pause", this.onWorldPause);
      gameEvents.removeEventListener("world:resume", this.onWorldResume);
      gameEvents.removeEventListener(
        "character:update",
        this.onCharacterUpdate,
      );
      gameEvents.removeEventListener(
        "presence:identity",
        this.onPresenceIdentity,
      );
      gameEvents.removeEventListener("chat:send", this.onChatSend);
      gameEvents.removeEventListener("chat:typing", this.onTyping);
      this.presence?.leave();
      this.presence = null;
      this.unbindFocusGuards();
      this.scale.off("resize", this.fitCamera, this);
    });

    // Connect now if identity already resolved before the scene attached.
    if (gameEvents.lastIdentity) this.connectPresence(gameEvents.lastIdentity);
  }

  private onDialogueClose = () => {
    this.dialogueOpen = false;
  };
  private onWorldPause = () => {
    this.worldPaused = true;
  };
  private onWorldResume = () => {
    this.worldPaused = false;
  };
  private onCharacterUpdate = (e: Event) => {
    const ce = e as CustomEvent<CharacterPalette>;
    this.rebuildUserCharacter(ce.detail);
    if (this.player) {
      this.player.setTexture(USER_IDLE_KEY);
      this.player.setFlipX(this.player.flipX);
    }
  };

  private rebuildUserCharacter(palette: CharacterPalette) {
    const legend = paletteToLegend(palette);
    if (this.textures.exists(USER_IDLE_KEY))
      this.textures.remove(USER_IDLE_KEY);
    if (this.textures.exists(USER_WALK_KEY))
      this.textures.remove(USER_WALK_KEY);
    createPixelTexture(
      this,
      USER_IDLE_KEY,
      buildCharacterRows(false, palette.body),
      legend,
    );
    createPixelTexture(
      this,
      USER_WALK_KEY,
      buildCharacterRows(true, palette.body),
      legend,
    );
  }

  // ---- DOM input focus guards ------------------------------------------
  // While a text field anywhere on the page is focused, fully suspend Phaser
  // keyboard handling and drop all key captures, so typing reaches the input
  // and the player never reacts to keystrokes meant for a form.

  private bindFocusGuards() {
    document.addEventListener("focusin", this.onDomFocusIn);
    document.addEventListener("focusout", this.onDomFocusOut);
    // Catch the case where a field is already focused at scene start.
    if (isEditableTarget(document.activeElement)) this.setKeyboardActive(false);
  }

  private unbindFocusGuards() {
    document.removeEventListener("focusin", this.onDomFocusIn);
    document.removeEventListener("focusout", this.onDomFocusOut);
  }

  private onDomFocusIn = (e: FocusEvent) => {
    if (isEditableTarget(e.target)) this.setKeyboardActive(false);
  };

  private onDomFocusOut = (e: FocusEvent) => {
    if (isEditableTarget(e.target)) this.setKeyboardActive(true);
  };

  private setKeyboardActive(active: boolean) {
    const kb = this.input.keyboard;
    if (!kb) return;
    kb.enabled = active;
    if (active) {
      kb.addCapture("UP,DOWN,LEFT,RIGHT");
    } else {
      kb.clearCaptures();
    }
  }

  // ---- Realtime presence ----------------------------------------------

  private onPresenceIdentity = (e: Event) => {
    const id = (e as CustomEvent<PresenceIdentity | null>).detail;
    this.connectPresence(id);
  };

  private connectPresence(id: PresenceIdentity | null) {
    this.presence?.leave();
    this.presence = null;
    this.clearRemotePlayers();
    this.identity = id;
    if (!id) {
      this.updateAmbientFade();
      return;
    }
    this.presence = new KhuralPresence(
      id,
      { x: this.player?.x ?? SPAWN.x, y: this.playerBaseY || SPAWN.y },
      {
        onRoster: this.onRoster,
        onMove: this.onRemoteMove,
        onChat: this.onRemoteChat,
      },
    );
    this.presence.join();
  }

  private onRoster = (members: RemoteMember[]) => {
    const seen = new Set<string>();
    members.forEach((m) => {
      seen.add(m.userId);
      if (!this.remote.has(m.userId)) this.addRemote(m);
    });
    for (const id of [...this.remote.keys()]) {
      if (!seen.has(id)) this.removeRemote(id);
    }
    this.updateAmbientFade();
  };

  private addRemote(m: RemoteMember) {
    const idleKey = `remote-${m.userId}-idle`;
    const walkKey = `remote-${m.userId}-walk`;
    const legend = paletteToLegend(m.palette);
    createPixelTexture(
      this,
      idleKey,
      buildCharacterRows(false, m.palette.body),
      legend,
    );
    createPixelTexture(
      this,
      walkKey,
      buildCharacterRows(true, m.palette.body),
      legend,
    );

    const sprite = this.add
      .image(m.x, m.y, idleKey)
      .setScale(SPRITE_SCALE)
      .setOrigin(0.5, 0.85)
      .setFlipX(m.facing < 0)
      .setDepth(m.y);

    const nameTag = this.buildNameTag(
      m.displayName,
      m.memberNumber,
    );
    nameTag.setPosition(m.x, m.y - 52).setDepth(9000);

    this.remote.set(m.userId, {
      id: m.userId,
      sprite,
      nameTag,
      idleKey,
      walkKey,
      x: m.x,
      baseY: m.y,
      targetX: m.x,
      targetY: m.y,
      facing: m.facing,
      walkFrame: 0,
      walkTimer: 0,
      walkPhase: 0,
      bubble: null,
      bubbleVisibleFor: 0,
    });
  }

  private removeRemote(id: string) {
    const st = this.remote.get(id);
    if (!st) return;
    st.bubble?.destroy();
    st.nameTag.destroy();
    st.sprite.destroy();
    if (this.textures.exists(st.idleKey)) this.textures.remove(st.idleKey);
    if (this.textures.exists(st.walkKey)) this.textures.remove(st.walkKey);
    this.remote.delete(id);
  }

  private clearRemotePlayers() {
    for (const id of [...this.remote.keys()]) this.removeRemote(id);
  }

  private onRemoteMove = (
    userId: string,
    x: number,
    y: number,
    facing: Facing,
  ) => {
    const st = this.remote.get(userId);
    if (!st) return;
    st.targetX = x;
    st.targetY = y;
    st.facing = facing;
  };

  private onRemoteChat = (userId: string, text: string) => {
    const st = this.remote.get(userId);
    if (!st) return;
    if (st.bubble) {
      st.bubble.destroy();
      st.bubble = null;
    }
    st.bubble = this.buildSpeechBubble(text, st.x, st.baseY - 44);
    st.bubbleVisibleFor = 5000;
  };

  private onChatSend = (e: Event) => {
    const text = (e as CustomEvent<string>).detail?.trim();
    if (!text || !this.presence) return;
    this.presence.sendChat(text);
    if (this.playerBubble) {
      this.playerBubble.destroy();
      this.playerBubble = null;
    }
    this.playerBubble = this.buildSpeechBubble(
      text,
      this.player.x,
      this.playerBaseY - 44,
    );
    this.playerBubbleFor = 5000;
  };

  private onTyping = (e: Event) => {
    this.typingBlocked = (e as CustomEvent<boolean>).detail;
  };

  private updateAmbientFade() {
    const shouldFade = this.remote.size > 0;
    if (shouldFade === this.ambientFaded) return;
    this.ambientFaded = shouldFade;
    this.ambient.forEach((npc) => {
      this.tweens.add({
        targets: npc.sprite,
        alpha: shouldFade ? 0.22 : 0.88,
        duration: 600,
        ease: "Sine.InOut",
      });
      if (shouldFade) this.hideBubble(npc);
    });
  }

  private buildNameTag(
    name: string,
    memberNumber: number,
  ): Phaser.GameObjects.Container {
    const label = `${name}  #${String(memberNumber).padStart(4, "0")}`;
    const text = this.add
      .text(0, 0, label, {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#f4e8c8",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setResolution(2);
    const w = text.width + 10;
    const h = 13;
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1810, 0.92);
    bg.lineStyle(1, 0xf4e8c8, 0.6);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    return this.add.container(0, 0, [bg, text]);
  }

  private buildSpeechBubble(
    text: string,
    x: number,
    y: number,
  ): Phaser.GameObjects.Container {
    const label = this.add
      .text(0, 0, text, {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#2a1810",
        align: "center",
        wordWrap: { width: 150 },
      })
      .setOrigin(0.5)
      .setResolution(2);
    const w = label.width + 14;
    const h = label.height + 10;
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.96);
    bg.lineStyle(1, 0x2a1810, 0.8);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);
    bg.fillStyle(0xffffff, 0.96);
    bg.fillTriangle(-4, h / 2 - 1, 4, h / 2 - 1, 0, h / 2 + 5);
    const container = this.add
      .container(x, y, [bg, label])
      .setDepth(9500)
      .setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 220 });
    return container;
  }

  private updateRemotes(delta: number) {
    this.remote.forEach((st) => {
      const dx = st.targetX - st.x;
      const dy = st.targetY - st.baseY;
      const dist = Math.hypot(dx, dy);
      const moving = dist > 1.2;
      st.x += dx * 0.2;
      st.baseY += dy * 0.2;

      if (moving) {
        st.walkPhase += delta * 0.018;
        st.walkTimer += delta;
        if (st.walkTimer > 180) {
          st.walkTimer = 0;
          st.walkFrame = (st.walkFrame + 1) % 2;
          st.sprite.setTexture(st.walkFrame === 0 ? st.idleKey : st.walkKey);
        }
      } else {
        st.walkPhase += delta * 0.004;
        if (st.walkFrame !== 0) {
          st.walkFrame = 0;
          st.sprite.setTexture(st.idleKey);
        }
      }

      st.sprite.setFlipX(st.facing < 0);
      const bob = Math.sin(st.walkPhase) * (moving ? 1.5 : 0.5);
      st.sprite.x = st.x;
      st.sprite.y = st.baseY + bob;
      st.sprite.setDepth(st.baseY);
      st.nameTag.setPosition(st.x, st.baseY - 52);

      if (st.bubble) {
        st.bubble.x = st.x;
        st.bubble.y = st.baseY - 44;
        st.bubbleVisibleFor -= delta;
        if (st.bubbleVisibleFor <= 0) {
          const b = st.bubble;
          st.bubble = null;
          this.tweens.add({
            targets: b,
            alpha: 0,
            duration: 200,
            onComplete: () => b.destroy(),
          });
        }
      }
    });

    if (this.playerBubble) {
      this.playerBubble.x = this.player.x;
      this.playerBubble.y = this.playerBaseY - 44;
      this.playerBubbleFor -= delta;
      if (this.playerBubbleFor <= 0) {
        const b = this.playerBubble;
        this.playerBubble = null;
        this.tweens.add({
          targets: b,
          alpha: 0,
          duration: 200,
          onComplete: () => b.destroy(),
        });
      }
    }
  }

  private fitCamera = (size: Phaser.Structs.Size) => {
    const zoomX = size.width / WORLD_W;
    const zoomY = size.height / WORLD_H;
    const zoom = Phaser.Math.Clamp(Math.max(zoomX, zoomY), 0.8, 3.2);
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(WORLD_W / 2, WORLD_H / 2);
  };

  private buildSprites() {
    Object.entries(CHAR_SPRITES).forEach(([key, def]) => {
      createPixelTexture(this, `char-${kebab(key)}`, def.rows, def.legend);
    });
    this.rebuildUserCharacter(loadCharacter());
    createPixelTexture(this, "poi-notice-board", POI_NOTICE_SPRITE, POI_NOTICE_LEGEND);
    createPixelTexture(this, "poi-pavilion", POI_PAVILION_SPRITE, POI_PAVILION_LEGEND);
    createPixelTexture(this, "poi-bookshelf", POI_BOOKSHELF_SPRITE, POI_BOOKSHELF_LEGEND);
    createPixelTexture(this, "poi-portal", POI_PORTAL_SPRITE, POI_PORTAL_LEGEND);
    createPixelTexture(this, "poi-salon", POI_SALON_SPRITE, POI_SALON_LEGEND);
    createPixelTexture(this, "prop-lamp", PROP_LAMP_SPRITE, PROP_LAMP_LEGEND);
    createPixelTexture(this, "prop-plant", PROP_PLANT_SPRITE, PROP_PLANT_LEGEND);
    createPixelTexture(this, "prop-tree", PROP_TREE_SPRITE, PROP_TREE_LEGEND);
    createPixelTexture(this, "prop-rock", PROP_ROCK_SPRITE, PROP_ROCK_LEGEND);
  }

  private drawFloor() {
    const g = this.add.graphics();
    const cx = WORLD_W / 2;
    const cy = WORLD_H / 2;

    g.fillStyle(GRASS_LIGHT, 1);
    g.fillRect(0, 0, WORLD_W, WORLD_H);

    g.fillStyle(GRASS_DARK, 1);
    const tuftStep = 30;
    for (let y = 8; y < WORLD_H; y += tuftStep) {
      for (let x = 8; x < WORLD_W; x += tuftStep) {
        const h = ((x * 31 + y * 17) % 13) - 6;
        const jx = x + h;
        const jy = y + (((x * 13 + y * 7) % 9) - 4);
        g.fillRect(jx, jy, 2, 2);
        g.fillRect(jx + 3, jy + 1, 2, 1);
        g.fillRect(jx - 2, jy + 2, 1, 2);
      }
    }

    const pathW = 64;
    this.drawCobblePath(g, cx - pathW / 2, 0, pathW, WORLD_H);
    this.drawCobblePath(g, 0, cy - pathW / 2, WORLD_W, pathW);

    const padR = 92;
    g.fillStyle(STONE_LINE, 1);
    g.fillCircle(cx, cy, padR + 2);
    g.fillStyle(STONE_DARK, 1);
    g.fillCircle(cx, cy, padR);

    for (let py = cy - padR; py < cy + padR; py += 6) {
      const halfChord = Math.sqrt(padR * padR - (py - cy) * (py - cy));
      const startX = cx - halfChord;
      const endX = cx + halfChord;
      const row = Math.floor((py - (cy - padR)) / 6);
      const offset = (row % 2) * 4;
      for (let px = startX + offset; px < endX; px += 7) {
        const hash = ((Math.floor(px) * 31 + Math.floor(py) * 17) % 5);
        const stoneColor = hash > 2 ? STONE_LIGHT : 0xc8b088;
        g.fillStyle(stoneColor, 1);
        const stW = Math.min(5, endX - px);
        if (stW > 0) g.fillRect(Math.floor(px) + 1, Math.floor(py) + 1, stW, 4);
      }
    }

    g.lineStyle(2, STONE_LINE, 0.7);
    g.strokeCircle(cx, cy, padR);
    g.lineStyle(1, STONE_LINE, 0.45);
    g.strokeCircle(cx, cy, padR - 22);
  }

  private drawCobblePath(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    g.fillStyle(STONE_LINE, 1);
    g.fillRect(x, y, w, h);

    const stoneW = 6;
    const stoneH = 5;
    const gutter = 1;
    for (let py = y; py < y + h; py += stoneH + gutter) {
      const row = Math.floor((py - y) / (stoneH + gutter));
      const offset = (row % 2) * Math.floor((stoneW + gutter) / 2);
      for (let px = x + offset; px < x + w; px += stoneW + gutter) {
        const hash = ((px * 31 + py * 17) % 7);
        const color =
          hash > 4 ? STONE_LIGHT : hash > 1 ? STONE_DARK : PATH_LIGHT;
        g.fillStyle(color, 1);
        const drawW = Math.min(stoneW, x + w - px);
        const drawH = Math.min(stoneH, y + h - py);
        if (drawW > 0 && drawH > 0) g.fillRect(px, py, drawW, drawH);
      }
    }
  }

  private spawnProps() {
    PROPS.forEach((p) => {
      const key = `prop-${p.kind}`;
      const scale = (p.scale ?? 1) * SPRITE_SCALE * 0.85;
      this.add
        .image(p.x, p.y, key)
        .setScale(scale)
        .setOrigin(0.5, 0.85)
        .setDepth(p.y);
    });
  }

  private spawnInteractables() {
    [...POIS, OBI_NPC].forEach((item) => {
      const sprite = this.add
        .image(item.x, item.y, item.spriteKey)
        .setScale(item.scale ?? SPRITE_SCALE)
        .setOrigin(0.5, 0.85)
        .setInteractive({ useHandCursor: true });

      sprite.on("pointerover", () => sprite.setTint(0xfff4d0));
      sprite.on("pointerout", () => sprite.clearTint());
      sprite.on("pointerdown", () => {
        if (this.worldPaused || this.dialogueOpen) return;
        this.dialogueOpen = true;
        gameEvents.openDialogue({ type: item.type, id: item.id });
      });

      const label = this.add
        .text(item.x, item.y + 14, item.label, {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#2a1810",
          backgroundColor: "#f4e8c8",
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5, 0)
        .setResolution(2)
        .setDepth(item.y + 100);

      const promptBg = this.add
        .rectangle(0, 0, 64, 18, 0x2a1810, 1)
        .setStrokeStyle(1, 0xf4e8c8);
      const promptText = this.add
        .text(0, 0, "press E", {
          fontFamily: "monospace",
          fontSize: "9px",
          color: "#f4e8c8",
        })
        .setOrigin(0.5);
      const prompt = this.add
        .container(item.x, item.y - 60, [promptBg, promptText])
        .setVisible(false)
        .setDepth(2000);

      sprite.setDepth(item.y);

      this.interactables.push({
        ...item,
        sprite,
        label,
        prompt,
        baseY: item.y,
        targetScale: item.scale ?? SPRITE_SCALE,
        currentScale: item.scale ?? SPRITE_SCALE,
      });

      if (item.type === "npc") {
        this.tweens.add({
          targets: sprite,
          y: item.y - 2,
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }
      if (item.id === "portal") {
        this.tweens.add({
          targets: sprite,
          alpha: { from: 0.88, to: 1 },
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }
      if (item.id === "obi") {
        const chip = this.buildFounderChip();
        chip.setPosition(item.x, item.y - 48);
        chip.setDepth(8500);
        this.tweens.add({
          targets: chip,
          y: item.y - 51,
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }
    });
  }

  private buildFounderChip(): Phaser.GameObjects.Container {
    const w = 44;
    const h = 13;
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1810, 1);
    bg.lineStyle(1, 0xe8b22e, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.fillStyle(0x2a1810, 1);
    bg.fillTriangle(-3, h / 2 - 1, 3, h / 2 - 1, 0, h / 2 + 4);
    bg.lineStyle(1, 0xe8b22e, 1);
    bg.lineBetween(-3, h / 2 - 1, 0, h / 2 + 4);
    bg.lineBetween(3, h / 2 - 1, 0, h / 2 + 4);

    const text = this.add
      .text(0, -1, "★ FOUNDER", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#e8b22e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    return this.add.container(0, 0, [bg, text]);
  }

  private spawnAmbient() {
    AMBIENT_NPCS.forEach((npc) => {
      const sprite = this.add
        .image(npc.x, npc.y, npc.spriteKey)
        .setScale(SPRITE_SCALE * 0.85)
        .setOrigin(0.5, 0.85)
        .setAlpha(0.88)
        .setDepth(npc.y);

      this.tweens.add({
        targets: sprite,
        y: npc.y - 2,
        duration: 900 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });

      const state: AmbientNpcState = {
        ...npc,
        sprite,
        baseY: npc.y,
        bubble: null,
        bubbleTimer: 2000 + Math.random() * 4000,
        bubbleVisibleFor: 0,
        lineIndex: Math.floor(Math.random() * npc.lines.length),
      };
      this.ambient.push(state);
    });
  }

  private playerIndicator!: Phaser.GameObjects.Container;

  private spawnPlayer() {
    this.player = this.add
      .image(SPAWN.x, SPAWN.y, USER_IDLE_KEY)
      .setScale(SPRITE_SCALE)
      .setOrigin(0.5, 0.85)
      .setDepth(SPAWN.y + 1);
    this.playerBaseY = SPAWN.y;

    this.playerIndicator = this.buildPlayerIndicator();
    this.playerIndicator.setPosition(SPAWN.x, SPAWN.y - 56);
    this.playerIndicator.setDepth(9000);
  }

  private buildPlayerIndicator(): Phaser.GameObjects.Container {
    const w = 28;
    const h = 14;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8b22e, 1);
    bg.lineStyle(1, 0x2a1810, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    bg.fillStyle(0xe8b22e, 1);
    bg.fillTriangle(-4, h / 2 - 1, 4, h / 2 - 1, 0, h / 2 + 5);
    bg.lineStyle(1, 0x2a1810, 1);
    bg.lineBetween(-4, h / 2 - 1, 0, h / 2 + 5);
    bg.lineBetween(4, h / 2 - 1, 0, h / 2 + 5);

    const text = this.add
      .text(0, 0, "YOU", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#2a1810",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    return this.add.container(0, 0, [bg, text]);
  }

  private showBubble(npc: AmbientNpcState) {
    if (npc.bubble) {
      npc.bubble.destroy();
      npc.bubble = null;
    }
    const line = npc.lines[npc.lineIndex];
    const text = this.add
      .text(0, 0, line, {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#5a4030",
        fontStyle: "italic",
      })
      .setOrigin(0.5, 0.5);
    const w = text.width + 12;
    const h = text.height + 7;
    const bg = this.add.graphics();
    bg.fillStyle(0xf4e8c8, 0.78);
    bg.lineStyle(1, 0x8a7050, 0.45);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);

    const container = this.add
      .container(npc.x, npc.baseY - 38, [bg, text])
      .setDepth(3000)
      .setAlpha(0);

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 260,
      ease: "Sine.Out",
    });
    npc.bubble = container;
    npc.bubbleVisibleFor = 2800;
    npc.lineIndex = (npc.lineIndex + 1) % npc.lines.length;
  }

  private hideBubble(npc: AmbientNpcState) {
    if (!npc.bubble) return;
    const b = npc.bubble;
    npc.bubble = null;
    this.tweens.add({
      targets: b,
      alpha: 0,
      duration: 200,
      onComplete: () => b.destroy(),
    });
  }

  update(time: number, delta: number) {
    this.updateRemotes(delta);

    if (this.dialogueOpen || this.worldPaused) {
      this.interactables.forEach((it) => it.prompt.setVisible(false));
      if (this.playerIndicator) {
        this.playerIndicator.setVisible(!this.worldPaused);
      }
      return;
    }

    if (this.playerIndicator) {
      this.playerIndicator.setVisible(true);
      this.playerIndicator.x = this.player.x;
      this.playerIndicator.y =
        this.playerBaseY - 58 + Math.sin(time * 0.004) * 2.5;
    }

    const step = (PLAYER_SPEED * delta) / 1000;
    let dx = 0;
    let dy = 0;
    if (!this.typingBlocked) {
      if (this.cursors.left?.isDown || this.wasd.A.isDown) dx -= 1;
      if (this.cursors.right?.isDown || this.wasd.D.isDown) dx += 1;
      if (this.cursors.up?.isDown || this.wasd.W.isDown) dy -= 1;
      if (this.cursors.down?.isDown || this.wasd.S.isDown) dy += 1;
    }

    const moving = dx !== 0 || dy !== 0;
    if (moving) {
      const mag = Math.hypot(dx, dy);
      const nx = (dx / mag) * step;
      const ny = (dy / mag) * step;
      this.player.x = Phaser.Math.Clamp(this.player.x + nx, 24, WORLD_W - 24);
      this.playerBaseY = Phaser.Math.Clamp(
        this.playerBaseY + ny,
        24,
        WORLD_H - 24,
      );
      if (dx < 0) this.player.setFlipX(true);
      if (dx > 0) this.player.setFlipX(false);
      this.walkPhase += delta * 0.018;
      this.playerWalkTimer += delta;
      if (this.playerWalkTimer > 180) {
        this.playerWalkTimer = 0;
        this.playerWalkFrame = (this.playerWalkFrame + 1) % 2;
        this.player.setTexture(
          this.playerWalkFrame === 0 ? USER_IDLE_KEY : USER_WALK_KEY,
        );
      }
    } else {
      this.walkPhase += delta * 0.004;
      this.playerWalkTimer = 0;
      if (this.playerWalkFrame !== 0) {
        this.playerWalkFrame = 0;
        this.player.setTexture(USER_IDLE_KEY);
      }
    }

    const bob = Math.sin(this.walkPhase) * (moving ? 1.5 : 0.5);
    this.player.y = this.playerBaseY + bob;
    this.player.setDepth(this.playerBaseY + 1);

    this.ambient.forEach((npc) => {
      if (npc.bubble) {
        npc.bubble.x = npc.x;
        npc.bubble.y = npc.baseY - 42;
        npc.bubbleVisibleFor -= delta;
        if (npc.bubbleVisibleFor <= 0) {
          this.hideBubble(npc);
          npc.bubbleTimer = 4500 + Math.random() * 6000;
        }
      } else {
        npc.bubbleTimer -= delta;
        if (npc.bubbleTimer <= 0) {
          this.showBubble(npc);
        }
      }
    });

    let nearest: Interactable | null = null;
    let nearestDist = INTERACT_RADIUS;
    this.interactables.forEach((it) => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.playerBaseY,
        it.x,
        it.y,
      );
      it.prompt.setVisible(false);
      const base = it.scale ?? SPRITE_SCALE;
      it.targetScale = base;
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = it;
      }
    });

    this.interactables.forEach((it) => {
      const base = it.scale ?? SPRITE_SCALE;
      if (nearest && nearest === it) it.targetScale = base * 1.12;
      it.currentScale += (it.targetScale - it.currentScale) * 0.18;
      it.sprite.setScale(it.currentScale);
    });

    if (nearest) {
      const target = nearest as Interactable;
      target.prompt.setVisible(true);
      this.currentTarget = target.id;
      if (
        !this.typingBlocked &&
        Phaser.Input.Keyboard.JustDown(this.interactKey)
      ) {
        this.dialogueOpen = true;
        gameEvents.openDialogue({ type: target.type, id: target.id });
      }
    } else {
      this.currentTarget = null;
    }

    if (this.presence) {
      const facing: Facing = this.player.flipX ? -1 : 1;
      this.moveSendTimer += delta;
      if (
        this.moveSendTimer > 100 &&
        (moving || facing !== this.lastSentFacing)
      ) {
        this.moveSendTimer = 0;
        this.lastSentFacing = facing;
        this.presence.sendMove(this.player.x, this.playerBaseY, facing);
      }
      // Refresh the presence snapshot so late joiners spawn us in place.
      this.posSyncTimer += delta;
      if (this.posSyncTimer > 4000) {
        this.posSyncTimer = 0;
        this.presence.syncPosition();
      }
    }
  }
}

function kebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}
