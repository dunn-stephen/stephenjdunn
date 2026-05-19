import { Desktop } from "@/components/desktop/Desktop";
import { getAllProjects } from "@/lib/projects";
import { getReadMeContent } from "@/lib/read-me";

export default async function HomePage() {
  const projects = await getAllProjects();
  const readMeContent = await getReadMeContent();

  return (
    <Desktop
      projects={projects}
      readMeContent={readMeContent}
    />
  );
}
