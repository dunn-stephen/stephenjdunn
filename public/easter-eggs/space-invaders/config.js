const PU_TYPES = [
  { type: "rapid", color: "#ff8800", label: "R" },
  { type: "shield", color: "#00ccff", label: "S" },
  { type: "spread", color: "#ff44ff", label: "W" },
  { type: "life", color: "#4aff4a", label: "+" },
  { type: "nuke", color: "#ffff00", label: "N" },
];

const defaultConfig = {
  gameMode: "normal",
  startingLives: 3,
  heatSpeed: "normal",
  alienSpeedMult: 1,
  bossFreq: 5,
  maxWaves: 0,
  waveScaling: "normal",
  puRapid: true,
  puShield: true,
  puSpread: true,
  puLife: true,
  puNuke: true,
};

let config = { ...defaultConfig };

function saveConfig() {
  localStorage.setItem("si_config", JSON.stringify(config));
}

function loadConfig() {
  const c = JSON.parse(localStorage.getItem("si_config") || "null");
  if (!c) return;

  for (const k in defaultConfig) {
    if (c[k] !== undefined) config[k] = c[k];
  }
}

function getActivePUTypes() {
  return PU_TYPES.filter((p) => {
    if (p.type === "rapid") return config.puRapid;
    if (p.type === "shield") return config.puShield;
    if (p.type === "spread") return config.puSpread;
    if (p.type === "life") return config.puLife;
    if (p.type === "nuke") return config.puNuke;
    return true;
  });
}

function getHeatMult() {
  if (config.heatSpeed === "off") return 0;
  if (config.heatSpeed === "slow") return 0.5;
  if (config.heatSpeed === "fast") return 2;
  return 1;
}

function getWaveScaleMult() {
  if (config.waveScaling === "slow") return 0.5;
  if (config.waveScaling === "fast") return 1.5;
  return 1;
}

loadConfig();
