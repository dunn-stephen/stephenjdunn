"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  name: string;
  kind: SearchKind;
  type: string;
  location: string;
  desc: string;
  onOpen?: () => void;
}

interface FinderWindowProps {
  projects?: Project[];
  readMeContent?: string;
  initialFilter?: SearchFilter;
}

interface DesktopFileDefinition {
  desc: string;
  id: string;
  name: string;
  noteId?: number;
  type: string;
}

interface SidebarFilter {
  icon: React.ReactNode;
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

function getKindIcon(kind: SearchKind, selected = false, desktop = false) {
  if (kind === "app") {
    return desktop ? <AppIcon selected={selected} /> : <SmallAppIcon selected={selected} />;
  }

  if (kind === "folder") {
    return desktop ? <FolderIconLg selected={selected} /> : <SmallFolderIcon selected={selected} />;
  }

  return desktop ? <DocIcon selected={selected} /> : <SmallDocIcon selected={selected} />;
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
    <div className="flex h-full items-center justify-center px-6 text-center font-['Arial'] text-[10px] tracking-[0.3px] text-[#6a6a6a]">
      <div>
        <p className="m-0 font-['Chicago'] text-[12px] text-[#232323]">
          {query ? "No items found." : "No items available."}
        </p>
        <p className="m-0 mt-2">
          {query ? "Try a different title, type, or location." : "Finder is waiting for connected search items."}
        </p>
      </div>
    </div>
  );
}

function SmallAppIcon({ selected = false }: { selected?: boolean }) {
  return (
    <svg aria-hidden="true" height="15" viewBox="0 0 15 15" width="15">
      <rect fill={selected ? "#dce6ff" : "#1f1f1f"} height="11" rx="1" width="13" x="1" y="1" />
      <rect fill={selected ? "#8eb1ff" : "#8db6ff"} height="7" width="9" x="3" y="3" />
      <rect fill={selected ? "#dce6ff" : "#5e5e5e"} height="1" width="5" x="5" y="13" />
    </svg>
  );
}

function SmallDocIcon({ selected = false }: { selected?: boolean }) {
  return (
    <svg aria-hidden="true" height="15" viewBox="0 0 12 15" width="12">
      <path d="M1 1h6l4 4v9H1z" fill={selected ? "#d9e4ff" : "#f8f8f8"} stroke={selected ? "#c1d4ff" : "#6e6e6e"} />
      <path d="M7 1v4h4" fill={selected ? "#afc7ff" : "#d8d8d8"} />
      <path d="M3 7h5M3 9h5M3 11h4" stroke={selected ? "#5d7fd8" : "#8d8d8d"} strokeWidth="1" />
    </svg>
  );
}

function SmallFolderIcon({ selected = false }: { selected?: boolean }) {
  return (
    <svg aria-hidden="true" height="13" viewBox="0 0 15 13" width="15">
      <path d="M1 4h13v7H1z" fill={selected ? "#a9bcff" : "#f3c243"} stroke={selected ? "#d7e0ff" : "#976c00"} />
      <path d="M1 3h4l1-2h3l1 2h4v2H1z" fill={selected ? "#c3d1ff" : "#ffd775"} stroke={selected ? "#d7e0ff" : "#b98a12"} />
    </svg>
  );
}

function AppIcon({ selected = false }: { selected?: boolean }) {
  return (
    <svg aria-hidden="true" height="36" viewBox="0 0 36 36" width="36">
      <rect fill={selected ? "#18378e" : "#2f2f2f"} height="24" rx="2" width="30" x="3" y="4" />
      <rect fill={selected ? "#9fb9ff" : "#89b6ff"} height="16" rx="1" width="22" x="7" y="8" />
      <rect fill={selected ? "#dbe5ff" : "#808080"} height="2" width="10" x="13" y="30" />
      <rect fill={selected ? "#dbe5ff" : "#5f5f5f"} height="2" width="16" x="10" y="32" />
    </svg>
  );
}

function DocIcon({ selected = false }: { selected?: boolean }) {
  return (
    <svg aria-hidden="true" height="28" viewBox="0 0 24 28" width="24">
      <path d="M3 1h12l6 6v20H3z" fill={selected ? "#dce6ff" : "#fafafa"} stroke={selected ? "#6d8fe6" : "#737373"} />
      <path d="M15 1v6h6" fill={selected ? "#a8c1ff" : "#d9d9d9"} />
      <path d="M6 11h10M6 14h10M6 17h10M6 20h8" stroke={selected ? "#5d7fd8" : "#9a9a9a"} strokeWidth="1.2" />
    </svg>
  );
}

