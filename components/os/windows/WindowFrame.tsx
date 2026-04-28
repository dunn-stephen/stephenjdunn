"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import type { WindowInstance } from "@/lib/os/types";

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
  const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);
  const collapsed = window.mode === "collapsed";

  return (
    <div
      className="os9-window absolute overflow-hidden"
      style={{
        left: window.bounds.x,
        top: window.bounds.y,
        width: window.bounds.width,
        height: collapsed ? 32 : window.bounds.height,
        zIndex: window.zIndex
      }}
      onPointerDown={() => onFocus(window.id)}
    >
      <div
        className="os9-titlebar cursor-move"
        onDoubleClick={() => onCollapse(window.id)}
        onPointerDown={(event) => {
          onFocus(window.id);
          dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            x: window.bounds.x,
            y: window.bounds.y
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag) {
            return;
          }

          onMove(window.id, drag.x + event.clientX - drag.startX, drag.y + event.clientY - drag.startY);
        }}
        onPointerUp={(event) => {
          dragRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="os9-button h-4 w-4 rounded-[2px] p-0"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onClose(window.id)}
          >
            ×
          </button>
          <button
            type="button"
            className="os9-button h-4 w-4 rounded-[2px] p-0"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onCollapse(window.id)}
          >
            −
          </button>
          <button
            type="button"
            className="os9-button h-4 w-4 rounded-[2px] p-0"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onZoom(window.id)}
          >
            +
          </button>
        </div>
        <div className="os9-titlebar-label">{window.title}</div>
        <div className="w-[54px]" />
      </div>

      {!collapsed ? <div className="os9-window-body h-[calc(100%-28px)] overflow-auto p-3">{children}</div> : null}

      {!collapsed ? (
        <div
          className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize bg-[linear-gradient(135deg,transparent_0_45%,#8a8a8a_45%_55%,transparent_55%)]"
          onPointerDown={(event) => {
            onFocus(window.id);
            resizeRef.current = {
              startX: event.clientX,
              startY: event.clientY,
              width: window.bounds.width,
              height: window.bounds.height
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const resize = resizeRef.current;
            if (!resize) {
              return;
            }

            onResize(
              window.id,
              Math.max(320, resize.width + event.clientX - resize.startX),
              Math.max(220, resize.height + event.clientY - resize.startY)
            );
          }}
          onPointerUp={(event) => {
            resizeRef.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
        />
      ) : null}
    </div>
  );
}
