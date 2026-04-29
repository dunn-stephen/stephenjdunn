"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_START_KEY = "os9-session-started-at";
const EASTER_EGG_TRIGGER_CLICKS = 5;
const SITE_LABEL = "stephenjdunn.com";

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
  onEasterEgg?: () => void;
}

function formatUptime(elapsedSeconds: number) {
  const totalSeconds = Math.max(0, elapsedSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

interface HappyMacButtonProps {
  onClick: () => void;
}

function HappyMacButton({ onClick }: HappyMacButtonProps) {
  return (
    <button
      aria-label="Happy Mac"
      className="relative flex h-16 w-16 items-end justify-center border border-[#5f5f5f] bg-[linear-gradient(180deg,#fbfbfb_0%,#d8d8d8_100%)] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#8f8f8f] transition-none active:translate-y-px"
      type="button"
      onClick={onClick}
    >
      <div className="absolute left-[9px] top-[6px] h-[38px] w-[46px] border border-[#4f4f4f] bg-[linear-gradient(180deg,#9bc2fb_0%,#4e7ccc_100%)] shadow-[inset_1px_1px_0_rgba(255,255,255,0.7)]">
        <div className="absolute left-[12px] top-[10px] h-[4px] w-[4px] bg-[#13224f]" />
        <div className="absolute right-[12px] top-[10px] h-[4px] w-[4px] bg-[#13224f]" />
        <div className="absolute left-[11px] top-[20px] h-[9px] w-[24px] rounded-b-[14px] border-b-[3px] border-[#13224f]" />
      </div>
      <div className="absolute bottom-[13px] h-[6px] w-[34px] border border-[#717171] bg-[#b7b7b7]" />
      <div className="absolute bottom-[7px] h-[6px] w-[50px] border border-[#6a6a6a] bg-[linear-gradient(180deg,#dddddd_0%,#adadad_100%)]" />
    </button>
  );
}

export function About({ isOpen, onClose, onEasterEgg }: AboutProps) {
  const startTime = useRef<number | null>(null);
  const easterEggTriggered = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [iconClicks, setIconClicks] = useState(0);

  useEffect(() => {
    if (startTime.current !== null) {
      return undefined;
    }

    const storedValue = window.sessionStorage.getItem(SESSION_START_KEY);
    const parsedValue = storedValue ? Number(storedValue) : Number.NaN;
    const initialStartTime = Number.isFinite(parsedValue) ? parsedValue : Date.now();

    startTime.current = initialStartTime;
    window.sessionStorage.setItem(SESSION_START_KEY, String(initialStartTime));

    return undefined;
  }, []);

  useEffect(() => {
    if (!isOpen || startTime.current === null) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (startTime.current === null) {
        return;
      }

      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (iconClicks < EASTER_EGG_TRIGGER_CLICKS || easterEggTriggered.current) {
      return;
    }

    easterEggTriggered.current = true;
    onEasterEgg?.();
  }, [iconClicks, onEasterEgg]);

  if (!isOpen) {
    return null;
  }

  const uptimeLabel = formatUptime(elapsed);
  const easterEggUnlocked = iconClicks >= EASTER_EGG_TRIGGER_CLICKS;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(0,0,0,0.18)] px-4"
    >
      <div
        aria-modal="true"
        className="os9-window h-[280px] w-[360px] bg-[#d6d6d6]"
        role="dialog"
      >
        <div className="os9-titlebar">
          <div className="os9-titlebar-label">About This Computer</div>
          <button
            type="button"
            onClick={onClose}
            className="os9-button px-2 py-0 text-[10px]"
          >
            Close
          </button>
        </div>

        <div className="os9-window-body flex h-[calc(280px-28px)] flex-col gap-3 overflow-hidden px-4 py-4 text-[12px] leading-4 text-[#242424]">
          <div className="flex items-start gap-4">
            <HappyMacButton
              onClick={() => setIconClicks((currentClicks) => currentClicks + 1)}
            />

            <div className="min-w-0 flex-1 space-y-1">
              <p className="m-0 font-['Chicago'] text-[14px] leading-4">Mac OS 9.2.2</p>
              <p className="m-0 text-[#3f3f3f]">© Apple Computer, Inc.</p>
              <p className="m-0 pt-1 font-['Chicago'] text-[12px] leading-4">Stephen Dunn — Software Engineer</p>
              <p className="m-0 text-[#4a4a4a]">{iconClicks >= EASTER_EGG_TRIGGER_CLICKS ? "Startup disk unlocked." : "Power Mac G4 (pretend)"}</p>
            </div>
          </div>

          <div className="os9-surface-inset bg-[#efefef] px-3 py-2">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] leading-4">
              <span className="font-['Chicago']">Built-in Memory:</span>
              <span>256 MB</span>
              <span className="font-['Chicago']">Virtual Memory:</span>
              <span>Off</span>
              <span className="font-['Chicago']">Uptime:</span>
              <span>{uptimeLabel}</span>
            </div>
          </div>

          <div className="h-px bg-[#9b9b9b]" />

          <div className="space-y-2 text-[11px] leading-4">
            <p className="m-0 font-['Chicago'] text-[12px]">{SITE_LABEL}</p>
            <p className="m-0">
              Built with: Next.js · TypeScript · Tailwind
              <br />
              Zustand · Framer Motion · MDX
            </p>
            <p className="m-0">Deployed on: Netlify</p>
            <p className="m-0">Icons: bearz314/MacOS9-icons (MIT)</p>
          </div>

          {easterEggUnlocked ? (
            <div className="os9-surface-outset bg-[#f7f0bf] px-3 py-2 text-[11px] leading-4 text-[#443d14]">
              Hidden message: still booting weird little ideas.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
