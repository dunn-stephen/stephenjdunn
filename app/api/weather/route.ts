import { NextResponse } from "next/server";
import { getWeatherCategory, isZipCodeQuery } from "@/lib/weather";

export const dynamic = "force-dynamic";

const OPEN_WEATHER_BASE_URL = "https://api.openweathermap.org";

type OpenWeatherCondition = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

type OpenWeatherCityGeocode = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};

type OpenWeatherZipGeocode = {
  zip: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
};

type OneCallResponse = {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: OpenWeatherCondition[];
    rain?: {
      "1h"?: number;
    };
    snow?: {
      "1h"?: number;
    };
  };
  hourly: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: OpenWeatherCondition[];
    pop: number;
    rain?: {
      "1h"?: number;
    };
    snow?: {
      "1h"?: number;
    };
  }>;
  daily: Array<{
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    summary: string;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: OpenWeatherCondition[];
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;
    uvi: number;
  }>;
};

type UpstreamError = {
  status: number;
  message: string;
};

function getApiKey() {
  return process.env.OPEN_WEATHER_API_KEY;
}

function getPrimaryCondition(conditions: OpenWeatherCondition[]) {
  const [condition] = conditions;

  if (!condition) {
    throw new Error("Weather response did not include a condition.");
  }

  return condition;
}

async function fetchOpenWeatherJson<T>(pathname: string, params: Record<string, string>) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Missing OPEN_WEATHER_API_KEY.");
  }

  const url = new URL(pathname, OPEN_WEATHER_BASE_URL);
  const searchParams = new URLSearchParams(params);
  searchParams.set("appid", apiKey);
  url.search = searchParams.toString();

  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `OpenWeather request failed with status ${response.status}.`;

    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (typeof errorPayload.message === "string" && errorPayload.message.trim()) {
        message = errorPayload.message;
      }
    } catch {
      // Ignore JSON parsing failures and keep the default message.
    }

    const error: UpstreamError = {
      status: response.status,
      message
    };

    throw error;
  }

  return (await response.json()) as T;
}

async function resolveLocation(query: string) {
  if (isZipCodeQuery(query)) {
    const zipQuery = query.trim().slice(0, 5);
    const location = await fetchOpenWeatherJson<OpenWeatherZipGeocode>("/geo/1.0/zip", {
      zip: `${zipQuery},US`
    });

    return {
      name: location.name,
      state: null,
      country: location.country,
      lat: location.lat,
      lon: location.lon
    };
  }

  const results = await fetchOpenWeatherJson<OpenWeatherCityGeocode[]>("/geo/1.0/direct", {
    q: query,
    limit: "5"
  });

  const [location] = results;

  if (!location) {
    return null;
  }

  return {
    name: location.name,
    state: location.state ?? null,
    country: location.country,
    lat: location.lat,
    lon: location.lon
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json(
      {
        error: "Enter a city name or US ZIP code."
      },
      { status: 400 }
    );
  }

  try {
    const location = await resolveLocation(query);

    if (!location) {
      return NextResponse.json(
        {
          error: "Location not found."
        },
        { status: 404 }
      );
    }

    const weatherParams = {
      lat: String(location.lat),
      lon: String(location.lon),
      units: "imperial"
    };

    const weather = await fetchOpenWeatherJson<OneCallResponse>("/data/3.0/onecall", {
      ...weatherParams,
      exclude: "minutely"
    });

    const currentCondition = getPrimaryCondition(weather.current.weather);

    return NextResponse.json(
      {
        location,
        category: getWeatherCategory(currentCondition.id),
        timezoneOffset: weather.timezone_offset,
        current: {
          observedAt: weather.current.dt,
          temperature: weather.current.temp,
          feelsLike: weather.current.feels_like,
          humidity: weather.current.humidity,
          pressure: weather.current.pressure,
          dewPoint: weather.current.dew_point,
          uvIndex: weather.current.uvi,
          cloudCover: weather.current.clouds,
          visibility: weather.current.visibility,
          windSpeed: weather.current.wind_speed,
          windDirection: weather.current.wind_deg ?? null,
          windGust: weather.current.wind_gust ?? null,
          conditionCode: currentCondition.id,
          condition: currentCondition.main,
          description: currentCondition.description,
          icon: currentCondition.icon,
          isDay: currentCondition.icon.endsWith("d"),
          sunrise: weather.current.sunrise,
          sunset: weather.current.sunset,
          precipitationLastHour: weather.current.rain?.["1h"] ?? weather.current.snow?.["1h"] ?? null
        },
        forecast: weather.hourly.slice(0, 8).map((entry) => {
          const condition = getPrimaryCondition(entry.weather);

          return {
            timestamp: entry.dt,
            temperature: entry.temp,
            feelsLike: entry.feels_like,
            pressure: entry.pressure,
            humidity: entry.humidity,
            dewPoint: entry.dew_point,
            uvIndex: entry.uvi,
            cloudCover: entry.clouds,
            visibility: entry.visibility,
            windSpeed: entry.wind_speed,
            windDirection: entry.wind_deg ?? null,
            conditionCode: condition.id,
            condition: condition.main,
            description: condition.description,
            icon: condition.icon,
            precipitationChance: entry.pop,
            precipitationVolume: entry.rain?.["1h"] ?? entry.snow?.["1h"] ?? null,
            isDay: condition.icon.endsWith("d")
          };
        }),
        daily: weather.daily.slice(0, 8).map((entry) => {
          const condition = getPrimaryCondition(entry.weather);

          return {
            timestamp: entry.dt,
            summary: entry.summary,
            tempMin: entry.temp.min,
            tempMax: entry.temp.max,
            tempDay: entry.temp.day,
            tempNight: entry.temp.night,
            tempEve: entry.temp.eve,
            tempMorn: entry.temp.morn,
            feelsLikeDay: entry.feels_like.day,
            feelsLikeNight: entry.feels_like.night,
            feelsLikeEve: entry.feels_like.eve,
            feelsLikeMorn: entry.feels_like.morn,
            sunrise: entry.sunrise,
            sunset: entry.sunset,
            moonrise: entry.moonrise,
            moonset: entry.moonset,
            moonPhase: entry.moon_phase,
            pressure: entry.pressure,
            humidity: entry.humidity,
            dewPoint: entry.dew_point,
            windSpeed: entry.wind_speed,
            windDirection: entry.wind_deg ?? null,
            windGust: entry.wind_gust ?? null,
            cloudCover: entry.clouds,
            uvIndex: entry.uvi,
            precipitationChance: entry.pop,
            rain: entry.rain ?? null,
            snow: entry.snow ?? null,
            conditionCode: condition.id,
            condition: condition.main,
            description: condition.description,
            icon: condition.icon
          };
        })
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      "message" in error &&
      typeof error.status === "number" &&
      typeof error.message === "string"
    ) {
      return NextResponse.json(
        {
          error: error.status === 404 ? "Location not found." : error.message
        },
        { status: error.status }
      );
    }

    const message = error instanceof Error ? error.message : "Weather data unavailable.";
    const status = message === "Missing OPEN_WEATHER_API_KEY." ? 500 : 502;

    return NextResponse.json(
      {
        error: message
      },
      { status }
    );
  }
}
