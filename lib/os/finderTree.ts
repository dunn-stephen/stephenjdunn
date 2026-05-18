import { getAllPosts, getAllProjects } from "@/lib/content";
import type { FinderNode, FinderTreeRecord } from "@/lib/os/types";

const trashFileNames = [
  "definitely_not_passwords.txt",
  "bank_account_number_and_debit_card_pin.txt",
  "embarrassing_haircut_2007.jpg",
  "resume_with_exaggerated_skills.doc",
  "definitely_not_pirated_movie.avi",
  "why_i_deserve_a_raise.ppt",
  "budget_if_i_won_the_lottery.xls",
  "top_secret_alien_contact_logs.txt",
  "proof_neighbor_is_a_vampire.txt",
  "things_i_know_that_they_dont_want_me_to_know.doc",
  "moon_landing_but_the_other_moon_landing.avi",
  "CONFIRMED_how_to_end_world_hunger.txt"
] as const;

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
      openBehavior: "finder",
      children: trashFileNames.map((_, index) => `trash-item-${index + 1}`)
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

  const trashNodes: FinderNode[] = trashFileNames.map((name, index) => ({
    id: `trash-item-${index + 1}`,
    name,
    type: "document",
    parentId: "trash",
    iconId: "trash-document",
    openBehavior: "show-dialog",
    meta: {
      subtitle: "The data in this file has been corrupted and cannot be opened."
    }
  }));

  return toRecord([...baseNodes, ...projectNodes, ...postNodes, ...trashNodes]);
}
