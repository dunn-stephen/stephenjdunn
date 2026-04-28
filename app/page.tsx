import { HomeSeoView } from "@/components/home/HomeSeoView";
import { getAllPosts, getAllProjects, getResumeData } from "@/lib/content";

export default function HomePage() {
  return <HomeSeoView projects={getAllProjects()} posts={getAllPosts()} resume={getResumeData()} />;
}
