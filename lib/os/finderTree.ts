import { getAllPosts, getAllProjects } from "@/lib/content";
import type { FinderNode, FinderTreeRecord } from "@/lib/os/types";

function toRecord(nodes: FinderNode[]) {
  return Object.fromEntries(nodes.map((node) => [node.id, node])) as FinderTreeRecord;
}

export function buildFinderTree(): FinderTreeRecord {
  const projects = getAllProjects();
  const posts = getAllPosts();

  const baseNodes: FinderNode[] = [
    {
      id: "volume-stephen-hd",
      name: "Stephen HD",
      type: "volume",
      iconId: "drive",
      openBehavior: "finder",
      children: ["folder-applications", "folder-projects", "folder-writing", "doc-resume", "doc-contact", "doc-about", "trash"]
    },
    {
      id: "folder-applications",
      name: "Applications",
      type: "folder",
      parentId: "volume-stephen-hd",
      iconId: "folder-apps",
      openBehavior: "finder",
      children: ["app-finder", "app-extras", "app-weather", "app-help"]
    },
    {
      id: "folder-projects",
      name: "Projects",
      type: "folder",
      parentId: "volume-stephen-hd",
      iconId: "folder-projects",
      openBehavior: "launch-app",
      appId: "projects-index",
      route: "/projects",
      children: projects.map((project) => `project-${project.slug}`)
    },
    {
      id: "folder-writing",
      name: "Writing",
      type: "folder",
      parentId: "volume-stephen-hd",
      iconId: "folder-writing",
      openBehavior: "launch-app",
      appId: "writing-index",
      route: "/blog",
      children: posts.map((post) => `post-${post.slug}`)
    },
    {
      id: "doc-resume",
      name: "Resume",
      type: "document",
      parentId: "volume-stephen-hd",
      iconId: "resume-doc",
      openBehavior: "launch-app",
      appId: "resume",
      route: "/resume"
    },
    {
      id: "doc-contact",
      name: "Contact",
      type: "document",
      parentId: "volume-stephen-hd",
      iconId: "contact-doc",
      openBehavior: "launch-app",
      appId: "contact",
      route: "/contact"
    },
    {
      id: "doc-about",
      name: "About Stephen",
      type: "document",
      parentId: "volume-stephen-hd",
      iconId: "about-doc",
      openBehavior: "launch-app",
      appId: "about-stephen"
    },
    {
      id: "app-finder",
      name: "Finder",
      type: "app",
      parentId: "folder-applications",
      iconId: "finder-app",
      openBehavior: "launch-app",
      appId: "finder"
    },
    {
      id: "app-extras",
      name: "Extras",
      type: "app",
      parentId: "folder-applications",
      iconId: "extras-app",
      openBehavior: "launch-app",
      appId: "extras"
    },
    {
      id: "app-weather",
      name: "Weather",
      type: "app",
      parentId: "folder-applications",
      iconId: "weather-app",
      openBehavior: "launch-app",
      appId: "weather"
    },
    {
      id: "app-help",
      name: "Help",
      type: "app",
      parentId: "folder-applications",
      iconId: "help-app",
      openBehavior: "launch-app",
      appId: "help"
    },
    {
      id: "trash",
      name: "Trash",
      type: "trash",
      parentId: "volume-stephen-hd",
      iconId: "trash",
      openBehavior: "finder"
    }
  ];

  const projectNodes: FinderNode[] = projects.map((project) => ({
    id: `project-${project.slug}`,
    name: project.title,
    type: "document",
    parentId: "folder-projects",
    iconId: "project-doc",
    openBehavior: "open-document",
    appId: "project-document",
    route: `/projects/${project.slug}`,
    meta: {
      subtitle: project.description,
      tags: project.tech.slice(0, 3),
      date: project.date
    }
  }));

  const postNodes: FinderNode[] = posts.map((post) => ({
    id: `post-${post.slug}`,
    name: post.title,
    type: "document",
    parentId: "folder-writing",
    iconId: "post-doc",
    openBehavior: "open-document",
    appId: "post-document",
    route: `/blog/${post.slug}`,
    meta: {
      subtitle: post.description,
      tags: post.tags,
      date: post.date
    }
  }));

  return toRecord([...baseNodes, ...projectNodes, ...postNodes]);
}
