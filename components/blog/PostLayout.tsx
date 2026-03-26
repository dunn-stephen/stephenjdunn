import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import type { BlogDetail, BlogSummary } from "@/lib/content";

type PostLayoutProps = {
  post: BlogDetail;
  content: ReactNode;
  previousPost?: BlogSummary;
  nextPost?: BlogSummary;
};

export function PostLayout({ post, content, previousPost, nextPost }: PostLayoutProps) {
  return (
    <article className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_240px]">
      <div className="space-y-8">
        <header className="rounded-3xl border border-border bg-black/25 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-dim">
            {post.date} · {post.readTime ?? 5} min read
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
              <Link
                className="mt-3 block text-lg text-text hover:text-accent"
                href={`/blog/${previousPost.slug}` as Route}
              >
                {previousPost.title}
              </Link>
            ) : (
              <p className="mt-3 text-dim">start of archive</p>
            )}
          </div>
          <div className="rounded-3xl border border-border bg-black/25 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-dim">next</p>
            {nextPost ? (
              <Link
                className="mt-3 block text-lg text-text hover:text-accent"
                href={`/blog/${nextPost.slug}` as Route}
              >
                {nextPost.title}
              </Link>
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
            const anchor = heading.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
            return (
              <a key={heading} href={`#${anchor}`} className="block text-dim transition hover:text-pink">
                {heading}
              </a>
            );
          })}
        </div>
      </aside>
    </article>
  );
}
