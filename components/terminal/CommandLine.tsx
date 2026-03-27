"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AsciiBanner } from "@/components/home/AsciiBanner";
import { pandaArt } from "@/lib/asciiArt";
import type { TerminalNavigateDetail } from "@/lib/terminalNavigation";
import { getCommandForRoute, resolveNamedRoute } from "@/lib/terminalNavigation";
import { shellHost, shellUser, siteConfig } from "@/lib/site";

type CommandLineProps = {
  onToggleSidebar: () => void;
  workspace?: ReactNode;
  projects?: Array<{ title: string; slug: string }>;
  posts?: Array<{ title: string; slug: string }>;
};

const helpLines = [
  "ArrowUp / ArrowDown - recall command history",
  "banner - print the ASCII banner",
  "blog - open the blog directory",
  "cat <doc> - open a document or item",
  "cd .. - go to the parent location",
  "cd <folder> - change to a page, folder, or item",
  "clear - clear terminal history",
  "contact - open the contact document",
  "help - show available commands",
  "home - open the home workspace",
  "ls - list files in the current location",
  "open github - open GitHub in a new tab",
  "open <page> - open a page in the modal",
  "panda - print panda ASCII art",
  "projects - open the projects directory",
  "resume - open the resume document",
  "tree - toggle the sidebar tree",
  "whoami - print the current identity"
];

type HistoryEntry = {
  id: string;
  kind: "command" | "output" | "system" | "banner";
  text: string;
  cwd?: string;
};

const storageKey = "terminal-history-v1";
const commandHistoryKey = "terminal-command-history-v1";

function readStoredEntries() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedEntries = window.localStorage.getItem(storageKey);
    return savedEntries ? (JSON.parse(savedEntries) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function readStoredCommandHistory() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedHistory = window.localStorage.getItem(commandHistoryKey);
    return savedHistory ? (JSON.parse(savedHistory) as string[]) : [];
  } catch {
    return [];
  }
}

function getCwdLabel(pathname: string) {
  if (pathname.startsWith("/projects")) {
    return "projects";
  }
  if (pathname.startsWith("/blog")) {
    return "blog";
  }
  return "~";
}

function getLsOutput(
  pathname: string,
  projects: Array<{ title: string; slug: string }>,
  posts: Array<{ title: string; slug: string }>
) {
  if (pathname === "/projects") {
    return projects.map((project) => project.slug).join("    ");
  }

  if (pathname.startsWith("/projects/")) {
    const slug = pathname.split("/")[2];
    return slug ? `${slug}.md` : "";
  }

  if (pathname === "/blog") {
    return posts.map((post) => post.slug).join("    ");
  }

  if (pathname.startsWith("/blog/")) {
    const slug = pathname.split("/")[2];
    return slug ? `${slug}.md` : "";
  }

  if (pathname === "/resume") {
    return "resume.md";
  }

  if (pathname === "/contact") {
    return "contact.md";
  }

  return ["README.md", "projects", "resume.md", "blog", "contact.md"].join("    ");
}

function getParentRoute(pathname: string): Route {
  if (pathname === "/") {
    return "/";
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return "/";
  }

  return `/${segments.slice(0, -1).join("/")}` as Route;
}

function normalizeRouteKey(value: string) {
  return value.replace(/\/$/, "").toLowerCase().replace(/\.mdx?$/, "");
}

function resolveDirectoryItemRoute(
  pathname: string,
  key: string,
  projects: Array<{ title: string; slug: string }>,
  posts: Array<{ title: string; slug: string }>
): Route | null {
  if (pathname === "/projects") {
    const project = projects.find((item) => item.slug.toLowerCase() === key);
    if (project) {
      return `/projects/${project.slug}` as Route;
    }
  }

  if (pathname === "/blog") {
    const post = posts.find((item) => item.slug.toLowerCase() === key);
    if (post) {
      return `/blog/${post.slug}` as Route;
    }
  }

  return null;
}

