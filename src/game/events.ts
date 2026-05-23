import type { CharacterPalette } from "@/lib/character";
import type { PresenceIdentity } from "./presence";
import type { NinjaPreset } from "@/lib/ninja-preset";

export type DialoguePayload = {
  type: "poi" | "npc";
  id: string;
};

class GameEventBus extends EventTarget {
  // Last identity emitted, so the scene can read current state on create()
  // even if the bridge dispatched before the scene attached its listener.
  lastIdentity: PresenceIdentity | null = null;
  lastPreset: NinjaPreset | null = null;
  // Live touch-joystick vector (-1..1), polled by the scene each frame.
  touchVec = { x: 0, y: 0 };

  openDialogue(detail: DialoguePayload) {
    this.dispatchEvent(new CustomEvent("dialogue:open", { detail }));
  }
  closeDialogue() {
    this.dispatchEvent(new Event("dialogue:close"));
  }
  pauseWorld() {
    this.dispatchEvent(new Event("world:pause"));
  }
  resumeWorld() {
    this.dispatchEvent(new Event("world:resume"));
  }
  characterUpdated(palette: CharacterPalette) {
    this.dispatchEvent(new CustomEvent("character:update", { detail: palette }));
  }
  setImmersed(immersed: boolean) {
    this.dispatchEvent(new CustomEvent("ui:immersed", { detail: immersed }));
  }
  presenceIdentity(identity: PresenceIdentity | null) {
    this.lastIdentity = identity;
    this.dispatchEvent(
      new CustomEvent("presence:identity", { detail: identity }),
    );
  }
  sendChat(text: string) {
    this.dispatchEvent(new CustomEvent("chat:send", { detail: text }));
  }
  setTyping(typing: boolean) {
    this.dispatchEvent(new CustomEvent("chat:typing", { detail: typing }));
  }
  presetUpdated(preset: NinjaPreset) {
    this.lastPreset = preset;
    this.dispatchEvent(new CustomEvent("preset:update", { detail: preset }));
  }
  setTouch(x: number, y: number) {
    this.touchVec.x = x;
    this.touchVec.y = y;
  }
  touchInteract() {
    this.dispatchEvent(new Event("touch:interact"));
  }
}

export const gameEvents = new GameEventBus();
