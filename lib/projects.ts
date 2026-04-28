import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Project, ProjectFile } from "@/types";

const PROJECTS_DIRECTORY = path.join(process.cwd(), "content", "projects");

interface ProjectFrontmatter {
  title: string;
  description: string;
  year: number;
  tags: string[];
  github: string;
  live?: string;
  icon: string;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function toOptionalString(value: unknown) {
  return isString(value) ? value : undefined;
}

function parseFrontmatter(data: Record<string, unknown>, slug: string): ProjectFrontmatter {
  const { title, description, year, tags, github, live, icon } = data;

  if (
    !isString(title) ||
    !isString(description) ||
    typeof year !== "number" ||
    !isStringArray(tags) ||
    !isString(github) ||
    !isString(icon)
  ) {
    throw new Error(`Invalid frontmatter for project "${slug}"`);
  }

  return {
    title,
    description,
    year,
    tags,
    github,
    live: toOptionalString(live),
    icon
  };
}

function getImageMimeType(filename: string) {
  if (filename.endsWith(".png")) {
    return "image/png";
  }

  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (filename.endsWith(".gif")) {
    return "image/gif";
  }

  if (filename.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/svg+xml";
}

async function readProjectFilesFromDirectory(slug: string, directory: string, relativeDirectory = ""): Promise<ProjectFile[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: ProjectFile[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.posix.join("content", "projects", slug, relativeDirectory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await readProjectFilesFromDirectory(
        slug,
        absolutePath,
        path.posix.join(relativeDirectory, entry.name)
      ));
      continue;
    }

    if (entry.name.endsWith(".mdx")) {
      const source = await fs.readFile(absolutePath, "utf8");
      const parsed = matter(source);

      files.push({
        name: entry.name,
        type: "mdx",
        path: relativePath,
        content: parsed.content
      });

      continue;
    }

    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(entry.name)) {
      const buffer = await fs.readFile(absolutePath);

      files.push({
        name: entry.name,
        type: "image",
        path: relativePath,
        content: `data:${getImageMimeType(entry.name.toLowerCase())};base64,${buffer.toString("base64")}`
      });
    }
  }

  return files;
}

async function readProjectFiles(slug: string): Promise<ProjectFile[]> {
  const projectDirectory = path.join(PROJECTS_DIRECTORY, slug);
  const files = await readProjectFilesFromDirectory(slug, projectDirectory);

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function readProject(slug: string): Promise<Project> {
  const projectDirectory = path.join(PROJECTS_DIRECTORY, slug);
  const source = await fs.readFile(path.join(projectDirectory, "index.mdx"), "utf8");
  const parsed = matter(source);
  const frontmatter = parseFrontmatter(parsed.data as Record<string, unknown>, slug);
  const files = await readProjectFiles(slug);

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    year: frontmatter.year,
    tags: frontmatter.tags,
    github: frontmatter.github,
    live: frontmatter.live,
    icon: frontmatter.icon,
    files
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const entries = await fs.readdir(PROJECTS_DIRECTORY, { withFileTypes: true });
  const slugs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(slugs.map((slug) => readProject(slug)));
}

export async function getProject(slug: string): Promise<Project> {
  return readProject(slug);
}
