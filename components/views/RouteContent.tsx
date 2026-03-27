import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDirectory } from "@/components/blog/BlogDirectory";
import { PostLayout } from "@/components/blog/PostLayout";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ProjectDirectory } from "@/components/projects/ProjectDirectory";
import { TerminalPage } from "@/components/terminal/TerminalPage";
import {
  getAllPosts,
  getAllProjects,
  getPostBySlug,
  getProjectBySlug,
  getResumeData
} from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { primaryRoutes, siteConfig } from "@/lib/site";

type RouteSegments = string[];

function isProjectsRoute(segments: RouteSegments) {
  return segments.length >= 1 && segments[0] === "projects";
}

function isBlogRoute(segments: RouteSegments) {
  return segments.length >= 1 && segments[0] === "blog";
}

export function getStaticRouteParams() {
  return [
    ...primaryRoutes
      .filter((route) => route.href !== "/")
      .map((route) => ({ slug: route.href.split("/").filter(Boolean) })),
    ...getAllProjects().map((project) => ({ slug: ["projects", project.slug] })),
    ...getAllPosts().map((post) => ({ slug: ["blog", post.slug] }))
  ];
}

export async function getRouteMetadata(segments: RouteSegments): Promise<Metadata> {
  if (segments.length === 1 && segments[0] === "projects") {
    return {
      title: "Projects",
      description: "Selected software projects, demos, and implementation notes."
    };
  }

  if (segments.length === 1 && segments[0] === "resume") {
    return {
      title: "Resume",
      description: "Experience, technical strengths, and background for Stephen J. Dunn."
    };
  }

  if (segments.length === 1 && segments[0] === "blog") {
    return {
      title: "Blog",
      description: "Technical writing, engineering notes, and product thoughts."
    };
  }

  if (segments.length === 1 && segments[0] === "contact") {
    return {
      title: "Contact",
      description: "How to contact Stephen J. Dunn and Apollo Labs."
    };
  }

  if (isProjectsRoute(segments) && segments.length === 2) {
    const project = getProjectBySlug(segments[1]);
    if (!project) {
      return {};
    }

    return {
      title: project.title,
      description: project.description
    };
  }

  if (isBlogRoute(segments) && segments.length === 2) {
    const post = getPostBySlug(segments[1]);
    if (!post) {
      return {};
    }

    return {
      title: post.title,
      description: post.description
    };
  }

  return {};
}

