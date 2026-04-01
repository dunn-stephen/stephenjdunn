function showConfig() {
  state = "config";
  const ov = document.getElementById("overlay");
  ov.classList.remove("hidden");

  function opt(id, val, label, style) {
    const active = config[id] === val;
    const cls = "cfg-opt" + (active ? " " + (style || "active") : "");
    return '<div class="' + cls + '" data-cfg="' + id + '" data-val="' + val + '">' + label + "</div>";
  }

  function toggle(id, label) {
    const on = config[id];
    return '<div class="cfg-toggle" data-toggle="' + id + '">' +
      '<div class="cfg-toggle-box ' + (on ? "on" : "off") + '">' + (on ? "✓" : "✗") + "</div>" +
      '<div class="cfg-toggle-label">' + label + "</div></div>";
  }

  ov.innerHTML = '<h1 style="font-size:18px">SETTINGS</h1>' +
    '<div class="cfg-panel">' +
    '<div class="cfg-section"><div class="cfg-section-title">GAME MODE</div>' +
    '<div class="cfg-row"><div class="cfg-label">MODE</div><div class="cfg-options">' +
    opt("gameMode", "normal", "NORMAL", "active") +
    opt("gameMode", "invincible", "INVINCIBLE", "active-gold") +
    opt("gameMode", "zen", "ZEN", "active-gold") +
    "</div></div></div>" +
    '<div class="cfg-section"><div class="cfg-section-title">DIFFICULTY</div>' +
    '<div class="cfg-row"><div class="cfg-label">STARTING LIVES</div><div class="cfg-options">' +
    [1, 2, 3, 5, 9].map((v) => opt("startingLives", v, String(v))).join("") +
    "</div></div>" +
    '<div class="cfg-row"><div class="cfg-label">ALIEN SPEED</div><div class="cfg-options">' +
    opt("alienSpeedMult", 0.5, "0.5x") +
    opt("alienSpeedMult", 0.75, "0.75x") +
    opt("alienSpeedMult", 1, "1x") +
    opt("alienSpeedMult", 1.5, "1.5x") +
    opt("alienSpeedMult", 2, "2x") +
    "</div></div>" +
    '<div class="cfg-row"><div class="cfg-label">HEAT GAUGE</div><div class="cfg-options">' +
    opt("heatSpeed", "off", "OFF") +
    opt("heatSpeed", "slow", "SLOW") +
    opt("heatSpeed", "normal", "NORMAL") +
    opt("heatSpeed", "fast", "FAST") +
    "</div></div></div>" +
    '<div class="cfg-section"><div class="cfg-section-title">WAVE SETTINGS</div>' +
    '<div class="cfg-row"><div class="cfg-label">BOSS EVERY</div><div class="cfg-options">' +
    opt("bossFreq", 3, "3 WAVES") +
    opt("bossFreq", 5, "5 WAVES") +
    opt("bossFreq", 7, "7 WAVES") +
    opt("bossFreq", 10, "10 WAVES") +
    "</div></div>" +
    '<div class="cfg-row"><div class="cfg-label">MAX WAVES</div><div class="cfg-options">' +
    opt("maxWaves", 0, "ENDLESS") +
    opt("maxWaves", 10, "10") +
    opt("maxWaves", 20, "20") +
    opt("maxWaves", 50, "50") +
    "</div></div>" +
    '<div class="cfg-row"><div class="cfg-label">SPEED SCALING</div><div class="cfg-options">' +
    opt("waveScaling", "slow", "SLOW") +
    opt("waveScaling", "normal", "NORMAL") +
    opt("waveScaling", "fast", "FAST") +
    "</div></div></div>" +
    '<div class="cfg-section"><div class="cfg-section-title">POWER-UPS</div>' +
    '<div class="cfg-row" style="flex-wrap:wrap;gap:8px">' +
    toggle("puRapid", "RAPID FIRE") +
    toggle("puShield", "SHIELD") +
    toggle("puSpread", "SPREAD SHOT") +
    toggle("puLife", "EXTRA LIFE") +
    toggle("puNuke", "NUKE") +
    "</div></div>" +
    "</div>" +
    '<div class="overlay-btns" style="margin-top:8px">' +
    '<button class="overlay-btn" id="cfg-back">BACK</button>' +
    '<button class="overlay-btn gold" id="cfg-reset">RESET DEFAULTS</button>' +
    "</div>";

  ov.querySelectorAll(".cfg-opt").forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.dataset.cfg;
      let val = el.dataset.val;
      if (!isNaN(Number(val))) val = Number(val);
      config[key] = val;
      saveConfig();
      showConfig();
    });
  });

  ov.querySelectorAll(".cfg-toggle").forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.dataset.toggle;
      config[key] = !config[key];
      saveConfig();
      showConfig();
    });
  });

  document.getElementById("cfg-back").addEventListener("click", () => {
    state = "menu";
    showMenu();
  });
  document.getElementById("cfg-reset").addEventListener("click", () => {
    Object.assign(config, defaultConfig);
    saveConfig();
    showConfig();
  });
}

function updateHUD() {
  document.getElementById("score").textContent = String(score).padStart(4, "0");
  document.getElementById("hi-score").textContent = String(hiScore).padStart(4, "0");
  document.getElementById("wave").textContent = wave;

  const ce = document.getElementById("combo");
  if (comboMultiplier > 1) {
    ce.textContent = "x" + comboMultiplier;
    ce.className = "hud-value combo-active";
  } else {
    ce.textContent = "x1";
    ce.className = "hud-value";
  }

  const ld = document.getElementById("lives-display");
  ld.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const d = document.createElement("div");
    d.className = "life-icon";
    ld.appendChild(d);
  }
}

