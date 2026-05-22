import Phaser from "phaser";
import { gameEvents } from "./events";
import {
  createPixelTexture,
  CHAR_SPRITES,
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
  KhuralPresence,
  type Facing,
  type PresenceIdentity,
  type RemoteMember,
} from "./presence";
import {
  NINJA_PRESETS,
  preloadNinja,
  registerNinjaAnims,
  ninjaIdleKey,
  ninjaWalkAnim,
  ninjaIdleFrame,
  vectorToDir4,
  type NinjaPreset,
  type Dir4,
} from "./ninja";
import { loadPreset } from "@/lib/ninja-preset";

const WORLD_W = 1800;
const WORLD_H = 1200;
const PLAYER_SPEED = 210;
const INTERACT_RADIUS = 96;
const SPRITE_SCALE = 2.8;
const NINJA_SCALE = 2.4; // 16px NA characters scaled into the world

// Axis-aligned collider rectangle in world space (footprint of a solid object).
type Collider = { x: number; y: number; w: number; h: number };
const PLAYER_HALF_W = 9;
const PLAYER_FOOT_H = 7;

const BG_COLOR = 0x73a234; // matches the NA grass fill tile
const HARBOUR_H = 230; // water band height along the top
const BEACH_H = 64; // sand strip between water and grass

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
    x: 900,
    y: 300,
    label: "About",
    spriteKey: "na-flag",
    scale: 3.0,
  },
  {
    id: "salon",
    type: "poi",
    x: 1240,
    y: 360,
    label: "Customize",
    spriteKey: "na-house",
    scale: 1.9,
  },
  {
    id: "pavilion",
    type: "poi",
    x: 1500,
    y: 680,
    label: "Events",
    spriteKey: "na-mill",
    scale: 2.6,
  },
  {
    id: "bookshelf",
    type: "poi",
    x: 300,
    y: 640,
    label: "Library",
    spriteKey: "na-house",
    scale: 1.9,
  },
  {
    id: "portal",
    type: "poi",
    x: 900,
    y: 980,
    label: "Discord",
    spriteKey: "poi-portal",
    scale: SPRITE_SCALE * 1.15,
  },
];

const OBI_NPC: InteractableData = {
  id: "obi",
  type: "npc",
  x: 600,
  y: 440,
  label: "Obi · Founder",
  spriteKey: "char-obi-idle",
  scale: NINJA_SCALE,
};

type AmbientNpc = {
  id: string;
  x: number;
  y: number;
  preset: NinjaPreset;
  lines: string[];
};

const AMBIENT_NPCS: AmbientNpc[] = [
  {
    id: "amb-1",
    x: 1080,
    y: 520,
    preset: "Villager",
    lines: ["Sain bain uu!", "First move?", "From Ulaanbaatar."],
  },
  {
    id: "amb-2",
    x: 480,
    y: 820,
    preset: "Woman",
    lines: ["Building from Berlin.", "Shipping today.", "Anyone in Melb?"],
  },
  {
    id: "amb-3",
    x: 1280,
    y: 880,
    preset: "OldMan",
    lines: ["Trying shatar.", "Where's the library?", "TS or Rust?"],
  },
  {
    id: "amb-4",
    x: 720,
    y: 760,
    preset: "Woman",
    lines: ["Good morning.", "Nice khural.", "Who's the founder?"],
  },
  {
    id: "amb-5",
    x: 1120,
    y: 740,
    preset: "Villager",
    lines: ["GM nomads.", "Coffee somewhere?", "Stand-up in 5."],
  },
  {
    id: "amb-6",
    x: 1380,
    y: 480,
    preset: "OldMan",
    lines: ["Just shipped.", "Anyone reviewing?", "Cmd-K!"],
  },
  {
    id: "amb-7",
    x: 560,
    y: 620,
    preset: "Villager",
    lines: ["New here.", "Where's everyone from?", "Love the steppe."],
  },
  {
    id: "amb-8",
    x: 980,
    y: 420,
    preset: "Woman",
    lines: ["Designing all night.", "Figma open.", "Ship it."],
  },
  {
    id: "amb-9",
    x: 760,
    y: 980,
    preset: "OldMan",
    lines: ["Heading to Discord.", "Portal's that way.", "GG."],
  },
];

