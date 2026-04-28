"use client";

import { AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/lib/window-store";
import { WindowFrame } from "@/components/windows/WindowFrame";

export function WindowManager() {
  const focusedWindowId = useWindowStore((state) => state.focusedWindowId);
  const windows = useWindowStore((state) => state.windows);

  return (
    <AnimatePresence>
      {[...windows]
        .filter((windowState) => windowState.isOpen && !windowState.isMinimized)
        .sort((left, right) => left.zIndex - right.zIndex)
        .map((windowState) => (
          <WindowFrame
            key={windowState.id}
            isActive={windowState.id === focusedWindowId}
            windowState={windowState}
          />
        ))}
    </AnimatePresence>
  );
}
