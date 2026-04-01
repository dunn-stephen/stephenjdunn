import type { Route } from "next";
import { getAllPosts, getAllProjects, getPostBySlug, getProjectBySlug } from "@/lib/content";
import { buildMailtoLink, primaryRoutes, profileData, siteConfig } from "@/lib/site";

export type SearchItem = {
  id: string;
  label: string;
  section: string;
  glyph: string;
  keywords: string[];
  hint?: string;
  description?: string;
  href?: Route;
  externalHref?: string;
};

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripMdx(source: string) {
  return compactWhitespace(
    source
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/[#>*_[\]{}()|-]/g, " ")
  );
}

export function buildSiteSearchItems(): SearchItem[] {
  const projects = getAllProjects();
  const posts = getAllPosts();

  const items: SearchItem[] = [
    ...primaryRoutes.map((route) => ({
      id: `route:${route.key}`,
      label: `Go to ${route.label.toLowerCase().replace(/^./, (value) => value.toUpperCase())}`,
      section: "Navigate",
      glyph: route.paletteGlyph,
      hint: route.number,
      description: `${route.label} page`,
      keywords: [route.key, route.label.toLowerCase(), route.href],
      href: route.href
    })),
    {
      id: "contact:overview",
      label: "Contact and Availability",
      section: "Contact",
      glyph: "✉",
      hint: "reach out",
      description: profileData.contact.availability[0]?.label ?? "Open to consulting",
      href: "/contact" as Route,
      keywords: [
        profileData.contact.quickMessageSubject,
        siteConfig.socialLinks.email,
        siteConfig.socialLinks.github,
        siteConfig.socialLinks.linkedin,
        siteConfig.socialLinks.apolloLabs,
        ...profileData.contact.availability.map((item) => item.label)
      ]
    },
    {
      id: "action:github",
      label: "Open GitHub",
      section: "Actions",
      glyph: "↗",
      hint: "external",
      description: "github.com/dunn-stephen",
      externalHref: siteConfig.socialLinks.github,
      keywords: ["github", "profile", "code", "repositories"]
    },
    {
      id: "action:linkedin",
      label: "Open LinkedIn",
      section: "Actions",
      glyph: "↗",
      hint: "external",
      description: "linkedin.com/in/stephendunn24",
      externalHref: siteConfig.socialLinks.linkedin,
      keywords: ["linkedin", "social", "profile", "resume"]
    },
    {
      id: "action:email",
      label: "Send Email",
      section: "Actions",
      glyph: "✉",
      hint: "external",
      description: "stephendunn2424@gmail.com",
      externalHref: buildMailtoLink(profileData.contact.quickMessageSubject),
      keywords: ["email", "contact", "mailto", "stephendunn2424@gmail.com"]
    },
    {
      id: "action:apollo-labs",
      label: "Open Apollo Labs",
      section: "Actions",
      glyph: "↗",
      hint: "external",
      description: "apollolabsconsulting.com",
      externalHref: siteConfig.socialLinks.apolloLabs,
      keywords: ["apollo", "apollo labs", "consulting", "agency"]
    }
  ];

  if (profileData.resume.pdfPath) {
    items.push({
      id: "action:resume-download",
      label: "Download Resume",
      section: "Actions",
      glyph: "⬇",
      hint: "external",
      description: "PDF resume download",
      externalHref: profileData.resume.pdfPath,
      keywords: ["resume", "download", "pdf", "cv"]
    });
  }

  items.push(
    ...projects.map((project) => {
      const detail = getProjectBySlug(project.slug);
      const keywordSources = [
        project.title,
        project.slug,
        project.description,
        project.primaryTech ?? "",
        project.status ?? "",
        project.displayMode,
        project.date,
        ...project.tech,
        ...(project.highlights ?? [])
      ];

      if (detail) {
        keywordSources.push(detail.content, ...detail.headings);
      }

      return {
        id: `project:${project.slug}`,
        label: project.title,
        section: "Projects",
        glyph: "◆",
        hint: project.slug,
        description: project.description,
        href: `/projects/${project.slug}` as Route,
        keywords: keywordSources.map(stripMdx)
      };
    }),
    ...posts.map((post) => {
      const detail = getPostBySlug(post.slug);
      const keywordSources = [post.title, post.slug, post.description, post.date, ...post.tags];

      if (detail) {
        keywordSources.push(detail.content, ...detail.headings);
      }

      return {
        id: `post:${post.slug}`,
        label: post.title,
        section: "Blog",
        glyph: "▦",
        hint: post.slug,
        description: post.description,
        href: `/blog/${post.slug}` as Route,
        keywords: keywordSources.map(stripMdx)
      };
    })
  );

  return items;
}
