"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Command, Menu, MoonStar, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { primaryRoutes } from "@/lib/site";
import { Sidebar } from "@/components/terminal/Sidebar";
import { StatusBar } from "@/components/terminal/StatusBar";
import { CommandPalette } from "@/components/terminal/CommandPalette";
import { CommandLine } from "@/components/terminal/CommandLine";

type TerminalShellProps = {
  children: ReactNode;
  projects: Array<{ title: string; slug: string }>;
  posts: Array<{ title: string; slug: string }>;
};

export function TerminalShell({ children, projects, posts }: TerminalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const paletteItems = useMemo(
    () => [
      ...primaryRoutes.map((route) => ({
        id: route.href,
        label: route.label,
        section: "pages",
        keywords: [route.label, route.href],
        href: route.href as Route
      })),
      {
        id: "/contact",
        label: "contact",
        section: "pages",
        keywords: ["apollo", "contact", "email"],
        href: "/contact" as Route
      },
      ...projects.map((project) => ({
        id: `project:${project.slug}`,
        label: project.title,
        section: "projects",
        keywords: [project.slug, "project"],
        href: `/projects/${project.slug}` as Route
      })),
      ...posts.map((post) => ({
        id: `post:${post.slug}`,
        label: post.title,
        section: "blog",
        keywords: [post.slug, "post", "blog"],
        href: `/blog/${post.slug}` as Route
      })),
      {
        id: "toggle-crt",
        label: "toggle crt effects",
        section: "commands",
        keywords: ["theme", "effects", "crt"],
        action: "toggle-crt" as const
      },
      {
        id: "toggle-sidebar",
        label: "toggle sidebar",
        section: "commands",
        keywords: ["tree", "sidebar", "navigation"],
        action: "toggle-sidebar" as const
      }
    ],
    [posts, projects]
  );

  const isTypingTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    );
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saved = window.localStorage.getItem("terminal-effects");
    const enabled = saved ? saved === "on" : !reducedMotion;
    setEffectsEnabled(enabled);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("effects-on", effectsEnabled);
    window.localStorage.setItem("terminal-effects", effectsEnabled ? "on" : "off");
  }, [effectsEnabled]);

  useEffect(() => {
    const toggleSidebar = () => setSidebarOpen((value) => !value);
    const toggleCrt = () => setEffectsEnabled((value) => !value);

    window.addEventListener("terminal:toggle-sidebar", toggleSidebar);
    window.addEventListener("terminal:toggle-crt", toggleCrt);

    return () => {
      window.removeEventListener("terminal:toggle-sidebar", toggleSidebar);
      window.removeEventListener("terminal:toggle-crt", toggleCrt);
    };
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.key.toLowerCase() === "k") || (!event.ctrlKey && event.key === "/")) {
        if (!isTypingTarget(event.target)) {
          event.preventDefault();
          setPaletteOpen(true);
        }
        return;
      }

      if (paletteOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          setPaletteOpen(false);
        }
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarOpen((value) => !value);
        return;
      }

      if (event.key === "Escape") {
        setSidebarOpen(false);
        return;
      }

      if (!isTypingTarget(event.target) && pathname.startsWith("/blog/")) {
        if (event.key === "j") {
          event.preventDefault();
          mainRef.current?.scrollBy({ top: 120, behavior: "smooth" });
          return;
        }

        if (event.key === "k") {
          event.preventDefault();
          mainRef.current?.scrollBy({ top: -120, behavior: "smooth" });
          return;
        }
      }

      const route = primaryRoutes.find((item) => item.hotkey === event.key);
      if (route) {
        event.preventDefault();
        router.push(route.href);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [paletteOpen, pathname, router]);

  const modeLabel = useMemo(() => {
    if (pathname === "/") {
      return "NORMAL";
    }
    return pathname.split("/").filter(Boolean).join(" > ").toUpperCase();
  }, [pathname]);

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[24px] border border-border bg-surface/95 shadow-terminal backdrop-blur">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-black/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-black/20 text-dim transition hover:border-accent hover:text-accent lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
              <span className="h-3 w-3 rounded-full bg-[#ffd166]" />
              <span className="h-3 w-3 rounded-full bg-[#80ed99]" />
            </div>
            <p className="text-sm uppercase tracking-[0.25em] text-dim">stephen@portfolio ~ bash</p>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 rounded-2xl border border-border bg-black/45 p-1 md:flex">
              {primaryRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    pathname === route.href
                      ? "bg-accent/15 text-accent"
                      : "text-dim hover:bg-white/5 hover:text-text"
                  )}
                >
                  <span
                    className={clsx(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-md border px-1 text-[10px] font-semibold leading-none",
                      pathname === route.href
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border text-dim"
                    )}
                  >
                    {route.hotkey}
                  </span>
                  <span>{route.label}</span>
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden rounded-xl border border-border bg-black/45 px-3 py-2 text-sm text-dim transition hover:border-accent hover:text-accent md:inline-flex"
              aria-label="Open command palette"
            >
              <Command className="mr-2 h-4 w-4" />
              palette
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="hidden rounded-xl border border-border bg-black/45 p-2 text-dim transition hover:border-accent hover:text-accent lg:inline-flex"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setEffectsEnabled((value) => !value)}
              className={clsx(
                "inline-flex rounded-xl border px-3 py-2 text-sm transition",
                effectsEnabled
                  ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-black/45 text-dim hover:text-text"
              )}
            >
              <MoonStar className="mr-2 h-4 w-4" />
              crt
            </button>
          </div>
        </header>

        <div
          className={clsx(
            "grid flex-1 overflow-hidden transition-[grid-template-columns] duration-300 ease-out",
            sidebarOpen
              ? "lg:grid-cols-[minmax(260px,320px)_1fr]"
              : "lg:grid-cols-[0px_1fr]"
          )}
        >
          <Sidebar
            pathname={pathname}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            projects={projects}
            posts={posts}
          />
          <main
            ref={mainRef}
            className="min-h-0 bg-black/30 px-4 py-3 sm:px-5 sm:py-4"
          >
            <div className="mx-auto flex h-full w-full max-w-5xl animate-floatIn flex-col">
              <CommandLine
                onToggleSidebar={() => setSidebarOpen((value) => !value)}
                onToggleCrt={() => setEffectsEnabled((value) => !value)}
                projects={projects}
                posts={posts}
              >
                {children}
              </CommandLine>
            </div>
          </main>
        </div>
        <StatusBar modeLabel={modeLabel} pathname={pathname} />
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        onToggleCrt={() => setEffectsEnabled((value) => !value)}
        items={paletteItems}
      />
    </div>
  );
}
