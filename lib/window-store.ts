"use client";

import { create } from "zustand";
import { appRegistry } from "@/lib/app-registry";
import type { AppId, WindowPosition, WindowSize, WindowState, WindowStore } from "@/types";

const MENUBAR_HEIGHT = 19;
const BASE_Z_INDEX = 100;
const CASCADE_OFFSET = 20;

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 1440, height: 900 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function getMaxZIndex(windows: WindowState[]) {
  return windows.reduce((maxZIndex, windowState) => Math.max(maxZIndex, windowState.zIndex), BASE_Z_INDEX);
}

function clampPosition(position: WindowPosition, size: WindowSize) {
  const viewport = getViewportSize();

  return {
    x: Math.max(0, Math.min(position.x, Math.max(0, viewport.width - size.width))),
    y: Math.max(MENUBAR_HEIGHT, Math.min(position.y, Math.max(MENUBAR_HEIGHT, viewport.height - size.height)))
  };
}

function applyFocus(windows: WindowState[], id: string) {
  const nextZIndex = getMaxZIndex(windows) + 1;

  return windows.map((windowState) => (
    windowState.id === id
      ? { ...windowState, zIndex: nextZIndex }
      : windowState
  ));
}

function getNextFocusedWindowId(windows: WindowState[], excludedId?: string) {
  return windows
    .filter((windowState) => windowState.id !== excludedId && windowState.isOpen && !windowState.isMinimized)
    .sort((left, right) => right.zIndex - left.zIndex)[0]?.id ?? null;
}

function createWindowState(appId: AppId, existingWindows: WindowState[], props?: Record<string, unknown>): WindowState {
  const definition = appRegistry[appId];
  const cascadeIndex = existingWindows.length;
  const title = typeof props?.title === "string" ? props.title : definition.name;
  const position = clampPosition(
    {
      x: 80 + cascadeIndex * CASCADE_OFFSET,
      y: 60 + cascadeIndex * CASCADE_OFFSET
    },
    definition.defaultSize
  );

  return {
    id: `${appId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    appId,
    title,
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    isShaded: false,
    position,
    size: { ...definition.defaultSize },
    preShadeHeight: definition.defaultSize.height,
    zIndex: getMaxZIndex(existingWindows) + 1,
    props
  };
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedWindowId: null,
  openWindow: (appId, props) => {
    const definition = appRegistry[appId];
    const currentWindows = get().windows;

    if (definition.singleton) {
      const existingWindow = currentWindows.find((windowState) => windowState.appId === appId && windowState.isOpen);

      if (existingWindow) {
        const focusedWindows = applyFocus(
          currentWindows.map((windowState) => (
            windowState.id === existingWindow.id
              ? { ...windowState, isMinimized: false }
              : windowState
          )),
          existingWindow.id
        );

        set({
          windows: focusedWindows,
          focusedWindowId: existingWindow.id
        });

        return;
      }
    }

    const nextWindow = createWindowState(appId, currentWindows, props);

    set({
      windows: [...currentWindows, nextWindow],
      focusedWindowId: nextWindow.id
    });
  },
  closeWindow: (id) => {
    const nextWindows = get().windows.filter((windowState) => windowState.id !== id);

    set({
      windows: nextWindows,
      focusedWindowId: getNextFocusedWindowId(nextWindows)
    });
  },
  minimizeWindow: (id) => {
    const nextWindows = get().windows.map((windowState) => (
      windowState.id === id
        ? { ...windowState, isMinimized: true }
        : windowState
    ));

    set({
      windows: nextWindows,
      focusedWindowId: getNextFocusedWindowId(nextWindows, id)
    });
  },
  maximizeWindow: (id) => {
    const viewport = getViewportSize();

    const nextWindows = applyFocus(
      get().windows.map((windowState) => {
        if (windowState.id !== id) {
          return windowState;
        }

        const definition = appRegistry[windowState.appId];

        if (windowState.isMaximized && windowState.restoreBounds) {
          return {
            ...windowState,
            isMaximized: false,
            position: windowState.restoreBounds.position,
            size: windowState.restoreBounds.size,
            restoreBounds: undefined
          };
        }

        return {
          ...windowState,
          isMaximized: true,
          isMinimized: false,
          position: { x: 0, y: MENUBAR_HEIGHT },
          size: {
            width: viewport.width,
            height: Math.max(definition.minSize.height, viewport.height - MENUBAR_HEIGHT)
          },
          restoreBounds: {
            position: windowState.position,
            size: windowState.size
          }
        };
      }),
      id
    );

    set({
      windows: nextWindows,
      focusedWindowId: id
    });
  },
  restoreWindow: (id) => {
    const nextWindows = applyFocus(
      get().windows.map((windowState) => {
        if (windowState.id !== id) {
          return windowState;
        }

        if (windowState.restoreBounds) {
          return {
            ...windowState,
            isMinimized: false,
            isMaximized: false,
            position: windowState.restoreBounds.position,
            size: windowState.restoreBounds.size,
            restoreBounds: undefined
          };
        }

        return {
          ...windowState,
          isMinimized: false,
          isMaximized: false
        };
      }),
      id
    );

    set({
      windows: nextWindows,
      focusedWindowId: id
    });
  },
  focusWindow: (id) => {
    const currentWindow = get().windows.find((windowState) => windowState.id === id);

    if (!currentWindow) {
      return;
    }

    set({
      windows: applyFocus(get().windows, id),
      focusedWindowId: id
    });
  },
  shadeWindow: (id) => {
    const nextWindows = get().windows.map((windowState) => {
      if (windowState.id !== id) {
        return windowState;
      }

      if (windowState.isShaded) {
        return {
          ...windowState,
          isShaded: false,
          size: {
            ...windowState.size,
            height: windowState.preShadeHeight
          }
        };
      }

      return {
        ...windowState,
        isShaded: true,
        preShadeHeight: windowState.size.height
      };
    });

    set({
      windows: applyFocus(nextWindows, id),
      focusedWindowId: id
    });
  },
  moveWindow: (id, position) => {
    const nextWindows = applyFocus(
      get().windows.map((windowState) => {
        if (windowState.id !== id) {
          return windowState;
        }

        const frameSize = windowState.isShaded
          ? { ...windowState.size, height: MENUBAR_HEIGHT }
          : windowState.size;

        return {
          ...windowState,
          position: clampPosition(position, frameSize)
        };
      }),
      id
    );

    set({
      windows: nextWindows,
      focusedWindowId: id
    });
  },
  resizeWindow: (id, size) => {
    const nextWindows = applyFocus(
      get().windows.map((windowState) => {
        if (windowState.id !== id) {
          return windowState;
        }

        const definition = appRegistry[windowState.appId];
        const nextSize = {
          width: Math.max(definition.minSize.width, size.width),
          height: Math.max(definition.minSize.height, size.height)
        };

        return {
          ...windowState,
          size: nextSize,
          preShadeHeight: windowState.isShaded ? windowState.preShadeHeight : nextSize.height
        };
      }),
      id
    );

    set({
      windows: nextWindows,
      focusedWindowId: id
    });
  }
}));
