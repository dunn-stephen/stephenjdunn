"use client";

import { create } from "zustand";
import type { AppId, WindowBounds, WindowInit, WindowInstance, WindowMode } from "@/lib/os/types";
import { geometryTemplateToBounds, readGeometryTemplate, resetPersistedGeometry, writeGeometryTemplate } from "@/lib/os/sessionStorage";
import { cascadeBounds, centerBounds, clampBounds, preferredZoomBounds } from "@/lib/os/windowMath";

export interface WindowManagerStore {
  windows: Record<string, WindowInstance>;
  activeWindowId: string | null;
  openWindow: (init: WindowInit) => string;
  focusWindow: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  moveWindow: (windowId: string, x: number, y: number) => void;
  resizeWindow: (windowId: string, width: number, height: number) => void;
  setMode: (windowId: string, mode: WindowMode) => void;
  collapseWindow: (windowId: string) => void;
  zoomWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  ensureCanonicalWindow: (init: WindowInit) => string;
  resetAllWindowGeometry: () => void;
}

function viewport() {
  if (typeof window === "undefined") {
    return {
      width: 1440,
      height: 900
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function getGeometryKey(appId: AppId, nodeId?: string) {
  return nodeId ? `${appId}:${nodeId}` : `${appId}:root`;
}

function assignZIndexes(windows: Record<string, WindowInstance>, focusedId: string | null) {
  const ordered = Object.values(windows)
    .sort((left, right) => left.zIndex - right.zIndex)
    .map((window) => window.id);

  const nextOrder = focusedId
    ? [...ordered.filter((id) => id !== focusedId), focusedId]
    : ordered;

  return nextOrder.reduce<Record<string, WindowInstance>>((next, id, index) => {
    const current = windows[id];

    next[id] = {
      ...current,
      isFocused: focusedId === id,
      zIndex: 200 + index
    };

    return next;
  }, {});
}

function persistWindowGeometry(window: WindowInstance) {
  writeGeometryTemplate(getGeometryKey(window.appId, window.nodeId), window.bounds);
}

export const useWindowManagerStore = create<WindowManagerStore>((set, get) => ({
  windows: {},
  activeWindowId: null,
  openWindow: (init) => {
    const id = crypto.randomUUID();
    const key = getGeometryKey(init.appId, init.nodeId);
    const savedTemplate = readGeometryTemplate(key);
    const { width, height } = viewport();
    const baseBounds = savedTemplate
      ? clampBounds(geometryTemplateToBounds(savedTemplate), width, height)
      : cascadeBounds(init.bounds, Object.keys(get().windows).length, width, height);

    const windowInstance: WindowInstance = {
      ...init,
      id,
      bounds: baseBounds,
      mode: "normal",
      isFocused: true,
      zIndex: 200 + Object.keys(get().windows).length
    };

    const windows = {
      ...get().windows,
      [id]: windowInstance
    };

    const nextWindows = assignZIndexes(windows, id);
    persistWindowGeometry(nextWindows[id]);

    set({
      windows: nextWindows,
      activeWindowId: id
    });

    return id;
  },
  focusWindow: (windowId) => {
    const current = get().windows[windowId];

    if (!current) {
      return;
    }

    set({
      windows: assignZIndexes(get().windows, windowId),
      activeWindowId: windowId
    });
  },
  closeWindow: (windowId) => {
    const nextWindows = { ...get().windows };
    delete nextWindows[windowId];
    const nextActiveId = Object.values(nextWindows).sort((left, right) => right.zIndex - left.zIndex)[0]?.id ?? null;

    set({
      windows: assignZIndexes(nextWindows, nextActiveId),
      activeWindowId: nextActiveId
    });
  },
  moveWindow: (windowId, x, y) => {
    const current = get().windows[windowId];
    if (!current) {
      return;
    }

    const { width, height } = viewport();
    const bounds = clampBounds(
      {
        ...current.bounds,
        x,
        y
      },
      width,
      height
    );

    const next = {
      ...current,
      bounds
    };

    persistWindowGeometry(next);

    set({
      windows: {
        ...get().windows,
        [windowId]: next
      }
    });
  },
  resizeWindow: (windowId, width, height) => {
    const current = get().windows[windowId];
    if (!current) {
      return;
    }

    const viewportSize = viewport();
    const bounds = clampBounds(
      {
        ...current.bounds,
        width,
        height
      },
      viewportSize.width,
      viewportSize.height
    );

    const next = {
      ...current,
      bounds
    };

    persistWindowGeometry(next);

    set({
      windows: {
        ...get().windows,
        [windowId]: next
      }
    });
  },
  setMode: (windowId, mode) => {
    const current = get().windows[windowId];
    if (!current) {
      return;
    }

    set({
      windows: {
        ...get().windows,
        [windowId]: {
          ...current,
          mode
        }
      }
    });
  },
  collapseWindow: (windowId) => {
    const current = get().windows[windowId];
    if (!current) {
      return;
    }

    set({
      windows: {
        ...get().windows,
        [windowId]: {
          ...current,
          mode: current.mode === "collapsed" ? "normal" : "collapsed"
        }
      }
    });
  },
  zoomWindow: (windowId) => {
    const current = get().windows[windowId];
    if (!current) {
      return;
    }

    const { width, height } = viewport();

    if (current.mode === "zoomed" && current.restoreBounds) {
      const next = {
        ...current,
        bounds: current.restoreBounds,
        restoreBounds: undefined,
        mode: "normal" as const
      };

      persistWindowGeometry(next);

      set({
        windows: {
          ...get().windows,
          [windowId]: next
        }
      });

      return;
    }

    const next = {
      ...current,
      restoreBounds: current.bounds,
      bounds: preferredZoomBounds(current.bounds, width, height),
      mode: "zoomed" as const
    };

    persistWindowGeometry(next);

    set({
      windows: {
        ...get().windows,
        [windowId]: next
      }
    });
  },
  restoreWindow: (windowId) => {
    const current = get().windows[windowId];
    if (!current?.restoreBounds) {
      return;
    }

    const next = {
      ...current,
      bounds: current.restoreBounds,
      restoreBounds: undefined,
      mode: "normal" as const
    };

    persistWindowGeometry(next);

    set({
      windows: {
        ...get().windows,
        [windowId]: next
      }
    });
  },
  ensureCanonicalWindow: (init) => {
    const existing = Object.values(get().windows).find(
      (window) => window.appId === init.appId && window.nodeId === init.nodeId && window.canonicalRoute === init.canonicalRoute
    );

    if (existing) {
      get().focusWindow(existing.id);
      return existing.id;
    }

    return get().openWindow(init);
  },
  resetAllWindowGeometry: () => {
    resetPersistedGeometry();
    const { width, height } = viewport();

    set({
      windows: Object.fromEntries(
        Object.values(get().windows).map((window, index) => {
          const bounds = cascadeBounds(
            centerBounds(window.bounds.width, window.bounds.height, width, height),
            index,
            width,
            height
          );

          return [
            window.id,
            {
              ...window,
              bounds,
              restoreBounds: undefined,
              mode: "normal" as const
            }
          ];
        })
      )
    });
  }
}));
