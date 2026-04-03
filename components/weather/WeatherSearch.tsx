"use client";

import type { FormEvent } from "react";
import { useEffect, useRef } from "react";

type WeatherSearchProps = {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function WeatherSearch({ query, loading, onQueryChange, onSubmit }: WeatherSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <section className="border border-border bg-panel">
      <div className="border-b border-border bg-panel-alt px-4 py-2 text-[0.58rem] uppercase tracking-[0.22em] text-subtle">
        Live Query
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
        <label htmlFor="weather-query" className="sr-only">
          Search weather by city or ZIP code
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2 border border-border bg-shell px-3 py-2">
          <span className="text-[0.72rem] text-accent" aria-hidden="true">
            &gt;
          </span>
          <input
            id="weather-query"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Austin, TX or 90210"
            className="w-full border-0 bg-transparent text-[0.72rem] uppercase tracking-[0.14em] text-text outline-none placeholder:text-faint"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="border border-[#3a1800] bg-[#1e0e00] px-4 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-accent transition hover:bg-[#2a1400] disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-faint"
        >
          {loading ? "Fetching" : "Search"}
        </button>
      </form>
      <div className="border-t border-border px-4 py-2 text-[0.58rem] uppercase tracking-[0.16em] text-subtle">
        Enter a city name or a 5-digit US ZIP code. The modal only opens from the secret `weather` command.
      </div>
    </section>
  );
}

