#!/usr/bin/env python3
"""
Sound generation script for stephenjdunn.com
Synthesizes 6 OS9-style UI sounds and saves them to public/sounds/
Run: python3 scripts/generate-sounds.py
"""

import os
import subprocess
import sys
import tempfile

import numpy as np
from scipy.io import wavfile

SAMPLE_RATE = 44100
OUTPUT_DIR = "public/sounds"


def normalize(wave: np.ndarray, peak: float = 0.7) -> np.ndarray:
    """Normalize audio to avoid clipping."""
    max_val = np.max(np.abs(wave))
    if max_val == 0:
        return wave
    return (wave / max_val * peak).astype(np.float32)


def save_mp3(wave: np.ndarray, filename: str) -> None:
    """Save a numpy float32 array as an MP3 file via ffmpeg, with WAV fallback."""
    path = os.path.join(OUTPUT_DIR, filename)

    pcm = (wave * 32767).astype(np.int16)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
        wavfile.write(tmp_path, SAMPLE_RATE, pcm)

    try:
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", tmp_path, "-codec:a", "libmp3lame", "-q:a", "4", path],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print(f"  ✅ {filename} (ffmpeg)")
            return
    except FileNotFoundError:
        pass
    finally:
        os.unlink(tmp_path)

    wavfile.write(path, SAMPLE_RATE, pcm)
    print(f"  ✅ {filename} (WAV fallback — install ffmpeg for true MP3)")


def generate_click() -> np.ndarray:
    """Short, crisp UI click — plays on icon single-click and button presses."""
    duration = 0.06
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    wave = np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 100)
    wave += 0.3 * np.sin(2 * np.pi * 300 * t) * np.exp(-t * 120)
    return normalize(wave)


def generate_open() -> np.ndarray:
    """Short ascending frequency sweep — plays when a window opens."""
    duration = 0.18
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq = np.linspace(350, 750, len(t))
    phase = np.cumsum(freq) / SAMPLE_RATE
    wave = np.sin(2 * np.pi * phase) * np.exp(-t * 10)
    return normalize(wave)


def generate_close() -> np.ndarray:
    """Short descending frequency sweep — plays when a window closes."""
    duration = 0.15
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq = np.linspace(700, 250, len(t))
    phase = np.cumsum(freq) / SAMPLE_RATE
    wave = np.sin(2 * np.pi * phase) * np.exp(-t * 12)
    return normalize(wave)


def generate_error() -> np.ndarray:
    """Low, attention-grabbing bonk — Sosumi-style error alert."""
    duration = 0.35
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    wave = (
        0.6 * np.sin(2 * np.pi * 200 * t)
        + 0.3 * np.sin(2 * np.pi * 400 * t)
        + 0.1 * np.sin(2 * np.pi * 600 * t)
    ) * np.exp(-t * 7)
    vibrato = 1 + 0.02 * np.sin(2 * np.pi * 8 * t)
    wave *= vibrato
    return normalize(wave)


def generate_alert() -> np.ndarray:
    """Gentle two-tone notification beep."""
    duration = 0.25
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    wave = (
        0.6 * np.sin(2 * np.pi * 880 * t)
        + 0.4 * np.sin(2 * np.pi * 1100 * t)
    ) * np.exp(-t * 14)
    return normalize(wave)


def generate_boot() -> np.ndarray:
    """Warm Mac startup chord — C major arpeggio with long decay."""
    duration = 2.2
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)

    c4 = np.sin(2 * np.pi * 261.63 * t)
    e4 = np.sin(2 * np.pi * 329.63 * t)
    g4 = np.sin(2 * np.pi * 392.00 * t)
    c5 = np.sin(2 * np.pi * 523.25 * t)
    g5 = np.sin(2 * np.pi * 783.99 * t)

    stagger_e = np.zeros_like(t)
    stagger_g = np.zeros_like(t)
    offset_e = int(0.05 * SAMPLE_RATE)
    offset_g = int(0.08 * SAMPLE_RATE)
    stagger_e[offset_e:] = e4[:-offset_e] if offset_e < len(e4) else e4
    stagger_g[offset_g:] = g4[:-offset_g] if offset_g < len(g4) else g4

    wave = (
        0.35 * c4
        + 0.28 * stagger_e
        + 0.22 * stagger_g
        + 0.18 * c5
        + 0.08 * g5
    ) * np.exp(-t * 1.2)

    attack_samples = int(0.05 * SAMPLE_RATE)
    wave[:attack_samples] *= np.linspace(0, 1, attack_samples)

    return normalize(wave, peak=0.65)


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating sounds → {OUTPUT_DIR}/\n")

    sounds = {
        "boot.mp3": generate_boot,
        "click.mp3": generate_click,
        "open.mp3": generate_open,
        "close.mp3": generate_close,
        "error.mp3": generate_error,
        "alert.mp3": generate_alert,
    }

    for filename, generator in sounds.items():
        wave = generator()
        save_mp3(wave, filename)

    print(f"\nDone. Files in {OUTPUT_DIR}/:")
    for filename in sorted(os.listdir(OUTPUT_DIR)):
        if filename.endswith(".mp3"):
            size = os.path.getsize(os.path.join(OUTPUT_DIR, filename))
            print(f"  {filename} ({size:,} bytes)")

    missing = []
    for filename in sounds:
        path = os.path.join(OUTPUT_DIR, filename)
        if not os.path.exists(path) or os.path.getsize(path) == 0:
            missing.append(filename)

    if missing:
        print(f"\n❌ Missing or empty files: {missing}")
        sys.exit(1)

    print("\n✅ All 6 sound files generated successfully.")


if __name__ == "__main__":
    main()
