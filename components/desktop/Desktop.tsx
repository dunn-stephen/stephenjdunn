"use client";

import { useState } from "react";
import { AboutDialog } from "@/components/desktop/AboutDialog";
import { DesktopIcons } from "@/components/desktop/DesktopIcons";
import { MenuBar } from "@/components/desktop/MenuBar";
import { MobileFallback } from "@/components/desktop/MobileFallback";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSoundStore } from "@/lib/sound";
import type { Project } from "@/types";

interface DesktopProps {
  projects: Project[];
}

export function Desktop({ projects }: DesktopProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const soundEnabled = useSoundStore((state) => state.enabled);
  const toggleSound = useSoundStore((state) => state.toggle);
  const [aboutOpen, setAboutOpen] = useState(false);

  if (isMobile) {
    return <MobileFallback />;
  }

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-[#C0C0C0]"
      data-project-count={projects.length}
    >
      <Wallpaper />
      <MenuBar
        activeAppName="Finder"
        soundEnabled={soundEnabled}
        onAbout={() => setAboutOpen(true)}
        onToggleSound={toggleSound}
        onShutDown={() => {
          // Task 1.2 only needs the Apple menu action present.
          console.info("Shut Down requested.");
        }}
      />
      <DesktopIcons />
      <AboutDialog
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </main>
  );
}
