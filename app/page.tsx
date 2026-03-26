import type { Route } from "next";
import Link from "next/link";
import { AsciiBanner } from "@/components/home/AsciiBanner";
import { TypedIntro } from "@/components/home/TypedIntro";
import { GitHubHeatmap } from "@/components/home/GitHubHeatmap";
import { UptimeClock } from "@/components/home/UptimeClock";
import { NowSection } from "@/components/home/NowSection";
import { SocialLinks } from "@/components/home/SocialLinks";
import { ApolloLabsCta } from "@/components/home/ApolloLabsCta";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getFeaturedProjects, getNowContent, getRecentPosts } from "@/lib/content";

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();
  const recentPosts = getRecentPosts(2);
  const nowContent = getNowContent();

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="README.md"
        title="A terminal-flavored portfolio that still reads clearly to normal humans."
        description="This site presents work, writing, and consulting through a TUI shell without hiding the actual content behind novelty."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AsciiBanner />
        <TypedIntro />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GitHubHeatmap />
        <div className="grid gap-6">
          <UptimeClock />
          <SocialLinks />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <NowSection content={nowContent} />
        <ApolloLabsCta />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-border bg-black/25 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-dim">featured.projects</p>
          <div className="mt-5 space-y-4">
            {featuredProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}` as Route}
                className="block rounded-2xl border border-border px-4 py-4 transition hover:border-accent"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg text-text">{project.title}</h2>
                  <span className="text-xs text-dim">{project.displayMode}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-dim">{project.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-black/25 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-dim">recent.posts</p>
          <div className="mt-5 space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}` as Route}
                className="block rounded-2xl border border-border px-4 py-4 transition hover:border-pink"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg text-text">{post.title}</h2>
                  <span className="text-xs text-dim">{post.readTime ?? 5} min</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-dim">{post.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
