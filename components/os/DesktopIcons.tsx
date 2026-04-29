"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { desktopIconNodeIds, type FinderTreeRecord } from "@/lib/os/types";

const defaultPositions = {
  "volume-stephen-hd": { x: 24, y: 88 },
  "folder-projects": { x: 24, y: 174 },
  "folder-writing": { x: 24, y: 260 },
  "doc-resume": { x: 24, y: 346 },
  "doc-contact": { x: 24, y: 432 },
  "folder-applications": { x: 24, y: 518 }
} as const;

type DesktopIconsProps = {
  tree: FinderTreeRecord;
  iconPositions: Record<string, { x: number; y: number }>;
  onUpdateIconPosition: (nodeId: string, position: { x: number; y: number }) => void;
  onOpenNode: (nodeId: string) => void;
};

export function DesktopIcons({
  tree,
  iconPositions,
  onUpdateIconPosition,
  onOpenNode
}: DesktopIconsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({
    width: 1280,
    height: 840
  });
  const dragRef = useRef<{
    nodeId: string;
    originX: number;
    originY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const positions = useMemo(
    () =>
      desktopIconNodeIds.reduce<Record<string, { x: number; y: number }>>((next, nodeId) => {
        next[nodeId] = iconPositions[nodeId] ?? defaultPositions[nodeId as keyof typeof defaultPositions] ?? { x: 24, y: 88 };
        return next;
      }, {}),
    [iconPositions]
  );

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      {desktopIconNodeIds.map((nodeId) => {
        const node = tree[nodeId];
        if (!node) {
          return null;
        }

        const isTrash = nodeId === "trash";
        const position = isTrash
          ? { x: viewport.width - 112, y: viewport.height - 128 }
          : positions[nodeId];

        return (
          <button
            key={nodeId}
            type="button"
            onClick={() => setSelectedId(nodeId)}
            onDoubleClick={() => onOpenNode(nodeId)}
            onPointerDown={(event) => {
              if (isTrash) {
                return;
              }

              dragRef.current = {
                nodeId,
                originX: position.x,
                originY: position.y,
                startX: event.clientX,
                startY: event.clientY
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;

              if (!drag || drag.nodeId !== nodeId) {
                return;
              }

              onUpdateIconPosition(nodeId, {
                x: Math.max(16, drag.originX + event.clientX - drag.startX),
                y: Math.max(52, drag.originY + event.clientY - drag.startY)
              });
            }}
            onPointerUp={(event) => {
              dragRef.current = null;
              event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            className={`pointer-events-auto absolute flex w-20 flex-col items-center gap-2 rounded-[4px] px-2 py-2 text-center ${
              selectedId === nodeId ? "bg-[rgba(220,233,251,0.45)]" : ""
            }`}
            style={{
              left: position.x,
              top: position.y
            }}
          >
            <span className="text-[28px]" aria-hidden="true">
              {nodeId === "trash" ? "🗑" : nodeId.includes("applications") ? "🗂" : nodeId.includes("resume") ? "📄" : nodeId.includes("contact") ? "☎" : nodeId.includes("writing") ? "📝" : nodeId.includes("projects") ? "📁" : "💽"}
            </span>
            <span className="rounded-[2px] bg-[rgba(255,255,255,0.55)] px-1 text-[11px] font-bold text-[#16324b]">
              {node.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
