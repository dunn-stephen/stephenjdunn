"use client";

import { MobileFallback } from "@/components/desktop/MobileFallback";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Project } from "@/types";

interface DesktopProps {
  projects: Project[];
}

export function Desktop({ projects }: DesktopProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobileFallback />;
  }

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-[#C0C0C0]"
      data-project-count={projects.length}
    >
      <Wallpaper />
    </main>
  );
}
