import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.join(root, "content");

export type ProjectFrontmatter = {
  title: string;
  slug: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
  displayMode: "iframe" | "screenshot" | "readme";
  screenshot?: string;
  featured?: boolean;
  date: string;
};

export type BlogFrontmatter = {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  description: string;
  readTime?: number;
};

export type ResumeData = {
  summary: string;
  skills: Array<{ category: string; color: "accent" | "green" | "pink" | "cyan"; items: string[] }>;
  interests: string[];
  experience: Array<{
    company: string;
    role: string;
    start: string;
    end: string;
    bullets: string[];
  }>;
};

export type ProjectSummary = ProjectFrontmatter;
export type BlogSummary = BlogFrontmatter & { headings: string[] };
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

function readMdxFile<T>(folder: "projects" | "blog", slug: string) {
  const filePath = path.join(contentRoot, folder, `${slug}.mdx`);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  return {
    frontmatter: data as T,
    content,
    headings: extractHeadings(content)
  };
}

export function getAllProjects(): ProjectSummary[] {
  return readDirectory(path.join(contentRoot, "projects"))
    .map((slug) => readMdxFile<ProjectFrontmatter>("projects", slug).frontmatter)
    .sort((a, b) => {
      if (a.featured !== b.featured) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function getFeaturedProjects(limit = 3) {
  return getAllProjects()
    .filter((project) => project.featured)
    .slice(0, limit);
}

export function getProjectBySlug(slug: string): ProjectDetail | null {
  const filePath = path.join(contentRoot, "projects", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { frontmatter, content, headings } = readMdxFile<ProjectFrontmatter>("projects", slug);
  return { ...frontmatter, content, headings };
}

export function getAllPosts(): BlogSummary[] {
  return readDirectory(path.join(contentRoot, "blog"))
    .map((slug) => {
      const { frontmatter, headings } = readMdxFile<BlogFrontmatter>("blog", slug);
      return { ...frontmatter, headings };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecentPosts(limit = 3) {
  return getAllPosts().slice(0, limit);
}

export function getPostBySlug(slug: string): BlogDetail | null {
  const filePath = path.join(contentRoot, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { frontmatter, content, headings } = readMdxFile<BlogFrontmatter>("blog", slug);
  return { ...frontmatter, content, headings };
}

export function getNowContent() {
  return fs.readFileSync(path.join(contentRoot, "now.md"), "utf8").trim();
}

export function getResumeData(): ResumeData {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, "resume.json"), "utf8")) as ResumeData;
}
