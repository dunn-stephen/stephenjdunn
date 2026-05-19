"use client";

import type { MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWindowStore } from "@/lib/window-store";
import { getAppDefinition } from "@/lib/app-registry";
import type { WindowSize, WindowState } from "@/types";
import { TitleBar } from "@/components/windows/TitleBar";

const TITLEBAR_HEIGHT = 22;
const RESIZE_HANDLE_SIZE = 16;

interface WindowFrameProps {
  isActive: boolean;
  windowState: WindowState;
}

interface WindowPlaceholderProps {
  appName: string;
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

function getMaxSize(positionX: number, positionY: number) {
  const viewport = getViewportSize();

  return {
    width: Math.max(0, viewport.width - positionX),
    height: Math.max(TITLEBAR_HEIGHT, viewport.height - positionY)
  };
}

function WindowPlaceholder({ appName }: WindowPlaceholderProps) {
  return (
    <div className="flex h-full items-center justify-center bg-[#f1f1f1] p-6 text-center text-[12px] text-[#4f4f4f]">
      <div className="max-w-[240px] space-y-2">
        <p className="font-['Chicago'] text-[13px] text-[#222222]">{appName}</p>
        <p>App content is not registered yet.</p>
      </div>
    </div>
  );
}

function clampResize(size: WindowSize, minSize: WindowSize, positionX: number, positionY: number) {
  const maxSize = getMaxSize(positionX, positionY);

  return {
    width: Math.max(minSize.width, Math.min(size.width, maxSize.width)),
    height: Math.max(minSize.height, Math.min(size.height, maxSize.height))
  };
}

export function WindowFrame({ isActive, windowState }: WindowFrameProps) {
  const definition = getAppDefinition(windowState.appId);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const resizeWindow = useWindowStore((state) => state.resizeWindow);
  const AppComponent = definition?.component;
  const showResizeHandle = definition.resizable && !windowState.isShaded && !windowState.isMaximized;
  const frameHeight = windowState.isShaded ? TITLEBAR_HEIGHT : windowState.size.height;
  const contentHeight = Math.max(0, windowState.size.height - TITLEBAR_HEIGHT);

  const handleResizeMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !definition.resizable || windowState.isShaded || windowState.isMaximized) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    focusWindow(windowState.id);

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = windowState.size.width;
    const startHeight = windowState.size.height;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const nextSize = clampResize(
        {
          width: startWidth + (moveEvent.clientX - startX),
          height: startHeight + (moveEvent.clientY - startY)
        },
        definition.minSize,
        windowState.position.x,
        windowState.position.y
      );

      resizeWindow(windowState.id, nextSize);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <motion.div
      className="os9-window-frame absolute flex flex-col overflow-hidden"
      data-focused={isActive}
      exit={{
        opacity: 0,
        scale: 0.85,
        transition: { duration: 0.1, ease: "easeOut" }
      }}
      initial={{
        opacity: 0,
        scale: 0.85
      }}
      animate={{
        opacity: 1,
        scale: 1,
        height: frameHeight
      }}
      style={{
        left: windowState.position.x,
        top: windowState.position.y,
        width: windowState.size.width,
        zIndex: windowState.zIndex
      }}
      transition={{
        opacity: { duration: 0.15, ease: "easeOut" },
        scale: { duration: 0.15, ease: "easeOut" },
        height: { duration: 0.15, ease: "easeInOut" }
      }}
      onMouseDown={() => focusWindow(windowState.id)}
    >
      <TitleBar
        isActive={isActive}
        windowState={windowState}
      />
      <AnimatePresence initial={false}>
        {!windowState.isShaded ? (
          <motion.div
            key="content"
            className="os9-window-frame__content-shell"
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.15, ease: "easeInOut" }
            }}
            initial={{
              height: 0,
              opacity: 0
            }}
            animate={{
              height: contentHeight,
              opacity: 1
            }}
            style={{ overflow: "hidden" }}
            transition={{
              duration: 0.15,
              ease: "easeInOut"
            }}
          >
            <div className="h-full bg-[#efefef]">
              {AppComponent ? (
                <AppComponent
                  windowId={windowState.id}
                  props={windowState.props}
                />
              ) : (
                <WindowPlaceholder appName={windowState.title} />
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {showResizeHandle ? (
        <div
          aria-hidden="true"
          className="os9-window-frame__resize-handle"
          style={{ width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE }}
          onMouseDown={handleResizeMouseDown}
        />
      ) : null}
    </motion.div>
  );
}
