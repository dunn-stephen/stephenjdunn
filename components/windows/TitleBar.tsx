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
      className={[
        "relative flex h-[22px] items-start justify-center select-none",
        isActive ? "text-[#111111]" : "text-[#666666]"
      ].join(" ")}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleDragMouseDown}
    >
      <button
        aria-label={`Close ${windowState.title}`}
        className={[
          "ml-1 mt-1 h-[11px] w-[11px] border border-white p-0",
          isActive ? "opacity-100" : "opacity-55"
        ].join(" ")}
        style={{ borderStyle: "inset" }}
        type="button"
        onClick={handleClose}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="relative block h-[9px] w-[9px] border border-[#222222] bg-[linear-gradient(to_bottom_right,#999999,#aaaaaa,#bbbbbb,#cccccc,#dddddd,#eeeeee,#ffffff,#ffffff)] shadow-[inset_1px_1px_0_#cccccc,inset_-1px_-1px_0_#888888]">
          <span className="absolute left-0 top-0 h-px w-px bg-white" />
        </span>
      </button>
      <div className={["mt-1 flex h-3 flex-1 px-1", isActive ? "opacity-100" : "opacity-55"].join(" ")}>
        <span
          className="block h-3 w-px"
          style={{
            backgroundImage: `repeating-linear-gradient(${isActive ? "#ffffff 0 1px, #dadada 1px 2px" : "#bdbdbd 0 1px, #dadada 1px 2px"})`
          }}
        />
        <span
          className="block h-3 flex-1"
          style={{
            backgroundImage: `repeating-linear-gradient(${isActive ? "#ffffff 0 1px, #737373 1px 2px" : "#bdbdbd 0 1px, #8a8a8a 1px 2px"})`
          }}
        />
        <span
          className="block h-3 w-px"
          style={{
            backgroundImage: `repeating-linear-gradient(${isActive ? "#dadada 0 1px, #737373 1px 2px" : "#dadada 0 1px, #8a8a8a 1px 2px"})`
          }}
        />
      </div>
      <div
        className={[
          "pointer-events-none mt-[3px] flex min-w-0 max-w-[42%] items-center gap-1 overflow-hidden px-[3px] text-center text-[12px] leading-none",
          isActive ? "opacity-100" : "opacity-50"
        ].join(" ")}
        title={windowState.title}
      >
        <Image
          src={definition.icon}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 shrink-0 object-contain [image-rendering:pixelated]"
        />
        <span className="truncate">{windowState.title}</span>
      </div>
      <div className={["mt-1 flex h-3 flex-1 px-1", isActive ? "opacity-100" : "opacity-55"].join(" ")}>
        <span
          className="block h-3 w-px"
          style={{
            backgroundImage: `repeating-linear-gradient(${isActive ? "#ffffff 0 1px, #dadada 1px 2px" : "#bdbdbd 0 1px, #dadada 1px 2px"})`
          }}
        />
        <span
          className="block h-3 flex-1"
          style={{
            backgroundImage: `repeating-linear-gradient(${isActive ? "#ffffff 0 1px, #737373 1px 2px" : "#bdbdbd 0 1px, #8a8a8a 1px 2px"})`
          }}
        />
        <span
          className="block h-3 w-px"
          style={{
            backgroundImage: `repeating-linear-gradient(${isActive ? "#dadada 0 1px, #737373 1px 2px" : "#dadada 0 1px, #8a8a8a 1px 2px"})`
          }}
        />
      </div>
      <button
        aria-label={windowState.isMaximized ? `Restore ${windowState.title}` : `Zoom ${windowState.title}`}
        className={[
          "mr-[3px] mt-1 h-[11px] w-[11px] border border-white p-0",
          isActive ? "opacity-100" : "opacity-55"
        ].join(" ")}
        style={{ borderStyle: "inset" }}
        type="button"
        onClick={handleZoom}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="relative block h-[9px] w-[9px] border border-[#222222] bg-[linear-gradient(to_bottom_right,#999999,#aaaaaa,#bbbbbb,#cccccc,#dddddd,#eeeeee,#ffffff,#ffffff)] shadow-[inset_1px_1px_0_#cccccc,inset_-1px_-1px_0_#888888]">
          <span className="absolute left-0 top-0 h-px w-px bg-white" />
          <span className="absolute left-px top-px h-[5px] w-[5px] border-b border-r border-[#202020]" />
        </span>
      </button>
      <button
        aria-label={windowState.isShaded ? `Expand ${windowState.title}` : `Collapse ${windowState.title}`}
        className={[
          "mr-1 mt-1 h-[11px] w-[11px] border border-white p-0",
          isActive ? "opacity-100" : "opacity-55"
        ].join(" ")}
        style={{ borderStyle: "inset" }}
        type="button"
        onClick={handleShade}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="relative block h-[9px] w-[9px] border border-[#222222] bg-[linear-gradient(to_bottom_right,#999999,#aaaaaa,#bbbbbb,#cccccc,#dddddd,#eeeeee,#ffffff,#ffffff)] shadow-[inset_1px_1px_0_#cccccc,inset_-1px_-1px_0_#888888]">
          <span className="absolute left-0 top-0 h-px w-px bg-white" />
          <span className="absolute left-px top-1 h-px w-[5px] border-y border-[#202020]" />
        </span>
      </button>
    </div>
  );
}
