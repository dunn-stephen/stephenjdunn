import type { MetadataRoute } from "next";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { primaryRoutes, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${siteConfig.domain}`;
  // The terminal is the primary UI, but the underlying URLs stay public so deep links are shareable.
  const staticRoutes = primaryRoutes.map((route) => route.href);
  const projectRoutes = getAllProjects().map((project) => `/projects/${project.slug}`);
  const blogRoutes = getAllPosts().map((post) => `/blog/${post.slug}`);

  return [...staticRoutes, ...projectRoutes, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));
}
