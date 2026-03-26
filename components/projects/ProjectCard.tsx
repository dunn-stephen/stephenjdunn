import type { Route } from "next";
import Link from "next/link";
import type { ProjectSummary } from "@/lib/content";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.slug}` as Route}
      className="group rounded-3xl border border-border bg-black/25 p-5 transition hover:border-accent hover:shadow-[0_0_32px_rgba(255,140,26,0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-dim">{project.displayMode}</p>
          <h2 className="mt-2 text-2xl text-text transition group-hover:text-accent">{project.title}</h2>
        </div>
        <p className="text-sm text-dim">{project.date}</p>
      </div>
      <p className="mt-4 leading-7 text-dim">{project.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tech.map((item) => (
          <span key={item} className="rounded-full border border-border px-3 py-1 text-xs text-green">
            {item}
          </span>
        ))}
      </div>
    </Link>
  );
}
