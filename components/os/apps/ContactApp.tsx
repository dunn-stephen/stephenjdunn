"use client";

import { SectionLabel } from "@/components/shared/Tui";
import { osApi } from "@/lib/os/api";
import { useOsResource } from "@/components/os/apps/useOsResource";

export function ContactApp() {
  const { data, loading, error } = useOsResource("profile", () => osApi.profile());

  if (loading) {
    return <p className="text-[11px] text-subtle">Loading contact info...</p>;
  }

  if (error || !data) {
    return <p className="text-[11px] text-[#8c2f2f]">{error ?? "Contact info unavailable."}</p>;
  }

  const methods = [
    {
      label: "Email",
      href: data.socialLinks.email,
      value: data.socialLinks.email.replace("mailto:", "")
    },
    {
      label: "GitHub",
      href: data.socialLinks.github,
      value: data.socialLinks.github.replace(/^https?:\/\//, "")
    },
    {
      label: "LinkedIn",
      href: data.socialLinks.linkedin,
      value: data.socialLinks.linkedin.replace(/^https?:\/\//, "")
    }
  ];

  return (
    <div className="space-y-4">
      <section className="os9-panel rounded-[2px] px-4 py-4">
        <SectionLabel>Reach Out</SectionLabel>
        <div className="space-y-2">
          {methods.map((method) => (
            <a
              key={method.label}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center justify-between gap-3 border border-border bg-[#f7f7f7] px-3 py-3 text-[12px] transition hover:border-[#5d7da6]"
            >
              <span className="font-bold uppercase tracking-[0.12em] text-subtle">{method.label}</span>
              <span className="text-accent-ink">{method.value}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="os9-panel rounded-[2px] px-4 py-4">
        <SectionLabel>Availability</SectionLabel>
        <div className="space-y-2">
          {data.contact.availability.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[12px] text-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2b72b9]" aria-hidden="true" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
