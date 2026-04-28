"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BootSequence } from "@/components/os/BootSequence";
import { WelcomeSetup } from "@/components/os/WelcomeSetup";
import { MenuBar } from "@/components/os/MenuBar";
import { DesktopIcons } from "@/components/os/DesktopIcons";
import { WindowLayer } from "@/components/os/windows/WindowLayer";
import { createCanonicalWindow, createFinderWindow, createNonCanonicalWindow } from "@/lib/os/appRegistry";
import { useFinderStore } from "@/lib/os/finderState";
import { getLaunchIntent } from "@/lib/os/launchIntent";
import { useDesktopSessionStore } from "@/lib/os/sessionState";
import { useOsSounds } from "@/lib/os/sounds";
import type { FinderTreeRecord } from "@/lib/os/types";
import { useWindowManagerStore } from "@/lib/os/windowState";

type DesktopShellProps = {
  initialFinderTree: FinderTreeRecord;
};

function useViewportUnlock(unlock: () => Promise<void>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleUnlock = () => {
      void unlock();
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };

    window.addEventListener("pointerdown", handleUnlock, { once: true });
    window.addEventListener("keydown", handleUnlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, [enabled, unlock]);
}

export function DesktopShell({ initialFinderTree }: DesktopShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const finderTree = useFinderStore((state) => state.tree);
  const selectionNodeIds = useFinderStore((state) => state.selectionNodeIds);
  const initializeTree = useFinderStore((state) => state.initializeTree);
  const setSelection = useFinderStore((state) => state.setSelection);
  const hydrated = useDesktopSessionStore((state) => state.hydrated);
  const phase = useDesktopSessionStore((state) => state.phase);
  const preferences = useDesktopSessionStore((state) => state.preferences);
  const hydrate = useDesktopSessionStore((state) => state.hydrate);
  const setPhase = useDesktopSessionStore((state) => state.setPhase);
  const updatePreferences = useDesktopSessionStore((state) => state.updatePreferences);
  const windows = useWindowManagerStore((state) => state.windows);
  const activeWindowId = useWindowManagerStore((state) => state.activeWindowId);
  const openWindow = useWindowManagerStore((state) => state.openWindow);
  const ensureCanonicalWindow = useWindowManagerStore((state) => state.ensureCanonicalWindow);
  const focusWindow = useWindowManagerStore((state) => state.focusWindow);
  const closeWindow = useWindowManagerStore((state) => state.closeWindow);
  const moveWindow = useWindowManagerStore((state) => state.moveWindow);
  const resizeWindow = useWindowManagerStore((state) => state.resizeWindow);
  const collapseWindow = useWindowManagerStore((state) => state.collapseWindow);
  const zoomWindow = useWindowManagerStore((state) => state.zoomWindow);
  const resetAllWindowGeometry = useWindowManagerStore((state) => state.resetAllWindowGeometry);
  const sounds = useOsSounds(preferences.soundEnabled);
  const welcomeInitiallyDismissedRef = useRef(true);
  const autoOpenedIntroRef = useRef(false);

  useEffect(() => {
    hydrate();
    initializeTree(initialFinderTree);
  }, [hydrate, initializeTree, initialFinderTree]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    welcomeInitiallyDismissedRef.current = preferences.welcomeDismissed;
  }, [hydrated, preferences.welcomeDismissed]);

  useEffect(() => {
    if (!hydrated || phase !== "boot") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPhase(preferences.welcomeDismissed ? "desktop" : "welcome");
    }, 1450);

    return () => window.clearTimeout(timeout);
  }, [hydrated, phase, preferences.welcomeDismissed, setPhase]);

  useViewportUnlock(sounds.unlock, hydrated && phase === "desktop" && preferences.welcomeDismissed);

  useEffect(() => {
    if (!hydrated || phase !== "desktop") {
      return;
    }

    const intent = getLaunchIntent(pathname);
    const shouldOpenIntroFinder =
      pathname === "/" &&
      !welcomeInitiallyDismissedRef.current &&
      preferences.openIntroWindows &&
      !autoOpenedIntroRef.current;

    if (!intent?.appId) {
      if (shouldOpenIntroFinder) {
        openWindow(createNonCanonicalWindow("about-stephen"));
        openWindow(createFinderWindow("volume-stephen-hd", finderTree));
        autoOpenedIntroRef.current = true;
      }

      return;
    }

    ensureCanonicalWindow(
      createCanonicalWindow(intent.appId, intent.route, {
        slug: intent.slug
      })
    );

    if (shouldOpenIntroFinder) {
      openWindow(createFinderWindow("volume-stephen-hd", finderTree));
      autoOpenedIntroRef.current = true;
    }
  }, [
    pathname,
    hydrated,
    phase,
    preferences.openIntroWindows,
    finderTree,
    openWindow,
    ensureCanonicalWindow
  ]);

  const orderedWindows = useMemo(
    () => Object.values(windows).sort((left, right) => left.zIndex - right.zIndex),
    [windows]
  );
  const activeAppId = activeWindowId ? windows[activeWindowId]?.appId ?? null : null;

  function ensureSingletonWindow(appId: "about-stephen" | "extras" | "weather" | "help") {
    const existing = Object.values(windows).find((window) => window.appId === appId && window.canonicalRoute === null);

    if (existing) {
      focusWindow(existing.id);
      return;
    }

    openWindow(createNonCanonicalWindow(appId));
  }

  function openCanonicalRoute(route: string) {
    if (pathname === route) {
      const intent = getLaunchIntent(route);
      if (intent?.appId) {
        ensureCanonicalWindow(
          createCanonicalWindow(intent.appId, intent.route, {
            slug: intent.slug
          })
        );
      }
      return;
    }

    router.push(route);
  }

  function openNode(nodeId: string) {
    const node = finderTree[nodeId];

    if (!node) {
      return;
    }

    setSelection([nodeId]);

    switch (node.openBehavior) {
      case "finder":
        openWindow(createFinderWindow(nodeId, finderTree));
        break;
      case "launch-app":
        if (node.route) {
          openCanonicalRoute(node.route);
        } else if (node.appId === "about-stephen" || node.appId === "extras" || node.appId === "weather" || node.appId === "help") {
          ensureSingletonWindow(node.appId);
        }
        break;
      case "open-document":
        if (node.route) {
          openCanonicalRoute(node.route);
        }
        break;
      case "external":
        if (node.externalHref) {
          window.open(node.externalHref, "_blank", "noopener,noreferrer");
        }
        break;
      default:
        break;
    }
  }

  return (
    <div className="fixed inset-0 z-[1800] overflow-hidden os9-wallpaper">
      <MenuBar
        activeAppId={activeAppId}
        activeWindowId={activeWindowId}
        selectionCount={selectionNodeIds.length}
        soundEnabled={preferences.soundEnabled}
        onAbout={() => ensureSingletonWindow("about-stephen")}
        onToggleSound={() =>
          updatePreferences((current) => ({
            ...current,
            soundEnabled: !current.soundEnabled
          }))
        }
        onResetWindows={() => resetAllWindowGeometry()}
        onNewFinderWindow={() => openWindow(createFinderWindow("volume-stephen-hd", finderTree))}
        onOpenSelection={() => {
          if (selectionNodeIds[0]) {
            openNode(selectionNodeIds[0]);
          }
        }}
        onCloseWindow={() => {
          if (activeWindowId) {
            closeWindow(activeWindowId);
          }
        }}
        onSetFinderView={(mode) =>
          updatePreferences((current) => ({
            ...current,
            finderViewByNodeId: {
              ...current.finderViewByNodeId,
              ...(activeWindowId && windows[activeWindowId]?.nodeId ? { [windows[activeWindowId].nodeId as string]: mode } : {})
            }
          }))
        }
        onOpenHelp={() => ensureSingletonWindow("help")}
      />

      <div className="relative h-full w-full pt-7">
        <DesktopIcons
          tree={finderTree}
          iconPositions={preferences.iconPositions}
          onUpdateIconPosition={(nodeId, position) =>
            updatePreferences((current) => ({
              ...current,
              iconPositions: {
                ...current.iconPositions,
                [nodeId]: position
              }
            }))
          }
          onOpenNode={openNode}
        />

        <WindowLayer
          windows={orderedWindows}
          tree={finderTree}
          selectionNodeIds={selectionNodeIds}
          onSelectFinderNode={(nodeId) => setSelection([nodeId])}
          onOpenFinderNode={openNode}
          onOpenProject={(slug) => openCanonicalRoute(`/projects/${slug}`)}
          onOpenPost={(slug) => openCanonicalRoute(`/blog/${slug}`)}
          onOpenWeather={() => ensureSingletonWindow("weather")}
          onOpenHelp={() => ensureSingletonWindow("help")}
          onFocus={focusWindow}
          onClose={closeWindow}
          onCollapse={collapseWindow}
          onZoom={zoomWindow}
          onMove={moveWindow}
          onResize={resizeWindow}
        />
      </div>

      {phase === "boot" || !hydrated ? <BootSequence /> : null}
      {phase === "welcome" ? (
        <WelcomeSetup
          defaultSoundEnabled={preferences.soundEnabled}
          defaultOpenIntroWindows={preferences.openIntroWindows}
          onEnter={async (values) => {
            updatePreferences((current) => ({
              ...current,
              soundEnabled: values.soundEnabled,
              openIntroWindows: values.openIntroWindows,
              welcomeDismissed: true
            }));
            await sounds.playStartupChime();
            setPhase("desktop");
          }}
        />
      ) : null}
    </div>
  );
}
