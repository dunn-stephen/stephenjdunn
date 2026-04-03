import type { WeatherCategory } from "@/lib/weather";

export type SceneMode = "idle" | "loading" | "error" | "ready";

export type Sprite = string[];

export type Grid = string[][];

export type RenderSceneOptions = {
  frame: number;
  mode: SceneMode;
  width?: number;
  height?: number;
  category?: WeatherCategory;
  isDay?: boolean;
  locationName?: string;
  conditionLabel?: string;
  temperature?: number;
};

