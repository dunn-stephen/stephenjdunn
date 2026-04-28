"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppId } from "@/lib/os/types";

type MenuBarProps = {
  activeAppId: AppId | null;
  activeWindowId: string | null;
  selectionCount: number;
  soundEnabled: boolean;
  onAbout: () => void;
  onToggleSound: () => void;
  onResetWindows: () => void;
  onNewFinderWindow: () => void;
  onOpenSelection: () => void;
  onCloseWindow: () => void;
  onSetFinderView: (mode: "icons" | "list") => void;
  onOpenHelp: () => void;
};

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

export function MenuBar(props: MenuBarProps) {
  const formatter = useClockLabel();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [tick, setTick] = useState<number | null>(null);

  useEffect(() => {
    const updateTick = () => {
      setTick(Date.now());
    };

    updateTick();
    const interval = window.setInterval(() => {
      updateTick();
    }, 1000 * 30);

    return () => window.clearInterval(interval);
  }, []);

  const time = tick === null ? "" : formatter.format(new Date(tick));
  const menus = [
    {
      id: "apple",
      label: "",
      items: [
        { label: "About Stephen OS", onSelect: props.onAbout, disabled: false },
        { label: props.soundEnabled ? "Sound Off" : "Sound On", onSelect: props.onToggleSound, disabled: false },
        { label: "Reset Window Positions", onSelect: props.onResetWindows, disabled: false }
      ]
    },
    {
      id: "file",
      label: "File",
      items: [
        { label: "New Finder Window", onSelect: props.onNewFinderWindow, disabled: false },
        { label: "Open", onSelect: props.onOpenSelection, disabled: props.selectionCount === 0 },
        { label: "Close Window", onSelect: props.onCloseWindow, disabled: props.activeWindowId === null }
      ]
    },
    {
      id: "view",
      label: "View",
      items: [
        { label: "as Icons", onSelect: () => props.onSetFinderView("icons"), disabled: props.activeAppId !== "finder" },
        { label: "as List", onSelect: () => props.onSetFinderView("list"), disabled: props.activeAppId !== "finder" }
      ]
    },
    {
      id: "help",
      label: "Help",
      items: [
        { label: "Stephen OS Help", onSelect: props.onOpenHelp, disabled: false }
      ]
    }
  ] as const;

  return (
    <div className="fixed inset-x-0 top-0 z-[2000] px-3 pt-2">
      <div className="os9-menubar flex h-7 items-center justify-between px-3">
      <div className="flex items-center gap-1">
        {menus.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((current) => (current === menu.id ? null : menu.id))}
              className={`os9-menubar-button ${openMenu === menu.id ? "os9-menubar-button-active" : ""}`}
            >
              {menu.label}
            </button>
            {openMenu === menu.id ? (
              <div className="os9-menu-dropdown absolute left-0 top-[calc(100%+1px)] min-w-[190px] p-1">
                {menu.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpenMenu(null);
                      if (!item.disabled) {
                        item.onSelect();
                      }
                    }}
                    className={`flex w-full items-center justify-between px-2 py-1 text-left text-[11px] ${
                      item.disabled ? "text-[#8d8d8d]" : "hover:bg-[#dce9fb]"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        <span className="ml-2 text-[11px] font-bold uppercase tracking-[0.12em] text-subtle">
          {props.activeAppId ? props.activeAppId.replace(/-/g, " ") : "Desktop"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-subtle">{time}</div>
        <div className="os9-menubar-status">
          <span aria-hidden="true">◧</span>
          <span>Finder</span>
        </div>
      </div>
      </div>
    </div>
  );
}
