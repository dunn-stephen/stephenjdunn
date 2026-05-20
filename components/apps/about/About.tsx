"use client";

import { useSound } from "@/hooks/useSound";
import { useEffect, useRef, useState } from "react";
import type { AppProps } from "@/types";

const SESSION_START_KEY = "os9-session-started-at";
const EASTER_EGG_TRIGGER_CLICKS = 5;
const SITE_LABEL = "stephenjdunn.com";
const SYSTEM_NAME = "Stephen OS 9.2";
const SYSTEM_SUBTITLE = "A browser-based Mac OS 9 portfolio by Stephen Dunn.";

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

export function About({ windowId }: AppProps) {
  const startTime = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [iconClicks, setIconClicks] = useState(0);
  const { play: playClick } = useSound("click");

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
    if (startTime.current === null) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (startTime.current === null) {
        return;
      }

      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const uptimeLabel = formatUptime(elapsed);
  const easterEggUnlocked = iconClicks >= EASTER_EGG_TRIGGER_CLICKS;

  return (
    <div
      data-window-id={windowId}
      className="flex h-full flex-col gap-3 overflow-auto bg-[#dadada] px-4 py-4 text-[12px] leading-4 text-[#242424]"
    >
      <div className="flex items-start gap-4">
        <HappyMacButton
          onClick={() => {
            playClick();
            setIconClicks((currentClicks) => currentClicks + 1);
          }}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <p className="m-0 font-['Chicago'] text-[14px] leading-4">{SYSTEM_NAME}</p>
          <p className="m-0 text-[#3f3f3f]">{SYSTEM_SUBTITLE}</p>
          <p className="m-0 pt-1 font-['Chicago'] text-[12px] leading-4">Stephen Dunn — Software Engineer</p>
          <p className="m-0 text-[#4a4a4a]">
            {iconClicks >= EASTER_EGG_TRIGGER_CLICKS
              ? "Startup disk unlocked."
              : "Open the apps, browse the files, and poke around."}
          </p>
        </div>
      </div>

      <div className="border border-black bg-[#efefef] px-3 py-2 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#b0b0b0]">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] leading-4">
          <span className="font-['Chicago']">Computer:</span>
          <span>Stephen Power Mac G4</span>
          <span className="font-['Chicago']">Processor:</span>
          <span>400 MHz curiosity engine</span>
          <span className="font-['Chicago']">Memory:</span>
          <span>512 MB creative RAM</span>
          <span className="font-['Chicago']">Startup Disk:</span>
          <span>Stephen HD</span>
          <span className="font-['Chicago']">System Software:</span>
          <span>{SYSTEM_NAME}</span>
          <span className="font-['Chicago']">Uptime:</span>
          <span>{uptimeLabel}</span>
        </div>
      </div>

      <div className="h-px bg-[#9b9b9b]" />

      <div className="space-y-2 text-[11px] leading-4">
        <p className="m-0 font-['Chicago'] text-[12px]">{SITE_LABEL}</p>
        <p className="m-0">
          This machine was assembled to showcase projects, writing, experiments, and a mild obsession with old interfaces.
        </p>
        <p className="m-0">
          Built with: Next.js · TypeScript · Tailwind
          <br />
          Zustand · Framer Motion · MDX
        </p>
        <p className="m-0">Deployed on: Netlify</p>
        <p className="m-0">Icons inspired by classic Mac OS 9 resources and credited in this project.</p>
      </div>

      {easterEggUnlocked ? (
        <div className="border border-black bg-[#f7f0bf] px-3 py-2 text-[11px] leading-4 text-[#443d14] shadow-[inset_1px_1px_0_#fff6cc,inset_-1px_-1px_0_#b8af71]">
          Hidden message: still booting weird little ideas.
        </div>
      ) : null}
    </div>
  );
}
