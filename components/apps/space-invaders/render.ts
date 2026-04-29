import { COLORS, PLAYER_SPRITE } from "./constants";
import { getEnemySize, getPlayerSize } from "./game-state";
import type { GameState, Sprite } from "./types";

function drawSprite(
  context: CanvasRenderingContext2D,
  sprite: Sprite,
  x: number,
  y: number,
  scale: number,
  color: string
) {
  context.fillStyle = color;

  for (let row = 0; row < sprite.length; row += 1) {
    for (let column = 0; column < sprite[row].length; column += 1) {
      if (!sprite[row][column]) {
        continue;
      }

      context.fillRect(x + column * scale, y + row * scale, scale, scale);
    }
  }
}

export function renderGame(context: CanvasRenderingContext2D, state: GameState) {
  const { width, height } = state.size;

  context.clearRect(0, 0, width, height);
  context.fillStyle = COLORS.background;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = COLORS.grid;
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += 28) {
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += 24) {
    context.beginPath();
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
    context.stroke();
  }

  context.restore();

  const playerSize = getPlayerSize(state.size);
  const playerScale = (playerSize.width * width) / PLAYER_SPRITE[0].length;
  const playerX = state.playerX * width - (playerSize.width * width) / 2;
  const playerY = 0.92 * height - (playerSize.height * height) / 2;

  if (state.playerInvulnerability <= 0 || Math.floor(state.playerInvulnerability * 10) % 2 === 0) {
    drawSprite(context, PLAYER_SPRITE, playerX, playerY, playerScale, COLORS.player);
  }

  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }

    const enemySize = getEnemySize(enemy, state.size);
    const sprite = enemy.frame === 0 ? enemy.sprites.base : enemy.sprites.alt;
    const scale = (enemySize.width * width) / sprite[0].length;
    drawSprite(context, sprite, enemy.x * width, enemy.y * height, scale, enemy.color);
  }

  for (const bullet of state.bullets) {
    context.fillStyle = bullet.owner === "player" ? COLORS.bullet : COLORS.enemyBullet;
    const bulletWidth = bullet.owner === "player" ? 3 : 4;
    const bulletHeight = bullet.owner === "player" ? 12 : 14;
    context.fillRect(
      bullet.x * width - bulletWidth / 2,
      bullet.y * height - bulletHeight / 2,
      bulletWidth,
      bulletHeight
    );
  }

  context.save();
  context.strokeStyle = "rgba(136, 255, 114, 0.35)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(18, height - 28);
  context.lineTo(width - 18, height - 28);
  context.stroke();
  context.restore();
}
