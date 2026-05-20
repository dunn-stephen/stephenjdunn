"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSound } from "@/hooks/useSound";
import { getAppDefinition } from "@/lib/app-registry";
import { NOTES } from "@/lib/notes-config";
import { useWindowStore } from "@/lib/window-store";

type MenuId = "apple" | "file" | "edit" | "view" | "window" | "special" | "help";

interface MenuBarProps {
  activeAppName: string;
  canCloseActiveApp: boolean;
  soundEnabled: boolean;
  onAbout: () => void;
  onCloseActiveApp: () => void;
  onOpenHelp: () => void;
  onRestart: () => void;
  onShutDown: () => void;
  onSleep: () => void;
  onToggleSound: () => void;
}

interface MenuActionEntry {
  type: "action";
  checked?: boolean;
  disabled?: boolean;
  icon?: string;
  label: string;
  onSelect?: () => void;
  shortcut?: string;
}

interface MenuSeparatorEntry {
  type: "separator";
}

type MenuEntry = MenuActionEntry | MenuSeparatorEntry;

interface MenuDefinition {
  id: MenuId;
  items: MenuEntry[];
  label: string;
}

const SOUND_GLYPH_WIDTH = 17;
const SOUND_GLYPH_HEIGHT = 13;

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

function SoundMenuGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 17 13"
      shapeRendering="crispEdges"
      className="block shrink-0 [image-rendering:pixelated]"
      style={{
        width: SOUND_GLYPH_WIDTH,
        height: SOUND_GLYPH_HEIGHT
      }}
    >
      <rect x="0" y="4" width="2" height="5" fill="#111111" />
      <rect x="2" y="3" width="3" height="7" fill="#c8c6ff" />
      <rect x="5" y="1" width="1" height="11" fill="#111111" />
      <rect x="6" y="0" width="1" height="1" fill="#111111" />
      <rect x="6" y="11" width="1" height="1" fill="#111111" />
      <rect x="6" y="1" width="2" height="2" fill="#6e69ff" />
      <rect x="6" y="9" width="2" height="2" fill="#6e69ff" />
      <rect x="8" y="3" width="1" height="6" fill="#6e69ff" />

      <rect x="10" y="3" width="1" height="1" fill="#7a7a7a" />
      <rect x="10" y="9" width="1" height="1" fill="#7a7a7a" />
      <rect x="11" y="2" width="1" height="1" fill="#b6b6b6" />
      <rect x="11" y="10" width="1" height="1" fill="#b6b6b6" />
      <rect x="12" y="1" width="1" height="1" fill="#7a7a7a" />
      <rect x="12" y="11" width="1" height="1" fill="#7a7a7a" />

      <rect x="11" y="4" width="1" height="1" fill="#7a7a7a" />
      <rect x="11" y="8" width="1" height="1" fill="#7a7a7a" />
      <rect x="12" y="3" width="1" height="1" fill="#b6b6b6" />
      <rect x="12" y="9" width="1" height="1" fill="#b6b6b6" />
      <rect x="13" y="2" width="1" height="1" fill="#7a7a7a" />
      <rect x="13" y="10" width="1" height="1" fill="#7a7a7a" />

      <rect x="12" y="5" width="1" height="1" fill="#7a7a7a" />
      <rect x="12" y="7" width="1" height="1" fill="#7a7a7a" />
      <rect x="13" y="4" width="1" height="1" fill="#b6b6b6" />
      <rect x="13" y="8" width="1" height="1" fill="#b6b6b6" />
      <rect x="14" y="3" width="1" height="1" fill="#7a7a7a" />
      <rect x="14" y="9" width="1" height="1" fill="#7a7a7a" />
    </svg>
  );
}

