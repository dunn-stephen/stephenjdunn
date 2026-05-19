"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { getTrashFileIconPath } from "@/lib/file-icons";
import { NOTES } from "@/lib/notes-config";
import { appRegistry } from "@/lib/app-registry";
import { TRASH_FILE_NAMES } from "@/lib/trash-files";
import { useWindowStore } from "@/lib/window-store";
import type { AppId, AppProps, Project, ProjectFile } from "@/types";

type SearchKind = "app" | "file" | "folder";
type SearchFilter = "all" | "app" | "file" | "desktop" | "trash";
type ViewMode = "list" | "grid";

const FINDER_APP_ORDER: AppId[] = [
  "finder",
  "textedit",
  "simpletext",
  "mail",
  "space-invaders",
  "notepad",
  "calculator",
  "about"
];

const APP_DESCRIPTIONS: Partial<Record<AppId, string>> = {
  finder: "Search apps, folders, notes, project files, and Trash.",
  textedit: "Open project notes and markdown documents.",
  simpletext: "Read the resume placeholder in a classic text window.",
  mail: "Launch the default mail client with a new message.",
  "space-invaders": "Play the built-in Space Invaders clone.",
  notepad: "Open short editable notes on the desktop.",
  calculator: "Handle quick calculations in a compact desk accessory.",
  about: "Show system details and icon credits."
};

const TWO_LINE_CLAMP_STYLE = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden"
} as const;

const GRID_LABEL_STYLE = {
  ...TWO_LINE_CLAMP_STYLE,
  minHeight: "22px"
} as const;

const GRID_LOCATION_STYLE = {
  ...TWO_LINE_CLAMP_STYLE,
  minHeight: "20px"
} as const;

export interface SearchItem {
  id: string;
  iconPath?: string;
  name: string;
  kind: SearchKind;
  type: string;
  location: string;
  desc: string;
  onOpen?: () => void;
}

interface DesktopFileDefinition {
  desc: string;
  id: string;
  name: string;
  noteId?: number;
  type: string;
}

interface SidebarFilter {
  id: SearchFilter;
  label: string;
}

function isProjectFile(value: unknown): value is ProjectFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === "string"
    && (candidate.type === "mdx" || candidate.type === "image")
    && typeof candidate.path === "string"
    && (candidate.content === undefined || typeof candidate.content === "string")
  );
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.slug === "string"
    && typeof candidate.title === "string"
    && typeof candidate.description === "string"
    && typeof candidate.year === "number"
    && Array.isArray(candidate.tags)
    && candidate.tags.every((tag) => typeof tag === "string")
    && typeof candidate.github === "string"
    && typeof candidate.icon === "string"
    && Array.isArray(candidate.files)
    && candidate.files.every(isProjectFile)
  );
}

function readProjects(props: AppProps["props"]) {
  return Array.isArray(props?.projects) ? props.projects.filter(isProject) : [];
}

function readReadMeContent(props: AppProps["props"]) {
  return typeof props?.readMeContent === "string" ? props.readMeContent : "";
}

