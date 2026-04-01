const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = 640;
const H = 480;

const ACHIEVEMENTS = [
  { id: "first_blood", name: "First Blood", desc: "Destroy your first alien", icon: "💀", check: () => stats.totalKills >= 1 },
  { id: "combo5", name: "Combo King", desc: "Reach a x5 combo", icon: "🔥", check: () => bestCombo >= 5 },
  { id: "combo8", name: "Combo God", desc: "Reach a x8 combo", icon: "⚡", check: () => bestCombo >= 8 },
  { id: "boss_slayer", name: "Boss Slayer", desc: "Defeat a boss", icon: "👑", check: () => bossesKilled >= 1 },
  { id: "sharpshooter", name: "Sharpshooter", desc: "End a game with 90%+ accuracy", icon: "🎯", check: () => shotsFired > 20 && shotsHit / shotsFired >= 0.9 },
  { id: "wave10", name: "Veteran", desc: "Reach wave 10", icon: "🎖️", check: () => wave >= 10 },
  { id: "wave20", name: "Commander", desc: "Reach wave 20", icon: "⭐", check: () => wave >= 20 },
  { id: "nuke_em", name: "Nuclear Option", desc: "Use a nuke power-up", icon: "☢️", check: () => nukesUsed >= 1 },
  { id: "survivor", name: "Survivor", desc: "Dodge 30 enemy bullets in one life", icon: "🛡️", check: () => bulletsDodged >= 30 },
  { id: "centurion", name: "Centurion", desc: "Destroy 100 aliens in one game", icon: "💯", check: () => sessionKills >= 100 },
];

let state = "menu";
let score = 0;
let hiScore = parseInt(localStorage.getItem("si_hi2") || "0");
let lives = 3;
let wave = 1;

let player;
let bullets;
let enemyBullets;
let aliens;
let barriers;
let particles;
let ufo;
let powerups;
let scorePopups;
let boss = null;
let mothership = null;
let alienDir;
let alienDropNext;
let alienMoveTimer;
let alienShootTimer;
let ufoTimer;
let keys = {};
let shootCooldown = 0;
let invincibleTimer = 0;
let comboCount = 0;
let comboTimer = 0;
let comboMultiplier = 1;
let bestCombo = 1;
let shotsFired = 0;
let shotsHit = 0;
let sessionKills = 0;
let bossesKilled = 0;
let nukesUsed = 0;
let bulletsDodged = 0;
let screenShake = { x: 0, y: 0, i: 0, d: 0.88 };
let deathFlashes = [];
let showStatsPanel = false;
let rapidFire = 0;
let shieldActive = 0;
let spreadShot = 0;
let bossDefeatedDelay = 0;
let heat = 0;
let overheated = false;
let overheatLock = 0;
let bannerText = "";
let bannerTimer = 0;
let entryPhase = false;
let entryTimer = 0;
let thrusterParticles = [];
let nukeFlash = 0;
let starLayers = [];
let shootingStars = [];
let touchLeft = false;
let touchRight = false;
let touchFire = false;
let fc = 0;

for (let layer = 0; layer < 3; layer++) {
  const stars = [];
  const count = [40, 30, 15][layer];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      s: layer === 0 ? 1 : layer === 1 ? 1.5 : 2,
      b: 0.15 + layer * 0.15 + Math.random() * 0.2,
      ts: 0.003 + Math.random() * 0.01,
      tp: Math.random() * Math.PI * 2,
    });
  }
  starLayers.push({ stars, speed: 0.1 + layer * 0.2 });
}

function checkAchievements() {
  ACHIEVEMENTS.forEach((a) => {
    if (!stats.achievements[a.id] && a.check()) {
      stats.achievements[a.id] = true;
      saveStats();
      showToast(a.icon, a.name, a.desc);
    }
  });
}

function initGame() {
  score = 0;
  lives = config.startingLives;
  wave = 1;
  shotsFired = 0;
  shotsHit = 0;
  bestCombo = 1;
  sessionKills = 0;
  bossesKilled = 0;
  nukesUsed = 0;
  bulletsDodged = 0;
  stats.gamesPlayed++;
  saveStats();
  startBGM();
  initWave();
  updateHUD();
}

function isBossWave() {
  return wave % config.bossFreq === 0 && wave % (config.bossFreq * 2) !== 0;
}

function isMothWave() {
  return wave % (config.bossFreq * 2) === 0;
}

