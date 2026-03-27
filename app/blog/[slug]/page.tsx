import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostLayout } from "@/components/blog/PostLayout";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const posts = getAllPosts();

  if (!post) {
    notFound();
  }

  const index = posts.findIndex((item) => item.slug === post.slug);
  const previousPost = posts[index + 1];
  const nextPost = posts[index - 1];
  const content = await renderMdx(post.content);

  return (
    <PostLayout
      post={post}
      previousPost={previousPost}
      nextPost={nextPost}
      content={content}
    />
  );
}
