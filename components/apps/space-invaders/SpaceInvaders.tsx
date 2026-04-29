"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSound } from "@/hooks/useSound";
import type { AppProps } from "@/types";
import { INITIAL_SIZE, PLAYER_SPRITE, SPACE_INVADERS_HIGH_SCORE_KEY } from "./constants";
import { createGameState, pauseGame, resizeGame, restartGame, resumeGame, tickGame } from "./game-state";
import { renderGame } from "./render";
import type { GameSize, GameState, HudState, InputState } from "./types";

const DEFAULT_HUD: HudState = {
  phase: "playing",
  pauseReason: null,
  score: 0,
  highScore: 0,
  lives: 3,
  enemiesRemaining: 24
};

interface OverlayCopy {
  title: string;
  detail: string;
  action: string;
}

interface StatBlockProps {
  label: string;
  value: string | number;
}

function readHighScore() {
  if (typeof window === "undefined") {
    return 0;
  }

  const rawValue = window.localStorage.getItem(SPACE_INVADERS_HIGH_SCORE_KEY);
  const parsed = Number.parseInt(rawValue ?? "0", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function snapshotHud(score: number, highScore: number, lives: number, enemiesRemaining: number, phase: HudState["phase"], pauseReason: HudState["pauseReason"]): HudState {
  return {
    score,
    highScore,
    lives,
    enemiesRemaining,
    phase,
    pauseReason
  };
}

function buildHudState(state: GameState) {
  return snapshotHud(
    state.score,
    state.highScore,
    state.lives,
    state.enemies.filter((enemy) => enemy.alive).length,
    state.phase,
    state.pauseReason
  );
}

function getOverlayCopy(hud: HudState): OverlayCopy | null {
  if (hud.phase === "won") {
    return {
      title: "You Win",
      detail: `Final score ${hud.score}. Press R or use Restart.`,
      action: "Restart mission"
    };
  }

  if (hud.phase === "lost") {
    return {
      title: "Game Over",
      detail: `Final score ${hud.score}. High score ${hud.highScore}.`,
      action: "Play again"
    };
  }

  if (hud.phase === "paused") {
    return {
      title: "Paused",
      detail: hud.pauseReason === "hidden" ? "Return to the tab and click the field to resume." : "Click the field to resume.",
      action: "Resume"
    };
  }

  return null;
}

function LifeIcon() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-[repeat(13,3px)] grid-rows-[repeat(8,3px)] gap-px"
    >
      {PLAYER_SPRITE.flatMap((row, rowIndex) => row.map((cell, columnIndex) => (
        <span
          key={`${rowIndex}-${columnIndex}`}
          className={cell ? "bg-[#88ff72]" : "bg-transparent"}
        />
      )))}
    </div>
  );
}

function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="flex min-w-[88px] flex-col rounded-[2px] border border-[#6e7468] bg-[#102314] px-2 py-1 shadow-[inset_1px_1px_0_rgba(205,255,197,0.16)]">
      <span className="font-['Chicago'] text-[10px] uppercase tracking-[0.08em] text-[#8fbc90]">{label}</span>
      <span className="font-mono text-[13px] text-[#e8ffe1]">{value}</span>
    </div>
  );
}