function initWave() {
  player = { x: W / 2, y: H - 40, w: 26, h: 16 };
  bullets = [];
  enemyBullets = [];
  aliens = [];
  particles = [];
  powerups = [];
  scorePopups = [];
  deathFlashes = [];
  thrusterParticles = [];
  ufo = null;
  boss = null;
  mothership = null;
  ufoTimer = 600 + Math.random() * 600;
  alienDir = 1;
  alienDropNext = false;
  alienMoveTimer = 0;
  alienShootTimer = 0;
  shootCooldown = 0;
  invincibleTimer = 0;
  comboCount = 0;
  comboTimer = 0;
  comboMultiplier = 1;
  rapidFire = 0;
  shieldActive = 0;
  spreadShot = 0;
  bossDefeatedDelay = 0;
  heat = 0;
  overheated = false;
  overheatLock = 0;
  nukeFlash = 0;
  screenShake = { x: 0, y: 0, i: 0, d: 0.88 };

  if (isMothWave()) bannerText = "MOTHERSHIP INCOMING";
  else if (isBossWave()) bannerText = "BOSS WAVE " + wave;
  else bannerText = "WAVE " + wave;
  bannerTimer = 120;
  entryPhase = !isBossWave() && !isMothWave();
  entryTimer = 0;

  if (isMothWave()) {
    const mhp = 40 + wave * 5;
    mothership = { x: W / 2 - 39, y: -50, targetY: 40, w: SP.moth[0].length * 3, h: SP.moth.length * 3, hp: mhp, maxHp: mhp, spawnTimer: 0, alive: true };
  } else if (isBossWave()) {
    const bhp = 20 + wave * 5;
    boss = { x: W / 2 - 30, y: 50, w: SP.boss[0].length * 3, h: SP.boss.length * 3, hp: bhp, maxHp: bhp, dir: 1, shootTimer: 0, phase: 0, alive: true };
  } else {
    const cols = 11;
    const rowTypes = [
      { sa: "a1a", sb: "a1b", color: "#ff4a4a", pts: 40 },
      { sa: "a2a", sb: "a2b", color: "#4aff4a", pts: 20 },
      { sa: "a2a", sb: "a2b", color: "#4aff4a", pts: 20 },
      { sa: "a3a", sb: "a3b", color: "#4a8aff", pts: 10 },
      { sa: "a3a", sb: "a3b", color: "#4a8aff", pts: 10 },
    ];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < cols; c++) {
        const spr = SP[rowTypes[r].sa];
        const sc = 2;
        const tx = 60 + c * 48;
        const ty = 60 + r * 36;
        const startX = entryPhase ? -50 + (c % 2 === 0 ? -100 : W + 100) : tx;
        const startY = entryPhase ? -40 - r * 30 : ty;
        aliens.push({
          x: startX,
          y: startY,
          tx,
          ty,
          row: r,
          col: c,
          alive: true,
          sa: rowTypes[r].sa,
          sb: rowTypes[r].sb,
          color: rowTypes[r].color,
          pts: rowTypes[r].pts,
          frame: 0,
          sc,
          w: spr[0].length * sc,
          h: spr.length * sc,
          entered: !entryPhase,
        });
      }
    }
  }

  barriers = [];
  const bp = [[0,0,1,1,1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,0,0,0,0,1,1,1,1,1],[1,1,1,1,0,0,0,0,0,0,1,1,1,1]];
  for (let b = 0; b < 4; b++) {
    const bx = 90 + b * 140;
    const by = H - 100;
    const s = 3;
    for (let r = 0; r < bp.length; r++) {
      for (let c = 0; c < bp[r].length; c++) {
        if (bp[r][c]) barriers.push({ x: bx + c * s, y: by + r * s, w: s, h: s, hp: 3 });
      }
    }
  }

  updateHUD();
}

function spawnExp(x, y, color, n = 12) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1 + Math.random() * 3;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 20 + Math.random() * 20, ml: 40, color, sz: 1 + Math.random() * 2 });
  }
}

function addPop(x, y, t, c = "#fff") {
  scorePopups.push({ x, y, text: t, color: c, life: 50, vy: -1.2 });
}

function trigShake(v) {
  screenShake.i = Math.max(screenShake.i, v);
}

function registerCombo() {
  comboCount++;
  comboTimer = 90;
  comboMultiplier = Math.min(8, 1 + Math.floor(comboCount / 3));
  if (comboMultiplier > bestCombo) bestCombo = comboMultiplier;
  if (comboMultiplier > 1) sfxCombo();
  updateHUD();
  checkAchievements();
}

function addScore(pts, x, y, c) {
  const t = pts * comboMultiplier;
  score += t;
  if (score > hiScore) {
    hiScore = score;
    localStorage.setItem("si_hi2", hiScore);
  }
  if (score > stats.bestScore) stats.bestScore = score;
  addPop(x, y, "+" + t, c || (comboMultiplier > 1 ? "#ffcc00" : "#fff"));
  updateHUD();
}

function doNuke() {
  nukesUsed++;
  nukeFlash = 20;
  trigShake(10);
  sfxNuke();
  enemyBullets.forEach((b) => spawnExp(b.x, b.y, "#ffff00", 3));
  enemyBullets = [];

  const alive = aliens.filter((a) => a.alive && a.entered);
  const shuffled = alive.sort(() => Math.random() - 0.5);
  const killCount = Math.ceil(shuffled.length * 0.5);
  for (let i = 0; i < killCount; i++) {
    const a = shuffled[i];
    a.alive = false;
    sessionKills++;
    stats.totalKills++;
    spawnExp(a.x + a.w / 2, a.y + a.h / 2, a.color, 6);
    score += a.pts;
    shotsHit++;
  }

  if (boss && boss.alive) {
    boss.hp -= Math.ceil(boss.maxHp * 0.25);
    if (boss.hp <= 0) boss.hp = 1;
  }
  if (mothership && mothership.alive) {
    mothership.hp -= Math.ceil(mothership.maxHp * 0.2);
    if (mothership.hp <= 0) mothership.hp = 1;
  }

  updateHUD();
  saveStats();
  checkAchievements();
}

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "Enter") {
    if (state === "config") return;
    handleStartOrAdvance();
  }
  if (e.code === "KeyP" && state === "playing") {
    state = "paused";
    showPauseScreen();
  } else if (e.code === "KeyP" && state === "paused") {
    state = "playing";
    document.getElementById("overlay").classList.add("hidden");
  }
  if (e.code === "Escape" && state === "paused") exitToMenu();
  if (e.code === "KeyM") muted = !muted;
  if (e.code === "Tab") {
    e.preventDefault();
    showStatsPanel = !showStatsPanel;
  }
  if (["Space", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function addT(id, cb) {
  const el = document.getElementById(id);
  if (!el) return;

  const s = (e) => {
    e.preventDefault();
    initAudio();
    cb(true);
  };
  const n = (e) => {
    e.preventDefault();
    cb(false);
  };

  el.addEventListener("touchstart", s, { passive: false });
  el.addEventListener("touchend", n, { passive: false });
  el.addEventListener("touchcancel", n, { passive: false });
  el.addEventListener("mousedown", s);
  el.addEventListener("mouseup", n);
  el.addEventListener("mouseleave", n);
}

addT("btn-left", (v) => { touchLeft = v; });
addT("btn-right", (v) => { touchRight = v; });
addT("btn-fire", (v) => { touchFire = v; });

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (state === "config") return;
  handleStartOrAdvance();
}, { passive: false });

