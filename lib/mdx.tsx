import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";

const prettyCodeOptions = {
  theme: "github-dark-dimmed",
  keepBackground: false
};

const mdxComponents = {
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="inline-flex items-center gap-1 text-pink underline decoration-border underline-offset-4 hover:text-accent"
      target={props.href?.startsWith("http") ? "_blank" : props.target}
      rel={props.href?.startsWith("http") ? "noreferrer" : props.rel}
    >
      {props.children}
      {props.href?.startsWith("http") ? <ExternalLink className="h-3.5 w-3.5" /> : null}
    </a>
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-2xl border border-border bg-black/40 p-4 text-sm text-text"
    />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code {...props} className="rounded bg-black/30 px-1.5 py-0.5 text-cyan" />
  ),
  blockquote: (props: HTMLAttributes<HTMLElement>) => (
    <blockquote
      {...props}
      className="border-l-2 border-accent pl-4 text-dim"
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} className="mt-10 text-xl font-semibold text-accent" />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className="mt-8 text-lg font-semibold text-green" />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="space-y-3 pl-5 marker:text-accent" />
  ),
  table: (props: HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto">
      <table {...props} className="w-full border-collapse text-left text-sm" />
    </div>
  ),
  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} className="border-b border-border px-3 py-2 text-dim" />
  ),
  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="border-b border-border/60 px-3 py-2 align-top" />
  )
};

export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [rehypePrettyCode, prettyCodeOptions]
        ]
      }
    }
  });

  return content;
}
