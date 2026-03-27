"use client";

import { useEffect, useState } from "react";

type StatusBarProps = {
  modeLabel: string;
};

function formatClock() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
}

export function StatusBar({ modeLabel }: StatusBarProps) {
  const [clock, setClock] = useState(formatClock);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="grid gap-2 border-t border-border bg-black/60 px-4 py-3 text-xs uppercase tracking-[0.22em] text-dim sm:grid-cols-[1fr_auto]">
      <p>{modeLabel}</p>
      <p className="sm:text-right">{clock}</p>
    </footer>
  );
}
