"use client";

import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { StandaloneExperienceShell } from "@/components/easter-eggs/StandaloneExperienceShell";
import { WeatherDisplay } from "@/components/weather/WeatherDisplay";
import { WeatherSearch } from "@/components/weather/WeatherSearch";
import { useWeather } from "@/components/weather/hooks/useWeather";

export function WeatherFrame() {
  const [query, setQuery] = useState("");
  const { weather, error, loading, search } = useWeather();

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void search(query);
    },
    [query, search]
  );

  return (
    <StandaloneExperienceShell
      title="WEATHER"
      titleClassName="text-[1.1rem] font-semibold tracking-[0.24em] text-accent sm:text-[1.35rem]"
      headerActions={
        <WeatherSearch
          query={query}
          loading={loading}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
          className="w-full border-0 bg-transparent lg:min-w-[440px]"
        />
      }
      shellClassName="max-h-[calc(100dvh-1.5rem)] max-w-[1360px] sm:max-h-[calc(100dvh-2rem)]"
      bodyClassName="min-h-0 flex-col"
    >
      <div className="app-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-shell px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5 lg:px-6 lg:pb-6 lg:pt-6">
        <WeatherDisplay weather={weather} loading={loading} error={error} />
      </div>
    </StandaloneExperienceShell>
  );
}
