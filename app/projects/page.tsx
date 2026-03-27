import { ProjectDirectory } from "@/components/projects/ProjectDirectory";
import { TerminalPage } from "@/components/terminal/TerminalPage";
import { getAllProjects } from "@/lib/content";

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <TerminalPage command="cd projects && ls" cwd="~">
      <div className="mb-6 space-y-2 text-sm leading-7 text-dim">
        <p>project directory</p>
        <p>Open an item from the tree or use the command bar to navigate deeper.</p>
      </div>
      <ProjectDirectory projects={projects} />
    </TerminalPage>
  );
}
