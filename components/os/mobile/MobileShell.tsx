"use client";

import { useMemo } from "react";
import type { FinderTreeRecord } from "@/lib/os/types";

type MobileShellProps = {
  tree: FinderTreeRecord;
  onOpenNode: (nodeId: string) => void;
};

export function MobileShell({ tree, onOpenNode }: MobileShellProps) {
  const launchers = useMemo(
    () => ["volume-stephen-hd", "folder-projects", "folder-writing", "doc-resume", "doc-contact", "folder-applications"],
    []
  );

  return (
    <div className="fixed inset-0 z-[1800] overflow-auto bg-[linear-gradient(180deg,#8cc0dd_0%,#6b99bc_100%)] px-4 pb-6 pt-12">
      <div className="mx-auto max-w-md space-y-4">
        <div className="os9-window px-4 py-4">
          <p className="text-[16px] font-bold uppercase tracking-[0.18em] text-accent-ink">Stephen OS</p>
          <p className="mt-2 text-[12px] leading-5 text-muted">
            Touch launcher for the Mac OS 9-style portfolio runtime.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {launchers.map((nodeId) => {
            const node = tree[nodeId];
            if (!node) {
              return null;
            }

            return (
              <button
                key={nodeId}
                type="button"
                onClick={() => onOpenNode(nodeId)}
                className="os9-window px-4 py-5 text-left"
              >
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent-ink">{node.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
