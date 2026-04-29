const AudioCtx = window.AudioContext || window.webkitAudioContext;

let audioCtx;
let muted = false;
let bgOsc = null;
let bgGain = null;
let bgPlaying = false;
let bgmTimer = 0;
let bgmInterval = 30;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playTone(f, d, t = "square", v = 0.06) {
  if (!audioCtx || muted) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  o.type = t;
  o.frequency.setValueAtTime(f, audioCtx.currentTime);
  g.gain.setValueAtTime(v, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + d);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + d);
}

function sfxShoot() { playTone(880, 0.08); }
function sfxSpread() { playTone(1100, 0.06); playTone(660, 0.06); }
function sfxHit() { playTone(220, 0.12, "sawtooth", 0.07); }
function sfxPlayerHit() { playTone(80, 0.4, "sawtooth", 0.09); playTone(60, 0.5, "square", 0.06); }
function sfxUfo() { playTone(440, 0.05, "sine", 0.03); }
function sfxPowerup() {
  playTone(523, 0.08, "sine", 0.05);
  setTimeout(() => playTone(659, 0.08, "sine", 0.05), 60);
  setTimeout(() => playTone(784, 0.12, "sine", 0.05), 120);
}
function sfxBoss() { playTone(100, 0.2, "sawtooth", 0.08); }
function sfxCombo() { playTone(1200, 0.05, "sine", 0.04); }
function sfxNuke() { playTone(60, 0.6, "sawtooth", 0.12); playTone(40, 0.8, "square", 0.1); }
function sfxOverheat() { playTone(200, 0.15, "sawtooth", 0.06); }

function startBGM() {
  if (!audioCtx || bgPlaying) return;
  bgOsc = audioCtx.createOscillator();
  bgGain = audioCtx.createGain();
  bgOsc.type = "square";
  bgOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
  bgGain.gain.setValueAtTime(0, audioCtx.currentTime);
  bgOsc.connect(bgGain);
  bgGain.connect(audioCtx.destination);
  bgOsc.start();
  bgPlaying = true;
}

function updateBGM() {
  if (!bgPlaying || !bgGain || muted) {
    if (bgGain) bgGain.gain.setValueAtTime(0, audioCtx.currentTime);
    return;
  }

  const t = audioCtx.currentTime;
  const vol = 0.025;
  bgGain.gain.setValueAtTime(vol, t);
  bgGain.gain.setValueAtTime(0, t + 0.05);
}
