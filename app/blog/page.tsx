import type { Metadata } from "next";
import { BlogDirectory } from "@/components/blog/BlogDirectory";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Technical writing, engineering notes, and product thoughts."
};

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogDirectory posts={posts} />;
}
