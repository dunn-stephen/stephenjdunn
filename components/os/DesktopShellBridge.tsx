"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { FinderTreeRecord } from "@/lib/os/types";
import { DESKTOP_RUNTIME } from "@/lib/os/types";
import { isStandaloneEasterEggRoute } from "@/lib/site";
import { DesktopShell } from "@/components/os/DesktopShell";
import { MobileShell } from "@/components/os/mobile/MobileShell";
import { createFinderWindow, createNonCanonicalWindow } from "@/lib/os/appRegistry";
import { useFinderStore } from "@/lib/os/finderState";
import { useWindowManagerStore } from "@/lib/os/windowState";
import { useDesktopSessionStore } from "@/lib/os/sessionState";

type DesktopShellBridgeProps = {
  children: ReactNode;
  initialFinderTree: FinderTreeRecord;
};

export function DesktopShellBridge({ children, initialFinderTree }: DesktopShellBridgeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const initializeTree = useFinderStore((state) => state.initializeTree);
  const tree = useFinderStore((state) => state.tree);
  const openWindow = useWindowManagerStore((state) => state.openWindow);
  const windows = useWindowManagerStore((state) => state.windows);
  const focusWindow = useWindowManagerStore((state) => state.focusWindow);

  useEffect(() => {
    initializeTree(initialFinderTree);
  }, [initialFinderTree, initializeTree]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${DESKTOP_RUNTIME.mobileBreakpointPx - 1}px)`);
    const handleChange = () => setIsMobile(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const shouldBypass = useMemo(() => isStandaloneEasterEggRoute(pathname), [pathname]);

  if (shouldBypass) {
    return <>{children}</>;
  }

  if (isMobile) {
    return (
      <MobileShell
        tree={tree}
        onOpenNode={(nodeId) => {
          if (nodeId === "volume-stephen-hd" || nodeId === "folder-applications" || nodeId === "trash") {
            openWindow(createFinderWindow(nodeId, tree));
            return;
          }

          const node = tree[nodeId];
          if (node?.route) {
            router.push(node.route);
            return;
          }

          if (node?.appId === "about-stephen" || node?.appId === "extras" || node?.appId === "weather" || node?.appId === "help") {
            const existing = Object.values(windows).find((window) => window.appId === node.appId);
            if (existing) {
              focusWindow(existing.id);
              return;
            }

            openWindow(createNonCanonicalWindow(node.appId));
          }
        }}
      />
    );
  }

  return <DesktopShell initialFinderTree={initialFinderTree} />;
}