function update() {
  if (state !== "playing") return;
  if (bannerTimer > 0) {
    bannerTimer--;
    if (bannerTimer > 60) return;
  }

  if (bossDefeatedDelay > 0) {
    bossDefeatedDelay--;
    particles = particles.filter((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--; return p.life > 0; });
    scorePopups = scorePopups.filter((p) => { p.y += p.vy; p.life--; return p.life > 0; });
    decayShake();
    if (bossDefeatedDelay === 0) {
      state = "waveClear";
      showOv("WAVE " + wave + " CLEAR!", isMothWave() ? "MOTHERSHIP DESTROYED!" : "BOSS DEFEATED!", "PRESS ENTER FOR NEXT WAVE", "SCORE: " + score);
    }
    return;
  }

  if (entryPhase) {
    entryTimer++;
    let allIn = true;
    aliens.forEach((a) => {
      if (!a.entered) {
        const delay = a.row * 8 + a.col * 3;
        if (entryTimer > delay) {
          a.x += (a.tx - a.x) * 0.12;
          a.y += (a.ty - a.y) * 0.12;
          if (Math.abs(a.x - a.tx) < 1 && Math.abs(a.y - a.ty) < 1) {
            a.x = a.tx;
            a.y = a.ty;
            a.entered = true;
          } else {
            allIn = false;
          }
        } else {
          allIn = false;
        }
      }
    });
    if (allIn) entryPhase = false;
    decayShake();
    return;
  }

  enemyBullets.forEach((b) => {
    if (b.y > player.y + 10 && !b.counted) {
      b.counted = true;
      bulletsDodged++;
    }
  });

  const movingLeft = keys["ArrowLeft"] || keys["KeyA"] || touchLeft;
  const movingRight = keys["ArrowRight"] || keys["KeyD"] || touchRight;
  if (movingLeft) player.x = Math.max(player.w / 2, player.x - 4);
  if (movingRight) player.x = Math.min(W - player.w / 2, player.x + 4);

  if (movingLeft || movingRight) {
    for (let i = 0; i < 2; i++) {
      thrusterParticles.push({
        x: player.x + (movingLeft ? 6 : -6) + Math.random() * 4 - 2,
        y: player.y + player.h / 2,
        vx: (movingLeft ? 1 : -1) * (0.5 + Math.random()),
        vy: 1 + Math.random() * 2,
        life: 10 + Math.random() * 10,
        ml: 20,
      });
    }
  }
  if (Math.random() < 0.3) {
    thrusterParticles.push({ x: player.x + Math.random() * 4 - 2, y: player.y + player.h / 2, vx: (Math.random() - 0.5) * 0.5, vy: 1 + Math.random(), life: 8 + Math.random() * 8, ml: 16 });
  }
  thrusterParticles = thrusterParticles.filter((p) => { p.x += p.vx; p.y += p.vy; p.life--; return p.life > 0; });

  if (!overheated) heat = Math.max(0, heat - 0.4);
  if (overheated) {
    overheatLock--;
    if (overheatLock <= 0) {
      overheated = false;
      heat = 0;
    }
  }

  const cdMax = rapidFire > 0 ? 6 : 15;
  shootCooldown = Math.max(0, shootCooldown - 1);
  const wantShoot = (keys["Space"] || touchFire) && shootCooldown === 0 && !overheated;
  if (wantShoot) {
    const heatAdd = (rapidFire > 0 ? 3 : 5) * getHeatMult();
    heat += heatAdd;
    if (getHeatMult() > 0 && heat >= 100) {
      overheated = true;
      overheatLock = 120;
      sfxOverheat();
      heat = 100;
    }
    if (spreadShot > 0) {
      bullets.push({ x: player.x, y: player.y - player.h / 2, vx: 0, vy: -7 });
      bullets.push({ x: player.x - 8, y: player.y - player.h / 2, vx: -1.5, vy: -7 });
      bullets.push({ x: player.x + 8, y: player.y - player.h / 2, vx: 1.5, vy: -7 });
      shotsFired += 3;
      sfxSpread();
    } else {
      bullets.push({ x: player.x, y: player.y - player.h / 2, vx: 0, vy: -7 });
      shotsFired++;
      sfxShoot();
    }
    shootCooldown = cdMax;
  }

  if (rapidFire > 0) rapidFire--;
  if (shieldActive > 0) shieldActive--;
  if (spreadShot > 0) spreadShot--;
  if (comboTimer > 0) {
    comboTimer--;
    if (comboTimer === 0) {
      comboCount = 0;
      comboMultiplier = 1;
      updateHUD();
    }
  }
  if (nukeFlash > 0) nukeFlash--;

  bullets = bullets.filter((b) => { b.x += b.vx || 0; b.y += b.vy; return b.y > -10 && b.x > -10 && b.x < W + 10; });
  enemyBullets = enemyBullets.filter((b) => { b.y += b.vy; return b.y < H + 10; });

  for (let i = bullets.length - 1; i >= 0; i--) {
    const pb = bullets[i];
    for (let j = enemyBullets.length - 1; j >= 0; j--) {
      const eb = enemyBullets[j];
      if (Math.abs(pb.x - eb.x) < 5 && Math.abs(pb.y - eb.y) < 6) {
        spawnExp(eb.x, eb.y, "#ff884488", 4);
        bullets.splice(i, 1);
        enemyBullets.splice(j, 1);
        break;
      }
    }
  }

  powerups = powerups.filter((p) => {
    p.y += 1.5;
    p.timer++;
    if (Math.abs(p.x - player.x) < 18 && Math.abs(p.y - player.y) < 18) {
      sfxPowerup();
      if (p.type === "rapid") { rapidFire = 300; addPop(p.x, p.y, "RAPID FIRE!", "#ff8800"); }
      else if (p.type === "shield") { shieldActive = 300; addPop(p.x, p.y, "SHIELD!", "#00ccff"); }
      else if (p.type === "spread") { spreadShot = 300; addPop(p.x, p.y, "SPREAD!", "#ff44ff"); }
      else if (p.type === "life") { lives = Math.min(lives + 1, 5); addPop(p.x, p.y, "+1 LIFE!", "#4aff4a"); updateHUD(); }
      else if (p.type === "nuke") { doNuke(); addPop(p.x, p.y, "NUKE!", "#ffff00"); }
      return false;
    }
    return p.y < H + 10;
  });

  scorePopups = scorePopups.filter((p) => { p.y += p.vy; p.life--; return p.life > 0; });
  deathFlashes = deathFlashes.filter((d) => { d.timer--; return d.timer > 0; });

  if (Math.random() < 0.005) {
    shootingStars.push({ x: Math.random() * W, y: 0, vx: -3 - Math.random() * 3, vy: 4 + Math.random() * 4, life: 30 + Math.random() * 20, ml: 50 });
  }
  shootingStars = shootingStars.filter((s) => { s.x += s.vx; s.y += s.vy; s.life--; return s.life > 0; });

  const aliveCount = aliens.filter((a) => a.alive).length;
  bgmInterval = Math.max(4, Math.floor(25 - (55 - aliveCount) * 0.4 - wave));
  bgmTimer++;
  if (bgmTimer >= bgmInterval) {
    bgmTimer = 0;
    updateBGM();
  }

  if (mothership && mothership.alive) {
    mothership.y += mothership.y < mothership.targetY ? 0.5 : 0.1;
    if (mothership.y + mothership.h >= player.y - 10 && config.gameMode !== "zen") {
      lives = 0;
      state = "gameOver";
      updateHUD();
      endGame();
      return;
    }
    mothership.spawnTimer++;
    if (mothership.spawnTimer >= 90 && aliens.filter((a) => a.alive).length < 15) {
      mothership.spawnTimer = 0;
      const sx = mothership.x + mothership.w / 2 + Math.random() * 40 - 20;
      const sy = mothership.y + mothership.h;
      const types = [{ sa: "a1a", sb: "a1b", c: "#ff4a4a", p: 40 }, { sa: "a3a", sb: "a3b", c: "#4a8aff", p: 10 }];
      const t = types[Math.floor(Math.random() * types.length)];
      const spr = SP[t.sa];
      const sc = 2;
      aliens.push({ x: sx, y: sy, tx: sx, ty: sy, row: 0, col: 0, alive: true, sa: t.sa, sb: t.sb, color: t.c, pts: t.p, frame: 0, sc, w: spr[0].length * sc, h: spr.length * sc, entered: true, mini: true, vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() });
    }
    if (config.gameMode !== "zen" && mothership.spawnTimer % 50 === 0) {
      const cx = mothership.x + mothership.w / 2;
      enemyBullets.push({ x: cx, y: mothership.y + mothership.h, vy: 3.5 });
      enemyBullets.push({ x: cx - 30, y: mothership.y + mothership.h, vy: 3 });
      enemyBullets.push({ x: cx + 30, y: mothership.y + mothership.h, vy: 3 });
    }
    for (let b = bullets.length - 1; b >= 0; b--) {
      const bul = bullets[b];
      if (bul.x > mothership.x && bul.x < mothership.x + mothership.w && bul.y > mothership.y && bul.y < mothership.y + mothership.h) {
        bullets.splice(b, 1);
        mothership.hp--;
        shotsHit++;
        registerCombo();
        addScore(15, bul.x, bul.y, "#ff8800");
        spawnExp(bul.x, bul.y, "#ff8800", 4);
        if (mothership.hp <= 0) {
          mothership.alive = false;
          bossesKilled++;
          addScore(1000, mothership.x + mothership.w / 2, mothership.y + mothership.h / 2, "#ffcc00");
          for (let k = 0; k < 5; k++) {
            setTimeout(() => spawnExp(mothership.x + Math.random() * mothership.w, mothership.y + Math.random() * mothership.h, "#ff" + ["4a4a", "8800", "cc00"][k % 3], 15), k * 100);
          }
          trigShake(16);
          sfxPlayerHit();
          stats.totalKills++;
          saveStats();
          aliens.forEach((a) => {
            if (a.alive && a.mini) {
              a.alive = false;
              spawnExp(a.x + a.w / 2, a.y + a.h / 2, a.color, 5);
              sessionKills++;
              stats.totalKills++;
            }
          });
          bossDefeatedDelay = 100;
          const pu = PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)];
          powerups.push({ x: mothership.x + mothership.w / 2, y: mothership.y + mothership.h / 2, type: pu.type, color: pu.color, label: pu.label, timer: 0 });
          checkAchievements();
        }
        break;
      }
    }
  }

  if (boss && boss.alive) {
    boss.phase += 0.02;
    boss.x += boss.dir * (1.5 + Math.sin(boss.phase) * 0.5);
    boss.y += 0.15 + wave * 0.01;
    if (boss.x + boss.w > W - 20) boss.dir = -1;
    if (boss.x < 20) boss.dir = 1;
    if (boss.y + boss.h >= player.y - 10 && config.gameMode !== "zen") {
      lives = 0;
      state = "gameOver";
      updateHUD();
      endGame();
      return;
    }
    boss.shootTimer++;
    if (config.gameMode !== "zen" && boss.shootTimer >= Math.max(15, 40 - wave * 2)) {
      boss.shootTimer = 0;
      const cx = boss.x + boss.w / 2;
      const cy = boss.y + boss.h;
      enemyBullets.push({ x: cx, y: cy, vy: 4 });
      enemyBullets.push({ x: cx - 20, y: cy, vy: 3.5 });
      enemyBullets.push({ x: cx + 20, y: cy, vy: 3.5 });
      sfxBoss();
    }
    for (let b = bullets.length - 1; b >= 0; b--) {
      const bul = bullets[b];
      if (bul.x > boss.x && bul.x < boss.x + boss.w && bul.y > boss.y && bul.y < boss.y + boss.h) {
        bullets.splice(b, 1);
        boss.hp--;
        shotsHit++;
        registerCombo();
        addScore(10, bul.x, bul.y, "#ffcc00");
        spawnExp(bul.x, bul.y, "#ffcc00", 4);
        if (boss.hp <= 0) {
          boss.alive = false;
          bossesKilled++;
          addScore(500, boss.x + boss.w / 2, boss.y + boss.h / 2, "#ffcc00");
          spawnExp(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ffcc00", 40);
          spawnExp(boss.x + 20, boss.y + 10, "#ff4a4a", 20);
          trigShake(14);
          sfxPlayerHit();
          stats.totalKills++;
          if (wave > stats.bestWave) stats.bestWave = wave;
          saveStats();
          bossDefeatedDelay = 80;
          const pu = PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)];
          powerups.push({ x: boss.x + boss.w / 2, y: boss.y + boss.h / 2, type: pu.type, color: pu.color, label: pu.label, timer: 0 });
          checkAchievements();
        }
        break;
      }
    }
  }

  if (!isBossWave() && !isMothWave()) {
    aliens.filter((a) => a.alive && a.mini).forEach((a) => {
      a.x += a.vx || 0;
      a.y += a.vy || 0;
      if (a.x < 10 || a.x + a.w > W - 10) a.vx *= -1;
    });

    const normalAlive = aliens.filter((a) => a.alive && !a.mini);
    alienMoveTimer++;
    const cnt = normalAlive.length;
    const wsc = getWaveScaleMult();
    const mi = Math.max(2, Math.floor((30 - wave * 2 * wsc - (55 - cnt) * 0.5) / config.alienSpeedMult));
    if (alienMoveTimer >= mi) {
      alienMoveTimer = 0;
      aliens.forEach((a) => { if (a.alive && !a.mini) a.frame = 1 - a.frame; });
      if (alienDropNext) {
        aliens.forEach((a) => {
          if (a.alive && !a.mini) {
            a.y += 10 + Math.min(wave, 8);
            if (config.gameMode === "zen") a.y = Math.min(a.y, player.y - a.h - 20);
          }
        });
        alienDir *= -1;
        alienDropNext = false;
      } else {
        const step = 6 + wave + (cnt < 10 ? 4 : 0);
        aliens.forEach((a) => { if (a.alive && !a.mini) a.x += step * alienDir; });
        if (normalAlive.length > 0) {
          const minX = Math.min(...normalAlive.map((a) => a.x));
          const maxX = Math.max(...normalAlive.map((a) => a.x + a.w));
          if (maxX > W - 10 || minX < 10) alienDropNext = true;
        }
      }
    }

    alienShootTimer++;
    if (config.gameMode !== "zen" && alienShootTimer >= Math.max(15, Math.floor((55 - wave * 5 * getWaveScaleMult()) / config.alienSpeedMult))) {
      alienShootTimer = 0;
      const bots = [];
      const na = aliens.filter((a) => a.alive && !a.mini);
      for (let c = 0; c < 11; c++) {
        for (let r = 4; r >= 0; r--) {
          const idx = na.findIndex((a) => a.col === c && a.row === r);
          if (idx >= 0) {
            bots.push(na[idx]);
            break;
          }
        }
      }
      aliens.filter((a) => a.alive && a.mini).forEach((a) => { if (Math.random() < 0.3) bots.push(a); });
      if (bots.length > 0) {
        const sh = bots[Math.floor(Math.random() * bots.length)];
        enemyBullets.push({ x: sh.x + sh.w / 2, y: sh.y + sh.h, vy: 3 + wave * 0.25 });
        if (wave >= 3 && Math.random() < 0.2) {
          const sh2 = bots[Math.floor(Math.random() * bots.length)];
          enemyBullets.push({ x: sh2.x + sh2.w / 2, y: sh2.y + sh2.h, vy: 3.5 + wave * 0.2 });
        }
      }
    }
  }

  for (let b = bullets.length - 1; b >= 0; b--) {
    const bul = bullets[b];
    for (const a of aliens) {
      if (!a.alive) continue;
      if (bul.x > a.x && bul.x < a.x + a.w && bul.y > a.y && bul.y < a.y + a.h) {
        a.alive = false;
        bullets.splice(b, 1);
        shotsHit++;
        sessionKills++;
        stats.totalKills++;
        registerCombo();
        addScore(a.pts, a.x + a.w / 2, a.y);
        deathFlashes.push({ x: a.x, y: a.y, w: a.w, h: a.h, timer: 5 });
        setTimeout(() => spawnExp(a.x + a.w / 2, a.y + a.h / 2, a.color), 50);
        sfxHit();
        if (wave > stats.bestWave) stats.bestWave = wave;
        saveStats();
        if (Math.random() < 0.12) {
          const active = getActivePUTypes();
          if (active.length > 0) {
            const nukeTypes = active.filter((p) => p.type === "nuke");
            const nonNuke = active.filter((p) => p.type !== "nuke");
            const pool = Math.random() < 0.15 && nukeTypes.length > 0 ? nukeTypes : (nonNuke.length > 0 ? nonNuke : active);
            const pu = pool[Math.floor(Math.random() * pool.length)];
            powerups.push({ x: a.x + a.w / 2, y: a.y + a.h / 2, type: pu.type, color: pu.color, label: pu.label, timer: 0 });
          }
        }
        updateHUD();
        checkAchievements();
        break;
      }
    }
  }

  if (config.gameMode === "normal" && aliens.filter((a) => a.alive).some((a) => a.y + a.h >= player.y - 10)) {
    lives = 0;
    state = "gameOver";
    updateHUD();
    endGame();
    return;
  }

  if (!isBossWave() && !isMothWave() && aliens.filter((a) => a.alive).length === 0) {
    state = "waveClear";
    showOv("WAVE " + wave + " CLEAR!", "SCORE: " + score, "PRESS ENTER FOR NEXT WAVE");
    return;
  }

  if (!isBossWave() && !isMothWave()) {
    ufoTimer--;
    if (ufoTimer <= 0 && !ufo) {
      ufo = { x: -40, y: 30, w: 32, h: 14, dir: 1 };
      if (Math.random() > 0.5) {
        ufo.x = W + 40;
        ufo.dir = -1;
      }
      ufoTimer = 800 + Math.random() * 600;
    }
    if (ufo) {
      ufo.x += ufo.dir * 2;
      if (ufo.x > W + 60 || ufo.x < -60) ufo = null;
      else if (Math.random() < 0.1) sfxUfo();
    }
    if (ufo) {
      for (let b = bullets.length - 1; b >= 0; b--) {
        const bul = bullets[b];
        if (bul.x > ufo.x && bul.x < ufo.x + ufo.w && bul.y > ufo.y && bul.y < ufo.y + ufo.h) {
          const pts = [50, 100, 150, 300][Math.floor(Math.random() * 4)];
          shotsHit++;
          registerCombo();
          addScore(pts, ufo.x + ufo.w / 2, ufo.y, "#ff44ff");
          spawnExp(ufo.x + ufo.w / 2, ufo.y + ufo.h / 2, "#ff44ff", 20);
          sfxHit();
          bullets.splice(b, 1);
          ufo = null;
          break;
        }
      }
    }
  }

  for (let b = bullets.length - 1; b >= 0; b--) {
    const bul = bullets[b];
    for (let i = barriers.length - 1; i >= 0; i--) {
      const bar = barriers[i];
      if (bul.x > bar.x && bul.x < bar.x + bar.w && bul.y > bar.y && bul.y < bar.y + bar.h) {
        bar.hp--;
        if (bar.hp <= 0) barriers.splice(i, 1);
        bullets.splice(b, 1);
        break;
      }
    }
  }

  for (let b = enemyBullets.length - 1; b >= 0; b--) {
    const bul = enemyBullets[b];
    for (let i = barriers.length - 1; i >= 0; i--) {
      const bar = barriers[i];
      if (bul.x > bar.x && bul.x < bar.x + bar.w && bul.y > bar.y && bul.y < bar.y + bar.h) {
        bar.hp--;
        if (bar.hp <= 0) barriers.splice(i, 1);
        enemyBullets.splice(b, 1);
        break;
      }
    }
  }

  if (invincibleTimer > 0) invincibleTimer--;
  else {
    for (let b = enemyBullets.length - 1; b >= 0; b--) {
      const bul = enemyBullets[b];
      if (bul.x > player.x - player.w / 2 && bul.x < player.x + player.w / 2 && bul.y > player.y - player.h / 2 && bul.y < player.y + player.h / 2) {
        enemyBullets.splice(b, 1);
        if (shieldActive > 0) {
          shieldActive = 0;
          addPop(player.x, player.y - 20, "SHIELD BROKEN!", "#00ccff");
          trigShake(4);
          spawnExp(player.x, player.y, "#00ccff", 10);
        } else if (config.gameMode === "invincible") {
          spawnExp(player.x, player.y, "#ffcc00", 10);
          trigShake(3);
          invincibleTimer = 30;
        } else {
          lives--;
          sfxPlayerHit();
          spawnExp(player.x, player.y, "#4aff4a", 25);
          trigShake(8);
          invincibleTimer = 90;
          comboCount = 0;
          comboTimer = 0;
          comboMultiplier = 1;
          updateHUD();
          if (lives <= 0) {
            state = "gameOver";
            endGame();
            return;
          }
        }
        break;
      }
    }
  }

  particles = particles.filter((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--; return p.life > 0; });
  decayShake();
}

