"use client";

import { useSoundStore } from "@/lib/sound";
import type { SoundId } from "@/types";

export function useSound(sound: SoundId) {
  const enabled = useSoundStore((state) => state.enabled);
  const playSound = useSoundStore((state) => state.play);

  return {
    enabled,
    play: () => playSound(sound)
  };
}
