"use client";

import { ProgressMeter, SectionLabel, Tag } from "@/components/shared/Tui";
import { osApi } from "@/lib/os/api";
import { useOsResource } from "@/components/os/apps/useOsResource";

export function ResumeApp() {
  const { data, loading, error } = useOsResource("resume", () => osApi.resume());

  if (loading) {
    return <p className="text-[11px] text-subtle">Loading resume...</p>;
  }

  if (error || !data) {
    return <p className="text-[11px] text-[#8c2f2f]">{error ?? "Resume unavailable."}</p>;
  }

  return (
    <div className="space-y-4">
      <section className="os9-panel rounded-[2px] px-4 py-4">
        <SectionLabel>Summary</SectionLabel>
        <p className="text-[13px] leading-6 text-muted">{data.summary}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="os9-panel rounded-[2px] px-4 py-4">
          <SectionLabel>Experience</SectionLabel>
          <div className="space-y-4">
            {data.experience.map((role) => (
              <div key={`${role.company}-${role.role}`}>
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent-ink">{role.role}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {role.company} · {role.start} - {role.end}
                </p>
                <ul className="mt-2 space-y-1 pl-4 text-[12px] leading-5 text-muted marker:text-accent">
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <section className="os9-panel rounded-[2px] px-4 py-4">
            <SectionLabel>Skills</SectionLabel>
            <div className="space-y-2">
              {data.skillRatings.map((rating) => (
                <ProgressMeter key={rating.label} label={rating.label} value={rating.value} />
              ))}
            </div>
          </section>

          <section className="os9-panel rounded-[2px] px-4 py-4">
            <SectionLabel>Toolkit</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {data.toolkit.map((item, index) => (
                <Tag key={item} accent={index < 2}>
                  {item}
                </Tag>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
