import clsx from "clsx";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  MoonStar,
  Sun,
  type LucideIcon
} from "lucide-react";
import { useState } from "react";
import { Panel, SectionLabel, Tag } from "@/components/shared/Tui";
import {
  buildLocationLabel,
  formatWeatherTime,
  formatWindDirection,
  toTitleCase
} from "@/lib/weather";
import type { DailyForecast, ForecastWeather, WeatherSnapshot } from "@/lib/weather";

type WeatherDataPanelProps = {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  section?: "summary" | "telemetry" | "hourly" | "daily" | "raw";
  className?: string;
};

const weatherIconMap: Record<string, LucideIcon> = {
  "01d": Sun,
  "01n": MoonStar,
  "02d": CloudSun,
  "02n": CloudMoon,
  "03d": Cloud,
  "03n": Cloud,
  "04d": Cloud,
  "04n": Cloud,
  "09d": CloudDrizzle,
  "09n": CloudDrizzle,
  "10d": CloudSunRain,
  "10n": CloudMoonRain,
  "11d": CloudLightning,
  "11n": CloudLightning,
  "13d": CloudSnow,
  "13n": CloudSnow,
  "50d": CloudFog,
  "50n": CloudFog
};

function formatTemperature(value: number) {
  return `${Math.round(value)}F`;
}