export function MenuBar({
  activeAppName,
  canCloseActiveApp,
  soundEnabled,
  onAbout,
  onCloseActiveApp,
  onOpenHelp,
  onRestart,
  onShutDown,
  onSleep,
  onToggleSound
}: MenuBarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formatter = useClockLabel();
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const openWindow = useWindowStore((state) => state.openWindow);
  const windows = useWindowStore((state) => state.windows);
  const focusedWindowId = useWindowStore((state) => state.focusedWindowId);
  const { play: playClick } = useSound("click");
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
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

  const openWindows = useMemo(
    () =>
      [...windows]
        .filter((windowState) => windowState.isOpen && !windowState.isMinimized)
        .sort((left, right) => right.zIndex - left.zIndex),
    [windows]
  );

  const menus = useMemo<MenuDefinition[]>(() => [
    {
      id: "apple",
      label: "",
      items: [
        {
          type: "action",
          label: "About This Computer",
          onSelect: onAbout
        },
        { type: "separator" },
        {
          type: "action",
          icon: getAppDefinition("simpletext").icon,
          label: "SimpleText",
          onSelect: () => openWindow("simpletext")
        },
        {
          type: "action",
          icon: getAppDefinition("calculator").icon,
          label: "Calculator",
          onSelect: () => openWindow("calculator")
        },
        {
          type: "action",
          icon: getAppDefinition("notepad").icon,
          label: "Note Pad",
          onSelect: () => openWindow("notepad", { noteId: 1, title: NOTES[1].title })
        },
        { type: "separator" },
        {
          type: "action",
          checked: soundEnabled,
          label: "Sound",
          onSelect: onToggleSound
        }
      ]
    },
    {
      id: "file",
      label: "File",
      items: [
        {
          type: "action",
          disabled: true,
          label: "New Folder",
          shortcut: "⌘N"
        },
        {
          type: "action",
          disabled: true,
          label: "Open",
          shortcut: "⌘O"
        },
        {
          type: "action",
          disabled: true,
          label: "Print",
          shortcut: "⌘P"
        },
        {
          type: "action",
          disabled: true,
          label: "Move To Trash",
          shortcut: "⌘⌫"
        },
        {
          type: "action",
          disabled: !canCloseActiveApp,
          label: "Close Window",
          onSelect: onCloseActiveApp,
          shortcut: "⌘W"
        }
      ]
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        {
          type: "action",
          disabled: true,
          label: "Undo",
          shortcut: "⌘Z"
        },
        { type: "separator" },
        {
          type: "action",
          disabled: true,
          label: "Cut",
          shortcut: "⌘X"
        },
        {
          type: "action",
          disabled: true,
          label: "Copy",
          shortcut: "⌘C"
        },
        {
          type: "action",
          disabled: true,
          label: "Paste",
          shortcut: "⌘V"
        },
        {
          type: "action",
          disabled: true,
          label: "Select All",
          shortcut: "⌘A"
        }
      ]
    },
    {
      id: "view",
      label: "View",
      items: [
        {
          type: "action",
          disabled: true,
          label: "as Icons"
        },
        {
          type: "action",
          disabled: true,
          label: "as Buttons"
        },
        {
          type: "action",
          disabled: true,
          label: "as List"
        },
        { type: "separator" },
        {
          type: "action",
          disabled: true,
          label: "Clean Up"
        },
        {
          type: "action",
          disabled: true,
          label: "Arrange"
        }
      ]
    },
    {
      id: "window",
      label: "Window",
      items: [
        {
          type: "action",
          checked: focusedWindowId === null,
          label: "Desktop"
        },
        { type: "separator" },
        ...openWindows.map<MenuActionEntry>((windowState) => ({
          type: "action",
          checked: windowState.id === focusedWindowId,
          label: windowState.title,
          onSelect: () => focusWindow(windowState.id)
        }))
      ]
    },
    {
      id: "special",
      label: "Special",
      items: [
        {
          type: "action",
          label: "Sleep",
          onSelect: onSleep
        },
        {
          type: "action",
          label: "Restart",
          onSelect: onRestart
        },
        {
          type: "action",
          label: "Shut Down",
          onSelect: onShutDown
        }
      ]
    },
    {
      id: "help",
      label: "Help",
      items: [
        {
          type: "action",
          label: "Help Center",
          onSelect: onOpenHelp
        },
        { type: "separator" },
        {
          type: "action",
          disabled: true,
          label: "Mac Help",
          shortcut: "⌘?"
        }
      ]
    }
  ], [
    canCloseActiveApp,
    focusedWindowId,
    onAbout,
    onCloseActiveApp,
    onOpenHelp,
    onRestart,
    onShutDown,
    onSleep,
    onToggleSound,
    openWindow,
    openWindows,
    soundEnabled,
    focusWindow
  ]);

  const time = tick === null ? "" : formatter.format(new Date(tick));
  const soundButtonLabel = soundEnabled ? "Disable sounds" : "Enable sounds";

  const handleSoundToggle = () => {
    setOpenMenu(null);

    if (soundEnabled) {
      playClick();
      onToggleSound();
      return;
    }

    onToggleSound();
    playClick();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 top-0 z-[9999]"
    >
      <div className="os9-menubar flex h-[19px] items-start border-b border-black text-[12px] leading-none [image-rendering:pixelated]">
        <div className="flex h-full items-start">
          {menus.map((menu) => {
            const isOpen = openMenu === menu.id;

            return (
              <div
                key={menu.id}
                className="relative h-full"
                onPointerEnter={() => {
                  if (openMenu !== null && openMenu !== menu.id) {
                    setOpenMenu(menu.id);
                  }
                }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  className={[
                    "os9-menubar-button flex h-[18px] items-center text-left",
                    menu.id === "apple" ? "min-w-[24px] justify-center px-[7px]" : "",
                    isOpen ? "os9-menubar-button-active" : "text-black"
                  ].join(" ")}
                  onClick={() => {
                    playClick();
                    setOpenMenu((current) => (current === menu.id ? null : menu.id));
                  }}
                >
                  {menu.label}
                </button>
                {isOpen ? (
                  <div className="os9-menu-dropdown absolute left-0 top-[18px] z-[10001] min-w-[180px] py-px">
                    {menu.items.map((item, index) => {
                      if (item.type === "separator") {
                        return (
                          <div
                            key={`${menu.id}-separator-${index}`}
                            className="os9-menu-separator"
                          />
                        );
                      }

                      return (
                        <button
                          key={`${menu.id}-${item.label}`}
                          type="button"
                          disabled={item.disabled}
                          className="os9-menu-item cursor-default"
                          data-has-icon={item.icon ? "true" : "false"}
                          onClick={() => {
                            if (item.disabled) {
                              return;
                            }

                            playClick();
                            item.onSelect?.();
                            setOpenMenu(null);
                          }}
                        >
                          {item.checked ? (
                            <span className="absolute left-[5px] top-1/2 -translate-y-1/2 text-[11px]">✓</span>
                          ) : null}
                          {item.icon ? (
                            <Image
                              src={item.icon}
                              alt=""
                              width={16}
                              height={16}
                              className="absolute left-[4px] top-1/2 h-4 w-4 -translate-y-1/2 object-contain [image-rendering:pixelated]"
                            />
                          ) : null}
                          <span className="truncate">{item.label}</span>
                          {item.shortcut ? (
                            <span className="pl-6 text-[11px]">{item.shortcut}</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="flex h-full items-center">
          <div className="os9-menubar-status ml-[8px] mr-[7px] text-black">{time}</div>
          <button
            type="button"
            aria-label={soundButtonLabel}
            aria-pressed={soundEnabled}
            title={soundButtonLabel}
            className="os9-menubar-sound-toggle mr-[4px]"
            data-enabled={soundEnabled ? "true" : "false"}
            onClick={handleSoundToggle}
          >
            <SoundMenuGlyph />
          </button>
          <div
            aria-hidden="true"
            className="os9-menubar-divider"
          />
          <div className="os9-menubar-status ml-[8px] mr-[7px] text-black">
            <span>{activeAppName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