function readInitialFilter(props: AppProps["props"]): SearchFilter {
  return props?.initialFilter === "trash" ? "trash" : "desktop";
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function filterItems(query: string, category: SearchFilter, items: SearchItem[]) {
  let results = items;

  if (category === "app") {
    results = results.filter((item) => item.kind === "app");
  }

  if (category === "file") {
    results = results.filter((item) => item.kind === "file");
  }

  if (category === "desktop") {
    results = results.filter((item) => item.location === "Desktop");
  }

  if (category === "trash") {
    results = results.filter((item) => item.location === "Trash");
  }

  if (query.trim()) {
    const normalizedQuery = query.toLowerCase();

    results = results.filter((item) => (
      item.name.toLowerCase().includes(normalizedQuery)
      || item.desc.toLowerCase().includes(normalizedQuery)
      || item.type.toLowerCase().includes(normalizedQuery)
      || item.location.toLowerCase().includes(normalizedQuery)
    ));
  }

  return results;
}

function titleCase(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function getDesktopFileDefinitions(readMeContent: string): DesktopFileDefinition[] {
  return [
    {
      id: "desktop:read-me",
      name: "Read Me",
      type: "Text Document",
      desc: readMeContent ? normalizeText(readMeContent).slice(0, 120) : "Open the desktop help document."
    },
    {
      id: "desktop:resume",
      name: "Resume",
      type: "SimpleText Document",
      desc: "View the resume placeholder in SimpleText."
    },
    ...Object.entries(NOTES).map(([noteId, note]) => ({
      id: `desktop:note-${noteId}`,
      name: note.title,
      type: "Note Pad Document",
      noteId: Number(noteId),
      desc: normalizeText(note.content)
    }))
  ];
}

function getTrashFileType(fileName: string) {
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
    return "Image File";
  }

  if (/\.(avi|mov|mp4|mkv)$/i.test(fileName)) {
    return "Movie File";
  }

  if (/\.(ppt|pptx)$/i.test(fileName)) {
    return "Presentation File";
  }

  if (/\.(xls|xlsx)$/i.test(fileName)) {
    return "Spreadsheet File";
  }

  if (/\.(doc|docx)$/i.test(fileName)) {
    return "Document File";
  }

  return "Text File";
}

function buildSearchItems({
  openWindow,
  projects,
  readMeContent
}: {
  openWindow: (appId: AppId, props?: Record<string, unknown>) => void;
  projects: Project[];
  readMeContent: string;
}) {
  const items: SearchItem[] = [];

  for (const appId of FINDER_APP_ORDER) {
    if (appId === "corrupted-file-dialog" || appId === "project-browser") {
      continue;
    }

    const definition = appRegistry[appId];

    items.push({
      id: appId,
      name: definition.name,
      kind: "app",
      type: "Application",
      location: "Desktop",
      desc: APP_DESCRIPTIONS[appId] ?? "Open this app.",
      iconPath: definition.icon,
      onOpen: () => {
        if (appId === "finder") {
          openWindow("finder", {
            projects,
            readMeContent,
            initialFilter: "desktop"
          });
          return;
        }

        openWindow(appId);
      }
    });
  }

  items.push({
    id: "projects",
    name: "Projects",
    kind: "folder",
    type: "Folder",
    location: "Desktop",
    desc: "Browse all project folders.",
    iconPath: "/icons/png/37.png",
    onOpen: () => {
      openWindow("project-browser", {
        projects,
        title: "Projects"
      });
    }
  });

  items.push({
    id: "trash",
    name: "Trash",
    kind: "folder",
    type: "Trash",
    location: "Desktop",
    desc: "Browse discarded files in Trash.",
    iconPath: "/icons/trash-os9.svg",
    onOpen: () => {
      openWindow("finder", {
        projects,
        readMeContent,
        initialFilter: "trash"
      });
    }
  });

  for (const file of getDesktopFileDefinitions(readMeContent)) {
    items.push({
      id: file.id,
      name: file.name,
      kind: "file",
      type: file.type,
      location: "Desktop",
      desc: file.desc,
      iconPath: file.id === "desktop:resume" ? "/icons/png/8.png" : file.id.startsWith("desktop:note-") ? "/icons/png/12.png" : "/icons/png/28.png",
      onOpen: () => {
        if (file.id === "desktop:read-me") {
          openWindow("textedit", {
            content: readMeContent,
            title: "Read Me"
          });
          return;
        }

        if (file.id === "desktop:resume") {
          openWindow("simpletext");
          return;
        }

        if (typeof file.noteId === "number") {
          openWindow("notepad", {
            noteId: file.noteId,
            title: file.name
          });
        }
      }
    });
  }

  for (const fileName of TRASH_FILE_NAMES) {
    items.push({
      id: `trash:${fileName}`,
      name: fileName,
      kind: "file",
      type: getTrashFileType(fileName),
      location: "Trash",
      desc: "Discarded file in Trash.",
      iconPath: getTrashFileIconPath(fileName),
      onOpen: () => {
        openWindow("corrupted-file-dialog", {
          fileName,
          title: "Cannot Open File"
        });
      }
    });
  }

  for (const project of projects) {
    items.push({
      id: project.slug,
      name: project.title,
      kind: "folder",
      type: "Folder",
      location: "Projects",
      desc: project.description,
      iconPath: "/icons/png/37.png",
      onOpen: () => {
        openWindow("project-browser", {
          projects,
          selectedProjectSlug: project.slug,
          title: project.title
        });
      }
    });

    const indexFile = project.files.find((file) => file.type === "mdx" && file.name === "index.mdx");

    if (!indexFile) {
      continue;
    }

    items.push({
      id: indexFile.path,
      name: indexFile.name,
      kind: "file",
      type: "MDX Document",
      location: `Projects \u203a ${project.title}`,
      desc: project.description,
      iconPath: "/icons/png/28.png",
      onOpen: () => {
        openWindow("textedit", {
          content: indexFile.content ?? "",
          title: indexFile.name
        });
      }
    });
  }

  return items.sort((left, right) => left.name.localeCompare(right.name));
}

function getDefaultIconPath(kind: SearchKind) {
  if (kind === "folder") {
    return "/icons/png/37.png";
  }

  if (kind === "app") {
    return "/icons/png/4.png";
  }

  return "/icons/png/28.png";
}

function SearchItemIcon({ item, desktop = false }: { item: SearchItem; desktop?: boolean }) {
  const iconSize = desktop ? 32 : 16;

  return (
    <Image
      src={item.iconPath ?? getDefaultIconPath(item.kind)}
      alt=""
      width={iconSize}
      height={iconSize}
      className={`${desktop ? "h-8 w-8" : "h-4 w-4"} object-contain [image-rendering:pixelated]`}
    />
  );
}

function getFilterLabel(filter: SearchFilter) {
  if (filter === "all") {
    return "All Results";
  }

  if (filter === "app") {
    return "Apps";
  }

  if (filter === "file") {
    return "Files";
  }

  if (filter === "trash") {
    return "Trash";
  }

  return "Desktop";
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="os9-empty-state">
      <div>
        <p className="os9-empty-state__title">
          {query ? "No items found." : "No items available."}
        </p>
        <p className="m-0 mt-2">
          {query ? "Try a different title, type, or location." : "Finder is waiting for connected search items."}
        </p>
      </div>
    </div>
  );
}

