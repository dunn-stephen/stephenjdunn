import type { WindowBounds } from "@/lib/os/types";

export const MENU_BAR_HEIGHT = 28;

export function clampBounds(bounds: WindowBounds, viewportWidth: number, viewportHeight: number): WindowBounds {
  const width = Math.min(bounds.width, Math.max(280, viewportWidth - 24));
  const height = Math.min(bounds.height, Math.max(160, viewportHeight - MENU_BAR_HEIGHT - 24));
  const maxX = Math.max(0, viewportWidth - width);
  const maxY = Math.max(MENU_BAR_HEIGHT, viewportHeight - 24);

  return {
    width,
    height,
    x: Math.min(Math.max(0, bounds.x), maxX),
    y: Math.min(Math.max(MENU_BAR_HEIGHT, bounds.y), maxY)
  };
}

export function centerBounds(width: number, height: number, viewportWidth: number, viewportHeight: number): WindowBounds {
  return clampBounds(
    {
      width,
      height,
      x: Math.round((viewportWidth - width) / 2),
      y: Math.round((viewportHeight - height + MENU_BAR_HEIGHT) / 2)
    },
    viewportWidth,
    viewportHeight
  );
}

export function cascadeBounds(
  base: WindowBounds,
  offsetIndex: number,
  viewportWidth: number,
  viewportHeight: number
): WindowBounds {
  return clampBounds(
    {
      ...base,
      x: base.x + offsetIndex * 22,
      y: base.y + offsetIndex * 18
    },
    viewportWidth,
    viewportHeight
  );
}

export function preferredZoomBounds(
  base: WindowBounds,
  viewportWidth: number,
  viewportHeight: number
): WindowBounds {
  return clampBounds(
    {
      width: Math.min(Math.round(base.width * 1.35), viewportWidth - 28),
      height: Math.min(Math.round(base.height * 1.35), viewportHeight - MENU_BAR_HEIGHT - 28),
      x: 14,
      y: MENU_BAR_HEIGHT + 14
    },
    viewportWidth,
    viewportHeight
  );
}
