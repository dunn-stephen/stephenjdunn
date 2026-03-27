"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type CommandLineProps = {
  onToggleSidebar?: () => void;
  onToggleCrt?: () => void;
  children?: ReactNode;
  projects?: Array<{ title: string; slug: string }>;
  posts?: Array<{ title: string; slug: string }>;
};

const pageCommands: Record<string, Route> = {
  home: "/",
  projects: "/projects",
  resume: "/resume",
  blog: "/blog",
  contact: "/contact"
};

const helpLines = [
  "commands: home, projects, resume, blog, contact",
  "commands: ls, open <page>, cd <folder>, cd .., cat <doc>, tree, crt, clear, help",
  "navigation: ArrowUp / ArrowDown recall previous commands"
];

type HistoryEntry = {
  id: string;
  kind: "command" | "output" | "system";
  text: string;
  cwd?: string;
};

const storageKey = "terminal-history-v1";
const commandHistoryKey = "terminal-command-history-v1";
const shellUser = "stephendunn";
const shellHost = "Stephen-Dunn-KQPFWR6HR4";

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

function resolveCdTarget(
  pathname: string,
  arg: string,
  projects: Array<{ title: string; slug: string }>,
  posts: Array<{ title: string; slug: string }>
): Route | null {
  const key = arg.replace(/\/$/, "").toLowerCase();

  if (!key || key === "~" || key === "/") {
    return "/";
  }

  if (key === "..") {
    return getParentRoute(pathname);
  }

  if (key in pageCommands) {
    return pageCommands[key];
  }

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

export function CommandLine({
  onToggleSidebar,
  onToggleCrt,
  children,
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
  const [showRouteContent, setShowRouteContent] = useState(true);

  useEffect(() => {
    try {
      const savedEntries = window.localStorage.getItem(storageKey);
      const savedHistory = window.localStorage.getItem(commandHistoryKey);

      if (savedEntries) {
        setEntries(JSON.parse(savedEntries) as HistoryEntry[]);
      } else {
        setEntries([]);
      }

      if (savedHistory) {
        setCommandHistory(JSON.parse(savedHistory) as string[]);
      }
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    if (entries.length === 0) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(entries));
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [entries]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [pathname, showRouteContent]);

  useEffect(() => {
    window.localStorage.setItem(commandHistoryKey, JSON.stringify(commandHistory));
  }, [commandHistory]);

  useEffect(() => {
    setShowRouteContent(true);
  }, [pathname]);

  const cwdLabel = useMemo(() => getCwdLabel(pathname), [pathname]);

  const appendEntries = (nextEntries: HistoryEntry[]) => {
    setEntries((current) => [...current, ...nextEntries]);
  };

  const execute = (raw: string) => {
    const command = raw.trim();
    if (!command) {
      return;
    }

    appendEntries([
      {
        id: crypto.randomUUID(),
        kind: "command",
        text: command,
        cwd: cwdLabel
      }
    ]);

    setCommandHistory((current) => {
      if (current[current.length - 1] === command) {
        return current;
      }
      return [...current, command];
    });
    setHistoryIndex(null);

    const [name, ...rest] = command.split(/\s+/);
    const arg = rest.join(" ");

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
      setShowRouteContent(false);
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

    if (name === "tree") {
      if (onToggleSidebar) {
        onToggleSidebar();
      } else {
        window.dispatchEvent(new CustomEvent("terminal:toggle-sidebar"));
      }
      appendEntries([{ id: crypto.randomUUID(), kind: "output", text: "tree toggled" }]);
      return;
    }

    if (name === "crt") {
      if (onToggleCrt) {
        onToggleCrt();
      } else {
        window.dispatchEvent(new CustomEvent("terminal:toggle-crt"));
      }
      appendEntries([{ id: crypto.randomUUID(), kind: "output", text: "crt effect toggled" }]);
      return;
    }

    if (name in pageCommands) {
      router.push(pageCommands[name]);
      return;
    }

    if (name === "cd") {
      const target = resolveCdTarget(pathname, arg, projects, posts);
      if (target) {
        router.push(target);
        return;
      }
    }

    if (name === "cat" && arg) {
      const key = arg.toLowerCase();
      if (key === "readme.md") {
        router.push("/");
        return;
      }
      if (key === "resume.md") {
        router.push("/resume");
        return;
      }
      if (key === "contact.md") {
        router.push("/contact");
        return;
      }
    }

    if (name === "open" && arg) {
      const key = arg.toLowerCase();
      if (key in pageCommands) {
        router.push(pageCommands[key]);
        return;
      }
    }

    appendEntries([{ id: crypto.randomUUID(), kind: "output", text: `zsh: command not found: ${name}` }]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-3xl border border-border bg-black/35">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-dim">terminal.session</p>
      </div>
      <div
        ref={scrollRef}
        className="tui-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3"
      >
        <div className="flex min-h-full flex-col justify-end">
          <div className="space-y-1 text-[13px] leading-5">
            {entries.map((entry) => (
              <div key={entry.id} className="break-words">
                {entry.kind === "command" ? (
                  <p className="text-text">
                    <span className="text-accent">{shellUser}</span>
                    <span className="text-text">@{shellHost}</span>{" "}
                    <span className="text-dim">{entry.cwd ?? cwdLabel}</span>{" "}
                    <span className="text-text">%</span> {entry.text}
                  </p>
                ) : entry.kind === "system" ? (
                  <p className="text-dim">{entry.text}</p>
                ) : (
                  <p className="text-dim">{entry.text}</p>
                )}
              </div>
            ))}
          </div>
          {children && showRouteContent ? (
            <div key={pathname} className="mt-2">
              {children}
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            execute(value);
            setValue("");
          }}
          className="flex items-center gap-2 text-[13px] leading-5"
        >
          <span className="shrink-0 text-accent">{shellUser}</span>
          <span className="shrink-0 text-text">@{shellHost}</span>
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
