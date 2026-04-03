import { Panel, SectionLabel } from "@/components/shared/Tui";
import { AsciiScene } from "@/components/weather/AsciiScene";
import { WeatherDataPanel } from "@/components/weather/WeatherDataPanel";
import type { WeatherSnapshot } from "@/lib/weather";

type WeatherDisplayProps = {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
};

export function WeatherDisplay({ weather, loading, error }: WeatherDisplayProps) {
  return (
    <div className="space-y-4">
      <Panel accent>
        <SectionLabel>Current Conditions Summary</SectionLabel>
        <div className="grid items-start gap-4 xl:grid-cols-[max-content_minmax(0,1fr)]">
          <AsciiScene
            weather={weather}
            loading={loading}
            error={error}
            compact
            className="max-w-full"
          />
          <WeatherDataPanel weather={weather} loading={loading} error={error} section="summary" />
        </div>
      </Panel>

      <WeatherDataPanel weather={weather} loading={loading} error={error} section="telemetry" />
      <WeatherDataPanel weather={weather} loading={loading} error={error} section="hourly" />
      <WeatherDataPanel weather={weather} loading={loading} error={error} section="daily" />
      <WeatherDataPanel weather={weather} loading={loading} error={error} section="raw" />
    </div>
  );
}