function formatChance(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatVisibility(value: number) {
  const miles = value / 1609.344;
  return `${miles.toFixed(miles >= 10 ? 0 : 1)} mi`;
}

function formatOptionalSpeed(value: number | null) {
  return typeof value === "number" ? `${Math.round(value)} mph` : "N/A";
}

function formatUvIndex(value: number) {
  return value.toFixed(1);
}

function formatMoonPhase(value: number) {
  return value.toFixed(2);
}

function formatPressure(value: number) {
  return `${value} hPa`;
}

function formatWind(speed: number, direction: number | null) {
  return `${formatWindDirection(direction)} ${Math.round(speed)} mph`;
}

function formatClock(timestamp: number, timezoneOffset: number) {
  return formatWeatherTime(timestamp, timezoneOffset, {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatDailyDate(timestamp: number, timezoneOffset: number) {
  return formatWeatherTime(timestamp, timezoneOffset, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatPrecipitationVolume(value: number | null) {
  if (typeof value !== "number") {
    return "0";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(value >= 1 ? 1 : 2);
}

function WeatherConditionIcon({
  icon,
  className
}: {
  icon: string;
  className?: string;
}) {
  const Icon = weatherIconMap[icon] ?? Cloud;

  return <Icon aria-hidden="true" className={clsx("shrink-0", className)} strokeWidth={1.8} />;
}

function SectionIntro({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <SectionLabel className="mb-1">{title}</SectionLabel>
      {subtitle ? (
        <p className="mb-4 text-[0.56rem] uppercase tracking-[0.16em] text-faint">{subtitle}</p>
      ) : null}
    </>
  );
}

function QuickStat({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={clsx("border px-3 py-2", accent ? "border-[#5a2608] bg-[#20120a]" : "border-border bg-surface")}>
      <p className="text-[0.54rem] uppercase tracking-[0.18em] text-subtle">{label}</p>
      <p className={clsx("mt-2 text-[0.76rem] uppercase tracking-[0.12em]", accent ? "text-accent" : "text-text")}>
        {value}
      </p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-baseline gap-3 border-b border-border py-2 last:border-b-0">
      <span className="text-[0.56rem] uppercase tracking-[0.16em] text-subtle">{label}</span>
      <span className="min-w-0 text-right text-[0.68rem] uppercase tracking-[0.12em] text-text">{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
      <span className="text-[0.54rem] uppercase tracking-[0.16em] text-subtle">{label}</span>
      <span className="min-w-0 text-right text-[0.62rem] uppercase tracking-[0.12em] text-text">{value}</span>
    </div>
  );
}

function PlaceholderPanel({
  title,
  body,
  className
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <SectionIntro title={title} />
      <p className="text-[0.68rem] leading-6 text-muted">{body}</p>
    </Panel>
  );
}

function SummaryContent({
  weather,
  loading,
  error,
  className
}: {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={className}>
        <p className="text-[0.7rem] leading-6 text-muted">Fetching live conditions, local daylight, and forecast telemetry.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p className="text-[0.7rem] leading-6 text-muted">{error}</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className={className}>
        <p className="text-[0.7rem] leading-6 text-muted">Search for a city or ZIP code to load the local conditions summary.</p>
      </div>
    );
  }

  return (
    <div className={clsx("space-y-5", className)}>
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-subtle">
          {buildLocationLabel(weather.location)}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="min-w-[140px]">
            <div className="flex items-end gap-3 text-accent">
              <p className="text-[2.8rem] leading-none">{formatTemperature(weather.current.temperature)}</p>
              <WeatherConditionIcon icon={weather.current.icon} className="mb-1 h-8 w-8" />
            </div>
            <p className="mt-3 flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.14em] text-text">
              <WeatherConditionIcon icon={weather.current.icon} className="h-4 w-4 text-subtle" />
              {toTitleCase(weather.current.description)}
            </p>
          </div>

          <div className="grid min-w-[220px] flex-1 gap-2 sm:grid-cols-2">
            <QuickStat label="Feels Like" value={formatTemperature(weather.current.feelsLike)} accent />
            <QuickStat label="Humidity" value={formatPercent(weather.current.humidity)} />
            <QuickStat label="Wind" value={formatWind(weather.current.windSpeed, weather.current.windDirection)} />
            <QuickStat label="UV Index" value={formatUvIndex(weather.current.uvIndex)} />
            <QuickStat label="Sunrise" value={formatClock(weather.current.sunrise, weather.timezoneOffset)} />
            <QuickStat label="Sunset" value={formatClock(weather.current.sunset, weather.timezoneOffset)} />
          </div>
        </div>
      </div>
    </div>
  );
}

type TelemetryContentProps = {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  className?: string;
  title?: string | null;
  subtitle?: string;
  compact?: boolean;
};

export function TelemetryContent({
  weather,
  loading,
  error,
  className,
  title = null,
  subtitle,
  compact = false
}: TelemetryContentProps) {
  if (loading) {
    return (
      <div className={className}>
        {title ? <SectionIntro title={title} subtitle={subtitle} /> : null}
        <p className="text-[0.7rem] leading-6 text-muted">Waiting for current telemetry and local daylight values.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {title ? <SectionIntro title={title} subtitle={subtitle} /> : null}
        <p className="text-[0.7rem] leading-6 text-muted">Resolve the weather query to inspect detailed telemetry.</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className={className}>
        {title ? <SectionIntro title={title} subtitle={subtitle} /> : null}
        <p className="text-[0.7rem] leading-6 text-muted">Detailed telemetry appears after a successful weather query.</p>
      </div>
    );
  }

  const primaryMetrics = [
    ["Feels Like", formatTemperature(weather.current.feelsLike)],
    ["Humidity", formatPercent(weather.current.humidity)],
    ["Cloud Cover", formatPercent(weather.current.cloudCover)],
    ["Pressure", formatPressure(weather.current.pressure)],
    ["Dew Point", formatTemperature(weather.current.dewPoint)],
    ["UV Index", formatUvIndex(weather.current.uvIndex)]
  ] as const;

  const secondaryMetrics = [
    ["Wind", formatWind(weather.current.windSpeed, weather.current.windDirection)],
    ["Wind Gust", formatOptionalSpeed(weather.current.windGust)],
    ["Visibility", formatVisibility(weather.current.visibility)],
    ["Precip 1H", formatPrecipitationVolume(weather.current.precipitationLastHour)],
    ["Sunrise", formatClock(weather.current.sunrise, weather.timezoneOffset)],
    ["Sunset", formatClock(weather.current.sunset, weather.timezoneOffset)]
  ] as const;

  const compactMetrics = [...primaryMetrics, ...secondaryMetrics];
  const compactColumnSize = Math.ceil(compactMetrics.length / 3);
  const compactColumns = compact
    ? Array.from({ length: 3 }, (_, index) =>
        compactMetrics.slice(index * compactColumnSize, (index + 1) * compactColumnSize)
      ).filter((column) => column.length > 0)
    : [];

  return (
    <div className={className}>
      {title ? <SectionIntro title={title} subtitle={subtitle} /> : null}
      {compact ? (
        <div className="grid gap-x-6 gap-y-0 md:grid-cols-3">
          {compactColumns.map((column, index) => (
            <div key={index}>
              {column.map(([label, value]) => (
                <MetricRow key={label} label={label} value={value} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-x-6 lg:grid-cols-2">
          <div>
            {primaryMetrics.map(([label, value]) => (
              <MetricRow key={label} label={label} value={value} />
            ))}
          </div>
          <div>
            {secondaryMetrics.map(([label, value]) => (
              <MetricRow key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HourlyForecastCard({
  entry,
  timezoneOffset
}: {
  entry: ForecastWeather;
  timezoneOffset: number;
}) {
  return (
    <details className="group min-w-[210px] border border-border bg-surface px-3 py-3">
      <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.18em] text-subtle">
              {formatWeatherTime(entry.timestamp, timezoneOffset, {
                weekday: "short",
                hour: "numeric",
                minute: "2-digit"
              })}
            </p>
            <div className="mt-2 flex items-center gap-2 text-accent">
              <p className="text-[1rem]">{formatTemperature(entry.temperature)}</p>
              <WeatherConditionIcon icon={entry.icon} className="h-4 w-4" />
            </div>
          </div>
          <Tag accent={entry.isDay} className="shrink-0">
            {entry.isDay ? "Day" : "Night"}
          </Tag>
        </div>

        <p className="mt-3 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.14em] text-text">
          <WeatherConditionIcon icon={entry.icon} className="h-3.5 w-3.5 text-subtle" />
          <span>{toTitleCase(entry.description)}</span>
        </p>
        <div className="mt-3 space-y-2">
          <DetailRow label="Feels" value={formatTemperature(entry.feelsLike)} />
          <DetailRow label="POP" value={formatChance(entry.precipitationChance)} />
          <DetailRow label="Wind" value={formatWind(entry.windSpeed, entry.windDirection)} />
        </div>
        <p className="mt-3 text-[0.54rem] uppercase tracking-[0.16em] text-faint">Toggle telemetry</p>
      </summary>

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        <DetailRow label="Pressure" value={formatPressure(entry.pressure)} />
        <DetailRow label="Humidity" value={formatPercent(entry.humidity)} />
        <DetailRow label="Dew Point" value={formatTemperature(entry.dewPoint)} />
        <DetailRow label="UV Index" value={formatUvIndex(entry.uvIndex)} />
        <DetailRow label="Clouds" value={formatPercent(entry.cloudCover)} />
        <DetailRow label="Visibility" value={formatVisibility(entry.visibility)} />
        <DetailRow label="Precip Vol" value={formatPrecipitationVolume(entry.precipitationVolume)} />
        <DetailRow label="Icon" value={entry.icon} />
        <DetailRow label="Code" value={String(entry.conditionCode)} />
      </div>
    </details>
  );
}

function DailyForecastRow({
  entry,
  timezoneOffset,
  expanded,
  onToggle
}: {
  entry: DailyForecast;
  timezoneOffset: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <details open={expanded} className="group border border-border bg-surface px-3 py-3">
      <summary
        className="list-none cursor-pointer [&::-webkit-details-marker]:hidden"
        aria-expanded={expanded}
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
      >
        <div className="grid items-start gap-3 md:grid-cols-[124px_104px_minmax(0,1fr)_92px_auto]">
          <p className="text-[0.58rem] uppercase tracking-[0.18em] text-subtle">
            {formatDailyDate(entry.timestamp, timezoneOffset)}
          </p>
          <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-accent">
            <WeatherConditionIcon icon={entry.icon} className="h-4 w-4" />
            <p>
              {formatTemperature(entry.tempMax)} / {formatTemperature(entry.tempMin)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate text-[0.66rem] uppercase tracking-[0.12em] text-text">
              <WeatherConditionIcon icon={entry.icon} className="h-3.5 w-3.5 text-subtle" />
              <span className="truncate">{entry.condition}</span>
            </p>
            <p className="mt-1 truncate text-[0.58rem] uppercase tracking-[0.14em] text-muted">
              {toTitleCase(entry.description)}
            </p>
          </div>
          <p className="text-[0.58rem] uppercase tracking-[0.16em] text-subtle">
            {`POP ${formatChance(entry.precipitationChance)}`}
          </p>
          <p className="text-right text-[0.54rem] uppercase tracking-[0.16em] text-faint">Toggle detail</p>
        </div>
        <p className="mt-3 text-[0.62rem] leading-5 text-muted">{entry.summary}</p>
      </summary>

      <div className="mt-4 grid gap-x-6 gap-y-2 border-t border-border pt-4 lg:grid-cols-2">
        <DetailRow label="Hi / Low" value={`${formatTemperature(entry.tempMax)} / ${formatTemperature(entry.tempMin)}`} />
        <DetailRow label="Wind" value={formatWind(entry.windSpeed, entry.windDirection)} />
        <DetailRow label="Morn / Day" value={`${formatTemperature(entry.tempMorn)} / ${formatTemperature(entry.tempDay)}`} />
        <DetailRow label="Wind Gust" value={formatOptionalSpeed(entry.windGust)} />
        <DetailRow label="Eve / Night" value={`${formatTemperature(entry.tempEve)} / ${formatTemperature(entry.tempNight)}`} />
        <DetailRow label="Pressure" value={formatPressure(entry.pressure)} />
        <DetailRow label="Feels M / D" value={`${formatTemperature(entry.feelsLikeMorn)} / ${formatTemperature(entry.feelsLikeDay)}`} />
        <DetailRow label="Humidity" value={formatPercent(entry.humidity)} />
        <DetailRow label="Feels E / N" value={`${formatTemperature(entry.feelsLikeEve)} / ${formatTemperature(entry.feelsLikeNight)}`} />
        <DetailRow label="Dew Point" value={formatTemperature(entry.dewPoint)} />
        <DetailRow label="Sunrise" value={formatClock(entry.sunrise, timezoneOffset)} />
        <DetailRow label="Clouds" value={formatPercent(entry.cloudCover)} />
        <DetailRow label="Sunset" value={formatClock(entry.sunset, timezoneOffset)} />
        <DetailRow label="UV Index" value={formatUvIndex(entry.uvIndex)} />
        <DetailRow label="Moonrise" value={formatClock(entry.moonrise, timezoneOffset)} />
        <DetailRow label="Rain" value={formatPrecipitationVolume(entry.rain)} />
        <DetailRow label="Moonset" value={formatClock(entry.moonset, timezoneOffset)} />
        <DetailRow label="Snow" value={formatPrecipitationVolume(entry.snow)} />
        <DetailRow label="Moon Phase" value={formatMoonPhase(entry.moonPhase)} />
        <DetailRow label="Icon" value={entry.icon} />
        <DetailRow label="Code" value={String(entry.conditionCode)} />
      </div>
    </details>
  );
}

function TelemetryPanel({
  weather,
  loading,
  error,
  className
}: {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  className?: string;
}) {
  if (loading) {
    return (
      <PlaceholderPanel
        title="Detailed Telemetry"
        body="Waiting for current telemetry and local daylight values."
        className={className}
      />
    );
  }

  if (error) {
    return (
      <PlaceholderPanel
        title="Detailed Telemetry"
        body="Resolve the weather query to inspect detailed telemetry."
        className={className}
      />
    );
  }

  if (!weather) {
    return (
      <PlaceholderPanel
        title="Detailed Telemetry"
        body="Detailed telemetry appears after a successful weather query."
        className={className}
      />
    );
  }

  return (
    <Panel className={className}>
      <TelemetryContent
        weather={weather}
        loading={loading}
        error={error}
        title="Detailed Telemetry"
        subtitle="Full current snapshot with aligned label and value pairs."
      />
    </Panel>
  );
}

function HourlyPanel({
  weather,
  loading,
  error,
  className
}: {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  className?: string;
}) {
  if (loading) {
      return (
        <PlaceholderPanel
          title="14 Hour Forecast"
          body="Building the compact hourly strip."
          className={className}
        />
      );
  }

  if (error) {
      return (
        <PlaceholderPanel
          title="14 Hour Forecast"
          body="Resolve the weather query to load the hourly outlook."
          className={className}
        />
      );
  }

  if (!weather) {
      return (
        <PlaceholderPanel
          title="14 Hour Forecast"
          body="The hourly forecast populates after a successful weather query."
          className={className}
        />
      );
  }

  return (
    <Panel className={className}>
      <SectionIntro
        title="14 Hour Forecast"
        subtitle={`${weather.forecast.length} hourly entries loaded. Essential scan view first, telemetry on toggle.`}
      />
      <div className="app-scrollbar flex gap-2 overflow-x-auto pb-1">
        {weather.forecast.map((entry) => (
          <HourlyForecastCard
            key={entry.timestamp}
            entry={entry}
            timezoneOffset={weather.timezoneOffset}
          />
        ))}
      </div>
    </Panel>
  );
}

function DailyPanel({
  weather,
  loading,
  error,
  className
}: {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  className?: string;
}) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  if (loading) {
    return (
      <PlaceholderPanel
        title="8 Day Forecast"
        body="Compiling the multi-day outlook."
        className={className}
      />
    );
  }

  if (error) {
    return (
      <PlaceholderPanel
        title="8 Day Forecast"
        body="Resolve the weather query to load the daily outlook."
        className={className}
      />
    );
  }

  if (!weather) {
    return (
      <PlaceholderPanel
        title="8 Day Forecast"
        body="The daily forecast populates after a successful weather query."
        className={className}
      />
    );
  }

  return (
    <Panel className={className}>
      <SectionIntro
        title="8 Day Forecast"
        subtitle="Daily scan rows with expandable detail for moon, wind, pressure, and precipitation telemetry."
      />
      <div className="space-y-2">
        {weather.daily.map((entry) => (
          <DailyForecastRow
            key={entry.timestamp}
            entry={entry}
            timezoneOffset={weather.timezoneOffset}
            expanded={detailsExpanded}
            onToggle={() => setDetailsExpanded((current) => !current)}
          />
        ))}
      </div>
    </Panel>
  );
}

function RawPayloadPanel({
  weather,
  loading,
  error,
  className
}: {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  className?: string;
}) {
  if (loading) {
    return (
      <PlaceholderPanel
        title="Raw Payload"
        body="Debug payload becomes available after the current query resolves."
        className={className}
      />
    );
  }

  if (error) {
    return (
      <PlaceholderPanel
        title="Raw Payload"
        body="Resolve the weather query to inspect the returned payload."
        className={className}
      />
    );
  }

  if (!weather) {
    return (
      <PlaceholderPanel
        title="Raw Payload"
        body="The raw payload is available after a successful weather query."
        className={className}
      />
    );
  }

  return (
    <Panel className={className}>
      <details className="group">
        <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <SectionIntro title="Raw Payload" subtitle="Collapsed by default for debugging only." />
            </div>
            <span className="shrink-0 text-[0.56rem] uppercase tracking-[0.16em] text-faint">
              Toggle Debug
            </span>
          </div>
        </summary>
        <pre className="app-scrollbar mt-2 max-h-[320px] overflow-auto border border-border bg-surface px-3 py-3 text-[0.58rem] leading-5 text-muted">
          {JSON.stringify(weather, null, 2)}
        </pre>
      </details>
    </Panel>
  );
}

export function WeatherDataPanel({
  weather,
  loading,
  error,
  section = "summary",
  className
}: WeatherDataPanelProps) {
  if (section === "summary") {
    return (
      <SummaryContent
        weather={weather}
        loading={loading}
        error={error}
        className={className}
      />
    );
  }

  if (section === "telemetry") {
    return (
      <TelemetryPanel
        weather={weather}
        loading={loading}
        error={error}
        className={className}
      />
    );
  }

  if (section === "hourly") {
    return (
      <HourlyPanel
        weather={weather}
        loading={loading}
        error={error}
        className={className}
      />
    );
  }

  if (section === "daily") {
    return (
      <DailyPanel
        weather={weather}
        loading={loading}
        error={error}
        className={className}
      />
    );
  }

  return (
    <RawPayloadPanel
      weather={weather}
      loading={loading}
      error={error}
      className={className}
    />
  );
}
