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
      className={[
        "absolute flex flex-col overflow-hidden border bg-[#dadada]",
        isActive
          ? "border-black shadow-[1px_1px_0_#111111,inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#999999]"
          : "border-[#525252] shadow-[1px_1px_0_#525252,inset_1px_1px_0_#9a9a9a,inset_-1px_-1px_0_#6f6f6f]"
      ].join(" ")}
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
            className="relative mx-1 mb-1 mt-[-1px] border border-black bg-white shadow-[-1px_-1px_0_#9c9c9c,1px_1px_0_#ffffff,inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#acacac]"
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
            <div className="h-full bg-[#f5f5f5]">
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
          className={["absolute bottom-1 right-1 cursor-se-resize bg-[#dadada] shadow-[inset_1px_1px_0_#ffffff]", isActive ? "opacity-100" : "opacity-55"].join(" ")}
          style={{ width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE }}
          onMouseDown={handleResizeMouseDown}
        >
          <div className="h-full w-full bg-[linear-gradient(135deg,transparent_0_44%,#6f6f6f_44%_48%,transparent_48%_58%,#6f6f6f_58%_62%,transparent_62%_72%,#6f6f6f_72%_76%,transparent_76%_100%)]" />
        </div>
      ) : null}
    </motion.div>
  );
}
