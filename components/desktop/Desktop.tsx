"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BootSequence } from "@/components/desktop/BootSequence";
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
  readMeContent: string;
}

type BootState = "checking" | "playing" | "done";
type PowerState = "awake" | "sleeping" | "shutdown";

const BOOT_SESSION_KEY = "has-booted";
const ALL_APPS_EASTER_EGG_IDS = [
  "finder",
  "textedit",
  "simpletext",
  "mail",
  "space-invaders",
  "notepad",
  "calculator",
  "about"
] as const;

function ShutdownAlert({
  onCancel,
  onRestart,
  onShutDown,
  onSleep
}: {
  onCancel: () => void;
  onRestart: () => void;
  onShutDown: () => void;
  onSleep: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[10001] flex items-start justify-center bg-[rgba(0,0,0,0.12)] px-4 pt-[140px]">
      <div className="w-[360px] border border-[#111111] bg-[#dedade] px-[26px] py-4 font-['Charcoal'] text-[12px] shadow-[1px_2px_0_#111111,inset_1px_1px_0_#ff9999,inset_-1px_-1px_0_#ff6162,inset_2px_2px_0_#ffffff,inset_-2px_-2px_0_#999999]">
        <div className="flex">
          <div className="mr-6 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#7b5800] bg-[radial-gradient(circle_at_40%_35%,#fff4a8_0_22%,#ffd35a_22%_65%,#e0a500_65%_100%)] font-['Chicago'] text-[18px] text-[#5a3b00]">
            !
          </div>
          <div className="pt-1 text-[#202020]">
            Are you sure you want to shut down your computer now?
          </div>
        </div>
        <div className="mt-[15px] flex justify-end gap-[10px]">
          <button className="os9-button min-h-[22px] w-[82px] rounded-none px-2 text-[11px]" type="button" onClick={onRestart}>
            Restart
          </button>
          <button className="os9-button min-h-[22px] w-[82px] rounded-none px-2 text-[11px]" type="button" onClick={onSleep}>
            Sleep
          </button>
          <button className="os9-button min-h-[22px] w-[82px] rounded-none px-2 text-[11px]" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="os9-button min-h-[22px] w-[82px] rounded-none px-2 text-[11px]" type="button" onClick={onShutDown}>
            Shut Down
          </button>
        </div>
      </div>
    </div>
  );
}

