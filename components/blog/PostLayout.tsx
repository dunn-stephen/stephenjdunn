import type { ReactNode } from "react";
import type { BlogDetail, BlogFrontmatter } from "@/lib/content";
import { DEFAULT_READ_TIME_MINUTES } from "@/lib/contentConstants";
import Link from "next/link";
import { BackLink, Panel, SectionLabel, Tag } from "@/components/shared/Tui";
import { siteConfig } from "@/lib/site";

type PostLayoutProps = {
  post: BlogDetail;
  content: ReactNode;
  previousPost?: BlogFrontmatter;
  nextPost?: BlogFrontmatter;
};

export function PostLayout({ post, content, previousPost, nextPost }: PostLayoutProps) {
  return (
    <article className="space-y-5">
      <BackLink href="/blog">Back to Blog</BackLink>

      <Panel className="space-y-3" accent>
        <p className="text-[0.58rem] uppercase tracking-[0.18em] text-subtle">
          {post.date} · {post.readTime ?? DEFAULT_READ_TIME_MINUTES} min read · {siteConfig.name}
        </p>
        <h1 className="text-[0.98rem] uppercase tracking-[0.22em] text-text">{post.title}</h1>
        <p className="max-w-3xl text-[0.72rem] leading-7 text-muted">{post.description}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <Tag key={tag} accent={index === 0}>
              {tag}
            </Tag>
          ))}
        </div>
      </Panel>

      <Panel>
        <section className="prose-shell">{content}</section>
      </Panel>

      <nav className="grid gap-3 md:grid-cols-2">
        <Panel>
          <SectionLabel>Previous</SectionLabel>
          {previousPost ? (
            <Link
              href={`/blog/${previousPost.slug}`}
              className="text-[0.78rem] tracking-[0.1em] text-muted transition hover:text-accent"
            >
              {previousPost.title}
            </Link>
          ) : (
            <p className="text-[0.68rem] uppercase tracking-[0.12em] text-subtle">Start of archive</p>
          )}
        </Panel>
        <Panel>
          <SectionLabel>Next</SectionLabel>
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="text-[0.78rem] tracking-[0.1em] text-muted transition hover:text-accent"
            >
              {nextPost.title}
            </Link>
          ) : (
            <p className="text-[0.68rem] uppercase tracking-[0.12em] text-subtle">End of archive</p>
          )}
        </Panel>
      </nav>
    </article>
  );
}
