import Link from "next/link";
import { Panel, SectionLabel, Tag } from "@/components/shared/Tui";
import type { BlogFrontmatter, ProjectFrontmatter, ResumeData } from "@/lib/content-schema";
import { profileData } from "@/lib/site";

type HomeSeoViewProps = {
  projects: ProjectFrontmatter[];
  posts: BlogFrontmatter[];
  resume: ResumeData;
};

export function HomeSeoView({ projects, posts, resume }: HomeSeoViewProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-10 sm:px-6">
      <Panel accent>
        <SectionLabel>Stephen OS Fallback</SectionLabel>
        <h1 className="text-[1rem] uppercase tracking-[0.18em] text-accent-ink">{profileData.name}</h1>
        <p className="mt-3 text-[0.76rem] leading-7 text-muted">{profileData.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profileData.home.specialties.map((specialty, index) => (
            <Tag key={specialty} accent={index === 0}>
              {specialty}
            </Tag>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <SectionLabel>Projects</SectionLabel>
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <Link key={project.slug} href={`/projects/${project.slug}`} className="block border border-border bg-[#f7f7f7] px-4 py-3">
                <p className="text-[0.76rem] uppercase tracking-[0.12em] text-accent-ink">{project.title}</p>
                <p className="mt-2 text-[0.7rem] leading-6 text-muted">{project.description}</p>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionLabel>Writing</SectionLabel>
          <div className="space-y-3">
            {posts.slice(0, 3).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block border border-border bg-[#f7f7f7] px-4 py-3">
                <p className="text-[0.76rem] uppercase tracking-[0.12em] text-accent-ink">{post.title}</p>
                <p className="mt-2 text-[0.7rem] leading-6 text-muted">{post.description}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionLabel>Resume Summary</SectionLabel>
        <p className="text-[0.74rem] leading-7 text-muted">{resume.summary}</p>
      </Panel>
    </div>
  );
}
