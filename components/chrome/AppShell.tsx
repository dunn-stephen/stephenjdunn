"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import type { SearchItem } from "@/lib/search";
import { isStandaloneEasterEggRoute } from "@/lib/site";

type AppShellProps = {
  children: ReactNode;
  paletteItems: SearchItem[];
};

export function AppShell({ children, paletteItems }: AppShellProps) {
  const pathname = usePathname();

  if (isStandaloneEasterEggRoute(pathname)) {
    return children;
  }

  return <SiteChrome paletteItems={paletteItems}>{children}</SiteChrome>;
}
