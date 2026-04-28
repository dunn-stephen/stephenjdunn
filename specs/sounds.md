# specs/sounds.md — Sound Generation Script
# Project: stephenjdunn.com
# Codex runs this script in Task 0.4 to generate all 6 sound files programmatically.

---

## Overview

All 6 sounds are synthesized using Python (`numpy` + `scipy`). No browser tools or external downloads required. The script lives at `scripts/generate-sounds.py` and outputs directly to `public/sounds/`.

**Pre-requisites (verified in Task 0.0):**
- Python 3.8+
- `numpy` and `scipy` installed
- `ffmpeg` (preferred for MP3 output) OR `scipy.io.wavfile` + in-script WAV-to-MP3 fallback

---

## Script: `scripts/generate-sounds.py`

Create this file at `scripts/generate-sounds.py`:

```python
#!/usr/bin/env python3
"""
Sound generation script for stephenjdunn.com
Synthesizes 6 OS9-style UI sounds and saves them to public/sounds/
Run: python3 scripts/generate-sounds.py
"""

import numpy as np
from scipy.io import wavfile
import subprocess
import os
import sys
import tempfile

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

    # Convert to 16-bit PCM for wav writing
    pcm = (wave * 32767).astype(np.int16)

    # Try ffmpeg first (best quality MP3)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
        wavfile.write(tmp_path, SAMPLE_RATE, pcm)

    try:
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", tmp_path, "-codec:a", "libmp3lame", "-q:a", "4", path],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            print(f"  ✅ {filename} (ffmpeg)")
            return
    except FileNotFoundError:
        pass  # ffmpeg not available, fall through to WAV fallback
    finally:
        os.unlink(tmp_path)

    # Fallback: save as .wav and rename — browser supports WAV, and Next.js will serve it
    # Note: the file will be .mp3 extension but contains WAV data — acceptable for modern browsers
    wav_path = os.path.join(OUTPUT_DIR, filename)
    wavfile.write(wav_path, SAMPLE_RATE, pcm)
    print(f"  ✅ {filename} (WAV fallback — install ffmpeg for true MP3)")

# ─────────────────────────────────────────────────────────────
# Sound definitions
# ─────────────────────────────────────────────────────────────

def generate_click() -> np.ndarray:
    """Short, crisp UI click — plays on icon single-click and button presses."""
    duration = 0.06
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    # High-pitched sine burst with fast exponential decay
    wave = np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 100)
    # Add a tiny low thud for body
    wave += 0.3 * np.sin(2 * np.pi * 300 * t) * np.exp(-t * 120)
    return normalize(wave)

def generate_open() -> np.ndarray:
    """Short ascending frequency sweep — plays when a window opens."""
    duration = 0.18
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    # Frequency sweeps upward from 350Hz to 750Hz
    freq = np.linspace(350, 750, len(t))
    phase = np.cumsum(freq) / SAMPLE_RATE
    wave = np.sin(2 * np.pi * phase) * np.exp(-t * 10)
    return normalize(wave)

def generate_close() -> np.ndarray:
    """Short descending frequency sweep — plays when a window closes."""
    duration = 0.15
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    # Frequency sweeps downward from 700Hz to 250Hz
    freq = np.linspace(700, 250, len(t))
    phase = np.cumsum(freq) / SAMPLE_RATE
    wave = np.sin(2 * np.pi * phase) * np.exp(-t * 12)
    return normalize(wave)

def generate_error() -> np.ndarray:
    """Low, attention-grabbing bonk — Sosumi-style error alert."""
    duration = 0.35
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    # Fundamental at 200Hz with harmonics for richness
    wave = (
        0.6 * np.sin(2 * np.pi * 200 * t) +
        0.3 * np.sin(2 * np.pi * 400 * t) +
        0.1 * np.sin(2 * np.pi * 600 * t)
    ) * np.exp(-t * 7)
    # Slight vibrato for character
    vibrato = 1 + 0.02 * np.sin(2 * np.pi * 8 * t)
    wave *= vibrato
    return normalize(wave)

def generate_alert() -> np.ndarray:
    """Gentle two-tone notification beep."""
    duration = 0.25
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    # Two harmonically related tones
    wave = (
        0.6 * np.sin(2 * np.pi * 880 * t) +
        0.4 * np.sin(2 * np.pi * 1100 * t)
    ) * np.exp(-t * 14)
    return normalize(wave)

def generate_boot() -> np.ndarray:
    """Warm Mac startup chord — C major arpeggio with long decay."""
    duration = 2.2
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)

    # C major chord: C4, E4, G4, C5 — the classic Mac startup harmonic structure
    c4  = np.sin(2 * np.pi * 261.63 * t)
    e4  = np.sin(2 * np.pi * 329.63 * t)
    g4  = np.sin(2 * np.pi * 392.00 * t)
    c5  = np.sin(2 * np.pi * 523.25 * t)
    g5  = np.sin(2 * np.pi * 783.99 * t)

    # Blend with slight stagger (higher notes arrive slightly later for warmth)
    stagger_e = np.zeros_like(t)
    stagger_g = np.zeros_like(t)
    offset_e = int(0.05 * SAMPLE_RATE)
    offset_g = int(0.08 * SAMPLE_RATE)
    stagger_e[offset_e:] = e4[:-offset_e] if offset_e < len(e4) else e4
    stagger_g[offset_g:] = g4[:-offset_g] if offset_g < len(g4) else g4

    wave = (
        0.35 * c4 +
        0.28 * stagger_e +
        0.22 * stagger_g +
        0.18 * c5 +
        0.08 * g5
    ) * np.exp(-t * 1.2)  # Long, gentle decay

    # Soft attack envelope (fade in over first 50ms)
    attack_samples = int(0.05 * SAMPLE_RATE)
    wave[:attack_samples] *= np.linspace(0, 1, attack_samples)

    return normalize(wave, peak=0.65)

# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating sounds → {OUTPUT_DIR}/\n")

    sounds = {
        "boot.mp3":  generate_boot,
        "click.mp3": generate_click,
        "open.mp3":  generate_open,
        "close.mp3": generate_close,
        "error.mp3": generate_error,
        "alert.mp3": generate_alert,
    }

    for filename, generator in sounds.items():
        wave = generator()
        save_mp3(wave, filename)

    print(f"\nDone. Files in {OUTPUT_DIR}/:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        if f.endswith(".mp3"):
            size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
            print(f"  {f} ({size:,} bytes)")

    # Verify all 6 files exist and are non-empty
    missing = []
    for filename in sounds:
        path = os.path.join(OUTPUT_DIR, filename)
        if not os.path.exists(path) or os.path.getsize(path) == 0:
            missing.append(filename)

    if missing:
        print(f"\n❌ Missing or empty files: {missing}")
        sys.exit(1)
    else:
        print("\n✅ All 6 sound files generated successfully.")

if __name__ == "__main__":
    main()
```

