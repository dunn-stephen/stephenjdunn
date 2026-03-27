import GithubSlugger from "github-slugger";
import type { Route } from "next";
import type { ReactNode } from "react";
import type { BlogDetail, BlogFrontmatter } from "@/lib/content";
import { DEFAULT_READ_TIME_MINUTES } from "@/lib/contentConstants";
import { TerminalPage } from "@/components/terminal/TerminalPage";
import { TerminalNavLink } from "@/components/terminal/TerminalNavLink";

type PostLayoutProps = {
  post: BlogDetail;
  content: ReactNode;
  previousPost?: BlogFrontmatter;
  nextPost?: BlogFrontmatter;
};

export function PostLayout({ post, content, previousPost, nextPost }: PostLayoutProps) {
  const slugger = new GithubSlugger();

  return (
    <TerminalPage command={`cd blog && cat ${post.slug}.mdx`} cwd="~">
      <article className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-black/25 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-dim">
              {post.date} · {post.readTime ?? DEFAULT_READ_TIME_MINUTES} min read
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text">{post.title}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-dim">{post.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-pink">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <section className="prose-shell rounded-3xl border border-border bg-black/25 p-6">
            {content}
          </section>

          <nav className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-dim">previous</p>
              {previousPost ? (
                <TerminalNavLink
                  className="mt-3 block text-lg text-text hover:text-accent"
                  href={`/blog/${previousPost.slug}` as Route}
                >
                  {previousPost.title}
                </TerminalNavLink>
              ) : (
                <p className="mt-3 text-dim">start of archive</p>
              )}
            </div>
            <div className="rounded-3xl border border-border bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-dim">next</p>
              {nextPost ? (
                <TerminalNavLink
                  className="mt-3 block text-lg text-text hover:text-accent"
                  href={`/blog/${nextPost.slug}` as Route}
                >
                  {nextPost.title}
                </TerminalNavLink>
              ) : (
                <p className="mt-3 text-dim">end of archive</p>
              )}
            </div>
          </nav>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-black/25 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-dim">contents</p>
          <div className="mt-4 space-y-3 text-sm">
            {post.headings.map((heading) => {
              const anchor = slugger.slug(heading);
              return (
                <a key={heading} href={`#${anchor}`} className="block text-dim transition hover:text-pink">
                  {heading}
                </a>
              );
            })}
          </div>
        </aside>
      </article>
    </TerminalPage>
  );
}
