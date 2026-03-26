import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";

type ProjectPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.description
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const content = await renderMdx(project.content);

  return <ProjectDetail project={project} content={content} />;
}
