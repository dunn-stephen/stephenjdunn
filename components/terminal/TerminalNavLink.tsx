"use client";

import type { Route } from "next";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { getCommandForRoute } from "@/lib/terminalNavigation";

type TerminalNavLinkProps = {
  href: Route;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
};

export function TerminalNavLink({ href, className, onClick, children }: TerminalNavLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("terminal:navigate", {
        detail: {
          href,
          command: getCommandForRoute(href)
        }
      })
    );

    onClick?.();
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
