"use client";

import { useState } from "react";
import { WeatherDisplay } from "@/components/weather/WeatherDisplay";
import { useWeather } from "@/components/weather/hooks/useWeather";

export function WeatherApp() {
  const [query, setQuery] = useState("San Francisco");
  const { weather, error, loading, search } = useWeather();

  return (
    <div className="space-y-4">
      <div className="os9-toolbar px-3 py-3">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void search(query);
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="os9-input"
            placeholder="Enter a city or ZIP code"
          />
          <button type="submit" className="os9-button rounded-[2px]">
            Fetch Weather
          </button>
        </form>
      </div>
      <WeatherDisplay weather={weather} error={error} loading={loading} />
    </div>
  );
}
