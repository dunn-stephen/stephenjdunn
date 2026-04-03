"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { WeatherDisplay } from "@/components/weather/WeatherDisplay";
import { WeatherSearch } from "@/components/weather/WeatherSearch";
import { useWeather } from "@/components/weather/hooks/useWeather";

type WeatherModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WeatherModal({ open, onClose }: WeatherModalProps) {
  const [query, setQuery] = useState("");
  const { weather, error, loading, search } = useWeather();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void search(query);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-[2px] sm:px-6">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close weather overlay"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Weather"
        className="relative z-10 flex h-full max-h-[calc(100dvh-3rem)] w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-border bg-surface shadow-terminal"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border bg-panel px-4 py-3">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-subtle">Secret Command</p>
            <p className="mt-1 text-[0.72rem] uppercase tracking-[0.18em] text-accent">Weather Uplink</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-border bg-surface px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-subtle transition hover:border-[#6a320d] hover:text-accent"
          >
            Close
          </button>
        </div>

        <div className="border-b border-border bg-shell p-4 sm:p-5">
          <WeatherSearch
            query={query}
            loading={loading}
            onQueryChange={setQuery}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto bg-shell px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
          <WeatherDisplay weather={weather} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
