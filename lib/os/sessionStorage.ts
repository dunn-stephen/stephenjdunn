import { DESKTOP_RUNTIME, defaultDesktopPreferences, type DesktopPreferences, type GeometryTemplate, type PersistedDesktopStateV1, type WindowBounds } from "@/lib/os/types";

const defaultState: PersistedDesktopStateV1 = {
  version: 1,
  preferences: defaultDesktopPreferences,
  geometryByKey: {}
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function readPersistedDesktopState(): PersistedDesktopStateV1 {
  if (!isBrowser()) {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(DESKTOP_RUNTIME.sessionStorageKey);

    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as PersistedDesktopStateV1;

    if (parsed.version !== 1) {
      return defaultState;
    }

    return {
      version: 1,
      preferences: {
        ...defaultDesktopPreferences,
        ...parsed.preferences
      },
      geometryByKey: parsed.geometryByKey ?? {}
    };
  } catch {
    return defaultState;
  }
}

export function writePersistedDesktopState(nextState: PersistedDesktopStateV1) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(DESKTOP_RUNTIME.sessionStorageKey, JSON.stringify(nextState));
}

export function updatePersistedPreferences(updater: (preferences: DesktopPreferences) => DesktopPreferences) {
  const state = readPersistedDesktopState();

  writePersistedDesktopState({
    ...state,
    preferences: updater(state.preferences)
  });
}

export function readGeometryTemplate(key: string) {
  return readPersistedDesktopState().geometryByKey[key];
}

export function writeGeometryTemplate(key: string, bounds: WindowBounds) {
  const state = readPersistedDesktopState();

  writePersistedDesktopState({
    ...state,
    geometryByKey: {
      ...state.geometryByKey,
      [key]: {
        width: bounds.width,
        height: bounds.height,
        offsetX: bounds.x,
        offsetY: bounds.y
      }
    }
  });
}

export function resetPersistedGeometry() {
  const state = readPersistedDesktopState();

  writePersistedDesktopState({
    ...state,
    geometryByKey: {}
  });
}

export function geometryTemplateToBounds(template: GeometryTemplate): WindowBounds {
  return {
    x: template.offsetX,
    y: template.offsetY,
    width: template.width,
    height: template.height
  };
}
