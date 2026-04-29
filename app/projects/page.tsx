import type { Metadata } from "next";
import { ProjectDirectory } from "@/components/projects/ProjectDirectory";
import { getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected software projects, demos, and implementation notes."
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return <ProjectDirectory projects={projects} />;
}