function decayShake() {
  if (screenShake.i > 0.5) {
    screenShake.x = (Math.random() - 0.5) * screenShake.i * 2;
    screenShake.y = (Math.random() - 0.5) * screenShake.i * 2;
    screenShake.i *= screenShake.d;
  } else {
    screenShake.x = 0;
    screenShake.y = 0;
    screenShake.i = 0;
  }
}

function endGame() {
  if (wave > stats.bestWave) stats.bestWave = wave;
  if (score > stats.bestScore) stats.bestScore = score;
  stats.totalShots += shotsFired;
  stats.totalHits += shotsHit;
  saveStats();
  checkAchievements();
  const acc = shotsFired > 0 ? Math.round(shotsHit / shotsFired * 100) : 0;
  showOv("GAME OVER", null, "PRESS ENTER TO RETRY", "FINAL SCORE: " + score, '<div class="stats-grid" style="margin-top:6px">' +
    "<div class=\"stat-item\">ACCURACY: <b>" + acc + "%</b></div>" +
    "<div class=\"stat-item\">WAVE: <b>" + wave + "</b></div>" +
    "<div class=\"stat-item\">KILLS: <b>" + sessionKills + "</b></div>" +
    "<div class=\"stat-item\">BEST COMBO: <b>x" + bestCombo + "</b></div>" +
    "<div class=\"stat-item\">BOSSES: <b>" + bossesKilled + "</b></div>" +
    "<div class=\"stat-item\">NUKES: <b>" + nukesUsed + "</b></div></div>");
}

