"use client";

import { compile, run } from "@mdx-js/mdx";
import type {
  AnchorHTMLAttributes,
  ComponentType,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode
} from "react";
import { useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";

interface MdxDocumentProps {
  compact?: boolean;
  source: string;
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
}

type MdxModule = {
  default: ComponentType<{ components?: typeof mdxComponents }>;
};

function stripFrontmatter(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

const mdxComponents = {
  a: ({ children, href, ...props }: LinkProps) => (
    <a
      {...props}
      href={href}
      className="text-[#1d57a7] underline underline-offset-2"
      rel={href?.startsWith("http") ? "noreferrer" : props.rel}
      target={href?.startsWith("http") ? "_blank" : props.target}
    >
      {children}
    </a>
  ),
  blockquote: (props: HTMLAttributes<HTMLElement>) => (
    <blockquote
      {...props}
      className="my-4 border-l-2 border-[#9b9b9b] pl-4 text-[#454545]"
    />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="rounded-sm bg-[#ececec] px-1 py-[1px] font-mono text-[11px] text-[#222222]"
    />
  ),
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      className="mb-3 font-['Charcoal'] text-[18px] font-bold text-[#111111]"
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="mb-3 mt-6 font-['Charcoal'] text-[15px] font-bold text-[#111111]"
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="mb-2 mt-5 font-['Charcoal'] text-[13px] font-bold text-[#111111]"
    />
  ),
  hr: (props: HTMLAttributes<HTMLHRElement>) => (
    <hr
      {...props}
      className="my-5 border-0 border-t border-[#c7c7c7]"
    />
  ),
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      alt={props.alt ?? ""}
      className="my-4 max-w-full border border-[#9b9b9b] bg-[#f5f5f5] p-1 shadow-[inset_1px_1px_0_#ffffff]"
    />
  ),
  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <li
      {...props}
      className="ml-5 list-disc pl-1"
    />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol
      {...props}
      className="my-3 space-y-1"
    />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      {...props}
      className="mb-3 text-[12px] leading-[1.5] text-[#1d1d1d]"
    />
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="my-4 overflow-x-auto border border-[#9b9b9b] bg-[#f2f2f2] p-3 font-mono text-[11px] leading-5 text-[#111111]"
    />
  ),
  strong: (props: HTMLAttributes<HTMLElement>) => (
    <strong
      {...props}
      className="font-['Charcoal'] font-bold text-[#111111]"
    />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul
      {...props}
      className="my-3 space-y-1"
    />
  )
};

export function MdxDocument({ compact = false, source }: MdxDocumentProps) {
  const [content, setContent] = useState<ReactNode>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDocument() {
      const normalizedSource = stripFrontmatter(source).trim();

      if (normalizedSource.length === 0) {
        if (!cancelled) {
          setContent(null);
          setError(null);
        }

        return;
      }

      try {
        const compiled = await compile(normalizedSource, {
          outputFormat: "function-body"
        });
        const renderedModule = (await run(String(compiled), runtime)) as MdxModule;
        const Content = renderedModule.default;

        if (!cancelled) {
          setContent(<Content components={mdxComponents} />);
          setError(null);
        }
      } catch (renderError) {
        console.error("Failed to render MDX document.", renderError);

        if (!cancelled) {
          setContent(null);
          setError("This document could not be rendered.");
        }
      }
    }

    void renderDocument();

    return () => {
      cancelled = true;
    };
  }, [source]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-center text-[12px] text-[#5c5c5c]">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <article
      className={`font-['Chicago'] text-[12px] text-[#111111] ${
        compact ? "space-y-2" : "space-y-3"
      }`}
    >
      {content}
    </article>
  );
}
