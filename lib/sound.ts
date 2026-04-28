"use client";

import { create } from "zustand";
import type { SoundId, SoundStore } from "@/types";

const SOUND_PREFERENCE_KEY = "sound-enabled";

export const SOUNDS: Record<SoundId, string> = {
  boot: "/sounds/boot.mp3",
  click: "/sounds/click.mp3",
  open: "/sounds/open.mp3",
  close: "/sounds/close.mp3",
  error: "/sounds/error.mp3",
  alert: "/sounds/alert.mp3"
};

let sharedAudioContext: AudioContext | null = null;

function readStoredPreference() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(SOUND_PREFERENCE_KEY);

  if (rawValue === null) {
    return null;
  }

  return rawValue === "true";
}

function writeStoredPreference(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
}

async function unlockAudioContext() {
  if (typeof window === "undefined") {
    return false;
  }

  const AudioContextConstructor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextConstructor) {
    return false;
  }

  try {
    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContextConstructor();
    }

    if (sharedAudioContext.state === "suspended") {
      await sharedAudioContext.resume();
    }

    return sharedAudioContext.state === "running";
  } catch {
    return false;
  }
}

function playSoundFile(sound: SoundId, enabled: boolean, initialized: boolean) {
  if (!enabled || !initialized || typeof window === "undefined") {
    return;
  }

  const audio = new Audio(SOUNDS[sound]);
  audio.preload = "auto";
  void audio.play().catch(() => undefined);
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  enabled: false,
  initialized: false,
  setEnabled: (enabled) => {
    writeStoredPreference(enabled);
    set({ enabled });
  },
  setInitialized: (initialized) => set({ initialized }),
  initializeFromInteraction: async () => {
    if (get().initialized) {
      return;
    }

    const allowed = await unlockAudioContext();
    const storedPreference = readStoredPreference();

    set({
      initialized: true,
      enabled: allowed ? storedPreference ?? true : false
    });
  },
  toggle: () =>
    set((state) => {
      const enabled = !state.enabled;
      writeStoredPreference(enabled);

      return {
        enabled,
        initialized: true
      };
    }),
  play: (sound) => playSoundFile(sound, get().enabled, get().initialized)
}));
