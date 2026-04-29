export type GamePhase = "playing" | "paused" | "won" | "lost";

export type PauseReason = "blur" | "hidden" | null;

export type GameEvent = "shoot" | "enemy-destroyed" | "player-hit";

export type Sprite = ReadonlyArray<ReadonlyArray<number>>;

export interface GameSize {
  width: number;
  height: number;
}

export interface Bullet {
  id: number;
  owner: "player" | "enemy";
  x: number;
  y: number;
  vy: number;
}

export interface EnemySpriteSet {
  base: Sprite;
  alt: Sprite;
}

export interface Enemy {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  alive: boolean;
  frame: 0 | 1;
  color: string;
  sprites: EnemySpriteSet;
}

export interface InputState {
  left: boolean;
  right: boolean;
  fire: boolean;
}

export interface GameState {
  phase: GamePhase;
  pauseReason: PauseReason;
  size: GameSize;
  score: number;
  highScore: number;
  lives: number;
  playerX: number;
  playerInvulnerability: number;
  playerFireCooldown: number;
  bullets: Bullet[];
  enemies: Enemy[];
  enemyDirection: 1 | -1;
  enemyMoveAccumulator: number;
  enemyShotCooldown: number;
  bulletSeed: number;
}

export interface TickResult {
  state: GameState;
  events: GameEvent[];
}

export interface HudState {
  phase: GamePhase;
  pauseReason: PauseReason;
  score: number;
  highScore: number;
  lives: number;
  enemiesRemaining: number;
}
