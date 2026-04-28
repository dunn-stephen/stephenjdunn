"use client";

import { useRef } from "react";

type PlayToneArgs = {
  frequency: number;
  duration: number;
  delay?: number;
  gain?: number;
};

function scheduleTone(context: AudioContext, destination: GainNode, args: PlayToneArgs) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const startAt = context.currentTime + (args.delay ?? 0);

  oscillator.type = "triangle";
  oscillator.frequency.value = args.frequency;
  gainNode.gain.setValueAtTime(args.gain ?? 0.06, startAt);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + args.duration);
  oscillator.connect(gainNode);
  gainNode.connect(destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + args.duration);
}

export function useOsSounds(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  function getContext() {
    if (typeof window === "undefined") {
      return null;
    }

    if (!contextRef.current) {
      const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }

      contextRef.current = new AudioContextCtor();
    }

    return contextRef.current;
  }

  async function unlock() {
    const context = getContext();

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }
  }

  async function playStartupChime() {
    if (!enabled) {
      return;
    }

    const context = getContext();

    if (!context) {
      return;
    }

    await unlock();

    const gain = context.createGain();
    gain.connect(context.destination);

    scheduleTone(context, gain, { frequency: 392, duration: 0.22, gain: 0.06 });
    scheduleTone(context, gain, { frequency: 523.25, duration: 0.28, delay: 0.08, gain: 0.05 });
    scheduleTone(context, gain, { frequency: 659.25, duration: 0.34, delay: 0.18, gain: 0.05 });
  }

  async function playUiTick() {
    if (!enabled) {
      return;
    }

    const context = getContext();

    if (!context) {
      return;
    }

    await unlock();

    const gain = context.createGain();
    gain.connect(context.destination);
    scheduleTone(context, gain, { frequency: 740, duration: 0.06, gain: 0.03 });
  }

  return {
    unlock,
    playStartupChime,
    playUiTick
  };
}
