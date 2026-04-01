"use client";

import { useEffect, useState } from "react";

function formatDateTime(date: Date) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date).toUpperCase();
  const day = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);

  return `${weekday} ${day} · ${time}`;
}

export function StatusBar() {
  const [clock, setClock] = useState("-- --- --:--:--");

  useEffect(() => {
    const updateClock = () => setClock(formatDateTime(new Date()));

    updateClock();
    const timer = window.setInterval(updateClock, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="flex flex-col justify-between gap-2 border-t border-border bg-surface px-4 py-2 text-[0.58rem] uppercase tracking-[0.16em] text-subtle sm:flex-row sm:items-center">
      <p>
        <span className="text-muted">⌘P</span> nav · <span className="text-muted">⌘K</span> palette ·{" "}
        <span className="text-muted">1–5</span> navigate
      </p>
      <p>{clock}</p>
    </footer>
  );
}
