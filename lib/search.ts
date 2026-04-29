import Fuse from "fuse.js";
import type { Project } from "@/types";

export type SearchItem = {
  id: string;
  label: string;
  section: string;
  glyph: string;
  keywords: string[];
  hint?: string;
  description?: string;
  href?: string;
  externalHref?: string;
  externalTarget?: "_blank" | "_self";
};

export interface SearchableItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  content: string;
}

export interface SearchResult {
  projectSlug: string;
  projectTitle: string;
  excerpt: string;
  score: number;
}

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripMdx(source: string) {
  return compactWhitespace(
    source
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/[#>*_[\]{}()|-]/g, " ")
  );
}

export function buildSearchIndex(projects: Project[]): SearchableItem[] {
  return projects.map((project) => ({
    id: `project:${project.slug}`,
    title: project.title,
    slug: project.slug,
    description: project.description,
    tags: project.tags,
    content: stripMdx(
      project.files
        .filter((file) => file.type === "mdx")
        .map((file) => `${file.name} ${file.content ?? ""}`)
        .join("\n\n")
    )
  }));
}

function buildExcerpt(item: SearchableItem, query: string) {
  if (!query) {
    return item.description;
  }

  const description = compactWhitespace(item.description);
  const content = compactWhitespace(item.content);
  const lowerQuery = query.toLowerCase();
  const descriptionIndex = description.toLowerCase().indexOf(lowerQuery);

  if (descriptionIndex >= 0) {
    return description;
  }

  const contentIndex = content.toLowerCase().indexOf(lowerQuery);

  if (contentIndex < 0) {
    return description;
  }

  const start = Math.max(0, contentIndex - 64);
  const end = Math.min(content.length, contentIndex + query.length + 96);
  const excerpt = content.slice(start, end).trim();

  return `${start > 0 ? "…" : ""}${excerpt}${end < content.length ? "…" : ""}`;
}

export function search(query: string, index: SearchableItem[]): SearchResult[] {
  const normalizedQuery = compactWhitespace(query.toLowerCase());

  if (normalizedQuery.length === 0) {
    return index.map((item, order) => ({
      projectSlug: item.slug,
      projectTitle: item.title,
      excerpt: item.description,
      score: order,
    }));
  }

  const fuse = new Fuse(index, {
    keys: [
      { name: "title", weight: 0.35 },
      { name: "description", weight: 0.25 },
      { name: "tags", weight: 0.2 },
      { name: "content", weight: 0.2 }
    ],
    includeScore: true,
    threshold: 0.38,
    ignoreLocation: true,
    minMatchCharLength: 2
  });

  return fuse.search(normalizedQuery).map((result) => ({
    projectSlug: result.item.slug,
    projectTitle: result.item.title,
    excerpt: buildExcerpt(result.item, normalizedQuery),
    score: result.score ?? 1,
  }));
}
