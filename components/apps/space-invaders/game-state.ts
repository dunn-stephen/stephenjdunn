import { ENEMY_COLUMNS, ENEMY_ROWS, INITIAL_SIZE, PLAYER_LIVES, ROW_CONFIG } from "./constants";
import type { Enemy, GamePhase, GameSize, GameState, InputState, PauseReason, TickResult } from "./types";

const FIELD_LEFT = 0.08;
const FIELD_RIGHT = 0.92;
const ENEMY_START_X = 0.12;
const ENEMY_START_Y = 0.14;
const ENEMY_GAP_X = 0.03;
const ENEMY_GAP_Y = 0.06;
const ENEMY_DROP_STEP = 0.055;
const PLAYER_Y = 0.92;
const PLAYER_SPEED = 0.78;
const PLAYER_BULLET_SPEED = -1.28;
const ENEMY_BULLET_SPEED = 0.48;
const PLAYER_FIRE_COOLDOWN = 0.16;
const PLAYER_INVULNERABILITY = 1.1;
const BASE_ENEMY_SHOT_COOLDOWN = 1.05;
const MIN_ENEMY_SHOT_COOLDOWN = 0.26;
const BASE_ENEMY_MOVE_INTERVAL = 0.62;
const MIN_ENEMY_MOVE_INTERVAL = 0.1;
const BASE_ENEMY_MOVE_STEP = 0.014;
const MAX_ENEMY_MOVE_STEP = 0.03;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getScale(size: GameSize) {
  return clamp(Math.min(size.width / 440, size.height / 320), 0.78, 1.45);
}

export function getPlayerSize(size: GameSize) {
  const scale = getScale(size);

  return {
    width: (26 * scale) / size.width,
    height: (16 * scale) / size.height
  };
}

export function getEnemySize(enemy: Enemy, size: GameSize) {
  const scale = getScale(size) * (enemy.row === 0 ? 1.08 : enemy.row === 1 ? 1 : 0.94);
  const sprite = enemy.sprites.base;

  return {
    width: (sprite[0].length * 2.35 * scale) / size.width,
    height: (sprite.length * 2.35 * scale) / size.height
  };
}

function createEnemies(): Enemy[] {
  const enemies: Enemy[] = [];
  let id = 1;
  let currentY = ENEMY_START_Y;

  for (let row = 0; row < ENEMY_ROWS; row += 1) {
    const rowConfig = ROW_CONFIG[row];
    let currentX = ENEMY_START_X;

    for (let col = 0; col < ENEMY_COLUMNS; col += 1) {
      const sampleWidth = (rowConfig.sprites.base[0].length * 2.35) / INITIAL_SIZE.width;
      enemies.push({
        id,
        row,
        col,
        x: currentX,
        y: currentY,
        alive: true,
        frame: 0,
        color: rowConfig.color,
        sprites: rowConfig.sprites
      });
      currentX += sampleWidth + ENEMY_GAP_X;
      id += 1;
    }

    const sampleHeight = (rowConfig.sprites.base.length * 2.35) / INITIAL_SIZE.height;
    currentY += sampleHeight + ENEMY_GAP_Y;
  }

  return enemies;
}

function createState(size: GameSize, highScore: number): GameState {
  return {
    phase: "playing",
    pauseReason: null,
    size,
    score: 0,
    highScore,
    lives: PLAYER_LIVES,
    playerX: 0.5,
    playerInvulnerability: 0,
    playerFireCooldown: 0,
    bullets: [],
    enemies: createEnemies(),
    enemyDirection: 1,
    enemyMoveAccumulator: 0,
    enemyShotCooldown: BASE_ENEMY_SHOT_COOLDOWN,
    bulletSeed: 1
  };
}

function getAliveEnemies(state: GameState) {
  return state.enemies.filter((enemy) => enemy.alive);
}

function getEnemyProgress(state: GameState) {
  return 1 - getAliveEnemies(state).length / (ENEMY_COLUMNS * ENEMY_ROWS);
}

function getEnemyMoveInterval(state: GameState) {
  return clamp(
    BASE_ENEMY_MOVE_INTERVAL - getEnemyProgress(state) * 0.48,
    MIN_ENEMY_MOVE_INTERVAL,
    BASE_ENEMY_MOVE_INTERVAL
  );
}

