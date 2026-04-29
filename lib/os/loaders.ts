import "server-only";
import { getAllPosts, getAllProjects, getPostBySlug, getProjectBySlug, getResumeData } from "@/lib/content";
import { profileData } from "@/lib/site";
import type { BlogPayload, PostDocumentPayload, ProfilePayload, ProjectDocumentPayload, ProjectsPayload, ResumePayload } from "@/lib/os/types";

export async function loadProfile(): Promise<ProfilePayload> {
  return {
    name: profileData.name,
    description: profileData.description,
    sidebar: profileData.sidebar,
    hero: profileData.hero,
    socialLinks: profileData.socialLinks,
    home: profileData.home,
    contact: profileData.contact
  };
}

export async function loadResume(): Promise<ResumePayload> {
  return getResumeData();
}

export async function loadProjects(): Promise<ProjectsPayload> {
  return {
    projects: getAllProjects()
  };
}

export async function loadProjectDocument(slug: string): Promise<ProjectDocumentPayload | null> {
  const project = getProjectBySlug(slug);

  if (!project) {
    return null;
  }

  return {
    title: project.title,
    slug: project.slug,
    description: project.description,
    tech: project.tech,
    primaryTech: project.primaryTech,
    status: project.status,
    highlights: project.highlights,
    relatedPost: project.relatedPost,
    github: project.github,
    demo: project.demo,
    displayMode: project.displayMode,
    screenshot: project.screenshot,
    featured: project.featured,
    date: project.date,
    headings: project.headings,
    source: project.content
  };
}

export async function loadPosts(): Promise<BlogPayload> {
  return {
    posts: getAllPosts()
  };
}

export async function loadPostDocument(slug: string): Promise<PostDocumentPayload | null> {
  const post = getPostBySlug(slug);

  if (!post) {
    return null;
  }

  return {
    title: post.title,
    slug: post.slug,
    date: post.date,
    tags: post.tags,
    description: post.description,
    readTime: post.readTime,
    headings: post.headings,
    source: post.content
  };
}
