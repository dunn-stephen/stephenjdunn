import type { MetadataRoute } from "next";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${siteConfig.domain}`;
  const staticRoutes = ["", "/projects", "/resume", "/blog", "/contact"];
  const projectRoutes = getAllProjects().map((project) => `/projects/${project.slug}`);
  const blogRoutes = getAllPosts().map((post) => `/blog/${post.slug}`);

  return [...staticRoutes, ...projectRoutes, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));
}