export function Desktop({ projects, readMeContent }: DesktopProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const openWindow = useWindowStore((state) => state.openWindow);
  const soundEnabled = useSoundStore((state) => state.enabled);
  const soundInitialized = useSoundStore((state) => state.initialized);
  const toggleSound = useSoundStore((state) => state.toggle);
  const initializeSound = useSoundStore((state) => state.initializeFromInteraction);
  const playSound = useSoundStore((state) => state.play);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusedWindowId = useWindowStore((state) => state.focusedWindowId);
  const windows = useWindowStore((state) => state.windows);
  const [allAppsEasterEggVisible, setAllAppsEasterEggVisible] = useState(false);
  const [allAppsEasterEggDismissed, setAllAppsEasterEggDismissed] = useState(false);
  const [bootState, setBootState] = useState<BootState>("checking");
  const [iconRevealMode, setIconRevealMode] = useState<"hidden" | "shown" | "stagger">("hidden");
  const [powerState, setPowerState] = useState<PowerState>("awake");
  const [shutdownDialogOpen, setShutdownDialogOpen] = useState(false);
  const allAppsEasterEggTriggered = useRef(false);

  const activeWindow = useMemo(
    () => windows.find((windowState) => windowState.id === focusedWindowId) ?? null,
    [focusedWindowId, windows]
  );
  const activeAppDefinition = useMemo(
    () => getAppDefinition(activeWindow?.appId ?? "finder"),
    [activeWindow]
  );
  const openAppIds = useMemo(
    () => new Set(windows.map((windowState) => windowState.appId)),
    [windows]
  );
  const activeMenuStatus = useMemo(() => {
    if (!activeWindow) {
      return {
        name: "Desktop"
      };
    }

    if (activeWindow.appId === "finder") {
      return {
        name: "Finder"
      };
    }

    return {
      name: activeAppDefinition.name
    };
  }, [activeAppDefinition, activeWindow]);
  const allAppsEasterEggState = allAppsEasterEggVisible
    ? "visible"
    : allAppsEasterEggDismissed
      ? "dismissed"
      : "idle";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hasBooted = window.sessionStorage.getItem(BOOT_SESSION_KEY);

      if (hasBooted) {
        setBootState("done");
        setIconRevealMode("shown");
        return;
      }

      setBootState("playing");
      setIconRevealMode("hidden");
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

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

  useEffect(() => {
    if (iconRevealMode !== "stagger") {
      return;
    }

    const timer = window.setTimeout(() => {
      setIconRevealMode("shown");
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [iconRevealMode]);

  useEffect(() => {
    if (
      allAppsEasterEggTriggered.current
      || !ALL_APPS_EASTER_EGG_IDS.every((appId) => openAppIds.has(appId))
    ) {
      return;
    }

    allAppsEasterEggTriggered.current = true;

    const revealTimer = window.setTimeout(() => {
      setAllAppsEasterEggVisible(true);
    }, 0);
    const dismissTimer = window.setTimeout(() => {
      setAllAppsEasterEggVisible(false);
      setAllAppsEasterEggDismissed(true);
    }, 4000);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [openAppIds]);

  const handleBootComplete = () => {
    window.sessionStorage.setItem(BOOT_SESSION_KEY, "1");
    setBootState("done");
    setIconRevealMode("stagger");
  };

  const handleRestart = () => {
    setShutdownDialogOpen(false);
    setPowerState("sleeping");

    window.setTimeout(() => {
      window.sessionStorage.removeItem(BOOT_SESSION_KEY);
      window.location.reload();
    }, 650);
  };

  return (
    <>
      <main
        className={`fixed inset-0 overflow-hidden bg-[#C0C0C0] transition-opacity max-md:hidden ${
          bootState === "checking" ? "opacity-0" : "opacity-100"
        }`}
        data-all-apps-easter-egg={allAppsEasterEggState}
        data-project-count={projects.length}
      >
        <Wallpaper />
        <MenuBar
          activeAppName={activeMenuStatus.name}
          canCloseActiveApp={activeWindow !== null}
          soundEnabled={soundEnabled}
          onAbout={() => openWindow("about")}
          onCloseActiveApp={() => {
            if (activeWindow) {
              closeWindow(activeWindow.id);
            }
          }}
          onOpenHelp={() => {
            openWindow("textedit", {
              content: readMeContent,
              title: "Help Center"
            });
          }}
          onRestart={() => {
            handleRestart();
          }}
          onSleep={() => {
            setShutdownDialogOpen(false);
            setPowerState("sleeping");
          }}
          onToggleSound={toggleSound}
          onShutDown={() => {
            playSound("alert");
            setShutdownDialogOpen(true);
          }}
        />
        <DesktopIcons
          projects={projects}
          readMeContent={readMeContent}
          revealMode={iconRevealMode}
        />
        {allAppsEasterEggState === "visible" ? (
          <div className="pointer-events-none absolute inset-x-0 top-12 z-[9997] flex justify-center px-4">
            <div className="os9-window w-full max-w-[360px] bg-[#d6d6d6] px-4 py-3 text-center text-[11px] text-[#252525] shadow-[2px_2px_0_rgba(0,0,0,0.22)]">
              <p className="m-0 font-['Chicago'] text-[12px]">Achievement Unlocked</p>
              <p className="m-0 mt-1">Every app is open. The desktop is officially overclocked.</p>
            </div>
          </div>
        ) : null}
        <WindowManager />
        <AnimatePresence>
          {shutdownDialogOpen ? (
            <motion.div
              key="shutdown-alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute inset-0 z-[10000]"
            >
              <ShutdownAlert
                onCancel={() => setShutdownDialogOpen(false)}
                onRestart={handleRestart}
                onSleep={() => {
                  setShutdownDialogOpen(false);
                  setPowerState("sleeping");
                }}
                onShutDown={() => {
                  setShutdownDialogOpen(false);
                  setPowerState("shutdown");
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {powerState === "sleeping" ? (
            <motion.button
              key="sleep-overlay"
              type="button"
              aria-label="Wake desktop"
              className="absolute inset-0 z-[10002] bg-black text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              onClick={() => setPowerState("awake")}
            >
              Wake
            </motion.button>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {powerState === "shutdown" ? (
            <motion.div
              key="shutdown-screen"
              className="absolute inset-0 z-[10003] flex items-center justify-center bg-black px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="space-y-4 text-[#c8c8c8]">
                <p className="m-0 font-['Chicago'] text-[13px]">It is now safe to switch off your Macintosh.</p>
                <button
                  type="button"
                  className="os9-button min-h-[22px] rounded-none px-4 text-[11px]"
                  onClick={handleRestart}
                >
                  Restart
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
      <MobileFallback projects={projects} />
      <AnimatePresence>
        {bootState !== "done" ? (
          <BootSequence onComplete={handleBootComplete} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
