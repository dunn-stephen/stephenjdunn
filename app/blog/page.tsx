import { BlogDirectory } from "@/components/blog/BlogDirectory";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getAllPosts } from "@/lib/content";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="blog/"
        title="Technical writing, build logs, and side-interest notes in the same archive."
        description="Posts are MDX-backed and designed to handle code, diagrams, and long-form explanations without giving up the terminal aesthetic."
      />
      <BlogDirectory posts={posts} />
    </div>
  );
}