function SearchIcon({ selected = false }: { selected?: boolean }) {
  return (
    <svg aria-hidden="true" height="12" viewBox="0 0 12 12" width="12">
      <circle cx="5" cy="5" fill="none" r="3.5" stroke={selected ? "#dbe5ff" : "#4c4c4c"} strokeWidth="1.4" />
      <path d="M7.8 7.8L11 11" stroke={selected ? "#dbe5ff" : "#4c4c4c"} strokeWidth="1.4" />
    </svg>
  );
}

function SidebarIcon({ filter, selected }: { filter: SearchFilter; selected: boolean }) {
  if (filter === "all") {
    return <SearchIcon selected={selected} />;
  }

  const item: SearchItem = {
    id: filter,
    name: filter,
    kind: filter === "app" ? "app" : filter === "file" ? "file" : "folder",
    type: "",
    location: "",
    desc: "",
    iconPath: filter === "trash" ? "/icons/trash-os9.svg" : undefined
  };

  return <SearchItemIcon item={item} />;
}

function ListHeader() {
  return (
    <div className="os9-list-header grid h-[22px] shrink-0 grid-cols-[minmax(0,1fr)_58px_120px_148px] uppercase text-[#3d3d3d]">
      <div className="flex items-center px-2">Name</div>
      <div className="flex items-center px-2">Kind</div>
      <div className="flex items-center px-2">Where</div>
      <div className="flex items-center px-2">Type</div>
    </div>
  );
}

