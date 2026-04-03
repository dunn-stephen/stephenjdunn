"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowLeftFromLine, ArrowRightFromLine, Github, Linkedin, Mail, Maximize2, Minus, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommandPalette } from "@/components/chrome/CommandPalette";
import { SpaceInvadersModal } from "@/components/easter-eggs/SpaceInvadersModal";
import { StarWarsModal } from "@/components/easter-eggs/StarWarsModal";
import { WeatherModal } from "@/components/easter-eggs/WeatherModal";
import { StatusBar } from "@/components/chrome/StatusBar";
import {
  getActivePrimaryRoute,
  getSectionState,
  isTypingTarget,
  primaryRoutes,
  profileData,
  siteConfig
} from "@/lib/site";
import type { SearchItem } from "@/lib/search";

type SiteChromeProps = {
  children: ReactNode;
  paletteItems: SearchItem[];
};

const sidebarSocialLinks = [
  {
    href: siteConfig.socialLinks.github,
    label: "github",
    icon: Github,
    external: true
  },
  {
    href: siteConfig.socialLinks.linkedin,
    label: "linkedin",
    icon: Linkedin,
    external: true
  },
  {
    href: siteConfig.socialLinks.email,
    label: "email",
    icon: Mail,
    external: false
  }
] as const;

function RouteLink({
  href,
  className,
  onClick,
  children
}: {
  href: Route;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function SidebarNav({
  activeKey,
  collapsed,
  onToggleCollapse,
  onNavigate
}: {
  activeKey: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: () => void;
}) {
  return (
    <aside
      className={clsx(
        "flex h-full flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ease-out",
        collapsed ? "w-[46px]" : "w-[190px]"
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className={clsx(
          "flex items-center border-b border-border py-3 text-[0.58rem] uppercase tracking-[0.16em] text-subtle transition hover:text-accent",
          collapsed ? "justify-center px-2" : "justify-end px-3"
        )}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      >
        {collapsed ? (
          <ArrowRightFromLine className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <ArrowLeftFromLine className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}
      </button>

      <div className="flex-1 overflow-y-auto py-3">
        <div className={clsx("px-3 text-[0.58rem] uppercase tracking-[0.22em] text-subtle", collapsed && "hidden")}>
          Navigate
        </div>
        <nav className="mt-2 space-y-0.5">
          {primaryRoutes.map((route) => {
            const isActive = route.key === activeKey;

            return (
              <RouteLink
                key={route.href}
                href={route.href}
                onClick={onNavigate}
                className={clsx(
                  "flex items-center gap-3 border-l-2 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] transition",
                  isActive
                    ? "border-l-accent bg-accent-surface text-accent"
                    : "border-l-transparent text-muted hover:bg-panel hover:text-text"
                )}
              >
                <span className={clsx("min-w-[16px] text-[0.58rem]", isActive ? "text-[#98542a]" : "text-faint")}>
                  {route.number}
                </span>
                <span className={clsx("whitespace-nowrap", collapsed && "hidden")}>{route.label}</span>
                <span
                  className={clsx(
                    "ml-auto h-1 w-1 rounded-full",
                    isActive ? "bg-accent" : "bg-border",
                    collapsed && "hidden"
                  )}
                />
              </RouteLink>
            );
          })}
        </nav>
      </div>

      <div className={clsx("border-t border-border py-3", collapsed ? "px-2" : "px-3")}>
        <div className={clsx(collapsed ? "flex flex-col items-center gap-2" : "space-y-2")}>
          {collapsed
            ? sidebarSocialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    aria-label={item.label}
                    title={item.label}
                    className="flex h-7 w-7 items-center justify-center border border-transparent text-subtle transition hover:border-[#6a320d] hover:bg-panel hover:text-accent"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                );
              })
            : sidebarSocialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="block text-[0.58rem] uppercase tracking-[0.12em] text-subtle transition hover:text-accent"
                >
                  ↗ {item.label}
                </a>
              ))}
        </div>
      </div>
    </aside>
  );
}

