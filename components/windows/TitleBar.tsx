"use client";

import type { MouseEvent } from "react";
import { useSound } from "@/hooks/useSound";
import { useWindowStore } from "@/lib/window-store";
import type { WindowState } from "@/types";

const MENUBAR_HEIGHT = 28;
const TITLEBAR_HEIGHT = 28;

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
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
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

  const handleMinimize = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    playClick();
    minimizeWindow(windowState.id);
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
      className={[
        "relative flex h-7 items-center justify-center border-b border-[#4b4b4b] px-3 select-none",
        isActive
          ? "bg-[linear-gradient(180deg,#cccccc_0%,#bcbcbc_50%,#aaaaaa_100%)] text-[#111111]"
          : "bg-[#dddddd] text-[#666666]"
      ].join(" ")}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleDragMouseDown}
    >
      <div className="absolute left-2 flex items-center gap-2">
        <button
          aria-label={`Close ${windowState.title}`}
          className="h-3 w-3 rounded-full border border-[#6f2020] bg-[#ff5f57] shadow-[inset_1px_1px_0_rgba(255,255,255,0.45)]"
          type="button"
          onClick={handleClose}
          onMouseDown={(event) => event.stopPropagation()}
        />
        <button
          aria-label={`Minimize ${windowState.title}`}
          className="h-3 w-3 rounded-full border border-[#8f6813] bg-[#febc2e] shadow-[inset_1px_1px_0_rgba(255,255,255,0.45)]"
          type="button"
          onClick={handleMinimize}
          onMouseDown={(event) => event.stopPropagation()}
        />
        <button
          aria-label={windowState.isMaximized ? `Restore ${windowState.title}` : `Zoom ${windowState.title}`}
          className="h-3 w-3 rounded-full border border-[#21682b] bg-[#28c840] shadow-[inset_1px_1px_0_rgba(255,255,255,0.45)]"
          type="button"
          onClick={handleZoom}
          onMouseDown={(event) => event.stopPropagation()}
        />
      </div>
      <div
        className={[
          "pointer-events-none max-w-[70%] truncate px-14 text-center text-[13px] leading-none tracking-[0.01em]",
          isActive ? "font-bold text-[#111111]" : "font-normal text-[#6a6a6a]"
        ].join(" ")}
      >
        {windowState.title}
      </div>
    </div>
  );
}
