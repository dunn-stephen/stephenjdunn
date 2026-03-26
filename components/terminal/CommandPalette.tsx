"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Command, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type CommandPaletteItem = {
  id: string;
  label: string;
  section: string;
  keywords: string[];
  href?: Route;
  action?: "toggle-crt" | "toggle-sidebar";
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onToggleSidebar: () => void;
  onToggleCrt: () => void;
  items: CommandPaletteItem[];
};

export function CommandPalette({
  open,
  onClose,
  onToggleSidebar,
  onToggleCrt,
  items
}: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      [item.label, item.section, ...item.keywords].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [items, query]);

  const runItem = (item: CommandPaletteItem) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.action === "toggle-crt") {
      onToggleCrt();
    } else if (item.action === "toggle-sidebar") {
      onToggleSidebar();
    }

    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 py-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-border bg-surface shadow-terminal"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <Search className="h-4 w-4 text-dim" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, projects, posts, or commands"
            className="w-full border-0 bg-transparent text-sm text-text outline-none placeholder:text-dim"
            aria-label="Command palette search"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-dim transition hover:border-accent hover:text-accent"
          >
            esc
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-dim">
              No matches.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => runItem(item)}
                  className="flex w-full items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-accent hover:bg-black/20"
                >
                  <div>
                    <p className="text-sm text-text">{item.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-dim">{item.section}</p>
                  </div>
                  <Command className="h-4 w-4 text-dim" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
