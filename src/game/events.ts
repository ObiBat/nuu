import type { CharacterPalette } from "@/lib/character";

export type DialoguePayload = {
  type: "poi" | "npc";
  id: string;
};

class GameEventBus extends EventTarget {
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
}

export const gameEvents = new GameEventBus();
