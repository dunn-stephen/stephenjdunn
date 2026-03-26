"use client";

import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site";

export function UptimeClock() {
  const launchDate = useMemo(() => new Date(siteConfig.launchDate).getTime(), []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const diff = Math.max(0, now - launchDate);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  return (
    <section className="rounded-3xl border border-border bg-black/35 p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-dim">runtime</p>
      <div className="mt-4 space-y-3">
        <p className="text-3xl font-semibold text-text">
          {new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit"
          }).format(now)}
        </p>
        <p className="text-dim">uptime since launch: {days}d {hours}h {minutes}m</p>
      </div>
    </section>
  );
}