function getEnemyMoveStep(state: GameState) {
  return clamp(
    BASE_ENEMY_MOVE_STEP + getEnemyProgress(state) * 0.016,
    BASE_ENEMY_MOVE_STEP,
    MAX_ENEMY_MOVE_STEP
  );
}

function getEnemyShotCooldown(state: GameState) {
  const spread = BASE_ENEMY_SHOT_COOLDOWN - getEnemyProgress(state) * 0.55;

  return clamp(spread + Math.random() * 0.16, MIN_ENEMY_SHOT_COOLDOWN, BASE_ENEMY_SHOT_COOLDOWN);
}

function pickEnemyShooter(enemies: Enemy[]) {
  const lowestByColumn = new Map<number, Enemy>();

  for (const enemy of enemies) {
    const current = lowestByColumn.get(enemy.col);

    if (!current || enemy.y > current.y) {
      lowestByColumn.set(enemy.col, enemy);
    }
  }

  const candidates = [...lowestByColumn.values()];

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

function intersectsBullet(enemy: Enemy, bulletX: number, bulletY: number, size: GameSize) {
  const enemySize = getEnemySize(enemy, size);

  return (
    bulletX >= enemy.x &&
    bulletX <= enemy.x + enemySize.width &&
    bulletY >= enemy.y &&
    bulletY <= enemy.y + enemySize.height
  );
}

function updateHighScore(score: number, currentHighScore: number) {
  return score > currentHighScore ? score : currentHighScore;
}

function withPhase(state: GameState, phase: GamePhase, pauseReason: PauseReason) {
  return {
    ...state,
    phase,
    pauseReason
  };
}

export function createGameState(size: GameSize, highScore: number) {
  return createState(size, highScore);
}

export function restartGame(size: GameSize, highScore: number) {
  return createState(size, highScore);
}

export function resizeGame(state: GameState, size: GameSize) {
  const playerSize = getPlayerSize(size);

  return {
    ...state,
    size,
    playerX: clamp(state.playerX, FIELD_LEFT + playerSize.width / 2, FIELD_RIGHT - playerSize.width / 2)
  };
}

export function pauseGame(state: GameState, reason: PauseReason) {
  if (state.phase !== "playing") {
    return state;
  }

  return withPhase(state, "paused", reason);
}

export function resumeGame(state: GameState) {
  if (state.phase !== "paused") {
    return state;
  }

  return withPhase(state, "playing", null);
}

export function tickGame(current: GameState, input: InputState, elapsedSeconds: number): TickResult {
  if (current.phase !== "playing") {
    return {
      state: current,
      events: []
    };
  }

  const dt = Math.min(elapsedSeconds, 0.05);
  const state: GameState = {
    ...current,
    playerFireCooldown: Math.max(current.playerFireCooldown - dt, 0),
    playerInvulnerability: Math.max(current.playerInvulnerability - dt, 0),
    enemyMoveAccumulator: current.enemyMoveAccumulator + dt,
    enemyShotCooldown: current.enemyShotCooldown - dt,
    bullets: current.bullets.map((bullet) => ({
      ...bullet,
      y: bullet.y + bullet.vy * dt
    })),
    enemies: current.enemies.map((enemy) => ({
      ...enemy
    }))
  };
  const events: TickResult["events"] = [];
  const playerSize = getPlayerSize(state.size);

  if (input.left === input.right) {
    state.playerX = clamp(state.playerX, FIELD_LEFT + playerSize.width / 2, FIELD_RIGHT - playerSize.width / 2);
  } else if (input.left) {
    state.playerX = clamp(
      state.playerX - PLAYER_SPEED * dt,
      FIELD_LEFT + playerSize.width / 2,
      FIELD_RIGHT - playerSize.width / 2
    );
  } else if (input.right) {
    state.playerX = clamp(
      state.playerX + PLAYER_SPEED * dt,
      FIELD_LEFT + playerSize.width / 2,
      FIELD_RIGHT - playerSize.width / 2
    );
  }

  const hasPlayerBullet = state.bullets.some((bullet) => bullet.owner === "player");

  if (input.fire && !hasPlayerBullet && state.playerFireCooldown <= 0) {
    state.bullets.push({
      id: state.bulletSeed,
      owner: "player",
      x: state.playerX,
      y: PLAYER_Y - playerSize.height / 2,
      vy: PLAYER_BULLET_SPEED
    });
    state.bulletSeed += 1;
    state.playerFireCooldown = PLAYER_FIRE_COOLDOWN;
    events.push("shoot");
  }

  const moveInterval = getEnemyMoveInterval(state);

  while (state.enemyMoveAccumulator >= moveInterval) {
    state.enemyMoveAccumulator -= moveInterval;

    const aliveEnemies = getAliveEnemies(state);
    const step = getEnemyMoveStep(state);
    let shouldDrop = false;

    for (const enemy of aliveEnemies) {
      const enemySize = getEnemySize(enemy, state.size);
      const nextX = enemy.x + step * state.enemyDirection;

      if (nextX < FIELD_LEFT || nextX + enemySize.width > FIELD_RIGHT) {
        shouldDrop = true;
        break;
      }
    }

    if (shouldDrop) {
      state.enemyDirection = state.enemyDirection === 1 ? -1 : 1;
      state.enemies = state.enemies.map((enemy) => (
        enemy.alive
          ? { ...enemy, y: enemy.y + ENEMY_DROP_STEP, frame: enemy.frame === 0 ? 1 : 0 }
          : enemy
      ));
    } else {
      state.enemies = state.enemies.map((enemy) => (
        enemy.alive
          ? {
              ...enemy,
              x: enemy.x + step * state.enemyDirection,
              frame: enemy.frame === 0 ? 1 : 0
            }
          : enemy
      ));
    }
  }

  if (state.enemyShotCooldown <= 0) {
    const shooter = pickEnemyShooter(getAliveEnemies(state));

    if (shooter) {
      const enemySize = getEnemySize(shooter, state.size);
      state.bullets.push({
        id: state.bulletSeed,
        owner: "enemy",
        x: shooter.x + enemySize.width / 2,
        y: shooter.y + enemySize.height,
        vy: ENEMY_BULLET_SPEED
      });
      state.bulletSeed += 1;
    }

    state.enemyShotCooldown = getEnemyShotCooldown(state);
  }

  state.bullets = state.bullets.filter((bullet) => bullet.y > -0.08 && bullet.y < 1.08);

  const playerBullet = state.bullets.find((bullet) => bullet.owner === "player") ?? null;

  if (playerBullet) {
    const target = state.enemies.find((enemy) => enemy.alive && intersectsBullet(enemy, playerBullet.x, playerBullet.y, state.size));

    if (target) {
      state.bullets = state.bullets.filter((bullet) => bullet.id !== playerBullet.id);
      state.enemies = state.enemies.map((enemy) => (
        enemy.id === target.id ? { ...enemy, alive: false } : enemy
      ));
      state.score += 10;
      state.highScore = updateHighScore(state.score, state.highScore);
      events.push("enemy-destroyed");
    }
  }

  const playerTop = PLAYER_Y - playerSize.height / 2;
  const playerBottom = PLAYER_Y + playerSize.height / 2;
  const playerLeft = state.playerX - playerSize.width / 2;
  const playerRight = state.playerX + playerSize.width / 2;

  if (state.playerInvulnerability <= 0) {
    const hitBullet = state.bullets.find((bullet) => (
      bullet.owner === "enemy" &&
      bullet.x >= playerLeft &&
      bullet.x <= playerRight &&
      bullet.y >= playerTop &&
      bullet.y <= playerBottom
    ));

    if (hitBullet) {
      state.bullets = state.bullets.filter((bullet) => bullet.id !== hitBullet.id);
      state.lives -= 1;
      state.playerInvulnerability = PLAYER_INVULNERABILITY;
      events.push("player-hit");

      if (state.lives <= 0) {
        return {
          state: withPhase(
            {
              ...state,
              highScore: updateHighScore(state.score, state.highScore)
            },
            "lost",
            null
          ),
          events
        };
      }
    }
  }

  const enemyReachedBottom = getAliveEnemies(state).some((enemy) => {
    const enemySize = getEnemySize(enemy, state.size);

    return enemy.y + enemySize.height >= PLAYER_Y - playerSize.height;
  });

  if (enemyReachedBottom) {
    return {
      state: withPhase(
        {
          ...state,
          lives: 0,
          highScore: updateHighScore(state.score, state.highScore)
        },
        "lost",
        null
      ),
      events
    };
  }

  if (getAliveEnemies(state).length === 0) {
    return {
      state: withPhase(
        {
          ...state,
          highScore: updateHighScore(state.score, state.highScore)
        },
        "won",
        null
      ),
      events
    };
  }

  return {
    state,
    events
  };
}
