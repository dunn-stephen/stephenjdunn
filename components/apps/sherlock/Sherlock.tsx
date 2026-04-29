"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { search as searchProjects } from "@/lib/search";
import { useWindowStore } from "@/lib/window-store";
import type { AppProps } from "@/types";

export interface SherlockSearchableItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export interface SherlockSearchResult {
  projectSlug: string;
  projectTitle: string;
  excerpt: string;
  score: number;
}

export interface SherlockProjectSummary {
  slug: string;
  title: string;
  description: string;
}

export interface SherlockWindowProps {
  index?: SherlockSearchableItem[];
  searchIndex?: SherlockSearchableItem[];
  projects?: SherlockProjectSummary[];
  onSelectResult?: (result: SherlockSearchResult) => void;
  onOpenResult?: (result: SherlockSearchResult) => void;
  search?: (query: string, index: SherlockSearchableItem[]) => SherlockSearchResult[] | LegacySearchResult[];
}

interface LegacySearchResult {
  item: SherlockSearchableItem;
  score: number;
}

interface NormalizedSherlockWindowProps {
  index: SherlockSearchableItem[];
  projects: SherlockProjectSummary[];
  rawProjects: Record<string, unknown>[];
  onSelectResult?: (result: SherlockSearchResult) => void;
  search?: (query: string, index: SherlockSearchableItem[]) => SherlockSearchResult[] | LegacySearchResult[];
}

interface ResultsEmptyStateProps {
  hasQuery: boolean;
  hasData: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isProjectSummary(value: unknown): value is SherlockProjectSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.slug === "string"
    && typeof value.title === "string"
    && typeof value.description === "string"
  );
}

function isSearchableItem(value: unknown): value is SherlockSearchableItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string"
    && typeof value.slug === "string"
    && typeof value.title === "string"
    && typeof value.description === "string"
    && typeof value.content === "string"
    && isStringArray(value.tags)
  );
}

function isSherlockSearchResult(value: unknown): value is SherlockSearchResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.projectSlug === "string"
    && typeof value.projectTitle === "string"
    && typeof value.excerpt === "string"
    && typeof value.score === "number"
  );
}

