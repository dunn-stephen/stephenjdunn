"use client";

import { SectionLabel } from "@/components/shared/Tui";

type ExtrasAppProps = {
  onOpenWeather: () => void;
  onOpenHelp: () => void;
};

const extras = [
  {
    id: "weather",
    label: "Weather",
    hint: "Open the in-shell weather desk accessory"
  },
  {
    id: "star-wars",
    label: "Star Wars",
    href: "/easter-eggs/star-wars/index.html",
    hint: "Open the standalone crawl experience"
  },
  {
    id: "space-invaders",
    label: "Space Invaders",
    href: "/easter-eggs/space-invaders/index.html",
    hint: "Open the standalone arcade route"
  },
  {
    id: "help",
    label: "Help",
    hint: "Open Stephen OS keyboard and menu help"
  }
] as const;

export function ExtrasApp({ onOpenWeather, onOpenHelp }: ExtrasAppProps) {
  return (
    <div className="space-y-4">
      <SectionLabel>Extras</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        {extras.map((item) => {
          if (item.id === "weather") {
            return (
              <button
                key={item.id}
                type="button"
                onClick={onOpenWeather}
                className="os9-panel rounded-[2px] px-4 py-4 text-left"
              >
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-ink">{item.label}</p>
                <p className="mt-2 text-[12px] leading-5 text-muted">{item.hint}</p>
              </button>
            );
          }

          if (item.id === "help") {
            return (
              <button
                key={item.id}
                type="button"
                onClick={onOpenHelp}
                className="os9-panel rounded-[2px] px-4 py-4 text-left"
              >
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-ink">{item.label}</p>
                <p className="mt-2 text-[12px] leading-5 text-muted">{item.hint}</p>
              </button>
            );
          }

          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="os9-panel rounded-[2px] px-4 py-4"
            >
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent-ink">{item.label}</p>
              <p className="mt-2 text-[12px] leading-5 text-muted">{item.hint}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
