const bootLines = [
  "boot: initializing terminal interface",
  "sync: loading stephenjdunn profile",
  "netlify: repository ready for first deploy",
  "status: minimal site scaffold online",
];

const footerLines = [
  "help",
  "whoami",
  "open /",
  "deploy --context=staging",
];

const bootLog = document.getElementById("boot-log");
const footerCommand = document.getElementById("footer-command");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function renderBootLog() {
  for (const line of bootLines) {
    const row = document.createElement("p");
    row.textContent = "";
    bootLog.appendChild(row);

    for (const char of line) {
      row.textContent += char;
      await sleep(16);
    }
  }
}

function rotateFooterCommands() {
  let index = 0;
  footerCommand.textContent = footerLines[index];

  window.setInterval(() => {
    index = (index + 1) % footerLines.length;
    footerCommand.textContent = footerLines[index];
  }, 1600);
}

renderBootLog();
rotateFooterCommands();
