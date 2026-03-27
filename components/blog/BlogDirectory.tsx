"use client";

import { useMemo, useState } from "react";
import type { BlogFrontmatter } from "@/lib/content";
import { PostCard } from "@/components/blog/PostCard";

export function BlogDirectory({ posts }: { posts: BlogFrontmatter[] }) {
  const [activeTag, setActiveTag] = useState<string>("all");
  const tags = useMemo(
    () => ["all", ...Array.from(new Set(posts.flatMap((post) => post.tags))).sort()],
    [posts]
  );

  const filtered = useMemo(() => {
    if (activeTag === "all") {
      return posts;
    }
    return posts.filter((post) => post.tags.includes(activeTag));
  }, [activeTag, posts]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              activeTag === tag
                ? "border-pink bg-pink text-black"
                : "border-border text-dim hover:border-pink hover:text-pink"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-5">
        {filtered.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