export function Finder({ props, windowId }: AppProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const initialFilter = useMemo(() => readInitialFilter(props), [props]);
  const [selectedFilter, setSelectedFilter] = useState<SearchFilter>(initialFilter);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const projects = useMemo(() => readProjects(props), [props]);
  const readMeContent = useMemo(() => readReadMeContent(props), [props]);

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

  useEffect(() => {
    setSelectedFilter(initialFilter);
  }, [initialFilter]);

  const items = useMemo(
    () => buildSearchItems({ openWindow, projects, readMeContent }),
    [openWindow, projects, readMeContent]
  );

  const counts = useMemo(() => ({
    all: filterItems(debouncedQuery, "all", items).length,
    app: filterItems(debouncedQuery, "app", items).length,
    file: filterItems(debouncedQuery, "file", items).length,
    desktop: filterItems(debouncedQuery, "desktop", items).length,
    trash: filterItems(debouncedQuery, "trash", items).length
  }), [debouncedQuery, items]);

  const results = useMemo(
    () => filterItems(debouncedQuery, selectedFilter, items),
    [debouncedQuery, items, selectedFilter]
  );

  const sidebarFilters = useMemo<SidebarFilter[]>(() => ([
    { id: "all", label: "All Results" },
    { id: "app", label: "Apps" },
    { id: "file", label: "Files" },
    { id: "desktop", label: "Desktop" },
    { id: "trash", label: "Trash" }
  ]), []);

  const openFirstResult = () => {
    results[0]?.onOpen?.();
  };

  const showDesktopGrid = selectedFilter === "desktop" && viewMode === "grid";
  const statusLabel = `Finder  \u203a  ${getFilterLabel(selectedFilter)}`;

  return (
    <div className="os9-app-shell flex h-full min-h-0 flex-col">
      <div className="os9-toolbar flex h-[28px] items-center gap-[5px] px-[6px]">
        <div className="os9-search-field min-w-0 flex-1 px-[6px]">
          <SearchIcon />
          <input
            id={`${windowId}-finder-search`}
            ref={inputRef}
            autoFocus
            className="os9-search-field__input px-[5px]"
            placeholder="Search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                openFirstResult();
              }
            }}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="os9-pill-button"
              type="button"
              onClick={() => setQuery("")}
            >
              x
            </button>
          ) : null}
        </div>

        <div className="os9-view-toggle">
          <button
            aria-label="List view"
            className="os9-view-toggle__button"
            data-active={viewMode === "list"}
            type="button"
            onClick={() => setViewMode("list")}
          >
            <span className="os9-view-toggle__glyph os9-view-toggle__glyph--list" />
          </button>
          <button
            aria-label="Grid view"
            className="os9-view-toggle__button"
            data-active={viewMode === "grid"}
            type="button"
            onClick={() => setViewMode("grid")}
          >
            <span className="os9-view-toggle__glyph os9-view-toggle__glyph--grid" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="os9-sidebar flex w-[152px] shrink-0 flex-col border-r border-[#ababab]">
          <div className="os9-sidebar__section">
            Finder
          </div>

          {sidebarFilters.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            const count = counts[filter.id];

            return (
              <button
                key={filter.id}
                className="os9-sidebar__item"
                data-selected={isSelected}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  <SidebarIcon filter={filter.id} selected={isSelected} />
                </span>
                <span className="min-w-0 flex-1 truncate">{filter.label}</span>
                <span className="os9-sidebar__count shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-white">
          {viewMode === "list" ? <ListHeader /> : null}

          <div className="app-scrollbar min-h-0 flex-1 overflow-auto">
            {results.length === 0 ? (
              <EmptyState query={debouncedQuery} />
            ) : showDesktopGrid ? (
              <div className="flex flex-wrap content-start gap-x-4 gap-y-5 px-4 py-4">
                {results.map((item) => (
                  <div
                    key={`${item.kind}:${item.id}:${item.location}`}
                    className="os9-grid-item w-[116px] cursor-default"
                    role="button"
                    tabIndex={0}
                    onDoubleClick={() => item.onOpen?.()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        item.onOpen?.();
                      }
                    }}
                  >
                    <div className="flex h-[52px] items-center justify-center">
                      <SearchItemIcon item={item} desktop />
                    </div>
                    <div className="os9-grid-item__label" style={GRID_LABEL_STYLE}>
                      {item.name}
                    </div>
                    <div className="mt-1 font-['Charcoal'] text-[8px] uppercase tracking-[0.04em] text-[#7f7f7f]">
                      {titleCase(item.kind)}
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "grid" ? (
              <div className="flex flex-wrap content-start gap-x-4 gap-y-5 px-4 py-4">
                {results.map((item) => (
                  <div
                    key={`${item.kind}:${item.id}:${item.location}`}
                    className="os9-grid-item w-[112px] cursor-default"
                    role="button"
                    tabIndex={0}
                    onDoubleClick={() => item.onOpen?.()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        item.onOpen?.();
                      }
                    }}
                  >
                    <div className="flex h-[44px] items-center justify-center">
                      <SearchItemIcon item={item} desktop />
                    </div>
                    <div className="os9-grid-item__label" style={GRID_LABEL_STYLE}>
                      {item.name}
                    </div>
                    <div className="os9-grid-item__meta mt-1" style={GRID_LOCATION_STYLE}>
                      {item.location}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="min-w-[420px]">
                {results.map((item) => (
                  <div
                    key={`${item.kind}:${item.id}:${item.location}`}
                    className="os9-list-row grid h-[22px] cursor-default grid-cols-[minmax(0,1fr)_58px_120px_148px] tracking-[0.2px] text-[#232323]"
                    role="button"
                    tabIndex={0}
                    onDoubleClick={() => item.onOpen?.()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        item.onOpen?.();
                      }
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2 px-2">
                      <span className="shrink-0">
                        <SearchItemIcon item={item} />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center px-2">{titleCase(item.kind)}</div>
                    <div className="truncate px-2 py-[5px]">{item.location}</div>
                    <div className="truncate px-2 py-[5px]">{item.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="os9-status-bar">
        <span className="os9-status-bar__segment truncate">{statusLabel}</span>
        <span className="os9-status-bar__segment shrink-0">{results.length} item{results.length === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}
