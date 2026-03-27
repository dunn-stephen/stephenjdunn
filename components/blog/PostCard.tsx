import type { Route } from "next";
import type { BlogFrontmatter } from "@/lib/content";
import { DEFAULT_READ_TIME_MINUTES } from "@/lib/contentConstants";
import { TerminalNavLink } from "@/components/terminal/TerminalNavLink";

export function PostCard({ post }: { post: BlogFrontmatter }) {
  return (
    <TerminalNavLink
      href={`/blog/${post.slug}` as Route}
      className="rounded-3xl border border-border bg-black/25 p-5 transition hover:border-pink hover:shadow-[0_0_32px_rgba(255,111,216,0.08)]"
    >
      <p className="text-xs uppercase tracking-[0.28em] text-dim">
        {post.date} · {post.readTime ?? DEFAULT_READ_TIME_MINUTES} min read
      </p>
      <h2 className="mt-3 text-2xl text-text">{post.title}</h2>
      <p className="mt-4 leading-7 text-dim">{post.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-pink">
            {tag}
          </span>
        ))}
      </div>
    </TerminalNavLink>
  );
}
