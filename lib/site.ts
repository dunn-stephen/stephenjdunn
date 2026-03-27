import type { Route } from "next";

export const shellUser = "stephenjdunn";
export const shellHost = "portfolio";
export const shellIdentity = `${shellUser}@${shellHost}`;

export const siteConfig = {
  name: "Stephen J. Dunn",
  domain: "stephenjdunn.com",
  description:
    "Terminal-styled personal website for Stephen J. Dunn: software engineer, builder, writer, and consultant.",
  socialLinks: {
    github: "https://github.com/stephendunn",
    linkedin: "https://www.linkedin.com/in/stephenjdunn/",
    email: "mailto:stephen@stephenjdunn.com",
    apolloLabs: "https://apollolabsconsulting.com"
  }
} as const;

export const primaryRoutes = [
  {
    href: "/" as Route,
    label: "home",
    hotkey: "1",
    command: "cat README.md",
    keywords: ["home", "readme", "/"]
  },
  {
    href: "/projects" as Route,
    label: "projects",
    hotkey: "2",
    command: "cd projects",
    keywords: ["projects", "/projects"]
  },
  {
    href: "/resume" as Route,
    label: "resume",
    hotkey: "3",
    command: "cat resume.md",
    keywords: ["resume", "cv", "/resume"]
  },
  {
    href: "/blog" as Route,
    label: "blog",
    hotkey: "4",
    command: "cd blog",
    keywords: ["blog", "posts", "/blog"]
  },
  {
    href: "/contact" as Route,
    label: "contact",
    hotkey: "5",
    command: "cat contact.md",
    keywords: ["apollo", "contact", "email", "/contact"]
  }
] as const;
