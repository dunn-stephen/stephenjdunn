import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogFrontmatter, ProjectFrontmatter, ResumeData } from "@/lib/content-schema";

const root = process.cwd();
const contentRoot = path.join(root, "content");

export type ProjectDetail = ProjectFrontmatter & { content: string; headings: string[] };
export type BlogDetail = BlogFrontmatter & { content: string; headings: string[] };

function readDirectory(directory: string) {
  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function extractHeadings(content: string) {
  return content
    .split("\n")
    .filter((line) => /^##\s+/.test(line))
    .map((line) => line.replace(/^##\s+/, "").trim());
}

function readFrontmatterFile<T>(folder: "projects" | "blog", slug: string) {
  const filePath = path.join(contentRoot, folder, `${slug}.mdx`);
  const source = fs.readFileSync(filePath, "utf8");
  return matter(source).data as T;
}

function readDetailMdxFile<T>(folder: "projects" | "blog", slug: string) {
  const filePath = path.join(contentRoot, folder, `${slug}.mdx`);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  return {
    frontmatter: data as T,
    content,
    headings: extractHeadings(content)
  };
}

export function getAllProjects(): ProjectFrontmatter[] {
  return readDirectory(path.join(contentRoot, "projects"))
    .map((slug) => readFrontmatterFile<ProjectFrontmatter>("projects", slug))
    .sort((a, b) => {
      if (a.featured !== b.featured) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function getProjectBySlug(slug: string): ProjectDetail | null {
  const filePath = path.join(contentRoot, "projects", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { frontmatter, content, headings } = readDetailMdxFile<ProjectFrontmatter>("projects", slug);
  return { ...frontmatter, content, headings };
}

export function getAllPosts(): BlogFrontmatter[] {
  return readDirectory(path.join(contentRoot, "blog"))
    .map((slug) => readFrontmatterFile<BlogFrontmatter>("blog", slug))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogDetail | null {
  const filePath = path.join(contentRoot, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { frontmatter, content, headings } = readDetailMdxFile<BlogFrontmatter>("blog", slug);
  return { ...frontmatter, content, headings };
}

export function getResumeData(): ResumeData {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, "resume.json"), "utf8")) as ResumeData;
}
