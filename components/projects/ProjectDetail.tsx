import type { ReactNode } from "react";
import Image from "next/image";
import type { ProjectDetail as ProjectDetailType } from "@/lib/content";
import Link from "next/link";
import { BackLink, Panel, SectionLabel, Tag } from "@/components/shared/Tui";

type ProjectDetailProps = {
  project: ProjectDetailType;
  content: ReactNode;
};

export function ProjectDetail({ project, content }: ProjectDetailProps) {
  return (
    <article className="space-y-5">
      <BackLink href="/projects">Back to Projects</BackLink>

      <Panel className="space-y-4">
        <div>
          <h1 className="text-[1rem] uppercase tracking-[0.28em] text-accent">{project.title}</h1>
          <p className="mt-3 max-w-3xl text-[0.72rem] leading-7 text-muted">{project.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-panel px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition hover:border-[#6a320d] hover:text-accent"
            >
              [ GitHub ↗ ]
            </a>
          ) : null}
          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-panel px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition hover:border-[#6a320d] hover:text-accent"
            >
              [ Visit Site ↗ ]
            </a>
          ) : null}
          {project.relatedPost ? (
            <Link
              href={`/blog/${project.relatedPost}`}
              className="inline-flex items-center gap-2 border border-border bg-panel px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition hover:border-[#6a320d] hover:text-accent"
            >
              [ Read Post ↗ ]
            </Link>
          ) : null}
        </div>
      </Panel>

      {project.highlights?.length ? (
        <div>
          <SectionLabel>Features</SectionLabel>
          <div className="space-y-2">
            {project.highlights.map((highlight) => (
              <div key={highlight} className="flex gap-2 text-[0.72rem] leading-6 text-muted">
                <span className="text-accent">►</span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <SectionLabel>Tech Stack</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {project.tech.map((item, index) => (
            <Tag key={item} accent={index < 2}>
              {item}
            </Tag>
          ))}
        </div>
      </div>

      {project.displayMode === "iframe" && project.demo ? (
        <section className="overflow-hidden border border-border bg-panel">
          <div className="border-b border-border px-4 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-subtle">
            Embedded Demo
          </div>
          <iframe
            title={`${project.title} demo`}
            src={project.demo}
            className="h-[540px] w-full border-0 bg-black"
          />
        </section>
      ) : null}

      {project.displayMode === "screenshot" && project.screenshot ? (
        <section className="border border-border bg-panel p-4">
          <div className="overflow-hidden border border-border bg-black/35">
            <Image
              src={project.screenshot}
              alt={`${project.title} preview`}
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
        </section>
      ) : null}

      <Panel className="space-y-4">
        <SectionLabel>Notes</SectionLabel>
        <section className="prose-shell">{content}</section>
      </Panel>
    </article>
  );
}
