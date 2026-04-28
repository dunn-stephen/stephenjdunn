"use client";

import { create } from "zustand";
import type { SoundId, SoundStore } from "@/types";

export const SOUNDS: Record<SoundId, string> = {
  boot: "/sounds/boot.mp3",
  click: "/sounds/click.mp3",
  open: "/sounds/open.mp3",
  close: "/sounds/close.mp3",
  error: "/sounds/error.mp3",
  alert: "/sounds/alert.mp3"
};

function playSoundFile(sound: SoundId, enabled: boolean) {
  if (!enabled || typeof window === "undefined") {
    return;
  }

  const audio = new Audio(SOUNDS[sound]);
  void audio.play().catch(() => undefined);
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  enabled: false,
  initialized: false,
  setEnabled: (enabled) => set({ enabled }),
  setInitialized: (initialized) => set({ initialized }),
  toggle: () => set((state) => ({ enabled: !state.enabled })),
  play: (sound) => playSoundFile(sound, get().enabled)
}));
