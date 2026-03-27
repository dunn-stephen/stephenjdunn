import type { ReactNode } from "react";
import Image from "next/image";
import type { ProjectDetail as ProjectDetailType } from "@/lib/content";
import { TerminalPage } from "@/components/terminal/TerminalPage";

type ProjectDetailProps = {
  project: ProjectDetailType;
  content: ReactNode;
};

export function ProjectDetail({ project, content }: ProjectDetailProps) {
  return (
    <TerminalPage command={`cd projects && cat ${project.slug}.mdx`} cwd="~">
    <article className="space-y-8">
      <header className="rounded-3xl border border-border bg-black/25 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-dim">{project.displayMode}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text">{project.title}</h1>
        <p className="mt-4 max-w-3xl leading-7 text-dim">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((item) => (
            <span key={item} className="rounded-full border border-border px-3 py-1 text-xs text-green">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-border px-4 py-3 text-sm text-dim transition hover:border-accent hover:text-accent"
            >
              view repo
            </a>
          ) : null}
          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-accent px-4 py-3 text-sm text-accent transition hover:bg-accent hover:text-black"
            >
              launch demo
            </a>
          ) : null}
        </div>
      </header>

      {project.displayMode === "iframe" && project.demo ? (
        <section className="overflow-hidden rounded-3xl border border-border bg-black/25">
          <div className="border-b border-border px-4 py-3 text-sm text-dim">embedded demo</div>
          <iframe
            title={`${project.title} demo`}
            src={project.demo}
            className="h-[540px] w-full border-0 bg-black"
          />
        </section>
      ) : null}

      {project.displayMode === "screenshot" && project.screenshot ? (
        <section className="rounded-3xl border border-border bg-black/25 p-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-black/35">
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

      <section className="prose-shell rounded-3xl border border-border bg-black/25 p-6">
        {content}
      </section>
    </article>
    </TerminalPage>
  );
}
