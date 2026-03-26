import { ProjectDirectory } from "@/components/projects/ProjectDirectory";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getAllProjects } from "@/lib/content";

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="projects/"
        title="Shipped work across apps, tools, interfaces, and experiments."
        description="Projects can render as demos, screenshots, or long-form writeups depending on what best explains the work."
      />
      <ProjectDirectory projects={projects} />
    </div>
  );
}