function resolveCdTarget(
  pathname: string,
  arg: string,
  projects: Array<{ title: string; slug: string }>,
  posts: Array<{ title: string; slug: string }>
): Route | null {
  const key = normalizeRouteKey(arg);

  if (!key || key === "~" || key === "/") {
    return "/";
  }

  if (key === "..") {
    return getParentRoute(pathname);
  }

  const namedRoute = resolveNamedRoute(key);
  if (namedRoute) {
    return namedRoute;
  }

  return resolveDirectoryItemRoute(pathname, key, projects, posts);
}

function resolveDirectRouteAlias(
  pathname: string,
  command: string,
  projects: Array<{ title: string; slug: string }>,
  posts: Array<{ title: string; slug: string }>
): Route | null {
  const key = normalizeRouteKey(command);

  return resolveNamedRoute(key) ?? resolveDirectoryItemRoute(pathname, key, projects, posts);
}

export function CommandLine({
  onToggleSidebar,
  workspace,
  projects = [],
  posts = []
}: CommandLineProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [showBootWorkspace, setShowBootWorkspace] = useState(() => pathname === "/");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setEntries(readStoredEntries());
      setCommandHistory(readStoredCommandHistory());
      setHasLoadedStorage(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(entries));
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [entries, hasLoadedStorage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [pathname]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    window.localStorage.setItem(commandHistoryKey, JSON.stringify(commandHistory));
  }, [commandHistory, hasLoadedStorage]);

  const cwdLabel = useMemo(() => getCwdLabel(pathname), [pathname]);
  const shouldRenderBootWorkspace = pathname === "/" && entries.length === 0 && Boolean(workspace) && showBootWorkspace;

  const appendEntries = (nextEntries: HistoryEntry[]) => {
    setEntries((current) => [...current, ...nextEntries]);
  };

  const focusInput = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    const caretPosition = input.value.length;
    input.setSelectionRange(caretPosition, caretPosition);
  };

  const handlePanelClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest("a, button, input, textarea, select, summary")) {
      return;
    }

    focusInput();
  };

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const detail = (event as CustomEvent<TerminalNavigateDetail>).detail;
      if (!detail?.href || !detail.command) {
        return;
      }

      appendEntries([
        {
          id: crypto.randomUUID(),
          kind: "command",
          text: detail.command,
          cwd: cwdLabel
        }
      ]);

      setCommandHistory((current) => {
        if (current[current.length - 1] === detail.command) {
          return current;
        }
        return [...current, detail.command];
      });

      setHistoryIndex(null);
      setShowBootWorkspace(false);
    };

    window.addEventListener("terminal:navigate", handleNavigate);
    return () => window.removeEventListener("terminal:navigate", handleNavigate);
  }, [cwdLabel]);

  const execute = (raw: string) => {
    const command = raw.trim();
    if (!command) {
      return;
    }

    const [name, ...rest] = command.split(/\s+/);
    const arg = rest.join(" ");

    let renderedCommand = command;
    let navigationTarget: Route | null = null;

    if (rest.length === 0) {
      navigationTarget = resolveDirectRouteAlias(pathname, name, projects, posts);
    }

    if (navigationTarget) {
      renderedCommand = getCommandForRoute(navigationTarget);
    } else if (name === "open" && arg) {
      const target = resolveDirectRouteAlias(pathname, arg, projects, posts);
      if (target) {
        navigationTarget = target;
        renderedCommand = getCommandForRoute(navigationTarget);
      }
    } else if (name === "cat" && arg) {
      const target = resolveDirectRouteAlias(pathname, arg, projects, posts);
      if (target) {
        navigationTarget = target;
      }
    } else if (name === "cd") {
      const target = resolveCdTarget(pathname, arg, projects, posts);
      if (target) {
        navigationTarget = target;
      }
    }

    setShowBootWorkspace(false);

    appendEntries([
      {
        id: crypto.randomUUID(),
        kind: "command",
        text: renderedCommand,
        cwd: cwdLabel
      }
    ]);

    setCommandHistory((current) => {
      if (current[current.length - 1] === renderedCommand) {
        return current;
      }
      return [...current, renderedCommand];
    });
    setHistoryIndex(null);

    if (name === "help") {
      appendEntries(
        helpLines.map((line) => ({
          id: crypto.randomUUID(),
          kind: "output" as const,
          text: line
        }))
      );
      return;
    }

    if (name === "clear") {
      setEntries([]);
      return;
    }

    if (name === "ls") {
      appendEntries([
        {
          id: crypto.randomUUID(),
          kind: "output",
          text: getLsOutput(pathname, projects, posts) || "empty"
        }
      ]);
      return;
    }

    if (name === "whoami") {
      appendEntries([{ id: crypto.randomUUID(), kind: "output", text: "Stephen Dunn" }]);
      return;
    }

    if (name === "open" && arg.toLowerCase() === "github") {
      window.open(siteConfig.socialLinks.github, "_blank", "noopener,noreferrer");
      appendEntries([
        {
          id: crypto.randomUUID(),
          kind: "output",
          text: `opening ${siteConfig.socialLinks.github}`
        }
      ]);
      return;
    }

    if (name === "tree") {
      onToggleSidebar();
      appendEntries([{ id: crypto.randomUUID(), kind: "output", text: "tree toggled" }]);
      return;
    }

    if (name === "banner") {
      appendEntries([{ id: crypto.randomUUID(), kind: "banner", text: "" }]);
      return;
    }

    if (name === "panda") {
      appendEntries([{ id: crypto.randomUUID(), kind: "output", text: pandaArt }]);
      return;
    }

    if (navigationTarget) {
      router.push(navigationTarget);
      return;
    }

    appendEntries([{ id: crypto.randomUUID(), kind: "output", text: `zsh: command not found: ${name}` }]);
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col rounded-3xl border border-border bg-black/35"
      onClick={handlePanelClick}
    >
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-dim">terminal.session</p>
      </div>
      <div
        ref={scrollRef}
        className="tui-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3"
      >
        <div className="flex min-h-full flex-col justify-end">
          <div className="space-y-1 text-[13px] leading-5">
            {shouldRenderBootWorkspace ? (
              <div className="mb-3">
                <p className="text-text">
                  <span className="text-accent">{shellUser}</span>
                  <span className="text-text">@{shellHost}</span>{" "}
                  <span className="text-dim">{cwdLabel}</span> <span className="text-text">%</span>{" "}
                  ./boot-portfolio
                </p>
                <div className="mt-3">{workspace}</div>
              </div>
            ) : null}
            {entries.map((entry) => (
              <div key={entry.id} className="break-words">
                {entry.kind === "command" ? (
                  <p className="text-text">
                    <span className="text-accent">{shellUser}</span>
                    <span className="text-text">@{shellHost}</span>{" "}
                    <span className="text-dim">{entry.cwd ?? cwdLabel}</span>{" "}
                    <span className="text-text">%</span> {entry.text}
                  </p>
                ) : entry.kind === "banner" ? (
                  <div className="py-2">
                    <AsciiBanner inline />
                  </div>
                ) : entry.kind === "system" ? (
                  <p className="text-dim">{entry.text}</p>
                ) : (
                  <p className="whitespace-pre-wrap text-text">{entry.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-surface/95 px-4 py-3 backdrop-blur">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            execute(value);
            setValue("");
          }}
          className="flex items-center gap-2 text-[13px] leading-5"
        >
          <span className="shrink-0">
            <span className="text-accent">{shellUser}</span>
            <span className="text-text">@{shellHost}</span>
          </span>
          <span className="shrink-0 text-dim">{cwdLabel}</span>
          <span className="shrink-0 text-text">%</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                if (commandHistory.length === 0) {
                  return;
                }

                const nextIndex =
                  historyIndex === null
                    ? commandHistory.length - 1
                    : Math.max(0, historyIndex - 1);

                setHistoryIndex(nextIndex);
                setValue(commandHistory[nextIndex] ?? "");
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                if (commandHistory.length === 0) {
                  return;
                }

                if (historyIndex === null) {
                  return;
                }

                const nextIndex = historyIndex + 1;
                if (nextIndex >= commandHistory.length) {
                  setHistoryIndex(null);
                  setValue("");
                  return;
                }

                setHistoryIndex(nextIndex);
                setValue(commandHistory[nextIndex] ?? "");
              }
            }}
            className="w-full border-0 bg-transparent text-text caret-accent outline-none placeholder:text-dim"
            placeholder=""
            aria-label="Terminal command input"
          />
        </form>
      </div>
    </div>
  );
}
