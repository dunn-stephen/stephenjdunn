import { BlogDirectory } from "@/components/blog/BlogDirectory";
import { TerminalPage } from "@/components/terminal/TerminalPage";
import { getAllPosts } from "@/lib/content";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <TerminalPage command="cd blog && ls" cwd="~">
      <div className="mb-6 space-y-2 text-sm leading-7 text-dim">
        <p>blog archive</p>
        <p>Select a post to open it in the shell output area.</p>
      </div>
      <BlogDirectory posts={posts} />
    </TerminalPage>
  );
}
