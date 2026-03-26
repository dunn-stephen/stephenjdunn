export const siteConfig = {
  name: "Stephen J. Dunn",
  domain: "stephenjdunn.com",
  description:
    "Terminal-styled personal website for Stephen J. Dunn: software engineer, builder, writer, and consultant.",
  launchDate: "2026-03-26T00:00:00.000Z",
  socialLinks: {
    github: "https://github.com/stephendunn",
    linkedin: "https://www.linkedin.com/in/stephenjdunn/",
    email: "mailto:stephen@stephenjdunn.com",
    apolloLabs: "https://apollolabsconsulting.com"
  }
} as const;

export const primaryRoutes = [
  { href: "/", label: "home", hotkey: "1" },
  { href: "/projects", label: "projects", hotkey: "2" },
  { href: "/resume", label: "resume", hotkey: "3" },
  { href: "/blog", label: "blog", hotkey: "4" }
] as const;
