import Link from "next/link";
import type { ProjectFrontmatter } from "@/lib/content-schema";
import { SectionLabel, StatusPill, Tag } from "@/components/shared/Tui";

type ProjectDirectoryProps = {
  projects: ProjectFrontmatter[];
};

export function ProjectDirectory({ projects }: ProjectDirectoryProps) {
  return (
    <div className="space-y-4">
      <SectionLabel>{`${projects.length} Projects · Click for Detail`}</SectionLabel>
      <div className="space-y-3">
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group block border border-border bg-panel px-4 py-4 text-left transition hover:border-[#6a320d] hover:bg-[#17130f] sm:px-5"
          >
            <div className="flex flex-col gap-4 md:grid md:grid-cols-[40px_minmax(0,1fr)_120px] md:items-start">
              <span className="text-[0.58rem] uppercase tracking-[0.18em] text-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.78rem] uppercase tracking-[0.12em] text-text transition group-hover:text-accent">
                    {project.slug}
                  </span>
                  <StatusPill status={project.status ?? "done"} />
                </div>

                <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-subtle">{project.title}</p>
                <p className="mt-3 text-[0.68rem] leading-6 text-muted">{project.description}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag accent>{project.primaryTech ?? project.tech[0]}</Tag>
                  {project.tech
                    .filter((value) => value !== (project.primaryTech ?? project.tech[0]))
                    .slice(0, 2)
                    .map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border pt-3 md:block md:border-t-0 md:pt-0 md:text-right">
                <p className="text-[0.58rem] uppercase tracking-[0.14em] text-subtle">{project.date}</p>
                <p className="mt-0 text-[0.68rem] text-faint transition group-hover:text-accent md:mt-8">
                  open card ►
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-border pt-4 text-[0.62rem] uppercase tracking-[0.14em] text-subtle">
        <span className="text-muted">[Open any card]</span> to view project detail
      </div>
    </div>
  );
}
