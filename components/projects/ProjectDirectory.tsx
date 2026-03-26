"use client";

import { useMemo, useState } from "react";
import type { ProjectSummary } from "@/lib/content";
import { ProjectCard } from "@/components/projects/ProjectCard";

type ProjectDirectoryProps = {
  projects: ProjectSummary[];
};

export function ProjectDirectory({ projects }: ProjectDirectoryProps) {
  const [activeTag, setActiveTag] = useState<string>("all");
  const tags = useMemo(
    () => ["all", ...Array.from(new Set(projects.flatMap((project) => project.tech))).sort()],
    [projects]
  );

  const filtered = useMemo(() => {
    if (activeTag === "all") {
      return projects;
    }
    return projects.filter((project) => project.tech.includes(activeTag));
  }, [activeTag, projects]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              activeTag === tag
                ? "border-accent bg-accent text-black"
                : "border-border text-dim hover:border-accent hover:text-accent"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