function isLegacySearchResult(value: unknown): value is LegacySearchResult {
  if (!isRecord(value)) {
    return false;
  }

  return isSearchableItem(value.item) && typeof value.score === "number";
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function summarizeText(value: string, fallback: string) {
  const normalized = normalizeText(value);

  if (normalized.length === 0) {
    return fallback;
  }

  return normalized.length <= 140 ? normalized : `${normalized.slice(0, 137).trimEnd()}...`;
}

function buildExcerpt(item: SherlockSearchableItem, query: string) {
  const normalizedQuery = normalizeText(query).toLowerCase();
  const sources = [item.description, item.content, item.tags.join(" ")];

  if (normalizedQuery.length === 0) {
    return summarizeText(item.description, summarizeText(item.content, "Project details unavailable."));
  }

  for (const source of sources) {
    const normalizedSource = normalizeText(source);

    if (normalizedSource.length === 0) {
      continue;
    }

    const matchIndex = normalizedSource.toLowerCase().indexOf(normalizedQuery);

    if (matchIndex === -1) {
      continue;
    }

    const sliceStart = Math.max(0, matchIndex - 42);
    const sliceEnd = Math.min(normalizedSource.length, matchIndex + normalizedQuery.length + 78);
    const prefix = sliceStart > 0 ? "..." : "";
    const suffix = sliceEnd < normalizedSource.length ? "..." : "";

    return `${prefix}${normalizedSource.slice(sliceStart, sliceEnd).trim()}${suffix}`;
  }

  return summarizeText(item.description, summarizeText(item.content, "Project details unavailable."));
}

function normalizeResult(result: unknown, index: SherlockSearchableItem[], query: string): SherlockSearchResult | null {
  if (isSherlockSearchResult(result)) {
    return {
      projectSlug: result.projectSlug,
      projectTitle: result.projectTitle,
      excerpt: normalizeText(result.excerpt) || "Project details unavailable.",
      score: result.score
    };
  }

  if (!isLegacySearchResult(result)) {
    return null;
  }

  const matchedItem = index.find((item) => item.slug === result.item.slug) ?? result.item;

  return {
    projectSlug: matchedItem.slug,
    projectTitle: matchedItem.title,
    excerpt: buildExcerpt(matchedItem, query),
    score: result.score
  };
}

function dedupeResults(results: SherlockSearchResult[]) {
  const seen = new Set<string>();

  return results.filter((result) => {
    if (seen.has(result.projectSlug)) {
      return false;
    }

    seen.add(result.projectSlug);
    return true;
  });
}

function mergeSearchableItems(index: SherlockSearchableItem[], projects: SherlockProjectSummary[]) {
  const merged = new Map<string, SherlockSearchableItem>();

  for (const item of index) {
    merged.set(item.slug, item);
  }

  for (const project of projects) {
    const current = merged.get(project.slug);

      merged.set(project.slug, {
      id: current?.id ?? `project:${project.slug}`,
      slug: project.slug,
      title: project.title,
      description: project.description,
      content: current?.content ?? "",
      tags: current?.tags ?? []
    });
  }

  return Array.from(merged.values()).sort((left, right) => left.title.localeCompare(right.title));
}

function buildProjectResults(items: SherlockSearchableItem[]) {
  return items.map((item, index) => ({
    projectSlug: item.slug,
    projectTitle: item.title,
    excerpt: summarizeText(item.description, summarizeText(item.content, "Project details unavailable.")),
    score: index
  }));
}

function fallbackSearch(query: string, index: SherlockSearchableItem[]) {
  const normalizedQuery = normalizeText(query).toLowerCase();

  if (normalizedQuery.length === 0) {
    return buildProjectResults(index);
  }

  return index
    .map((item) => {
      const title = item.title.toLowerCase();
      const description = item.description.toLowerCase();
      const content = item.content.toLowerCase();
      const tags = item.tags.join(" ").toLowerCase();

      let score = Number.POSITIVE_INFINITY;

      if (title.includes(normalizedQuery)) {
        score = 0;
      } else if (description.includes(normalizedQuery)) {
        score = 0.2;
      } else if (tags.includes(normalizedQuery)) {
        score = 0.35;
      } else if (content.includes(normalizedQuery)) {
        score = 0.5;
      }

      if (!Number.isFinite(score)) {
        return null;
      }

      return {
        projectSlug: item.slug,
        projectTitle: item.title,
        excerpt: buildExcerpt(item, normalizedQuery),
        score
      };
    })
    .filter((result): result is SherlockSearchResult => result !== null)
    .sort((left, right) => left.score - right.score || left.projectTitle.localeCompare(right.projectTitle));
}

function normalizeWindowProps(props: AppProps["props"]): NormalizedSherlockWindowProps {
  if (!isRecord(props)) {
    return {
      index: [],
      projects: [],
      rawProjects: []
    };
  }

  const rawIndex = Array.isArray(props.index)
    ? props.index
    : Array.isArray(props.searchIndex)
      ? props.searchIndex
      : [];
  const rawProjects = Array.isArray(props.projects) ? props.projects : [];
  const onSelectResult = typeof props.onSelectResult === "function"
    ? props.onSelectResult as SherlockWindowProps["onSelectResult"]
    : typeof props.onOpenResult === "function"
      ? props.onOpenResult as SherlockWindowProps["onOpenResult"]
      : undefined;
  const search = typeof props.search === "function"
    ? props.search as SherlockWindowProps["search"]
    : undefined;

  return {
    index: rawIndex.filter(isSearchableItem),
    projects: rawProjects.filter(isProjectSummary),
    rawProjects: rawProjects.filter(isRecord),
    onSelectResult,
    search
  };
}

function ResultsEmptyState({ hasQuery, hasData }: ResultsEmptyStateProps) {
  if (!hasData) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-[12px] text-[#555555]">
        <div className="space-y-2">
          <p className="font-['Chicago'] text-[13px] text-[#222222]">Sherlock</p>
          <p>Search data is not connected for this window yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-[12px] text-[#555555]">
      <div className="space-y-2">
        <p className="font-['Chicago'] text-[13px] text-[#222222]">{hasQuery ? "No items found." : "No projects available."}</p>
        <p>
          {hasQuery
            ? "Try a different title, tag, or keyword."
            : "Sherlock is ready, but no projects were provided to display."}
        </p>
      </div>
    </div>
  );
}

export function Sherlock({ props, windowId }: AppProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const normalizedProps = useMemo(() => normalizeWindowProps(props), [props]);
  const { index, projects, rawProjects, onSelectResult, search } = normalizedProps;
  const searchableItems = useMemo(
    () => mergeSearchableItems(index, projects),
    [index, projects]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [windowId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const results = (() => {
    if (searchableItems.length === 0) {
      return [] as SherlockSearchResult[];
    }

    if (normalizeText(debouncedQuery).length === 0) {
      return buildProjectResults(searchableItems);
    }

    const activeSearch = search ?? searchProjects;
    const normalizedResults = activeSearch(debouncedQuery, searchableItems)
      .map((result) => normalizeResult(result, searchableItems, debouncedQuery))
      .filter((result): result is SherlockSearchResult => result !== null)
      .sort((left, right) => left.score - right.score || left.projectTitle.localeCompare(right.projectTitle));

    return normalizedResults.length > 0 ? dedupeResults(normalizedResults) : fallbackSearch(debouncedQuery, searchableItems);
  })();

  const hasData = searchableItems.length > 0;
  const hasQuery = normalizeText(query).length > 0;

  const handleSelectResult = (result: SherlockSearchResult) => {
    if (onSelectResult) {
      onSelectResult(result);
      return;
    }

    openWindow("finder", {
      projects: rawProjects,
      selectedProjectSlug: result.projectSlug
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#d4d0c8] text-[12px] text-[#1d1d1d]">
      <div className="border-b border-[#8f8f8f] bg-[#d9d9d9] px-3 py-2">
        <div className="flex items-center gap-3">
          <Image
            alt=""
            aria-hidden
            className="h-5 w-5 shrink-0"
            height={20}
            src="/icons/png/11.png"
            width={20}
          />
          <label className="font-['Chicago'] text-[11px] text-[#3f3f3f]" htmlFor={`${windowId}-sherlock-search`}>
            Search
          </label>
          <input
            id={`${windowId}-sherlock-search`}
            ref={inputRef}
            autoFocus
            className="os9-surface-inset min-w-0 flex-1 bg-white px-3 py-1.5 text-[12px] text-[#1f1f1f] outline-none"
            placeholder="Search projects"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || results.length === 0) {
                return;
              }

              handleSelectResult(results[0]);
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-[#8f8f8f] bg-[#efefef] px-3 py-1 font-['Chicago'] text-[11px] text-[#4a4a4a]">
        <span>{hasQuery ? `Searching for "${query.trim()}"` : "All Projects"}</span>
        <span>{results.length} item{results.length === 1 ? "" : "s"}</span>
      </div>

      <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#e5e5e5] p-3">
        {results.length === 0 ? (
          <ResultsEmptyState hasData={hasData} hasQuery={hasQuery} />
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <button
                key={result.projectSlug}
                className="os9-surface-outset flex w-full items-start gap-3 bg-[#f7f7f7] px-3 py-3 text-left transition-colors hover:bg-[#f0f4fb] focus:bg-[#dbe9fb] focus:outline-none"
                type="button"
                onClick={() => handleSelectResult(result)}
              >
                <Image
                  alt=""
                  aria-hidden
                  className="mt-0.5 h-8 w-8 shrink-0"
                  height={32}
                  src="/icons/png/37.png"
                  width={32}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="m-0 font-['Chicago'] text-[12px] text-[#1c1c1c]">{result.projectTitle}</p>
                    <span className="shrink-0 font-['Chicago'] text-[10px] uppercase tracking-[0.08em] text-[#5d5d5d]">
                      Finder
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-[#4a4a4a]">{result.excerpt}</p>
                  <p className="mt-2 font-['Chicago'] text-[10px] uppercase tracking-[0.08em] text-[#6a6a6a]">
                    {result.projectSlug}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#8f8f8f] bg-[#d8d8d8] px-3 py-1 font-['Chicago'] text-[11px] text-[#3d3d3d]">
        {hasData
          ? "Type to search titles, descriptions, tags, and indexed content."
          : "Waiting for the search index and project list to be passed into Sherlock."}
      </footer>
    </div>
  );
}
