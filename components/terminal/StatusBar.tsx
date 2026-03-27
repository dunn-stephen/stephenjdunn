"use client";

import { useEffect, useMemo, useState } from "react";

type StatusBarProps = {
  modeLabel: string;
  pathname: string;
};

const pageIndexMap: Record<string, string> = {
  "/": "1/4",
  "/projects": "2/4",
  "/resume": "3/4",
  "/blog": "4/4"
};

export function StatusBar({ modeLabel, pathname }: StatusBarProps) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const formatClock = () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date());

    setClock(formatClock());
    const timer = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const pageIndex = useMemo(() => {
    if (pageIndexMap[pathname]) {
      return pageIndexMap[pathname];
    }
    if (pathname.startsWith("/projects/")) {
      return "2/x";
    }
    if (pathname.startsWith("/blog/")) {
      return "4/x";
    }
    return "aux";
  }, [pathname]);

  return (
    <footer className="grid gap-2 border-t border-border bg-black/60 px-4 py-3 text-xs uppercase tracking-[0.22em] text-dim sm:grid-cols-[auto_1fr_auto]">
      <p>NORMAL · {modeLabel}</p>
      <p className="sm:text-center">tree · {pageIndex} · shell input ready</p>
      <p className="sm:text-right">{clock}</p>
    </footer>
  );
}
