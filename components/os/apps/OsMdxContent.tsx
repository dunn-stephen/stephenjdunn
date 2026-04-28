"use client";

import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { useEffect, useState } from "react";
import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";

const mdxComponents = {
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="inline-flex items-center gap-1 text-accent underline decoration-border underline-offset-4 transition hover:text-[#ff8a43]"
      target={props.href?.startsWith("http") ? "_blank" : props.target}
      rel={props.href?.startsWith("http") ? "noreferrer" : props.rel}
    >
      {props.children}
      {props.href?.startsWith("http") ? <ExternalLink className="h-3.5 w-3.5" /> : null}
    </a>
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre {...props} className="overflow-x-auto border border-border bg-surface p-4 text-[0.68rem] text-muted" />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code {...props} className="rounded bg-surface px-1.5 py-0.5 text-accent" />
  ),
  blockquote: (props: HTMLAttributes<HTMLElement>) => (
    <blockquote {...props} className="border-l-2 border-accent pl-4 text-muted" />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="mt-10 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent"
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-text" />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="space-y-3 pl-5 marker:text-accent" />
  ),
  table: (props: HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto">
      <table {...props} className="w-full border-collapse text-left text-[0.68rem]" />
    </div>
  ),
  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} className="border-b border-border px-3 py-2 text-subtle" />
  ),
  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="border-b border-border px-3 py-2 align-top text-muted" />
  )
};

type MdxModule = {
  default: (props: { components?: typeof mdxComponents }) => ReactNode;
};

type RenderState = {
  source: string | null;
  content: ReactNode;
  error: string | null;
};

export function OsMdxContent({ source }: { source: string }) {
  const [state, setState] = useState<RenderState>({
    source: null,
    content: null,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    async function renderSource() {
      try {
        const compiled = await compile(source, {
          outputFormat: "function-body",
          rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
          remarkPlugins: [remarkGfm]
        });

        const { default: Content } = (await run(String(compiled), {
          ...runtime,
          baseUrl: import.meta.url
        })) as MdxModule;

        if (!cancelled) {
          setState({
            source,
            content: <Content components={mdxComponents} />,
            error: null
          });
        }
      } catch (renderError: unknown) {
        if (!cancelled) {
          setState({
            source,
            content: null,
            error: renderError instanceof Error ? renderError.message : "Unable to render content."
          });
        }
      }
    }

    void renderSource();

    return () => {
      cancelled = true;
    };
  }, [source]);

  const isCurrent = state.source === source;

  if (isCurrent && state.error) {
    return <p className="text-[11px] text-[#8c2f2f]">{state.error}</p>;
  }

  if (!isCurrent || !state.content) {
    return <p className="text-[11px] text-subtle">Rendering content...</p>;
  }

  return <div className="prose-shell os9-panel rounded-[2px] px-4 py-4">{state.content}</div>;
}