function handleStartOrAdvance() {
  initAudio();
  if (state === "menu" || state === "gameOver") {
    initGame();
    state = "playing";
    document.getElementById("overlay").classList.add("hidden");
  } else if (state === "waveClear") {
    if (config.maxWaves > 0 && wave >= config.maxWaves) {
      state = "gameOver";
      endGame();
      return;
    }
    wave++;
    initWave();
    state = "playing";
    document.getElementById("overlay").classList.add("hidden");
  }
}

function showOv(title, sub, prompt, extra, extraHTML) {
  const ov = document.getElementById("overlay");
  ov.classList.remove("hidden");

  let h = "";
  if (title) {
    let c = "";
    if (title === "GAME OVER") c = ' class="red"';
    if (title.includes("CLEAR") || title.includes("BOSS") || title.includes("MOTHER")) c = ' class="gold"';
    h += "<h1" + c + ">" + title + "</h1>";
  }
  if (sub) h += '<div class="subtitle">' + sub + "</div>";
  if (extra) h += '<div class="final-score">' + extra + "</div>";
  if (extraHTML) h += extraHTML;
  if (prompt) h += '<div class="start-prompt">' + prompt + "</div>";
  ov.innerHTML = h;
}

function showPauseScreen() {
  const ov = document.getElementById("overlay");
  ov.classList.remove("hidden");
  ov.innerHTML =
    "<h1>PAUSED</h1>" +
    '<div class="subtitle">WAVE ' + wave + " &bull; SCORE: " + score + "</div>" +
    '<div class="overlay-btns">' +
    '<button class="overlay-btn" id="btn-resume">RESUME</button>' +
    '<button class="overlay-btn exit" id="btn-exit">EXIT TO MENU</button>' +
    "</div>" +
    '<div class="subtitle" style="margin-top:8px"><span style="color:#4aff4a">P</span> RESUME &bull; <span style="color:#ff6a4a">ESC</span> EXIT</div>';

  document.getElementById("btn-resume").addEventListener("click", () => {
    state = "playing";
    ov.classList.add("hidden");
  });
  document.getElementById("btn-exit").addEventListener("click", () => {
    exitToMenu();
  });
}

function exitToMenu() {
  if (wave > stats.bestWave) stats.bestWave = wave;
  if (score > stats.bestScore) stats.bestScore = score;
  stats.totalShots += shotsFired;
  stats.totalHits += shotsHit;
  saveStats();
  state = "menu";
  showMenu();
}

function showMenu() {
  const ov = document.getElementById("overlay");
  ov.classList.remove("hidden");
  ov.innerHTML =
    "<h1>SPACE INVADERS</h1>" +
    '<div class="subtitle">DEFEND EARTH FROM THE ALIEN HORDE</div>' +
    '<div class="score-table">' +
    '<div class="score-row"><div class="alien-preview"><canvas id="pv1" width="28" height="20"></canvas></div><div>= 40 PTS</div></div>' +
    '<div class="score-row"><div class="alien-preview"><canvas id="pv2" width="28" height="20"></canvas></div><div>= 20 PTS</div></div>' +
    '<div class="score-row"><div class="alien-preview"><canvas id="pv3" width="28" height="20"></canvas></div><div>= 10 PTS</div></div></div>' +
    '<div class="subtitle" style="margin-top:6px">POWER-UPS</div>' +
    '<div class="powerup-legend">' +
    '<div class="pu-item"><div class="pu-dot" style="background:#ff8800"></div>RAPID</div>' +
    '<div class="pu-item"><div class="pu-dot" style="background:#00ccff"></div>SHIELD</div>' +
    '<div class="pu-item"><div class="pu-dot" style="background:#ff44ff"></div>SPREAD</div>' +
    '<div class="pu-item"><div class="pu-dot" style="background:#4aff4a"></div>+LIFE</div>' +
    '<div class="pu-item"><div class="pu-dot" style="background:#ffff00"></div>NUKE</div></div>' +
    '<div class="subtitle" style="margin-top:4px">BOSS EVERY ' + config.bossFreq + " WAVES &bull; MOTHERSHIP EVERY " + (config.bossFreq * 2) + "</div>" +
    '<div class="subtitle">BUILD COMBOS &bull; MANAGE HEAT &bull; EARN ACHIEVEMENTS</div>' +
    '<div class="overlay-btns" style="margin-top:8px">' +
    '<button class="overlay-btn" id="btn-start">START GAME</button>' +
    '<button class="overlay-btn gold" id="btn-settings">SETTINGS</button>' +
    "</div>" +
    '<div class="subtitle" style="margin-top:4px;font-size:6px">' +
    (config.gameMode !== "normal" ? "MODE: " + config.gameMode.toUpperCase() + " &bull; " : "") +
    "LIVES: " + config.startingLives + " &bull; SPEED: " + config.alienSpeedMult + "x" +
    (config.heatSpeed === "off" ? " &bull; HEAT: OFF" : "") +
    "</div>";

  [["pv1", SP.a1a, "#ff4a4a"], ["pv2", SP.a2a, "#4aff4a"], ["pv3", SP.a3a, "#4a8aff"]].forEach(([id, spr, col]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const cx = el.getContext("2d");
    cx.clearRect(0, 0, 28, 20);
    ds(cx, spr, Math.floor((28 - spr[0].length * 2) / 2), Math.floor((20 - spr.length * 2) / 2), 2, col);
  });

  document.getElementById("btn-start").addEventListener("click", () => {
    handleStartOrAdvance();
  });
  document.getElementById("btn-settings").addEventListener("click", () => {
    showConfig();
  });
}
