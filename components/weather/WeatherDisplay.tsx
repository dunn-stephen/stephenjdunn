import { Panel, SectionLabel } from "@/components/shared/Tui";
import { AsciiScene } from "@/components/weather/AsciiScene";
import { TelemetryContent, WeatherDataPanel } from "@/components/weather/WeatherDataPanel";
import type { WeatherSnapshot } from "@/lib/weather";

type WeatherDisplayProps = {
  weather: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
};

export function WeatherDisplay({ weather, loading, error }: WeatherDisplayProps) {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-4">
      <Panel accent>
        <SectionLabel>Current Conditions</SectionLabel>
        <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
          <div className="min-w-0">
            <SectionLabel className="mb-3">Summary</SectionLabel>
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(280px,0.88fr)_minmax(0,1.12fr)]">
              <AsciiScene
                weather={weather}
                loading={loading}
                error={error}
                compact
                className="w-full max-w-full"
              />
              <WeatherDataPanel weather={weather} loading={loading} error={error} section="summary" />
            </div>
          </div>

          <TelemetryContent
            weather={weather}
            loading={loading}
            error={error}
            title="Telemetry"
            compact
          />
        </div>
      </Panel>

      <WeatherDataPanel weather={weather} loading={loading} error={error} section="hourly" />
      <WeatherDataPanel weather={weather} loading={loading} error={error} section="daily" />
      <WeatherDataPanel weather={weather} loading={loading} error={error} section="raw" />
    </div>
  );
}
