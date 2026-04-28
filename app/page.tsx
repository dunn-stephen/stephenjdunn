import { Desktop } from "@/components/desktop/Desktop";
import { getAllProjects } from "@/lib/projects";

export default async function HomePage() {
  const projects = await getAllProjects();

  return <Desktop projects={projects} />;
}
