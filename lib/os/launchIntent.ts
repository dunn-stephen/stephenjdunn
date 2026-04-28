import type { LaunchIntent } from "@/lib/os/types";

export function getLaunchIntent(pathname: string): LaunchIntent | null {
  if (pathname === "/") {
    return {
      route: "/",
      appId: "about-stephen",
      nodeId: "doc-about",
      shouldPushHistory: false
    };
  }

  if (pathname === "/projects") {
    return {
      route: "/projects",
      appId: "projects-index",
      shouldPushHistory: false
    };
  }

  if (pathname.startsWith("/projects/")) {
    const slug = pathname.replace("/projects/", "").trim();

    if (!slug) {
      return null;
    }

    return {
      route: pathname as `/projects/${string}`,
      appId: "project-document",
      slug,
      nodeId: `project-${slug}`,
      shouldPushHistory: false
    };
  }

  if (pathname === "/blog") {
    return {
      route: "/blog",
      appId: "writing-index",
      shouldPushHistory: false
    };
  }

  if (pathname.startsWith("/blog/")) {
    const slug = pathname.replace("/blog/", "").trim();

    if (!slug) {
      return null;
    }

    return {
      route: pathname as `/blog/${string}`,
      appId: "post-document",
      slug,
      nodeId: `post-${slug}`,
      shouldPushHistory: false
    };
  }

  if (pathname === "/resume") {
    return {
      route: "/resume",
      appId: "resume",
      shouldPushHistory: false
    };
  }

  if (pathname === "/contact") {
    return {
      route: "/contact",
      appId: "contact",
      shouldPushHistory: false
    };
  }

  return null;
}
