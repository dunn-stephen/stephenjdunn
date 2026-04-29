"use client";

import { Panel, SectionLabel, Tag } from "@/components/shared/Tui";

const shortcuts = [
  "Double-click desktop icons to open them",
  "Drag window title bars to move windows",
  "Use the resize handle in the bottom-right corner to resize windows",
  "Use the File menu to open a new Finder window",
  "Use the Apple menu to reset window positions"
] as const;

export function HelpApp() {
  return (
    <div className="space-y-4">
      <Panel accent>
        <SectionLabel>Stephen OS Help</SectionLabel>
        <p className="text-[12px] leading-6 text-muted">
          This runtime is a route-backed Mac OS 9-style shell. Canonical pages still exist under the desktop.
        </p>
      </Panel>

      <Panel>
        <SectionLabel>Keyboard and Mouse</SectionLabel>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div key={shortcut} className="flex items-start gap-2 text-[12px] leading-5 text-muted">
              <Tag accent>Tip</Tag>
              <span>{shortcut}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