---

## Running the script

```bash
mkdir -p scripts
# (write the script to scripts/generate-sounds.py)
python3 scripts/generate-sounds.py
```

Expected output:
```
Generating sounds → public/sounds/

  ✅ boot.mp3 (ffmpeg)
  ✅ click.mp3 (ffmpeg)
  ✅ open.mp3 (ffmpeg)
  ✅ close.mp3 (ffmpeg)
  ✅ error.mp3 (ffmpeg)
  ✅ alert.mp3 (ffmpeg)

Done. Files in public/sounds/:
  alert.mp3  (12,345 bytes)
  boot.mp3   (38,012 bytes)
  click.mp3  (3,456 bytes)
  close.mp3  (8,123 bytes)
  error.mp3  (14,567 bytes)
  open.mp3   (7,890 bytes)

✅ All 6 sound files generated successfully.
```

---

## Sound character summary

| File | Duration | Character |
|---|---|---|
| `boot.mp3` | ~2.2s | Warm C major chord, soft attack, long decay — approximates the classic Mac startup chime |
| `click.mp3` | ~0.06s | Crisp high-pitched snap with slight low thud |
| `open.mp3` | ~0.18s | Ascending frequency sweep (350→750Hz) |
| `close.mp3` | ~0.15s | Descending frequency sweep (700→250Hz) |
| `error.mp3` | ~0.35s | Low bonk with harmonics and slight vibrato — Sosumi-style |
| `alert.mp3` | ~0.25s | Two-tone beep (880Hz + 1100Hz) |

---

## Notes

- **ffmpeg** produces true MP3 files. Without it, the script saves PCM audio with an `.mp3` extension — modern browsers play it correctly regardless.
- Stephen can replace any of these files with custom sounds at any time. The filenames and paths are fixed (`public/sounds/*.mp3`) but the audio content can be swapped freely.
- All generated sounds are original (programmatically synthesized). There is no Apple IP in these files.