export async function renderRouteContent(segments: RouteSegments) {
  if (segments.length === 1 && segments[0] === "projects") {
    const projects = getAllProjects();

    return (
      <TerminalPage command="cd projects && ls" cwd="~">
        <div className="mb-6 space-y-2 text-sm leading-7 text-dim">
          <p>project directory</p>
          <p>Open an item from the tree or use the command bar to navigate deeper.</p>
        </div>
        <ProjectDirectory projects={projects} />
      </TerminalPage>
    );
  }

  if (segments.length === 1 && segments[0] === "blog") {
    const posts = getAllPosts();

    return (
      <TerminalPage command="cd blog && ls" cwd="~">
        <div className="mb-6 space-y-2 text-sm leading-7 text-dim">
          <p>blog archive</p>
          <p>Select a post to open it in the shell output area.</p>
        </div>
        <BlogDirectory posts={posts} />
      </TerminalPage>
    );
  }

  if (segments.length === 1 && segments[0] === "resume") {
    const resume = getResumeData();
    const skillToneMap = {
      accent: "text-accent",
      green: "text-green",
      pink: "text-pink",
      cyan: "text-cyan"
    } as const;

    return (
      <div className="space-y-8">
        <TerminalPage command="cat resume.md" cwd="~">
          <div className="mb-6 space-y-2 text-sm leading-7 text-dim">
            <p>Professional experience rendered as terminal output.</p>
          </div>
          <section className="rounded-3xl border border-border bg-black/25 p-6">
            <div className="grid gap-6 border-b border-border pb-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-dim">contact</p>
                <div className="mt-4 grid gap-3 text-sm text-text sm:grid-cols-2">
                  <p>{resume.contact.phone}</p>
                  <p>{resume.contact.email}</p>
                  <p>{resume.contact.github}</p>
                  <p>{resume.contact.linkedin}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-dim">focus</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {resume.contact.headline.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border px-3 py-1 text-sm text-accent"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 border-b border-border pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-dim">summary</p>
            </div>
            <p className="mt-5 max-w-3xl leading-7 text-text">{resume.summary}</p>
          </section>

          <section className="rounded-3xl border border-border bg-black/25 p-6">
            <p className="border-b border-border pb-4 text-xs uppercase tracking-[0.28em] text-dim">
              experience
            </p>
            <div className="mt-6 space-y-6">
              {resume.experience.map((role) => (
                <article key={`${role.company}-${role.role}`} className="border-l-2 border-accent pl-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl text-text">{role.role}</h2>
                      <p className="mt-1 text-dim">{role.company}</p>
                    </div>
                    <p className="text-sm text-dim">
                      {role.start} - {role.end}
                    </p>
                  </div>
                  <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-accent">
                    {role.bullets.map((bullet) => (
                      <li key={bullet} className="leading-7 text-text">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
            <div className="rounded-3xl border border-border bg-black/25 p-6">
              <p className="border-b border-border pb-4 text-xs uppercase tracking-[0.28em] text-dim">
                skills
              </p>
              <div className="mt-6 grid gap-5">
                {resume.skills.map((group) => (
                  <div key={group.category}>
                    <h2 className={`text-sm uppercase tracking-[0.28em] ${skillToneMap[group.color]}`}>
                      {group.category}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-border px-3 py-1 text-sm text-text"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-black/25 p-6">
              <p className="border-b border-border pb-4 text-xs uppercase tracking-[0.28em] text-dim">
                interests
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {resume.interests.map((interest) => (
                  <span key={interest} className="rounded-full border border-border px-3 py-1 text-sm text-cyan">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-black/25 p-6">
            <p className="border-b border-border pb-4 text-xs uppercase tracking-[0.28em] text-dim">
              education
            </p>
            <div className="mt-6 space-y-3">
              <h2 className="text-2xl text-text">
                {resume.education.degree} | {resume.education.school}
              </h2>
              <p className="text-dim">{resume.education.years}</p>
              {resume.education.concentration ? (
                <p className="text-text">Concentration: {resume.education.concentration}</p>
              ) : null}
              {resume.education.highlights?.length ? (
                <div className="flex flex-wrap gap-2">
                  {resume.education.highlights.map((item) => (
                    <span key={item} className="rounded-full border border-border px-3 py-1 text-sm text-green">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </TerminalPage>
      </div>
    );
  }

  if (segments.length === 1 && segments[0] === "contact") {
    return (
      <TerminalPage command="cat contact.md" cwd="~">
        <div className="mb-6 space-y-2 text-sm leading-7 text-dim">
          <p>Reach out if you need software shipped, untangled, or explained clearly.</p>
        </div>
        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-black/25 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-dim">consulting</p>
            <h2 className="mt-3 text-2xl text-text">Apollo Labs</h2>
            <p className="mt-4 max-w-2xl leading-7 text-dim">
              I work with teams that need engineering execution without excess ceremony: product
              delivery, AI workflow implementation, debugging, and system cleanup.
            </p>
            <a
              href={siteConfig.socialLinks.apolloLabs}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-2xl border border-accent px-4 py-3 text-sm text-accent transition hover:bg-accent hover:text-black"
            >
              open Apollo Labs
            </a>
          </div>

          <div className="rounded-3xl border border-border bg-black/25 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-dim">direct</p>
            <div className="mt-5 grid gap-3">
              <a
                href={siteConfig.socialLinks.email}
                className="rounded-2xl border border-border px-4 py-3 text-dim transition hover:border-accent hover:text-accent"
              >
                mailto: stephen@stephenjdunn.com
              </a>
              <a
                href={siteConfig.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-border px-4 py-3 text-dim transition hover:border-accent hover:text-accent"
              >
                github.com/stephendunn
              </a>
              <a
                href={siteConfig.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-border px-4 py-3 text-dim transition hover:border-accent hover:text-accent"
              >
                linkedin.com/in/stephenjdunn
              </a>
            </div>
          </div>
        </section>
      </TerminalPage>
    );
  }

  if (isProjectsRoute(segments) && segments.length === 2) {
    const project = getProjectBySlug(segments[1]);

    if (!project) {
      notFound();
    }

    const content = await renderMdx(project.content);
    return <ProjectDetail project={project} content={content} />;
  }

  if (isBlogRoute(segments) && segments.length === 2) {
    const post = getPostBySlug(segments[1]);
    const posts = getAllPosts();

    if (!post) {
      notFound();
    }

    const index = posts.findIndex((item) => item.slug === post.slug);
    const previousPost = posts[index + 1];
    const nextPost = posts[index - 1];
    const content = await renderMdx(post.content);

    return (
      <PostLayout
        post={post}
        previousPost={previousPost}
        nextPost={nextPost}
        content={content}
      />
    );
  }

  notFound();
}