function draw() {
  fc++;
  ctx.save();
  ctx.translate(screenShake.x, screenShake.y);
  ctx.clearRect(-10, -10, W + 20, H + 20);

  starLayers.forEach((l, li) => {
    l.stars.forEach((s) => {
      if (state === "playing") s.y += l.speed;
      if (s.y > H) {
        s.y = 0;
        s.x = Math.random() * W;
      }
      const f = 0.5 + 0.5 * Math.sin(fc * s.ts + s.tp);
      const a = s.b * f;
      const g = li === 0 ? "150,180,150" : li === 1 ? "170,200,170" : "200,230,200";
      ctx.fillStyle = "rgba(" + g + "," + a + ")";
      ctx.fillRect(s.x, s.y, s.s, s.s);
    });
  });

  shootingStars.forEach((s) => {
    const a = s.life / s.ml;
    ctx.strokeStyle = "rgba(255,255,200," + a + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
    ctx.stroke();
  });

  if (state === "menu") {
    ctx.restore();
    return;
  }

  if (nukeFlash > 0) {
    ctx.fillStyle = "rgba(255,255,100," + (nukeFlash / 20) * 0.3 + ")";
    ctx.fillRect(0, 0, W, H);
  }

  if (bannerTimer > 0) {
    const progress = bannerTimer > 60 ? (120 - bannerTimer) / 60 : 1;
    const fadeOut = bannerTimer < 20 ? bannerTimer / 20 : 1;
    ctx.save();
    ctx.globalAlpha = fadeOut;
    ctx.font = '18px "Press Start 2P"';
    ctx.textAlign = "center";
    ctx.fillStyle = bannerText.includes("BOSS") || bannerText.includes("MOTHER") ? "#ffcc00" : "#4aff4a";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    const bx = W / 2 - 300 + progress * 300;
    ctx.fillText(bannerText, bx, H / 2);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  barriers.forEach((b) => {
    ctx.fillStyle = "rgba(74,255,74," + (0.3 + (b.hp / 3) * 0.7) + ")";
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
  aliens.forEach((a) => { if (a.alive) ds(ctx, SP[a.frame === 0 ? a.sa : a.sb], a.x, a.y, a.sc, a.color); });
  deathFlashes.forEach((d) => {
    ctx.fillStyle = "rgba(255,255,255," + d.timer / 5 + ")";
    ctx.fillRect(d.x - 2, d.y - 2, d.w + 4, d.h + 4);
  });

  if (mothership && mothership.alive) {
    const mc = mothership.hp > mothership.maxHp * 0.5 ? "#ff8800" : mothership.hp > mothership.maxHp * 0.25 ? "#ff4a4a" : "#cc0000";
    const pulse = 0.85 + 0.15 * Math.sin(fc * 0.05);
    ctx.globalAlpha = pulse;
    ds(ctx, SP.moth, mothership.x, mothership.y, 3, mc);
    ctx.globalAlpha = 1;
    const bw = mothership.w;
    const hp = mothership.hp / mothership.maxHp;
    ctx.fillStyle = "#222";
    ctx.fillRect(mothership.x, mothership.y - 14, bw, 6);
    ctx.fillStyle = hp > 0.5 ? "#4aff4a" : hp > 0.25 ? "#ff8800" : "#ff4a4a";
    ctx.fillRect(mothership.x, mothership.y - 14, bw * hp, 6);
    ctx.strokeStyle = "#555";
    ctx.strokeRect(mothership.x, mothership.y - 14, bw, 6);
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("MOTHERSHIP", mothership.x + mothership.w / 2, mothership.y - 20);
  }

  if (boss && boss.alive) {
    const bc = boss.hp > boss.maxHp * 0.5 ? "#ffcc00" : boss.hp > boss.maxHp * 0.25 ? "#ff8800" : "#ff4a4a";
    ds(ctx, SP.boss, boss.x, boss.y, 3, bc);
    const bw = boss.w;
    const hp = boss.hp / boss.maxHp;
    ctx.fillStyle = "#222";
    ctx.fillRect(boss.x, boss.y - 12, bw, 6);
    ctx.fillStyle = hp > 0.5 ? "#4aff4a" : hp > 0.25 ? "#ff8800" : "#ff4a4a";
    ctx.fillRect(boss.x, boss.y - 12, bw * hp, 6);
    ctx.strokeStyle = "#555";
    ctx.strokeRect(boss.x, boss.y - 12, bw, 6);
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("BOSS", boss.x + boss.w / 2, boss.y - 18);
  }

  if (ufo) {
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(fc * 0.15);
    ds(ctx, SP.ufo, ufo.x, ufo.y, 2, "#ff44ff");
    ctx.globalAlpha = 1;
  }

  thrusterParticles.forEach((p) => {
    const a = p.life / p.ml;
    const r = Math.floor(74 + 180 * (1 - a));
    const g = Math.floor(255 * a);
    const b = Math.floor(74 * a);
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    ctx.fillRect(p.x, p.y, 2, 2);
  });

  if (state === "playing" || state === "paused") {
    const blink = invincibleTimer > 0 && Math.floor(invincibleTimer / 4) % 2 === 0;
    if (!blink) {
      if (shieldActive > 0) {
        ctx.strokeStyle = "rgba(0,204,255," + (0.4 + 0.3 * Math.sin(fc * 0.1)) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(player.x, player.y, 20, 16, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      const pc = spreadShot > 0 ? "#ff44ff" : rapidFire > 0 ? "#ff8800" : "#4aff4a";
      ds(ctx, SP.pl, player.x - player.w / 2, player.y - player.h / 2, 2, pc);
    }
  }

  powerups.forEach((p) => {
    const bob = Math.sin(fc * 0.08 + p.timer * 0.1) * 3;
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(fc * 0.12);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.label, p.x, p.y + bob + 1);
    ctx.restore();
  });

  ctx.shadowColor = "#4aff4a";
  ctx.shadowBlur = 6;
  bullets.forEach((b) => {
    ctx.fillStyle = spreadShot > 0 ? "#ff44ff" : "#4aff4a";
    ctx.fillRect(b.x - 1, b.y, 2, 8);
  });
  ctx.shadowBlur = 0;

  ctx.shadowColor = "#ff4a4a";
  ctx.shadowBlur = 6;
  enemyBullets.forEach((b) => {
    ctx.fillStyle = "#ff6a4a";
    ctx.fillRect(b.x - 1, b.y, 3, 8);
  });
  ctx.shadowBlur = 0;

  particles.forEach((p) => {
    ctx.globalAlpha = p.life / p.ml;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.sz, p.sz);
  });
  ctx.globalAlpha = 1;

  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = "center";
  scorePopups.forEach((p) => {
    ctx.globalAlpha = Math.min(1, p.life / 20);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  });
  ctx.globalAlpha = 1;

  const hx = W - 110;
  const hy = H - 30;
  const hw = 100;
  const hh = 8;
  ctx.fillStyle = "#111";
  ctx.fillRect(hx, hy, hw, hh);
  const hpct = heat / 100;
  ctx.fillStyle = overheated ? "#ff0000" : hpct > 0.7 ? "#ff4400" : hpct > 0.4 ? "#ff8800" : "#44aa44";
  ctx.fillRect(hx, hy, hw * hpct, hh);
  ctx.strokeStyle = "#333";
  ctx.strokeRect(hx, hy, hw, hh);
  ctx.font = '6px "Press Start 2P"';
  ctx.textAlign = "right";
  ctx.fillStyle = overheated ? "#ff0000" : "#3a6a3a";
  ctx.fillText(overheated ? "OVERHEAT!" : "HEAT", hx - 4, hy + 7);

  let iy = H - 28;
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = "left";
  if (rapidFire > 0) { ctx.fillStyle = "#ff8800"; ctx.fillText("RAPID " + Math.ceil(rapidFire / 60) + "s", 8, iy); iy -= 12; }
  if (shieldActive > 0) { ctx.fillStyle = "#00ccff"; ctx.fillText("SHIELD " + Math.ceil(shieldActive / 60) + "s", 8, iy); iy -= 12; }
  if (spreadShot > 0) { ctx.fillStyle = "#ff44ff"; ctx.fillText("SPREAD " + Math.ceil(spreadShot / 60) + "s", 8, iy); iy -= 12; }
  if (comboMultiplier > 1) {
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,204,0," + (0.5 + 0.5 * Math.sin(fc * 0.15)) + ")";
    ctx.fillText("COMBO x" + comboMultiplier, W / 2, 20);
  }

  ctx.strokeStyle = "#1a4a1a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H - 16);
  ctx.lineTo(W, H - 16);
  ctx.stroke();

  if (muted) {
    ctx.font = '6px "Press Start 2P"';
    ctx.textAlign = "right";
    ctx.fillStyle = "#ff4a4a66";
    ctx.fillText("MUTED", W - 8, H - 4);
  }

  if (showStatsPanel && state !== "menu") {
    ctx.fillStyle = "rgba(0,5,0,.9)";
    ctx.fillRect(W / 2 - 150, 50, 300, 220);
    ctx.strokeStyle = "#2a5a2a";
    ctx.strokeRect(W / 2 - 150, 50, 300, 220);
    ctx.fillStyle = "#4aff4a";
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = "center";
    ctx.fillText("CAREER STATS", W / 2, 75);
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = "left";
    ctx.fillStyle = "#3a8a3a";
    const sx = W / 2 - 130;
    const sy = 95;
    const g = 18;
    const aS = stats.totalShots + shotsFired;
    const aH = stats.totalHits + shotsHit;
    const achCount = Object.keys(stats.achievements || {}).length;
    ["GAMES:     " + stats.gamesPlayed, "KILLS:     " + stats.totalKills, "ACCURACY:  " + (aS > 0 ? Math.round(aH / aS * 100) : 0) + "%", "BEST WAVE: " + Math.max(stats.bestWave, wave), "BEST SCORE:" + Math.max(stats.bestScore, score), "ACHIEVE:   " + achCount + "/" + ACHIEVEMENTS.length].forEach((l, i) => ctx.fillText(l, sx, sy + i * g));
    ctx.font = '6px "Press Start 2P"';
    ctx.fillStyle = "#ffcc00";
    let ay = sy + 6 * g + 8;
    ACHIEVEMENTS.forEach((a) => {
      if (stats.achievements[a.id]) {
        ctx.fillText(a.icon + " " + a.name, sx, ay);
        ay += 14;
      }
    });
  }

  ctx.restore();
}

function loop() {
  try {
    update();
    draw();
  } catch (e) {
    console.error("Game loop error:", e);
  }
  requestAnimationFrame(loop);
}

showMenu();
updateHUD();
loop();