export function SpaceInvaders(_: AppProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<InputState>({ left: false, right: false, fire: false });
  const highScoreRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameRef = useRef<number | null>(null);
  const [hud, setHud] = useState(DEFAULT_HUD);
  const hudRef = useRef<HudState>(DEFAULT_HUD);
  const [gameSize, setGameSize] = useState<GameSize>(INITIAL_SIZE);
  const stateRef = useRef(createGameState(INITIAL_SIZE, 0));
  const { play: playShoot } = useSound("click");
  const { play: playEnemyDestroyed } = useSound("alert");
  const { play: playPlayerHit } = useSound("error");
  const soundRef = useRef({
    playShoot,
    playEnemyDestroyed,
    playPlayerHit
  });

  useEffect(() => {
    hudRef.current = hud;
  }, [hud]);

  useEffect(() => {
    soundRef.current = {
      playShoot,
      playEnemyDestroyed,
      playPlayerHit
    };
  }, [playEnemyDestroyed, playPlayerHit, playShoot]);

  useEffect(() => {
    const nextHighScore = readHighScore();
    highScoreRef.current = nextHighScore;
    const state = restartGame(INITIAL_SIZE, nextHighScore);
    const nextHud = buildHudState(state);
    stateRef.current = state;
    hudRef.current = nextHud;
    previousFrameRef.current = null;

    const frame = window.requestAnimationFrame(() => {
      setHud(nextHud);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const updateSize = () => {
      const rect = viewport.getBoundingClientRect();

      const nextSize = {
        width: Math.max(Math.floor(rect.width), 1),
        height: Math.max(Math.floor(rect.height), 1)
      };

      setGameSize((currentSize) => (
        currentSize.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      ));
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return undefined;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(Math.floor(gameSize.width * dpr), 1);
    canvas.height = Math.max(Math.floor(gameSize.height * dpr), 1);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    stateRef.current = resizeGame(stateRef.current, gameSize);
    renderGame(context, stateRef.current);
  }, [gameSize]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    canvas.focus();

    const loop = (timestamp: number) => {
      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        return;
      }

      if (previousFrameRef.current === null) {
        previousFrameRef.current = timestamp;
      }

      const elapsedSeconds = (timestamp - previousFrameRef.current) / 1000;
      previousFrameRef.current = timestamp;

      const result = tickGame(stateRef.current, inputRef.current, elapsedSeconds);
      stateRef.current = result.state;

      for (const event of result.events) {
        if (event === "shoot") {
          soundRef.current.playShoot();
        } else if (event === "enemy-destroyed") {
          soundRef.current.playEnemyDestroyed();
        } else if (event === "player-hit") {
          soundRef.current.playPlayerHit();
        }
      }

      if (result.state.highScore !== highScoreRef.current) {
        highScoreRef.current = result.state.highScore;
        window.localStorage.setItem(SPACE_INVADERS_HIGH_SCORE_KEY, String(result.state.highScore));
      }

      const nextHud = buildHudState(result.state);

      if (
        nextHud.score !== hudRef.current.score ||
        nextHud.highScore !== hudRef.current.highScore ||
        nextHud.lives !== hudRef.current.lives ||
        nextHud.enemiesRemaining !== hudRef.current.enemiesRemaining ||
        nextHud.phase !== hudRef.current.phase ||
        nextHud.pauseReason !== hudRef.current.pauseReason
      ) {
        hudRef.current = nextHud;
        setHud(nextHud);
      }

      renderGame(context, result.state);
      animationFrameRef.current = window.requestAnimationFrame(loop);
    };

    animationFrameRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      previousFrameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stateRef.current = pauseGame(stateRef.current, "hidden");
        inputRef.current = { left: false, right: false, fire: false };
        const nextHud = buildHudState(stateRef.current);
        hudRef.current = nextHud;
        setHud(nextHud);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const overlayCopy = useMemo(() => getOverlayCopy(hud), [hud]);

  const syncHud = () => {
    const current = stateRef.current;
    const nextHud = buildHudState(current);

    hudRef.current = nextHud;
    setHud(nextHud);
  };

  const handleRestart = () => {
    stateRef.current = restartGame(gameSize, highScoreRef.current);
    inputRef.current = { left: false, right: false, fire: false };
    previousFrameRef.current = null;
    syncHud();
    canvasRef.current?.focus();
  };

  const handleResume = () => {
    stateRef.current = resumeGame(stateRef.current);
    previousFrameRef.current = null;
    syncHud();
    canvasRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === "ArrowLeft") {
      inputRef.current.left = true;
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowRight") {
      inputRef.current.right = true;
      event.preventDefault();
      return;
    }

    if (event.key === " " || event.key === "Spacebar") {
      inputRef.current.fire = true;
      event.preventDefault();
      return;
    }

    if (event.key.toLowerCase() === "r") {
      handleRestart();
      event.preventDefault();
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === "ArrowLeft") {
      inputRef.current.left = false;
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowRight") {
      inputRef.current.right = false;
      event.preventDefault();
      return;
    }

    if (event.key === " " || event.key === "Spacebar") {
      inputRef.current.fire = false;
      event.preventDefault();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#d4d0c8] text-[#1f1f1f]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6f736a] bg-[#1a2e1b] px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <StatBlock label="Score" value={hud.score} />
          <StatBlock label="High" value={hud.highScore} />
          <StatBlock label="Invaders" value={hud.enemiesRemaining} />
        </div>
        <div className="flex items-center gap-2 rounded-[2px] border border-[#6e7468] bg-[#102314] px-2 py-1">
          <span className="font-['Chicago'] text-[10px] uppercase tracking-[0.08em] text-[#8fbc90]">Lives</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: hud.lives }, (_, index) => (
              <LifeIcon key={index} />
            ))}
            {hud.lives === 0 ? <span className="font-mono text-[12px] text-[#e8ffe1]">0</span> : null}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 bg-[#d7d4cb] p-3">
        <div className="os9-surface-inset relative min-h-0 flex-1 overflow-hidden bg-[#081207]">
          <div ref={viewportRef} className="relative h-full w-full">
            <canvas
              ref={canvasRef}
              aria-label="Space Invaders game field"
              className="block h-full w-full cursor-crosshair outline-none"
              tabIndex={0}
              onBlur={() => {
                stateRef.current = pauseGame(stateRef.current, "blur");
                inputRef.current = { left: false, right: false, fire: false };
                syncHud();
              }}
              onClick={() => {
                if (stateRef.current.phase === "paused") {
                  handleResume();
                } else {
                  canvasRef.current?.focus();
                }
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onMouseDown={() => canvasRef.current?.focus()}
            />

            {overlayCopy ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[rgba(5,10,4,0.82)] p-4 text-center">
                <div className="pointer-events-auto flex w-full max-w-[260px] flex-col items-center gap-3 border border-[#6e7468] bg-[#102314] px-4 py-4 shadow-[inset_1px_1px_0_rgba(205,255,197,0.16)]">
                  <p className="font-['Chicago'] text-[14px] text-[#e8ffe1]">{overlayCopy.title}</p>
                  <p className="text-[12px] leading-5 text-[#b1d8b4]">{overlayCopy.detail}</p>
                  <button
                    className="os9-button rounded-[2px] px-4 py-1 text-[11px]"
                    type="button"
                    onClick={hud.phase === "paused" ? handleResume : handleRestart}
                  >
                    {overlayCopy.action}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border border-[#8f8f8f] bg-[#ece9df] px-3 py-2 text-[11px] text-[#314233]">
          <div className="flex flex-wrap gap-3">
            <span>
              <strong className="font-['Chicago']">Controls:</strong> ← → move
            </span>
            <span>Space fire</span>
            <span>R restart</span>
          </div>
          <button className="os9-button rounded-[2px] px-4 py-1 text-[11px]" type="button" onClick={handleRestart}>
            Restart
          </button>
        </footer>
      </div>
    </div>
  );
}
