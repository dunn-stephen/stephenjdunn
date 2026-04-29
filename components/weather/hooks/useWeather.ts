"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WeatherSnapshot } from "@/lib/weather";

type WeatherErrorResponse = {
  error?: string;
};

export function useWeather() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setWeather(null);
      setError("Enter a city or US ZIP code.");
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const response = await fetch(`/api/weather?query=${encodeURIComponent(normalizedQuery)}`, {
        signal: controller.signal,
        cache: "no-store"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as WeatherErrorResponse | null;
        throw new Error(payload?.error ?? "Weather data unavailable.");
      }

      const payload = (await response.json()) as WeatherSnapshot;
      setWeather(payload);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setWeather(null);
      setError(error instanceof Error ? error.message : "Weather data unavailable.");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    weather,
    error,
    loading,
    search
  };
}

