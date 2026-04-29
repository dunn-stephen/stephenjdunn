const defStats = {
  gamesPlayed: 0,
  totalKills: 0,
  totalShots: 0,
  totalHits: 0,
  bestWave: 0,
  bestScore: 0,
  achievements: {},
};

let stats = JSON.parse(localStorage.getItem("si_stats2") || "null") || { ...defStats };
if (!stats.achievements) stats.achievements = {};

function saveStats() {
  localStorage.setItem("si_stats2", JSON.stringify(stats));
}

function showToast(icon, title, desc) {
  const c = document.getElementById("toast-container");
  const d = document.createElement("div");
  d.className = "toast";
  d.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-text"><div class="toast-title">${title}</div><div class="toast-desc">${desc}</div></div>`;
  c.appendChild(d);
  setTimeout(() => d.remove(), 3200);
}
