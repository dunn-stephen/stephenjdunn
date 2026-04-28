"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DesktopIcon } from "@/components/desktop/DesktopIcon";
import { useSound } from "@/hooks/useSound";
import { useWindowStore } from "@/lib/window-store";
import type { AppId } from "@/types";

const DESKTOP_ICON_POSITIONS_KEY = "desktop-icon-positions";
const MENUBAR_HEIGHT = 28;
const ICON_WIDTH = 84;
const ICON_HEIGHT = 92;

interface IconPosition {
  x: number;
  y: number;
}

interface DesktopItem {
  id: string;
  label: string;
  icon: string;
  appId?: AppId;
  windowProps?: Record<string, unknown>;
  isVisualOnly?: boolean;
  defaultPosition: IconPosition;
}

const DESKTOP_ITEMS: DesktopItem[] = [
  {
    id: "trash",
    label: "Trash",
    icon: "/icons/png/7.png",
    isVisualOnly: true,
    defaultPosition: { x: 1100, y: 620 }
  },
  {
    id: "read-me",
    label: "Read Me",
    icon: "/icons/png/28.png",
    appId: "textedit",
    defaultPosition: { x: 24, y: 52 }
  },
  {
    id: "resume",
    label: "Resume",
    icon: "/icons/png/79.png",
    appId: "simpletext",
    defaultPosition: { x: 24, y: 148 }
  },
  {
    id: "mail",
    label: "Mail",
    icon: "/icons/png/20.png",
    appId: "mail",
    defaultPosition: { x: 24, y: 244 }
  },
  {
    id: "space-invaders",
    label: "Space Invaders",
    icon: "/icons/png/62.png",
    appId: "space-invaders",
    defaultPosition: { x: 24, y: 340 }
  },
  {
    id: "projects",
    label: "Projects",
    icon: "/icons/png/37.png",
    appId: "finder",
    defaultPosition: { x: 24, y: 436 }
  },
  {
    id: "note-1",
    label: "Note 1",
    icon: "/icons/png/77.png",
    appId: "notepad",
    windowProps: { noteId: 1 },
    defaultPosition: { x: 128, y: 52 }
  },
  {
    id: "note-2",
    label: "Note 2",
    icon: "/icons/png/77.png",
    appId: "notepad",
    windowProps: { noteId: 2 },
    defaultPosition: { x: 128, y: 148 }
  },
  {
    id: "note-3",
    label: "Note 3",
    icon: "/icons/png/77.png",
    appId: "notepad",
    windowProps: { noteId: 3 },
    defaultPosition: { x: 128, y: 244 }
  },
  {
    id: "note-4",
    label: "Note 4",
    icon: "/icons/png/77.png",
    appId: "notepad",
    windowProps: { noteId: 4 },
    defaultPosition: { x: 128, y: 340 }
  }
];

function clampPosition(position: IconPosition, viewport: { width: number; height: number }) {
  return {
    x: Math.max(12, Math.min(position.x, Math.max(12, viewport.width - ICON_WIDTH - 12))),
    y: Math.max(MENUBAR_HEIGHT + 12, Math.min(position.y, Math.max(MENUBAR_HEIGHT + 12, viewport.height - ICON_HEIGHT - 12)))
  };
}

export function DesktopIcons() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const { play: playClick } = useSound("click");
  const { play: playAlert } = useSound("alert");
  const { play: playOpen } = useSound("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });
  const [positions, setPositions] = useState<Record<string, IconPosition>>(() => {
    const defaults = Object.fromEntries(DESKTOP_ITEMS.map((item) => [item.id, item.defaultPosition]));

    if (typeof window === "undefined") {
      return defaults;
    }

    try {
      const raw = window.localStorage.getItem(DESKTOP_ICON_POSITIONS_KEY);

      if (!raw) {
        return defaults;
      }

      const parsed = JSON.parse(raw) as Record<string, IconPosition>;

      return Object.fromEntries(
        DESKTOP_ITEMS.map((item) => [
          item.id,
          parsed[item.id] ?? defaults[item.id]
        ])
      );
    } catch {
      return defaults;
    }
  });
  const dragRef = useRef<{
    id: string;
    startPointer: IconPosition;
    startPosition: IconPosition;
    cleanup: () => void;
  } | null>(null);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const items = useMemo(
    () =>
      DESKTOP_ITEMS.map((item) => ({
        ...item,
        position: clampPosition(positions[item.id] ?? item.defaultPosition, viewport)
      })),
    [positions, viewport]
  );

  function persistPositions(nextPositions: Record<string, IconPosition>) {
    window.localStorage.setItem(DESKTOP_ICON_POSITIONS_KEY, JSON.stringify(nextPositions));
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {items.map((item) => (
        <DesktopIcon
          key={item.id}
          icon={item.icon}
          label={item.label}
          position={item.position}
          selected={selectedId === item.id}
          onClick={() => {
            setSelectedId(item.id);
            playClick();
          }}
          onDoubleClick={() => {
            if (item.isVisualOnly) {
              playAlert();
              window.alert("This feature is not available.");
              return;
            }

            if (!item.appId) {
              return;
            }

            playOpen();
            openWindow(item.appId, item.windowProps);
          }}
          onPointerDown={(event) => {
            event.preventDefault();

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const dragState = dragRef.current;

              if (!dragState || dragState.id !== item.id) {
                return;
              }

              const nextPosition = clampPosition(
                {
                  x: dragState.startPosition.x + (moveEvent.clientX - dragState.startPointer.x),
                  y: dragState.startPosition.y + (moveEvent.clientY - dragState.startPointer.y)
                },
                viewport
              );

              setPositions((current) => ({
                ...current,
                [item.id]: nextPosition
              }));
            };

            const handleMouseUp = (upEvent: MouseEvent) => {
              const dragState = dragRef.current;

              if (!dragState || dragState.id !== item.id) {
                return;
              }

              const nextPosition = clampPosition(
                {
                  x: dragState.startPosition.x + (upEvent.clientX - dragState.startPointer.x),
                  y: dragState.startPosition.y + (upEvent.clientY - dragState.startPointer.y)
                },
                viewport
              );
              const nextPositions = {
                ...positions,
                [item.id]: nextPosition
              };

              setPositions(nextPositions);
              persistPositions(nextPositions);
              dragState.cleanup();
              dragRef.current = null;
            };

            const cleanup = () => {
              window.removeEventListener("mousemove", handleMouseMove);
              window.removeEventListener("mouseup", handleMouseUp);
            };

            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);

            dragRef.current = {
              id: item.id,
              startPointer: { x: event.clientX, y: event.clientY },
              startPosition: item.position,
              cleanup
            };

            setSelectedId(item.id);
          }}
        />
      ))}
    </div>
  );
}
