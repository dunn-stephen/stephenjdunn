"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import { useSound } from "@/hooks/useSound";
import { getAppDefinition } from "@/lib/app-registry";
import { useWindowStore } from "@/lib/window-store";
import type { WindowState } from "@/types";

const MENUBAR_HEIGHT = 19;
const TITLEBAR_HEIGHT = 22;

interface TitleBarProps {
  isActive: boolean;
  windowState: WindowState;
}

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 1440, height: 900 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

export function TitleBar({ isActive, windowState }: TitleBarProps) {
  const definition = getAppDefinition(windowState.appId);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const moveWindow = useWindowStore((state) => state.moveWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const shadeWindow = useWindowStore((state) => state.shadeWindow);
  const { play: playClick } = useSound("click");
  const { play: playClose } = useSound("close");

  const handleDragMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.detail > 1 || windowState.isMaximized) {
      return;
    }

    event.preventDefault();
    focusWindow(windowState.id);

    const startOffsetX = event.clientX - windowState.position.x;
    const startOffsetY = event.clientY - windowState.position.y;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const viewport = getViewportSize();
      const nextX = Math.max(0, Math.min(moveEvent.clientX - startOffsetX, viewport.width - windowState.size.width));
      const frameHeight = windowState.isShaded ? TITLEBAR_HEIGHT : windowState.size.height;
      const maxY = Math.max(MENUBAR_HEIGHT, viewport.height - frameHeight);
      const nextY = Math.max(MENUBAR_HEIGHT, Math.min(moveEvent.clientY - startOffsetY, maxY));

      moveWindow(windowState.id, { x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    focusWindow(windowState.id);
    shadeWindow(windowState.id);
  };

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    playClose();
    closeWindow(windowState.id);
  };

  const handleShade = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    playClick();
    shadeWindow(windowState.id);
  };

  const handleZoom = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    playClick();

    if (windowState.isMaximized) {
      restoreWindow(windowState.id);
      return;
    }

    maximizeWindow(windowState.id);
  };

  return (
    <div
      className="os9-window-frame__header text-[#111111]"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleDragMouseDown}
    >
      <button
        aria-label={`Close ${windowState.title}`}
        className="os9-window-frame__control os9-window-frame__control--close"
        type="button"
        onClick={handleClose}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="os9-window-frame__control-box">
          <span className="os9-window-frame__control-inner">
            <span className="os9-window-frame__control-highlight" />
          </span>
        </span>
      </button>

      <div className="os9-window-frame__titlebar-hit">
        <span className="os9-window-frame__stripe os9-window-frame__stripe--left" />
        <span className="os9-window-frame__stripe os9-window-frame__stripe--center" />
        <span className="os9-window-frame__stripe os9-window-frame__stripe--right" />
      </div>

      <div
        className="pointer-events-none mt-[3px] flex min-w-0 max-w-[42%] items-center gap-1 overflow-hidden px-[3px] text-center"
        title={windowState.title}
      >
        <Image
          src={definition.icon}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 shrink-0 object-contain [image-rendering:pixelated]"
        />
        <span className="os9-window-frame__title truncate font-['Charcoal']">{windowState.title}</span>
      </div>

      <div className="os9-window-frame__titlebar-hit">
        <span className="os9-window-frame__stripe os9-window-frame__stripe--left" />
        <span className="os9-window-frame__stripe os9-window-frame__stripe--center" />
        <span className="os9-window-frame__stripe os9-window-frame__stripe--right" />
      </div>

      {definition.resizable ? (
        <button
          aria-label={windowState.isMaximized ? `Restore ${windowState.title}` : `Zoom ${windowState.title}`}
          className="os9-window-frame__control os9-window-frame__control--zoom"
          type="button"
          onClick={handleZoom}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <span className="os9-window-frame__control-box">
            <span className="os9-window-frame__control-inner">
              <span className="os9-window-frame__control-highlight" />
              <span className="os9-window-frame__zoom-glyph" />
            </span>
          </span>
        </button>
      ) : null}
      <button
        aria-label={windowState.isShaded ? `Expand ${windowState.title}` : `Collapse ${windowState.title}`}
        className="os9-window-frame__control os9-window-frame__control--shade"
        type="button"
        onClick={handleShade}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="os9-window-frame__control-box">
          <span className="os9-window-frame__control-inner">
            <span className="os9-window-frame__control-highlight" />
            <span className="os9-window-frame__shade-glyph" />
          </span>
        </span>
      </button>
    </div>
  );
}
