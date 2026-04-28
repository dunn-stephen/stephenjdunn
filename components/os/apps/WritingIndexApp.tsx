"use client";

import { Tag } from "@/components/shared/Tui";
import { osApi } from "@/lib/os/api";
import { useOsResource } from "@/components/os/apps/useOsResource";

export function WritingIndexApp({ onOpenPost }: { onOpenPost: (slug: string) => void }) {
  const { data, loading, error } = useOsResource("posts", () => osApi.posts());

  if (loading) {
    return <p className="text-[11px] text-subtle">Loading writing...</p>;
  }

  if (error || !data) {
    return <p className="text-[11px] text-[#8c2f2f]">{error ?? "Posts unavailable."}</p>;
  }

  if (data.posts.length === 0) {
    return <p className="text-[11px] text-subtle">No posts published yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.posts.map((post) => (
        <button
          key={post.slug}
          type="button"
          onDoubleClick={() => onOpenPost(post.slug)}
          onClick={() => onOpenPost(post.slug)}
          className="w-full border border-border bg-[#f4f4f4] px-4 py-3 text-left transition hover:bg-[#e9f2fe]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent-ink">
              {post.title}
            </span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-subtle">{post.date}</span>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-muted">{post.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Tag key={tag} accent={index === 0}>
                {tag}
              </Tag>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
