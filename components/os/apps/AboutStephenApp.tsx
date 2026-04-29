"use client";

import { Panel, SectionLabel, Tag } from "@/components/shared/Tui";
import { osApi } from "@/lib/os/api";
import { useOsResource } from "@/components/os/apps/useOsResource";

export function AboutStephenApp() {
  const { data, loading, error } = useOsResource("profile", () => osApi.profile());

  if (loading) {
    return <p className="text-[11px] text-subtle">Loading profile...</p>;
  }

  if (error || !data) {
    return <p className="text-[11px] text-[#8c2f2f]">{error ?? "Profile unavailable."}</p>;
  }

  return (
    <div className="space-y-4">
      <Panel accent>
        <SectionLabel>Profile</SectionLabel>
        <h2 className="text-[18px] font-bold uppercase tracking-[0.16em] text-accent-ink">{data.name}</h2>
        <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-subtle">
          {data.sidebar.role} · {data.sidebar.company}
        </p>
        <p className="mt-3 max-w-3xl text-[13px] leading-6 text-muted">{data.description}</p>
      </Panel>

      <Panel>
        <SectionLabel>Now</SectionLabel>
        <p className="text-[13px] leading-6 text-muted">{data.home.hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.home.specialties.map((specialty, index) => (
            <Tag key={specialty} accent={index === 0}>
              {specialty}
            </Tag>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionLabel>Availability</SectionLabel>
        <div className="space-y-2">
          {data.contact.availability.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[12px] text-muted">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#2b72b9]"
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