type PropKind = "lamp" | "plant" | "tree" | "rock";
const PROPS: { kind: PropKind; x: number; y: number; scale?: number }[] = [
  // Trees — perimeter, corners, and clusters frame the steppe.
  { kind: "tree", x: 70, y: 110 },
  { kind: "tree", x: 1730, y: 110 },
  { kind: "tree", x: 70, y: 1110 },
  { kind: "tree", x: 1730, y: 1110 },
  { kind: "tree", x: 300, y: 80 },
  { kind: "tree", x: 640, y: 100 },
  { kind: "tree", x: 1180, y: 100 },
  { kind: "tree", x: 1520, y: 80 },
  { kind: "tree", x: 300, y: 1130 },
  { kind: "tree", x: 660, y: 1120 },
  { kind: "tree", x: 1160, y: 1120 },
  { kind: "tree", x: 1520, y: 1130 },
  { kind: "tree", x: 90, y: 380 },
  { kind: "tree", x: 80, y: 660 },
  { kind: "tree", x: 100, y: 900 },
  { kind: "tree", x: 1720, y: 380 },
  { kind: "tree", x: 1730, y: 660 },
  { kind: "tree", x: 1710, y: 900 },
  { kind: "tree", x: 210, y: 220 },
  { kind: "tree", x: 1600, y: 240 },
  { kind: "tree", x: 230, y: 1000 },
  { kind: "tree", x: 1580, y: 1000 },
  { kind: "tree", x: 460, y: 470, scale: 0.9 },
  { kind: "tree", x: 1340, y: 770, scale: 0.9 },
  // Rocks scattered across the grass.
  { kind: "rock", x: 520, y: 320 },
  { kind: "rock", x: 1300, y: 320 },
  { kind: "rock", x: 320, y: 820 },
  { kind: "rock", x: 1500, y: 880 },
  { kind: "rock", x: 760, y: 560 },
  { kind: "rock", x: 1080, y: 1000 },
  { kind: "rock", x: 640, y: 540 },
  // Plants as soft accents.
  { kind: "plant", x: 900, y: 200 },
  { kind: "plant", x: 430, y: 580 },
  { kind: "plant", x: 1380, y: 600 },
  { kind: "plant", x: 900, y: 1080 },
  { kind: "plant", x: 700, y: 320 },
  { kind: "plant", x: 1180, y: 320 },
  { kind: "plant", x: 540, y: 940 },
  { kind: "plant", x: 1260, y: 940 },
  // Lamps ring the central gathering pad.
  { kind: "lamp", x: 760, y: 470 },
  { kind: "lamp", x: 1040, y: 470 },
  { kind: "lamp", x: 760, y: 730 },
  { kind: "lamp", x: 1040, y: 730 },
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
  sprite: Phaser.GameObjects.Sprite;
  baseY: number;
  dir4: Dir4;
  homeX: number;
  homeY: number;
  targetX: number;
  targetY: number;
  moving: boolean;
  pauseTimer: number;
  bubble: Phaser.GameObjects.Container | null;
  bubbleTimer: number;
  bubbleVisibleFor: number;
  lineIndex: number;
};