function FolderIconLg({ selected = false }: { selected?: boolean }) {
  return (
    <svg aria-hidden="true" height="36" viewBox="0 0 36 28" width="36">
      <path d="M2 9h32v16H2z" fill={selected ? "#9eb4ff" : "#f3c243"} stroke={selected ? "#dbe5ff" : "#916600"} strokeWidth="1.2" />
      <path d="M2 7h10l2-4h8l2 4h10v4H2z" fill={selected ? "#c7d5ff" : "#ffd775"} stroke={selected ? "#dbe5ff" : "#bc8d12"} strokeWidth="1.2" />
    </svg>
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

  if (filter === "app") {
    return <SmallAppIcon selected={selected} />;
  }

  if (filter === "file") {
    return <SmallDocIcon selected={selected} />;
  }

  return <SmallFolderIcon selected={selected} />;
}

function ListHeader() {
  return (
    <div className="grid h-[22px] shrink-0 grid-cols-[minmax(0,1fr)_58px_120px_148px] border-b border-[#ababab] bg-[linear-gradient(180deg,#ebebeb_0%,#d3d3d3_100%)] font-['Chicago'] text-[9px] uppercase tracking-[0.04em] text-[#3d3d3d]">
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
    { id: "all", label: "All Results", icon: <SidebarIcon filter="all" selected={selectedFilter === "all"} /> },
    { id: "app", label: "Apps", icon: <SidebarIcon filter="app" selected={selectedFilter === "app"} /> },
    { id: "file", label: "Files", icon: <SidebarIcon filter="file" selected={selectedFilter === "file"} /> },
    { id: "desktop", label: "Desktop", icon: <SidebarIcon filter="desktop" selected={selectedFilter === "desktop"} /> },
    { id: "trash", label: "Trash", icon: <SidebarIcon filter="trash" selected={selectedFilter === "trash"} /> }
  ]), [selectedFilter]);

  const openFirstResult = () => {
    results[0]?.onOpen?.();
  };

  const showDesktopGrid = selectedFilter === "desktop" && viewMode === "grid";
  const statusLabel = `Finder  \u203a  ${getFilterLabel(selectedFilter)}`;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#dadada] text-[#1c1c1c]">
      <div className="flex h-[28px] items-center gap-[5px] border-b border-[#ababab] bg-[linear-gradient(180deg,#ededed_0%,#d7d7d7_100%)] px-[6px]">
        <div className="flex h-[20px] min-w-0 flex-1 items-center border border-[#606060] bg-[linear-gradient(180deg,#ffffff_0%,#f0f0f0_100%)] px-[6px] shadow-[inset_1px_1px_0_#a0a0a0,inset_-1px_-1px_0_#ffffff]">
          <SearchIcon />
          <input
            id={`${windowId}-finder-search`}
            ref={inputRef}
            autoFocus
            className="min-w-0 flex-1 bg-transparent px-[5px] font-['Arial'] text-[10px] text-[#262626] outline-none placeholder:text-[#8a8a8a]"
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
              className="flex h-3 w-3 items-center justify-center rounded-full border border-[#7d7d7d] bg-[linear-gradient(180deg,#f7f7f7_0%,#d5d5d5_100%)] text-[9px] leading-none text-[#505050]"
              type="button"
              onClick={() => setQuery("")}
            >
              x
            </button>
          ) : null}
        </div>

        <div className="flex h-[20px] overflow-hidden border border-[#7f7f7f] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#9f9f9f]">
          <button
            aria-label="List view"
            className={`flex w-[24px] items-center justify-center border-r border-[#8e8e8e] text-[11px] leading-none ${
              viewMode === "list"
                ? "bg-[linear-gradient(180deg,#b8ccf0_0%,#91aee0_100%)]"
                : "bg-[linear-gradient(180deg,#f8f8f8_0%,#d0d0d0_100%)]"
            }`}
            type="button"
            onClick={() => setViewMode("list")}
          >
            ≡
          </button>
          <button
            aria-label="Grid view"
            className={`flex w-[24px] items-center justify-center text-[11px] leading-none ${
              viewMode === "grid"
                ? "bg-[linear-gradient(180deg,#b8ccf0_0%,#91aee0_100%)]"
                : "bg-[linear-gradient(180deg,#f8f8f8_0%,#d0d0d0_100%)]"
            }`}
            type="button"
            onClick={() => setViewMode("grid")}
          >
            ⊞
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex w-[152px] shrink-0 flex-col border-r border-[#ababab] bg-white">
          <div className="px-3 pb-2 pt-3 font-['Chicago'] text-[9px] uppercase tracking-[0.08em] text-[#6d6d6d]">
            Finder
          </div>

          {sidebarFilters.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            const count = counts[filter.id];

            return (
              <button
                key={filter.id}
                className={`flex h-[22px] items-center gap-2 px-3 text-left font-['Arial'] text-[10px] ${
                  isSelected
                    ? "bg-[#0000a8] text-white"
                    : "bg-transparent text-[#202020] hover:bg-[#dbe9fb]"
                }`}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
              >
                <span className="flex h-[15px] w-[15px] items-center justify-center">{filter.icon}</span>
                <span className="min-w-0 flex-1 truncate">{filter.label}</span>
                <span className={`shrink-0 text-[9px] ${isSelected ? "text-[#aaccff]" : "text-[#aaaaaa]"}`}>
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
                    className="flex w-[116px] cursor-default flex-col items-center text-center"
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
                      {getKindIcon(item.kind, false, true)}
                    </div>
                    <div className="w-full px-1 font-['Arial'] text-[10px] leading-[11px] text-[#1f1f1f]" style={GRID_LABEL_STYLE}>
                      {item.name}
                    </div>
                    <div className="mt-1 font-['Arial'] text-[8px] uppercase tracking-[0.04em] text-[#999999]">
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
                    className="flex w-[112px] cursor-default flex-col items-center text-center"
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
                      {getKindIcon(item.kind, false, true)}
                    </div>
                    <div className="w-full px-1 font-['Arial'] text-[10px] leading-[11px] text-[#1f1f1f]" style={GRID_LABEL_STYLE}>
                      {item.name}
                    </div>
                    <div className="mt-1 w-full px-1 font-['Arial'] text-[8px] leading-[10px] text-[#888888]" style={GRID_LOCATION_STYLE}>
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
                    className="grid h-[22px] cursor-default grid-cols-[minmax(0,1fr)_58px_120px_148px] border-b border-[#e8e8e8] font-['Arial'] text-[10px] tracking-[0.2px] text-[#232323]"
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
                      <span className="shrink-0">{getKindIcon(item.kind)}</span>
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

      <div className="flex h-[20px] items-center justify-between bg-[#dadada] px-[8px] font-['Arial'] text-[10px] tracking-[0.4px] text-[#2d2d2d]">
        <span>{statusLabel}</span>
        <span>{results.length} item{results.length === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}
