import { Desktop } from "@/components/desktop/Desktop";
import { getAllProjects } from "@/lib/projects";
import { getReadMeContent } from "@/lib/read-me";
import { buildSearchIndex } from "@/lib/search";

export default async function HomePage() {
  const projects = await getAllProjects();
  const readMeContent = await getReadMeContent();
  const searchIndex = buildSearchIndex(projects);

  return (
    <Desktop
      projects={projects}
      readMeContent={readMeContent}
      searchIndex={searchIndex}
    />
  );
}
