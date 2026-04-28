"use client";

import { useEffect, useMemo, useState } from "react";
import { AboutDialog } from "@/components/desktop/AboutDialog";
import { DesktopIcons } from "@/components/desktop/DesktopIcons";
import { MenuBar } from "@/components/desktop/MenuBar";
import { MobileFallback } from "@/components/desktop/MobileFallback";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { WindowManager } from "@/components/windows/WindowManager";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getAppDefinition } from "@/lib/app-registry";
import { useSoundStore } from "@/lib/sound";
import { useWindowStore } from "@/lib/window-store";
import type { Project } from "@/types";

interface DesktopProps {
  projects: Project[];
}

export function Desktop({ projects }: DesktopProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const soundEnabled = useSoundStore((state) => state.enabled);
  const soundInitialized = useSoundStore((state) => state.initialized);
  const toggleSound = useSoundStore((state) => state.toggle);
  const initializeSound = useSoundStore((state) => state.initializeFromInteraction);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusedWindowId = useWindowStore((state) => state.focusedWindowId);
  const windows = useWindowStore((state) => state.windows);
  const [aboutOpen, setAboutOpen] = useState(false);

  const activeWindow = useMemo(
    () => windows.find((windowState) => windowState.id === focusedWindowId) ?? null,
    [focusedWindowId, windows]
  );
  const activeAppName = activeWindow ? getAppDefinition(activeWindow.appId).name : "Finder";

  useEffect(() => {
    if (isMobile || soundInitialized) {
      return;
    }

    const handleUnlock = () => {
      void initializeSound();
    };

    window.addEventListener("pointerdown", handleUnlock, { once: true });
    window.addEventListener("keydown", handleUnlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, [initializeSound, isMobile, soundInitialized]);

  return (
    <>
      <main
        className="fixed inset-0 overflow-hidden bg-[#C0C0C0] max-md:hidden"
        data-project-count={projects.length}
      >
        <Wallpaper />
        <MenuBar
          activeAppName={activeAppName}
          canCloseActiveApp={activeWindow !== null}
          soundEnabled={soundEnabled}
          onAbout={() => setAboutOpen(true)}
          onCloseActiveApp={() => {
            if (activeWindow) {
              closeWindow(activeWindow.id);
            }
          }}
          onToggleSound={toggleSound}
          onShutDown={() => {
            // Task 1.2 only needs the Apple menu action present.
            console.info("Shut Down requested.");
          }}
        />
        <DesktopIcons />
        <WindowManager />
        <AboutDialog
          isOpen={aboutOpen}
          onClose={() => setAboutOpen(false)}
        />
      </main>
      <MobileFallback projects={projects} />
    </>
  );
}
