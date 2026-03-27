"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { Command, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { primaryRoutes, shellIdentity } from "@/lib/site";
import { Sidebar } from "@/components/terminal/Sidebar";
import { StatusBar } from "@/components/terminal/StatusBar";
import { CommandPalette } from "@/components/terminal/CommandPalette";
import { CommandLine } from "@/components/terminal/CommandLine";
import { RouteModal } from "@/components/terminal/RouteModal";
import { TerminalNavLink } from "@/components/terminal/TerminalNavLink";
import { getCommandForRoute, getDismissRoute } from "@/lib/terminalNavigation";

type TerminalShellProps = {
  children: ReactNode;
  workspace: ReactNode;
  projects: Array<{ title: string; slug: string }>;
  posts: Array<{ title: string; slug: string }>;
};

export function TerminalShell({ children, workspace, projects, posts }: TerminalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const hasActiveModal = pathname !== "/";

  const paletteItems = useMemo(
    () => [
      ...primaryRoutes.map((route) => ({
        id: route.href,
        label: route.label,
        section: "pages",
        keywords: route.keywords,
        href: route.href as Route
      })),
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
    const toggleSidebar = () => setSidebarOpen((value) => !value);

    window.addEventListener("terminal:toggle-sidebar", toggleSidebar);

    return () => {
      window.removeEventListener("terminal:toggle-sidebar", toggleSidebar);
    };
  }, []);

  useEffect(() => {
    if (!hasActiveModal) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setSidebarOpen(false);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hasActiveModal, pathname]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const hasPrimaryModifier = event.ctrlKey || event.metaKey;

      if ((hasPrimaryModifier && event.key.toLowerCase() === "k") || (!hasPrimaryModifier && event.key === "/")) {
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

      if (hasActiveModal && event.key === "Escape") {
        event.preventDefault();
        router.push(getDismissRoute(pathname));
        return;
      }

      if (hasPrimaryModifier && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarOpen((value) => !value);
        return;
      }

      if (event.key === "Escape") {
        setSidebarOpen(false);
        return;
      }

      if (!isTypingTarget(event.target) && pathname.startsWith("/blog/")) {
        const modalScrollTarget = modalContentRef.current;

        if (event.key === "j") {
          if (!modalScrollTarget) {
            return;
          }
          event.preventDefault();
          modalScrollTarget.scrollBy({ top: 120, behavior: "smooth" });
          return;
        }

        if (event.key === "k") {
          if (!modalScrollTarget) {
            return;
          }
          event.preventDefault();
          modalScrollTarget.scrollBy({ top: -120, behavior: "smooth" });
          return;
        }
      }

      const route = primaryRoutes.find((item) => item.hotkey === event.key);
      if (route) {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent("terminal:navigate", {
            detail: {
              href: route.href,
              command: getCommandForRoute(route.href)
            }
          })
        );
        router.push(route.href);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [hasActiveModal, paletteOpen, pathname, router]);

  const modeLabel = useMemo(() => {
    if (pathname === "/") {
      return "NORMAL";
    }
    return pathname.split("/").filter(Boolean).join(" > ").toUpperCase();
  }, [pathname]);

  return (
    <div className="h-dvh px-3 py-4 sm:px-6 sm:py-8">
      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[24px] border border-border bg-surface/95 shadow-terminal backdrop-blur">
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
            <p className="text-sm uppercase tracking-[0.25em] text-dim">{shellIdentity} ~ bash</p>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 rounded-2xl border border-border bg-black/45 p-1 md:flex">
              {primaryRoutes.map((route) => (
                <TerminalNavLink
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
                </TerminalNavLink>
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
          <main className="relative min-h-0 bg-black/30 px-4 py-3 sm:px-5 sm:py-4">
            <div className="mx-auto flex h-full w-full max-w-5xl animate-floatIn flex-col">
              <CommandLine
                onToggleSidebar={() => setSidebarOpen((value) => !value)}
                projects={projects}
                posts={posts}
                workspace={workspace}
              />
            </div>
          </main>
        </div>
        {hasActiveModal ? (
          <RouteModal
            pathname={pathname}
            sidebarOpen={sidebarOpen}
            contentRef={modalContentRef}
          >
            {children}
          </RouteModal>
        ) : null}
        <StatusBar modeLabel={modeLabel} />
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        items={paletteItems}
      />
    </div>
  );
}
