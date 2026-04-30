"use client";

import type { PointerEvent, ReactNode } from "react";
import { useRef } from "react";
import type { WindowInstance } from "@/lib/os/types";

const WINDOW_SHADE_HEIGHT = 28;
const MIN_WINDOW_WIDTH = 320;
const MIN_WINDOW_HEIGHT = 220;

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
}

interface ResizeState {
  pointerId: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
}

type WindowFrameProps = {
  window: WindowInstance;
  children: ReactNode;
  onFocus: (windowId: string) => void;
  onClose: (windowId: string) => void;
  onCollapse: (windowId: string) => void;
  onZoom: (windowId: string) => void;
  onMove: (windowId: string, x: number, y: number) => void;
  onResize: (windowId: string, width: number, height: number) => void;
};

export function WindowFrame({
  window,
  children,
  onFocus,
  onClose,
  onCollapse,
  onZoom,
  onMove,
  onResize
}: WindowFrameProps) {
  const dragRef = useRef<DragState | null>(null);
  const resizeRef = useRef<ResizeState | null>(null);
  const collapsed = window.mode === "collapsed";
  const focused = window.isFocused;
  const zoomed = window.mode === "zoomed";

  function releasePointerCapture(target: HTMLElement, pointerId: number) {
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  }

  function handleTitlebarPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    onFocus(window.id);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: window.bounds.x,
      y: window.bounds.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleTitlebarPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    // os9 uses `.draggable` regions with jQuery UI drag; this translates that behavior into React pointer capture.
    onMove(window.id, drag.x + event.clientX - drag.startX, drag.y + event.clientY - drag.startY);
  }

  function handleTitlebarPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    releasePointerCapture(event.currentTarget, event.pointerId);
  }

  function handleResizePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    onFocus(window.id);
    resizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: window.bounds.width,
      height: window.bounds.height
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.stopPropagation();
  }

  function handleResizePointerMove(event: PointerEvent<HTMLDivElement>) {
    const resize = resizeRef.current;

    if (!resize || resize.pointerId !== event.pointerId) {
      return;
    }

    // The source repo only exposes a south-east resize handle, so the adapted resize logic does the same.
    onResize(
      window.id,
      Math.max(MIN_WINDOW_WIDTH, resize.width + event.clientX - resize.startX),
      Math.max(MIN_WINDOW_HEIGHT, resize.height + event.clientY - resize.startY)
    );
  }

  function handleResizePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const resize = resizeRef.current;

    if (!resize || resize.pointerId !== event.pointerId) {
      return;
    }

    resizeRef.current = null;
    releasePointerCapture(event.currentTarget, event.pointerId);
  }

  return (
    <div
      className="os9-window-frame absolute flex flex-col overflow-hidden"
      data-collapsed={collapsed ? "true" : "false"}
      data-focused={focused ? "true" : "false"}
      data-zoomed={zoomed ? "true" : "false"}
      tabIndex={-1}
      style={{
        left: window.bounds.x,
        top: window.bounds.y,
        width: window.bounds.width,
        height: collapsed ? WINDOW_SHADE_HEIGHT : window.bounds.height,
        zIndex: window.zIndex
      }}
      onPointerDown={() => onFocus(window.id)}
    >
      {/* Mirrors os9's `window.header.html`: close box, striped rails, title, zoom box, and windowshade box. */}
      <div
        className="os9-window-frame__header"
        onDoubleClick={() => onCollapse(window.id)}
        onPointerCancel={handleTitlebarPointerEnd}
        onPointerDown={handleTitlebarPointerDown}
        onPointerMove={handleTitlebarPointerMove}
        onPointerUp={handleTitlebarPointerEnd}
      >
        <button
          aria-label={`Close ${window.title}`}
          className="os9-window-frame__control os9-window-frame__control--close"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onClose(window.id)}
        >
          <span className="os9-window-frame__control-box">
            <span className="os9-window-frame__control-inner">
              <span className="os9-window-frame__control-highlight" />
            </span>
          </span>
        </button>
        <div className="os9-window-frame__titlebar-hit" aria-hidden="true">
          <span className="os9-window-frame__stripe os9-window-frame__stripe--left" />
          <span className="os9-window-frame__stripe os9-window-frame__stripe--center" />
          <span className="os9-window-frame__stripe os9-window-frame__stripe--right" />
        </div>
        <div className="os9-window-frame__title" title={window.title}>
          {window.title}
        </div>
        <div className="os9-window-frame__titlebar-hit" aria-hidden="true">
          <span className="os9-window-frame__stripe os9-window-frame__stripe--left" />
          <span className="os9-window-frame__stripe os9-window-frame__stripe--center" />
          <span className="os9-window-frame__stripe os9-window-frame__stripe--right" />
        </div>
        <button
          aria-label={zoomed ? `Restore ${window.title}` : `Zoom ${window.title}`}
          className="os9-window-frame__control os9-window-frame__control--zoom"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onZoom(window.id)}
        >
          <span className="os9-window-frame__control-box">
            <span className="os9-window-frame__control-inner">
              <span className="os9-window-frame__control-highlight" />
              <span className="os9-window-frame__zoom-glyph" />
            </span>
          </span>
        </button>
        <button
          aria-label={collapsed ? `Expand ${window.title}` : `Collapse ${window.title}`}
          className="os9-window-frame__control os9-window-frame__control--shade"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onCollapse(window.id)}
        >
          <span className="os9-window-frame__control-box">
            <span className="os9-window-frame__control-inner">
              <span className="os9-window-frame__control-highlight" />
              <span className="os9-window-frame__shade-glyph" />
            </span>
          </span>
        </button>
      </div>

      {!collapsed ? (
        <div className="os9-window-frame__content-shell">
          <div className="os9-window-frame__content app-scrollbar">{children}</div>
        </div>
      ) : null}

      {!collapsed ? (
        <div
          aria-hidden="true"
          className="os9-window-frame__resize-handle"
          onPointerCancel={handleResizePointerEnd}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerEnd}
        />
      ) : null}
    </div>
  );
}
