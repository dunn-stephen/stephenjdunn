"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import clsx from "clsx";
import { getDismissRoute } from "@/lib/terminalNavigation";

type RouteModalProps = {
  pathname: string;
  sidebarOpen?: boolean;
  contentRef?: RefObject<HTMLDivElement>;
  children: ReactNode;
};

export function RouteModal({
  pathname,
  sidebarOpen = false,
  contentRef,
  children
}: RouteModalProps) {
  const router = useRouter();
  const closeTarget = getDismissRoute(pathname);

  return (
    <div
      className={clsx(
        "absolute inset-0 z-40",
        sidebarOpen && "lg:left-[320px]"
      )}
    >
      <button
        type="button"
        aria-label="Close popup"
        onClick={() => router.push(closeTarget)}
        className="absolute inset-0 z-0 bg-black/70 backdrop-blur-[2px]"
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center p-3 pt-16 sm:p-6 sm:pt-10">
        <div className="pointer-events-auto relative w-full max-w-5xl">
          <button
            type="button"
            onClick={() => router.push(closeTarget)}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/90 text-dim transition hover:border-accent hover:text-accent"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>

          <div
            ref={contentRef}
            className="tui-scrollbar max-h-[calc(100vh-7rem)] overflow-y-auto pr-1"
          >
            <div className="animate-modalIn">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
