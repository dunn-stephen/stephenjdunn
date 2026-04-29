"use client";

import { create } from "zustand";
import { defaultDesktopPreferences, type DesktopPhase, type DesktopPreferences } from "@/lib/os/types";
import { readPersistedDesktopState, updatePersistedPreferences } from "@/lib/os/sessionStorage";

type DesktopSessionState = {
  hydrated: boolean;
  phase: DesktopPhase;
  preferences: DesktopPreferences;
  hydrate: () => void;
  setPhase: (phase: DesktopPhase) => void;
  updatePreferences: (updater: (preferences: DesktopPreferences) => DesktopPreferences) => void;
};

export const useDesktopSessionStore = create<DesktopSessionState>((set) => ({
  hydrated: false,
  phase: "boot",
  preferences: defaultDesktopPreferences,
  hydrate: () => {
    const state = readPersistedDesktopState();

    set({
      hydrated: true,
      phase: "boot",
      preferences: state.preferences
    });
  },
  setPhase: (phase) => set({ phase }),
  updatePreferences: (updater) =>
    set((state) => {
      const preferences = updater(state.preferences);
      updatePersistedPreferences(() => preferences);
      return {
        preferences
      };
    })
}));
