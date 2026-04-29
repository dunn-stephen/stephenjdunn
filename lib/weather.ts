export type WeatherCategory =
  | "clear"
  | "partly-cloudy"
  | "overcast"
  | "drizzle"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "fog"
  | "mixed";

export type WeatherLocation = {
  name: string;
  state: string | null;
  country: string;
  lat: number;
  lon: number;
};

export type CurrentWeather = {
  observedAt: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  dewPoint: number;
  uvIndex: number;
  cloudCover: number;
  visibility: number;
  windSpeed: number;
  windDirection: number | null;
  windGust: number | null;
  conditionCode: number;
  condition: string;
  description: string;
  icon: string;
  isDay: boolean;
  sunrise: number;
  sunset: number;
  precipitationLastHour: number | null;
};

export type ForecastWeather = {
  timestamp: number;
  temperature: number;
  feelsLike: number;
  pressure: number;
  humidity: number;
  dewPoint: number;
  uvIndex: number;
  cloudCover: number;
  visibility: number;
  windSpeed: number;
  windDirection: number | null;
  conditionCode: number;
  condition: string;
  description: string;
  icon: string;
  precipitationChance: number;
  precipitationVolume: number | null;
  isDay: boolean;
};

export type DailyForecast = {
  timestamp: number;
  summary: string;
  tempMin: number;
  tempMax: number;
  tempDay: number;
  tempNight: number;
  tempEve: number;
  tempMorn: number;
  feelsLikeDay: number;
  feelsLikeNight: number;
  feelsLikeEve: number;
  feelsLikeMorn: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moonPhase: number;
  pressure: number;
  humidity: number;
  dewPoint: number;
  windSpeed: number;
  windDirection: number | null;
  windGust: number | null;
  cloudCover: number;
  uvIndex: number;
  precipitationChance: number;
  rain: number | null;
  snow: number | null;
  conditionCode: number;
  condition: string;
  description: string;
  icon: string;
};

export type WeatherSnapshot = {
  location: WeatherLocation;
  category: WeatherCategory;
  timezoneOffset: number;
  current: CurrentWeather;
  forecast: ForecastWeather[];
  daily: DailyForecast[];
};

export function getWeatherCategory(conditionCode: number): WeatherCategory {
  if (conditionCode >= 200 && conditionCode <= 232) {
    return "thunderstorm";
  }

  if (conditionCode >= 300 && conditionCode <= 321) {
    return "drizzle";
  }

  if (conditionCode >= 500 && conditionCode <= 531) {
    return "rain";
  }

  if (conditionCode >= 600 && conditionCode <= 622) {
    if (conditionCode >= 611 && conditionCode <= 616) {
      return "mixed";
    }

    return "snow";
  }

  if (conditionCode >= 700 && conditionCode <= 781) {
    return "fog";
  }

  if (conditionCode === 800) {
    return "clear";
  }

  if (conditionCode >= 801 && conditionCode <= 802) {
    return "partly-cloudy";
  }

  if (conditionCode >= 803 && conditionCode <= 804) {
    return "overcast";
  }

  return "clear";
}

export function isZipCodeQuery(query: string) {
  return /^\d{5}(?:-\d{4})?$/.test(query.trim());
}

export function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatWindDirection(degrees: number | null | undefined) {
  if (typeof degrees !== "number" || Number.isNaN(degrees)) {
    return "CALM";
  }

  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % directions.length;

  return directions[index];
}

export function formatWeatherTime(
  unixSeconds: number,
  timezoneOffsetSeconds: number,
  options: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    ...options
  }).format(new Date((unixSeconds + timezoneOffsetSeconds) * 1000));
}

export function buildLocationLabel(location: WeatherLocation) {
  return [location.name, location.state, location.country].filter(Boolean).join(", ");
}
