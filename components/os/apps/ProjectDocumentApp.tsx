"use client";

import { Tag } from "@/components/shared/Tui";
import { osApi } from "@/lib/os/api";
import { useOsResource } from "@/components/os/apps/useOsResource";
import { OsMdxContent } from "@/components/os/apps/OsMdxContent";

export function ProjectDocumentApp({ slug }: { slug: string }) {
  const { data, loading, error } = useOsResource(`project:${slug}`, () => osApi.project(slug));

  if (loading) {
    return <p className="text-[11px] text-subtle">Loading project...</p>;
  }

  if (error || !data) {
    return <p className="text-[11px] text-[#8c2f2f]">{error ?? "Project unavailable."}</p>;
  }

  return (
    <article className="space-y-4">
      <section className="os9-panel rounded-[2px] px-4 py-4">
        <h2 className="text-[16px] font-bold uppercase tracking-[0.14em] text-accent-ink">{data.title}</h2>
        <p className="mt-3 text-[13px] leading-6 text-muted">{data.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.tech.map((item, index) => (
            <Tag key={item} accent={index < 2}>
              {item}
            </Tag>
          ))}
        </div>
      </section>
      <OsMdxContent source={data.source} />
    </article>
  );
}
