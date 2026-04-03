"use client";

import clsx from "clsx";
import { renderWeatherScene, isLightningFlashFrame } from "@/components/weather/ascii/renderer";
import type { SceneMode } from "@/components/weather/ascii/types";
import { useAnimationLoop } from "@/components/weather/hooks/useAnimationLoop";
import { buildLocationLabel } from "@/lib/weather";
import type { WeatherSnapshot } from "@/lib/weather";

type AsciiSceneProps = {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  compact?: boolean;
  className?: string;
};

function getSceneMode(weather: WeatherSnapshot | null, loading: boolean, error: string | null): SceneMode {
  if (loading) {
    return "loading";
  }

  if (error) {
    return "error";
  }

  if (weather) {
    return "ready";
  }

  return "idle";
}

function getScenePalette(weather: WeatherSnapshot | null, flashActive: boolean) {
  if (flashActive) {
    return {
      background: "linear-gradient(180deg, #f5efe3 0%, #d8d1c2 100%)",
      textClassName: "text-[#171412]"
    };
  }

  if (!weather) {
    return {
      background: "linear-gradient(180deg, #17171a 0%, #111114 100%)",
      textClassName: "text-[#e7dfd6]"
    };
  }

  switch (weather.category) {
    case "clear":
      return {
        background: weather.current.isDay
          ? "linear-gradient(180deg, rgba(232,100,12,0.20) 0%, rgba(34,23,16,0.9) 72%, #0d0d0e 100%)"
          : "linear-gradient(180deg, rgba(59,91,140,0.36) 0%, rgba(20,25,39,0.94) 68%, #0b0d12 100%)",
        textClassName: weather.current.isDay ? "text-[#f3e8dd]" : "text-[#dde8ff]"
      };
    case "partly-cloudy":
      return {
        background: weather.current.isDay
          ? "linear-gradient(180deg, rgba(161,133,100,0.22) 0%, rgba(36,29,24,0.92) 70%, #0d0d0e 100%)"
          : "linear-gradient(180deg, rgba(80,94,126,0.34) 0%, rgba(20,24,34,0.94) 68%, #0b0d12 100%)",
        textClassName: "text-[#e6e2da]"
      };
    case "overcast":
      return {
        background: "linear-gradient(180deg, rgba(91,91,98,0.34) 0%, rgba(28,28,31,0.94) 68%, #0d0d0e 100%)",
        textClassName: "text-[#e2ddd5]"
      };
    case "drizzle":
    case "rain":
    case "mixed":
      return {
        background: "linear-gradient(180deg, rgba(75,104,136,0.34) 0%, rgba(22,28,37,0.94) 68%, #0d0d0e 100%)",
        textClassName: "text-[#dae6f3]"
      };
    case "snow":
      return {
        background: "linear-gradient(180deg, rgba(162,182,214,0.28) 0%, rgba(28,35,47,0.94) 68%, #0d0d0e 100%)",
        textClassName: "text-[#eef4ff]"
      };
    case "fog":
      return {
        background: "linear-gradient(180deg, rgba(116,112,107,0.34) 0%, rgba(31,30,30,0.94) 68%, #0d0d0e 100%)",
        textClassName: "text-[#e0dbd3]"
      };
    case "thunderstorm":
      return {
        background: "linear-gradient(180deg, rgba(88,74,46,0.28) 0%, rgba(18,18,21,0.96) 68%, #0b0b0d 100%)",
        textClassName: "text-[#f0e3ca]"
      };
    default:
      return {
        background: "linear-gradient(180deg, #17171a 0%, #111114 100%)",
        textClassName: "text-[#e7dfd6]"
      };
  }
}

export function AsciiScene({ weather, loading, error, compact = false, className }: AsciiSceneProps) {
  const mode = getSceneMode(weather, loading, error);
  const frame = useAnimationLoop(mode === "loading" || mode === "ready");
  const flashActive = isLightningFlashFrame(weather?.category, frame);
  const palette = getScenePalette(weather, flashActive);
  const scene = renderWeatherScene({
    frame,
    mode,
    category: weather?.category,
    isDay: weather?.current.isDay,
    locationName: weather ? buildLocationLabel(weather.location) : undefined,
    conditionLabel: weather?.current.description,
    temperature: weather?.current.temperature
  });

  if (compact) {
    return (
      <div className={clsx("relative overflow-hidden border border-border bg-panel-alt", className)}>
        <div className="absolute inset-0 opacity-95" style={{ background: palette.background }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] opacity-80" />
        <pre
          className={clsx(
            "app-scrollbar relative z-10 m-0 max-w-full overflow-x-auto whitespace-pre px-2 py-2 text-[0.32rem] leading-[1.06] sm:text-[0.38rem] md:text-[0.44rem] lg:text-[0.5rem]",
            palette.textClassName
          )}
        >
          {scene}
        </pre>
      </div>
    );
  }

  return (
    <section className={clsx("inline-flex w-fit max-w-full self-start flex-col overflow-hidden border border-border bg-panel", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-border bg-panel-alt px-4 py-2">
        <p className="text-[0.58rem] uppercase tracking-[0.22em] text-subtle">ASCII Scene</p>
        <p className="truncate text-[0.58rem] uppercase tracking-[0.16em] text-faint">
          {weather ? weather.current.condition : loading ? "Loading" : error ? "Retry Ready" : "Awaiting Query"}
        </p>
      </div>

      <div className="relative inline-flex max-w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-95" style={{ background: palette.background }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] opacity-80" />
        <pre
          className={clsx(
            "app-scrollbar relative z-10 m-0 max-w-full overflow-x-auto whitespace-pre text-[0.42rem] leading-[1.08] sm:text-[0.5rem] md:text-[0.58rem] lg:text-[0.64rem]",
            palette.textClassName
          )}
        >
          {scene}
        </pre>
      </div>
    </section>
  );
}
