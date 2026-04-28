"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppMenu } from "@/components/desktop/AppMenu";
import { AppleMenu } from "@/components/desktop/AppleMenu";

interface MenuBarProps {
  activeAppName: string;
  soundEnabled: boolean;
  onAbout: () => void;
  onToggleSound: () => void;
  onShutDown: () => void;
}

function useClockLabel() {
  return useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit"
      }),
    []
  );
}

export function MenuBar({
  activeAppName,
  soundEnabled,
  onAbout,
  onToggleSound,
  onShutDown
}: MenuBarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formatter = useClockLabel();
  const [openMenu, setOpenMenu] = useState<"apple" | "app" | null>(null);
  const [tick, setTick] = useState<number | null>(null);

  useEffect(() => {
    const updateTick = () => {
      setTick(Date.now());
    };

    updateTick();

    const interval = window.setInterval(updateTick, 1000 * 30);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (openMenu === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [openMenu]);

  const time = tick === null ? "" : formatter.format(new Date(tick));

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 top-0 z-[9999]"
    >
      <div className="os9-menubar flex h-7 items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <AppleMenu
            isOpen={openMenu === "apple"}
            soundEnabled={soundEnabled}
            onToggleOpen={() => setOpenMenu((current) => (current === "apple" ? null : "apple"))}
            onAbout={() => {
              setOpenMenu(null);
              onAbout();
            }}
            onToggleSound={() => {
              onToggleSound();
            }}
            onShutDown={() => {
              setOpenMenu(null);
              onShutDown();
            }}
          />
          <AppMenu
            label={activeAppName}
            isOpen={openMenu === "app"}
            onToggleOpen={() => setOpenMenu((current) => (current === "app" ? null : "app"))}
            onSelect={() => setOpenMenu(null)}
          />
        </div>
        <div className="flex items-center gap-2">
          {!soundEnabled ? (
            <span
              aria-label="Sound muted"
              className="text-[11px] font-bold text-[#3b3b3b]"
            >
              🔇
            </span>
          ) : null}
          <div className="text-[11px] font-bold text-[#222222]">{time}</div>
        </div>
      </div>
    </div>
  );
}
