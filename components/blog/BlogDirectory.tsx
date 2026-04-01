import Link from "next/link";
import type { BlogFrontmatter } from "@/lib/content";
import { SectionLabel, Tag } from "@/components/shared/Tui";
import { DEFAULT_READ_TIME_MINUTES } from "@/lib/contentConstants";

export function BlogDirectory({ posts }: { posts: BlogFrontmatter[] }) {
  return (
    <div className="space-y-4">
      <SectionLabel>{`${posts.length} Posts · Latest First`}</SectionLabel>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block border border-border bg-panel px-4 py-4 transition hover:border-[#6a320d] hover:bg-[#17130f] sm:px-5"
          >
            <div className="flex flex-col gap-4 md:grid md:grid-cols-[116px_minmax(0,1fr)_100px] md:items-start">
              <div className="space-y-2">
                <p className="text-[0.58rem] uppercase tracking-[0.14em] text-subtle">{post.date}</p>
                <Tag>{`${post.readTime ?? DEFAULT_READ_TIME_MINUTES} min read`}</Tag>
              </div>

              <div className="min-w-0">
                <h2 className="text-[0.78rem] tracking-[0.1em] text-text transition group-hover:text-accent">
                  {post.title}
                </h2>
                <p className="mt-3 text-[0.68rem] leading-6 text-muted">{post.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border pt-3 md:block md:border-t-0 md:pt-0 md:text-right">
                <p className="text-[0.58rem] uppercase tracking-[0.14em] text-faint">
                  {post.slug.replace(/-/g, " / ")}
                </p>
                <p className="mt-0 text-[0.68rem] text-faint transition group-hover:text-accent md:mt-8">
                  read card ►
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-border pt-4 text-[0.62rem] uppercase tracking-[0.14em] text-subtle">
        <span className="text-muted">[Open any card]</span> to read the post
      </div>
    </div>
  );
}
