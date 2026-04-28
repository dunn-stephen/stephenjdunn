"use client";

import { StatusPill, Tag } from "@/components/shared/Tui";
import { osApi } from "@/lib/os/api";
import { useOsResource } from "@/components/os/apps/useOsResource";

export function ProjectsIndexApp({ onOpenProject }: { onOpenProject: (slug: string) => void }) {
  const { data, loading, error } = useOsResource("projects", () => osApi.projects());

  if (loading) {
    return <p className="text-[11px] text-subtle">Loading projects...</p>;
  }

  if (error || !data) {
    return <p className="text-[11px] text-[#8c2f2f]">{error ?? "Projects unavailable."}</p>;
  }

  if (data.projects.length === 0) {
    return <p className="text-[11px] text-subtle">No projects published yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.projects.map((project) => (
        <button
          key={project.slug}
          type="button"
          onDoubleClick={() => onOpenProject(project.slug)}
          onClick={() => onOpenProject(project.slug)}
          className="w-full border border-border bg-[#f4f4f4] px-4 py-3 text-left transition hover:bg-[#e9f2fe]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent-ink">
              {project.title}
            </span>
            <StatusPill status={project.status ?? "done"} />
          </div>
          <p className="mt-2 text-[12px] leading-5 text-muted">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tech.slice(0, 3).map((tech, index) => (
              <Tag key={tech} accent={index === 0}>
                {tech}
              </Tag>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
