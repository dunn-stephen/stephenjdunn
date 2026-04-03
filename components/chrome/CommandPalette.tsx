"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchItem } from "@/lib/search";

type CommandPaletteProps = {
  open: boolean;
  items: SearchItem[];
  initialQuery?: string;
  onClose: () => void;
  onSecretCommand: (id: string) => void;
  onSelect: (item: SearchItem) => void;
};

function normalizeValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function getSearchScore(item: SearchItem, terms: string[]) {
  const label = normalizeValue(item.label);
  const section = normalizeValue(item.section);
  const hint = normalizeValue(item.hint ?? "");
  const description = normalizeValue(item.description ?? "");
  const keywords = (Array.isArray(item.keywords) ? item.keywords : []).map(normalizeValue).filter(Boolean);
  const haystack = [label, section, hint, description, ...keywords].join(" ");

  if (!terms.every((term) => haystack.includes(term))) {
    return null;
  }

  let score = 0;

  for (const term of terms) {
    if (label === term) {
      score += 120;
    }
    if (label.startsWith(term)) {
      score += 80;
    }
    if (label.includes(term)) {
      score += 50;
    }
    if (description.includes(term)) {
      score += 18;
    }
    if (hint.includes(term)) {
      score += 14;
    }
    if (section.includes(term)) {
      score += 10;
    }
    if (keywords.some((value) => value === term)) {
      score += 60;
    }
    if (keywords.some((value) => value.startsWith(term))) {
      score += 28;
    }
    if (keywords.some((value) => value.includes(term))) {
      score += 18;
    }
  }

  return score;
}

function getSecretCommandId(query: string) {
  const normalized = normalizeValue(query);

  if (normalized === "spaceinvaders" || normalized === "space invaders" || normalized === "space-invaders") {
    return "space-invaders";
  }

  if (normalized === "starwars" || normalized === "star wars" || normalized === "star-wars") {
    return "star-wars";
  }

  if (normalized === "weather") {
    return "weather";
  }

  return null;
}

export function CommandPalette({
  open,
  items,
  initialQuery = "",
  onClose,
  onSecretCommand,
  onSelect
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(() => {
    const normalized = normalizeValue(query);

    if (!normalized) {
      return items;
    }

    const terms = normalized.split(" ").filter(Boolean);

    return items
      .map((item, index) => ({ item, index, score: getSearchScore(item, terms) }))
      .filter((result) => result.score !== null)
      .sort((left, right) => {
        if (left.score === right.score) {
          return left.index - right.index;
        }
        return (right.score ?? 0) - (left.score ?? 0);
      })
      .map((result) => result.item);
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [open]);

  const closePalette = () => {
    onClose();
  };

  const runSelected = (index: number) => {
    const item = filtered[index];
    if (!item) {
      return;
    }

    onSelect(item);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/78 px-4 py-12 backdrop-blur-[2px] sm:py-20">
      <button
        type="button"
        aria-label="Close command palette overlay"
        className="absolute inset-0"
        onClick={closePalette}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-[500px] overflow-hidden border border-border bg-surface shadow-terminal"
      >
        <div className="border-b border-border bg-panel px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 border border-border bg-panel-alt px-3 py-2">
              <span className="text-[0.72rem] text-accent">⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setSelectedIndex((current) => (filtered.length === 0 ? 0 : (current + 1) % filtered.length));
                    return;
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setSelectedIndex((current) =>
                      filtered.length === 0 ? 0 : (current - 1 + filtered.length) % filtered.length
                    );
                    return;
                  }

                  if (event.key === "Enter") {
                    event.preventDefault();
                    const secretCommandId = getSecretCommandId(query);
                    if (secretCommandId) {
                      onSecretCommand(secretCommandId);
                      return;
                    }
                    runSelected(selectedIndex);
                    return;
                  }

                  if (event.key === "Escape") {
                    event.preventDefault();
                    closePalette();
                  }
                }}
                placeholder="Type a command or search..."
                className="w-full border-0 bg-transparent text-[0.72rem] uppercase tracking-[0.14em] text-text outline-none placeholder:text-faint"
                aria-label="Command palette search"
              />
            </div>
            <button
              type="button"
              onClick={closePalette}
              className="border border-border bg-surface px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-subtle transition hover:border-[#6a320d] hover:text-accent"
            >
              Esc
            </button>
          </div>
        </div>

        <div className="app-scrollbar max-h-[420px] overflow-y-auto bg-panel">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-[0.72rem] uppercase tracking-[0.16em] text-muted">
              {query.trim() ? `No matches for "${query.trim()}".` : "No matches."}
            </div>
          ) : (
            <div>
              {filtered.map((item, index) => {
                const previousItem = filtered[index - 1];
                const showSection = previousItem?.section !== item.section;

                return (
                  <div key={item.id}>
                    {showSection ? (
                      <div className="border-b border-border bg-panel-alt px-4 py-2 text-[0.58rem] uppercase tracking-[0.22em] text-subtle">
                        {item.section}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => runSelected(index)}
                      className={clsx(
                        "flex w-full items-center gap-3 border-b border-border border-l-2 px-4 py-3 text-left transition",
                        index === selectedIndex
                          ? "border-l-accent bg-accent-surface"
                          : "border-l-transparent hover:bg-panel-alt"
                      )}
                    >
                      <span
                        className={clsx(
                          "min-w-[14px] text-[0.68rem]",
                          index === selectedIndex ? "text-accent" : "text-faint"
                        )}
                      >
                        {item.glyph}
                      </span>
                      <span
                        className={clsx(
                          "min-w-0 flex-1",
                          index === selectedIndex ? "text-accent" : "text-muted"
                        )}
                      >
                        <span className="block truncate text-[0.76rem] tracking-[0.1em]">{item.label}</span>
                        {item.description ? (
                          <span
                            className={clsx(
                              "mt-1 block truncate text-[0.62rem] tracking-[0.06em]",
                              index === selectedIndex ? "text-muted" : "text-subtle"
                            )}
                          >
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-4 border-t border-border bg-panel px-4 py-2 text-[0.58rem] uppercase tracking-[0.16em] text-subtle">
          <span>
            <em className="not-italic text-muted">↑↓</em> navigate
          </span>
          <span>
            <em className="not-italic text-muted">Enter</em> select
          </span>
          <span>
            <em className="not-italic text-muted">Esc</em> close
          </span>
        </div>
      </div>
    </div>
  );
}
