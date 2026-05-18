"use client";

import { useMemo } from "react";
import type { FinderNode, FinderTreeRecord } from "@/lib/os/types";

type FinderAppProps = {
  tree: FinderTreeRecord;
  nodeId: string;
  selectionNodeIds: string[];
  onSelect: (nodeId: string) => void;
  onOpenNode: (nodeId: string) => void;
};

function iconForNode(node: FinderNode) {
  if (node.type === "trash") {
    return "🗑";
  }

  if (node.type === "volume") {
    return "💽";
  }

  if (node.type === "folder") {
    if (node.id.includes("applications")) {
      return "🗂";
    }

    if (node.id.includes("writing")) {
      return "📝";
    }

    return "📁";
  }

  if (node.type === "app") {
    return "🗂";
  }

  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(node.name)) {
    return "🖼";
  }

  if (/\.(avi|mov|mp4|mkv)$/i.test(node.name)) {
    return "🎞";
  }

  if (/\.(ppt|pptx)$/i.test(node.name)) {
    return "📊";
  }

  if (/\.(xls|xlsx)$/i.test(node.name)) {
    return "📈";
  }

  if (node.id.includes("resume")) {
    return "📄";
  }

  if (node.id.includes("contact")) {
    return "☎";
  }

  if (node.id.includes("about")) {
    return "ℹ";
  }

  return "📄";
}

export function FinderApp({ tree, nodeId, selectionNodeIds, onSelect, onOpenNode }: FinderAppProps) {
  const node = tree[nodeId];
  const rootNodes = useMemo(
    () =>
      Object.values(tree)
        .filter((item) => item.parentId === "volume-stephen-hd")
        .sort((left, right) => left.name.localeCompare(right.name)),
    [tree]
  );
  const items = useMemo(
    () => (node?.children ?? []).map((childId) => tree[childId]).filter(Boolean).sort((left, right) => left.name.localeCompare(right.name)),
    [node?.children, tree]
  );

  return (
    <div className="grid h-full min-h-[320px] grid-cols-[180px_minmax(0,1fr)]">
      <aside className="os9-surface-inset border-r border-[#9a9a9a] px-2 py-2">
        <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-subtle">Stephen HD</p>
        <div className="mt-2 space-y-1">
          {rootNodes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenNode(item.id)}
              className="flex w-full items-center gap-2 rounded-[2px] px-2 py-1 text-left text-[12px] hover:bg-[#dce9fb]"
            >
              <span>{iconForNode(item)}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex flex-col">
        <div className="os9-toolbar px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-subtle">
          {node?.name ?? "Finder"}
        </div>
        <div className="flex-1 overflow-auto px-3 py-3">
          {items.length === 0 ? (
            <div className="os9-panel rounded-[2px] px-4 py-6 text-[12px] text-subtle">This folder is empty.</div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const isSelected = selectionNodeIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    onDoubleClick={() => onOpenNode(item.id)}
                    className={`border px-3 py-3 text-left text-[12px] ${
                      isSelected ? "border-[#5d7da6] bg-[#dce9fb]" : "border-border bg-[#f5f5f5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[18px]" aria-hidden="true">
                        {iconForNode(item)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold uppercase tracking-[0.12em] text-accent-ink">{item.name}</p>
                        {item.meta?.subtitle ? (
                          <p className="mt-1 line-clamp-3 text-[11px] leading-5 text-muted">{item.meta.subtitle}</p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
