"use client";

import { useEffect, useState } from "react";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function StatusBar() {
  const [clock, setClock] = useState("Loading...");

  useEffect(() => {
    const updateClock = () => setClock(formatDateTime(new Date()));

    updateClock();
    const timer = window.setInterval(updateClock, 1000 * 30);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="pointer-events-none fixed bottom-3 left-3 right-3 z-30 flex justify-center sm:justify-end">
      <div className="pointer-events-auto os9-surface-outset flex w-full max-w-[560px] flex-wrap items-center justify-between gap-2 rounded-[3px] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-subtle sm:w-auto">
        <div className="flex flex-wrap items-center gap-3">
          <span>Command+K Find</span>
          <span>1-5 Open</span>
          <span>Esc Close</span>
        </div>
        <p className="text-text">{clock}</p>
      </div>
    </footer>
  );
}