export function SiteChrome({ children, paletteItems }: SiteChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const headerSearchInputRef = useRef<HTMLInputElement>(null);
  const activeRoute = getActivePrimaryRoute(pathname);
  const sectionState = getSectionState(pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavPathname, setMobileNavPathname] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteInitialQuery, setPaletteInitialQuery] = useState("");
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [activeEasterEgg, setActiveEasterEgg] = useState<string | null>(null);
  const mobileNavOpen = mobileNavPathname === pathname;

  const closeMobileNav = useCallback(() => setMobileNavPathname(null), []);
  const openMobileNav = useCallback(() => setMobileNavPathname(pathname), [pathname]);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const closeEasterEgg = useCallback(() => setActiveEasterEgg(null), []);
  const openPalette = useCallback((query = "") => {
    setMobileNavPathname(null);
    setPaletteInitialQuery(query);
    setPaletteOpen(true);
  }, []);
  const focusHeaderSearch = useCallback(() => {
    setMobileNavPathname(null);
    setPaletteOpen(false);
    window.setTimeout(() => {
      const input = headerSearchInputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      const cursorPosition = input.value.length;
      input.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }, []);
  const navigateTo = useCallback((href: Route) => {
    setMobileNavPathname(null);
    setPaletteOpen(false);
    router.push(href);
  }, [router]);
  const handleSecretCommand = useCallback((id: string) => {
    setMobileNavPathname(null);
    setPaletteOpen(false);
    setActiveEasterEgg(id);
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const hasPrimaryModifier = event.ctrlKey || event.metaKey;

      if (hasPrimaryModifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileNavPathname(null);
        setPaletteInitialQuery("");
        setPaletteOpen(true);
        return;
      }

      if (hasPrimaryModifier && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setSidebarCollapsed((value) => !value);
        return;
      }

      if (event.key === "Escape") {
        if (activeEasterEgg) {
          event.preventDefault();
          setActiveEasterEgg(null);
          return;
        }

        if (paletteOpen) {
          event.preventDefault();
          setPaletteOpen(false);
          return;
        }

        if (mobileNavOpen) {
          event.preventDefault();
          setMobileNavPathname(null);
        }
        return;
      }

      if (event.key === "/" && !hasPrimaryModifier && !event.altKey && !isTypingTarget(event.target)) {
        event.preventDefault();
        focusHeaderSearch();
        return;
      }

      if (paletteOpen || isTypingTarget(event.target)) {
        return;
      }

      const route = primaryRoutes.find((item) => item.hotkey === event.key);
      if (route) {
        event.preventDefault();
        setMobileNavPathname(null);
        setPaletteOpen(false);
        router.push(route.href);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [activeEasterEgg, focusHeaderSearch, mobileNavOpen, paletteOpen, router]);

  const runPaletteItem = (item: SearchItem) => {
    if (item.href) {
      navigateTo(item.href);
      return;
    }

    if (item.externalHref) {
      const isMailto = item.externalHref.startsWith("mailto:");
      if (isMailto) {
        window.location.href = item.externalHref;
      } else {
        window.open(item.externalHref, "_blank", "noopener,noreferrer");
      }
      closePalette();
    }
  };

  const handleHeaderSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    openPalette(headerSearchQuery.trim());
  };

  return (
    <div className="min-h-dvh bg-shell px-2 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-[1440px] flex-col overflow-hidden border border-border bg-surface shadow-terminal">
        <header className="flex items-center gap-3 border-b border-border bg-panel px-3 py-2 sm:px-4">
          <button
            type="button"
            onClick={openMobileNav}
            className="order-last inline-flex self-stretch w-8 items-center justify-center border border-border bg-panel-alt text-[0.72rem] text-muted transition hover:border-[#6a320d] hover:text-accent md:hidden"
            aria-label="Open navigation"
          >
            ☰
          </button>

          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="grid h-[11px] w-[11px] place-items-center rounded-full bg-[#ff5f56]">
              <X size={7} strokeWidth={2.5} className="block text-[#1c1c1f]" />
            </span>
            <span className="grid h-[11px] w-[11px] place-items-center rounded-full bg-[#ffbd2e]">
              <Minus size={7} strokeWidth={2.5} className="block text-[#1c1c1f]" />
            </span>
            <span className="grid h-[11px] w-[11px] place-items-center rounded-full bg-[#27c93f]">
              <Maximize2 size={7} strokeWidth={2.2} className="block text-[#1c1c1f]" />
            </span>
          </div>

          <form
            className="min-w-0 flex-1 border border-border bg-panel-alt"
            onSubmit={handleHeaderSearchSubmit}
          >
            <label htmlFor="site-search" className="sr-only">
              Search the site
            </label>
            <div className="flex items-center gap-2 px-3 py-1">
              <span className="text-[0.62rem] text-faint" aria-hidden="true">
                /
              </span>
              <input
                id="site-search"
                ref={headerSearchInputRef}
                type="search"
                value={headerSearchQuery}
                onChange={(event) => setHeaderSearchQuery(event.target.value)}
                onFocus={() => openPalette(headerSearchQuery.trim())}
                placeholder={`Search ${profileData.domain}`}
                className="w-full border-0 bg-transparent text-[0.58rem] uppercase tracking-[0.16em] text-subtle outline-none placeholder:text-faint"
                aria-label="Search the site"
              />
              <span className="hidden text-[0.54rem] uppercase tracking-[0.18em] text-faint sm:inline">
                Enter
              </span>
            </div>
          </form>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openPalette()}
              className="hidden border border-[#3a1800] bg-[#1e0e00] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-accent transition hover:bg-[#2a1400] sm:inline-flex"
              aria-label="Open command palette"
            >
              ⌘ palette
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="hidden md:flex">
            <SidebarNav
              activeKey={activeRoute.key}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
              onNavigate={() => undefined}
            />
          </div>

          {mobileNavOpen ? (
            <div className="fixed inset-0 z-40 md:hidden">
              <button
                type="button"
                onClick={closeMobileNav}
                className="absolute inset-0 bg-black/70"
                aria-label="Close navigation overlay"
              />
              <div className="absolute bottom-0 left-0 top-0">
                <SidebarNav
                  activeKey={activeRoute.key}
                  collapsed={false}
                  onToggleCollapse={closeMobileNav}
                  onNavigate={closeMobileNav}
                />
              </div>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-border bg-panel px-4 pt-4 sm:px-6">
              <div className="flex items-end justify-between gap-6">
                <div className="min-w-0">
                  <p className="text-[0.58rem] uppercase tracking-[0.3em] text-accent">
                    {profileData.hero.eyebrow}
                  </p>
                  <pre className="mt-2 whitespace-pre text-[0.56rem] font-semibold leading-[1.2] text-accent sm:text-[0.64rem]">
                    {profileData.hero.ascii}
                  </pre>
                  <p className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-accent">
                    {profileData.hero.subtitle}
                  </p>
                </div>
              </div>

              <nav className="app-scrollbar mt-2 flex overflow-x-auto">
                {primaryRoutes.map((route) => {
                  const isActive = route.key === activeRoute.key;

                  return (
                    <RouteLink
                      key={route.href}
                      href={route.href}
                      className={clsx(
                        "mr-1 inline-flex items-center gap-1 border border-transparent border-b-0 px-2 py-2 text-[0.52rem] uppercase tracking-[0.18em] transition sm:gap-2 sm:px-4 sm:text-[0.62rem]",
                        isActive
                          ? "border-border border-b-panel bg-surface text-accent"
                          : "bg-panel-alt text-accent hover:bg-[#2e2e31] hover:text-[#ff8a43]"
                      )}
                    >
                      <span
                        className={clsx("hidden text-[0.58rem] text-accent sm:inline", isActive ? "opacity-70" : "opacity-55")}
                      >
                        {route.hotkey}
                      </span>
                      <span>{route.label}</span>
                    </RouteLink>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-border bg-panel px-4 py-2 sm:px-6">
              <div className="flex min-w-0 items-center gap-2 text-[0.62rem] uppercase tracking-[0.32em]">
                <span className="shrink-0 text-accent">■</span>
                {sectionState.breadcrumb ? (
                  <>
                    <RouteLink
                      href={sectionState.breadcrumb.href}
                      className="truncate text-accent transition hover:text-[#ff8a43]"
                    >
                      {sectionState.breadcrumb.label}
                    </RouteLink>
                    <span className="shrink-0 text-faint">/</span>
                    <span className="truncate text-accent">{sectionState.title}</span>
                  </>
                ) : (
                  <span className="truncate text-accent">{sectionState.title}</span>
                )}
              </div>
              {sectionState.breadcrumb ? (
                <RouteLink
                  href={sectionState.breadcrumb.href}
                  className="text-[0.58rem] uppercase tracking-[0.14em] text-muted transition hover:text-accent"
                >
                  ◄ {sectionState.breadcrumb.label}
                </RouteLink>
              ) : (
                <span className="text-[0.58rem] uppercase tracking-[0.14em] text-faint" />
              )}
            </div>

            <main className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="mx-auto w-full max-w-[1120px]">{children}</div>
            </main>
          </div>
        </div>

        <StatusBar />
      </div>

      <CommandPalette
        key={paletteOpen ? `palette-open:${paletteInitialQuery}` : "palette-closed"}
        open={paletteOpen}
        items={paletteItems}
        initialQuery={paletteInitialQuery}
        onClose={closePalette}
        onSecretCommand={handleSecretCommand}
        onSelect={runPaletteItem}
      />

      <SpaceInvadersModal open={activeEasterEgg === "space-invaders"} onClose={closeEasterEgg} />
      <StarWarsModal open={activeEasterEgg === "star-wars"} onClose={closeEasterEgg} />
      <WeatherModal open={activeEasterEgg === "weather"} onClose={closeEasterEgg} />
    </div>
  );
}
