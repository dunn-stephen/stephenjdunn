import type { Route } from "next";
import { primaryRoutes } from "@/lib/site";

export type TerminalNavigateDetail = {
  href: Route;
  command: string;
};

const pageCommands = primaryRoutes.reduce<Record<string, Route>>((commands, route) => {
  commands[route.label] = route.href;
  return commands;
}, {});

const topLevelRouteCommands = primaryRoutes.reduce<Record<string, string>>((commands, route) => {
  commands[route.href] = route.command;
  return commands;
}, {});

export function resolveNamedRoute(key: string): Route | null {
  if (key === "readme") {
    return "/";
  }

  return pageCommands[key] ?? null;
}

export function getDismissRoute(pathname: string): Route {
  if (pathname.startsWith("/projects/")) {
    return "/projects";
  }

  if (pathname.startsWith("/blog/")) {
    return "/blog";
  }

  return "/" as Route;
}

export function getCommandForRoute(href: string): string {
  const topLevelCommand = topLevelRouteCommands[href];
  if (topLevelCommand) {
    return topLevelCommand;
  }

  if (href.startsWith("/projects/")) {
    const slug = href.split("/")[2];
    return slug ? `cd projects && cd ${slug}` : "cd projects";
  }

  if (href.startsWith("/blog/")) {
    const slug = href.split("/")[2];
    return slug ? `cd blog && cd ${slug}` : "cd blog";
  }

  return `open ${href}`;
}
