import { Desktop } from "@/components/desktop/Desktop";
import { getAllProjects } from "@/lib/projects";
import { buildSearchIndex } from "@/lib/search";

export default async function HomePage() {
  const projects = await getAllProjects();
  const searchIndex = buildSearchIndex(projects);

  return <Desktop projects={projects} searchIndex={searchIndex} />;
}