type RemotePlayerState = {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  nameTag: Phaser.GameObjects.Container;
  preset: NinjaPreset;
  dir: Dir4;
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
  private player!: Phaser.GameObjects.Sprite;
  private playerPreset: NinjaPreset = "Boy";
  private playerDir4: Dir4 = "down";
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
  private colliders: Collider[] = [];

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

  preload() {
    preloadNinja(this);
    this.load.image("na-grass", "/art/ninja/fill/grass.png");
    this.load.image("na-water", "/art/ninja/fill/water.png");
    this.load.image("na-sand", "/art/ninja/fill/sand.png");
    // NA nature props + buildings + harbour boats.
    this.load.image("na-tree", "/art/ninja/obj/tree.png");
    this.load.image("na-bush", "/art/ninja/obj/bush.png");
    this.load.image("na-rock", "/art/ninja/obj/rock.png");
    this.load.image("na-house", "/art/ninja/obj/house.png");
    this.load.image("na-house-blue", "/art/ninja/obj/house_blue.png");
    this.load.image("na-mill", "/art/ninja/obj/mill.png");
    this.load.image("na-boat", "/art/ninja/obj/boat.png");
    this.load.image("na-flag", "/art/ninja/obj/flag.png");
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
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(40, 30);
    this.scale.on("resize", this.fitCamera, this);

    gameEvents.addEventListener("dialogue:close", this.onDialogueClose);
    gameEvents.addEventListener("world:pause", this.onWorldPause);
    gameEvents.addEventListener("world:resume", this.onWorldResume);
    gameEvents.addEventListener("character:update", this.onCharacterUpdate);
    gameEvents.addEventListener("presence:identity", this.onPresenceIdentity);
    gameEvents.addEventListener("chat:send", this.onChatSend);
    gameEvents.addEventListener("chat:typing", this.onTyping);
    gameEvents.addEventListener("preset:update", this.onPresetUpdate);
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
      gameEvents.removeEventListener("preset:update", this.onPresetUpdate);
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
  // Player look is an LPC preset now; the hex-palette customizer is adapted to
  // preset selection in a follow-up, so this is a no-op for the moment.
  private onCharacterUpdate = (_e: Event) => {};

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
    // Use the member's chosen preset (broadcast via presence); fall back to a
    // stable per-id pick if missing/invalid.
    let preset = m.preset as NinjaPreset;
    if (!NINJA_PRESETS.includes(preset)) {
      let h = 0;
      for (const c of m.userId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      preset = NINJA_PRESETS[h % NINJA_PRESETS.length];
    }
    registerNinjaAnims(this, preset);

    const sprite = this.add
      .sprite(m.x, m.y, ninjaIdleKey(preset))
      .setScale(NINJA_SCALE)
      .setOrigin(0.5, 0.85)
      .setFrame(ninjaIdleFrame("down"))
      .setDepth(m.y);

    const nameTag = this.buildNameTag(m.displayName, m.memberNumber);
    nameTag.setPosition(m.x, m.y - 52).setDepth(9000);

    this.remote.set(m.userId, {
      id: m.userId,
      sprite,
      nameTag,
      preset,
      dir: "down",
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
        st.dir = vectorToDir4(dx, dy);
        st.walkPhase += delta * 0.018;
        st.sprite.play(ninjaWalkAnim(st.preset, st.dir), true);
      } else {
        st.walkPhase += delta * 0.004;
        st.sprite.stop();
        st.sprite.setTexture(ninjaIdleKey(st.preset), ninjaIdleFrame(st.dir));
      }

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
    // Zoomed out: show a generous slice of the (big) world and pan to follow
    // the player. Targets ~960px of world width visible on a typical screen.
    const zoom = Phaser.Math.Clamp(
      Math.max(size.width / 960, size.height / 600),
      1.1,
      2.2,
    );
    this.cameras.main.setZoom(zoom);
  };

  private buildSprites() {
    Object.entries(CHAR_SPRITES).forEach(([key, def]) => {
      createPixelTexture(this, `char-${kebab(key)}`, def.rows, def.legend);
    });
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
    const cx = WORLD_W / 2;
    const cy = WORLD_H / 2;

    // Grass field under everything.
    this.add
      .tileSprite(cx, cy, WORLD_W, WORLD_H, "na-grass")
      .setDepth(-20);

    // Sydney harbour along the top: water band, then a sand beach strip.
    this.add
      .tileSprite(cx, HARBOUR_H / 2, WORLD_W, HARBOUR_H, "na-water")
      .setDepth(-18);
    this.add
      .tileSprite(cx, HARBOUR_H + BEACH_H / 2, WORLD_W, BEACH_H, "na-sand")
      .setDepth(-17);

    // Boats moored in the harbour.
    const boats = [
      { x: 300, y: 120 },
      { x: 760, y: 90 },
      { x: 1180, y: 140 },
      { x: 1560, y: 100 },
    ];
    boats.forEach((b, i) => {
      const boat = this.add
        .image(b.x, b.y, "na-boat")
        .setScale(2)
        .setOrigin(0.5, 0.7)
        .setDepth(-17);
      this.tweens.add({
        targets: boat,
        y: b.y + 4,
        duration: 1800 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    });

    // Soft shoreline shadow where sand meets grass.
    const g = this.add.graphics().setDepth(-16);
    g.fillStyle(0x000000, 0.08);
    g.fillRect(0, HARBOUR_H + BEACH_H, WORLD_W, 6);

    // Sand plaza at the central gathering circle.
    const plaza = this.add.graphics().setDepth(-15);
    plaza.fillStyle(0xf0cb8d, 1);
    plaza.fillCircle(cx, cy, 150);
    plaza.fillStyle(0xe6bd7a, 0.5);
    plaza.fillCircle(cx, cy, 120);

    // The harbour water is impassable — block the top band.
    this.colliders.push({ x: 0, y: 0, w: WORLD_W, h: HARBOUR_H + 8 });
  }

  // Per-kind config: LPC object sprites (lamp stays procedural). oy = vertical
  // origin so the sprite's base sits on its world y; fp = collider footprint.
  private static readonly PROP_CFG: Record<
    PropKind,
    { key: string; scale: number; oy: number; fp: { w: number; h: number } | null }
  > = {
    tree: { key: "na-tree", scale: 2.2, oy: 0.95, fp: { w: 14, h: 9 } },
    rock: { key: "na-rock", scale: 2.4, oy: 0.85, fp: { w: 22, h: 12 } },
    plant: { key: "na-bush", scale: 1.7, oy: 0.85, fp: null },
    lamp: { key: "na-bush", scale: 1.4, oy: 0.85, fp: null },
  };

  private spawnProps() {
    PROPS.forEach((p) => {
      // Don't spawn props in the harbour water / beach band.
      if (p.y < HARBOUR_H + BEACH_H + 12) return;
      const cfg = KhuralScene.PROP_CFG[p.kind];
      this.add
        .image(p.x, p.y, cfg.key)
        .setScale((p.scale ?? 1) * cfg.scale)
        .setOrigin(0.5, cfg.oy)
        .setDepth(p.y);
      if (cfg.fp) this.addCollider(p.x, p.y, cfg.fp.w, cfg.fp.h);
    });
  }

  private addCollider(centerX: number, baseY: number, w: number, h: number) {
    this.colliders.push({ x: centerX - w / 2, y: baseY - h, w, h });
  }

  private collidesAt(x: number, y: number): boolean {
    const left = x - PLAYER_HALF_W;
    const top = y - PLAYER_FOOT_H / 2;
    const right = x + PLAYER_HALF_W;
    const bottom = y + PLAYER_FOOT_H / 2;
    for (const c of this.colliders) {
      if (
        left < c.x + c.w &&
        right > c.x &&
        top < c.y + c.h &&
        bottom > c.y
      ) {
        return true;
      }
    }
    return false;
  }

  private spawnInteractables() {
    [...POIS, OBI_NPC].forEach((item) => {
      // The founder NPC uses an LPC character (static idle frame); POIs keep
      // their procedural building sprites until the tileset pass (increment C).
      // Resolve each interactable to its art + footprint. Founder = LPC
      // character; notice-board = signpost; portal = its glowing pixel sprite;
      // the rest are LPC houses (the Sydney village around the khural).
      const cfg = ((): {
        key: string;
        frame?: number;
        oy: number;
        fp: { w: number; h: number } | null;
      } => {
        if (item.id === "obi")
          return {
            key: ninjaIdleKey("Noble"),
            frame: ninjaIdleFrame("down"),
            oy: 0.85,
            fp: null,
          };
        if (item.id === "notice-board")
          return { key: "na-flag", oy: 0.95, fp: { w: 10, h: 8 } };
        if (item.id === "portal")
          return { key: "poi-portal", oy: 0.85, fp: { w: 44, h: 18 } };
        // A distinct building per POI.
        if (item.id === "pavilion")
          return { key: "na-mill", oy: 0.9, fp: { w: 56, h: 24 } };
        if (item.id === "bookshelf")
          return { key: "na-house-blue", oy: 0.9, fp: { w: 70, h: 26 } };
        return { key: "na-house", oy: 0.9, fp: { w: 70, h: 26 } }; // salon
      })();

      const sprite = this.add
        .image(item.x, item.y, cfg.key, cfg.frame)
        .setScale(item.scale ?? SPRITE_SCALE)
        .setOrigin(0.5, cfg.oy)
        .setInteractive({ useHandCursor: true });

      sprite.on("pointerover", () => sprite.setTint(0xfff4d0));
      sprite.on("pointerout", () => sprite.clearTint());
      sprite.on("pointerdown", () => {
        if (this.worldPaused || this.dialogueOpen) return;
        this.dialogueOpen = true;
        gameEvents.openDialogue({ type: item.type, id: item.id });
      });

      if (cfg.fp) this.addCollider(item.x, item.y, cfg.fp.w, cfg.fp.h);

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
      registerNinjaAnims(this, npc.preset);
      const sprite = this.add
        .sprite(npc.x, npc.y, ninjaIdleKey(npc.preset))
        .setScale(NINJA_SCALE * 0.95)
        .setOrigin(0.5, 0.85)
        .setFrame(ninjaIdleFrame("down"))
        .setAlpha(0.95)
        .setDepth(npc.y);

      const state: AmbientNpcState = {
        ...npc,
        sprite,
        baseY: npc.y,
        dir4: "down",
        homeX: npc.x,
        homeY: npc.y,
        targetX: npc.x,
        targetY: npc.y,
        moving: false,
        pauseTimer: 800 + Math.random() * 3000,
        bubble: null,
        bubbleTimer: 2000 + Math.random() * 4000,
        bubbleVisibleFor: 0,
        lineIndex: Math.floor(Math.random() * npc.lines.length),
      };
      this.ambient.push(state);
    });
  }

  private playerIndicator!: Phaser.GameObjects.Container;

  private onPresetUpdate = (e: Event) => {
    const preset = (e as CustomEvent<NinjaPreset>).detail;
    this.playerPreset = preset;
    registerNinjaAnims(this, preset);
    this.player?.setTexture(ninjaIdleKey(preset), ninjaIdleFrame(this.playerDir4));
  };

  private spawnPlayer() {
    this.playerPreset = gameEvents.lastPreset ?? loadPreset();
    registerNinjaAnims(this, this.playerPreset);
    this.player = this.add
      .sprite(SPAWN.x, SPAWN.y, ninjaIdleKey(this.playerPreset))
      .setScale(NINJA_SCALE)
      .setOrigin(0.5, 0.85)
      .setFrame(ninjaIdleFrame("down"))
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

      // Resolve each axis independently so the player slides along walls.
      const tryX = Phaser.Math.Clamp(this.player.x + nx, 24, WORLD_W - 24);
      if (!this.collidesAt(tryX, this.playerBaseY)) this.player.x = tryX;
      const tryY = Phaser.Math.Clamp(this.playerBaseY + ny, 24, WORLD_H - 24);
      if (!this.collidesAt(this.player.x, tryY)) this.playerBaseY = tryY;

      this.playerDir4 = vectorToDir4(dx, dy);
      this.player.play(ninjaWalkAnim(this.playerPreset, this.playerDir4), true);
    } else {
      this.player.stop();
      this.player.setTexture(
        ninjaIdleKey(this.playerPreset),
        ninjaIdleFrame(this.playerDir4),
      );
    }

    // Walk frames convey stride; keep a tiny idle bob only.
    const bob = moving ? 0 : Math.sin(time * 0.004) * 0.6;
    this.player.y = this.playerBaseY + bob;
    this.player.setDepth(this.playerBaseY + 1);

    const AMB_SPEED = 36;
    const AMB_RADIUS = 110;
    this.ambient.forEach((npc) => {
      // Wander: stroll to a random point near home, pause, repeat.
      if (npc.pauseTimer > 0) {
        npc.pauseTimer -= delta;
        if (npc.moving) {
          npc.moving = false;
          npc.sprite.stop();
          npc.sprite.setTexture(ninjaIdleKey(npc.preset), ninjaIdleFrame(npc.dir4));
        }
        if (npc.pauseTimer <= 0) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * AMB_RADIUS;
          npc.targetX = Phaser.Math.Clamp(
            npc.homeX + Math.cos(a) * r,
            30,
            WORLD_W - 30,
          );
          npc.targetY = Phaser.Math.Clamp(
            npc.homeY + Math.sin(a) * r,
            30,
            WORLD_H - 30,
          );
          npc.moving = true;
        }
      } else {
        const dx = npc.targetX - npc.x;
        const dy = npc.targetY - npc.baseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 3) {
          npc.moving = false;
          npc.pauseTimer = 1500 + Math.random() * 4500;
          npc.sprite.stop();
          npc.sprite.setTexture(ninjaIdleKey(npc.preset), ninjaIdleFrame(npc.dir4));
        } else {
          const step = (AMB_SPEED * delta) / 1000;
          const nx = npc.x + (dx / dist) * step;
          const ny = npc.baseY + (dy / dist) * step;
          if (this.collidesAt(nx, ny)) {
            npc.pauseTimer = 400; // blocked — pause then pick a new spot
          } else {
            npc.x = nx;
            npc.baseY = ny;
          }
          npc.dir4 = vectorToDir4(dx, dy);
          npc.sprite.play(ninjaWalkAnim(npc.preset, npc.dir4), true);
        }
      }
      npc.sprite.x = npc.x;
      npc.sprite.y = npc.baseY;
      npc.sprite.setDepth(npc.baseY);

      if (npc.bubble) {
        npc.bubble.x = npc.x;
        npc.bubble.y = npc.baseY - 46;
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
