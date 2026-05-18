import type { AppId, CanonicalRoute, FinderTreeRecord, WindowBounds, WindowInit } from "@/lib/os/types";

const defaultBoundsByApp: Record<AppId, WindowBounds> = {
  finder: { x: 72, y: 96, width: 680, height: 460 },
  "about-stephen": { x: 148, y: 120, width: 560, height: 420 },
  "projects-index": { x: 116, y: 104, width: 760, height: 520 },
  "project-document": { x: 136, y: 116, width: 820, height: 560 },
  "writing-index": { x: 124, y: 112, width: 760, height: 520 },
  "post-document": { x: 144, y: 120, width: 820, height: 560 },
  resume: { x: 148, y: 96, width: 860, height: 560 },
  contact: { x: 188, y: 128, width: 540, height: 420 },
  extras: { x: 212, y: 132, width: 460, height: 320 },
  weather: { x: 96, y: 88, width: 880, height: 600 },
  help: { x: 232, y: 148, width: 460, height: 340 },
  "file-corruption-dialog": { x: 264, y: 176, width: 420, height: 220 }
};

export function getDefaultBounds(appId: AppId) {
  return defaultBoundsByApp[appId];
}

export function createFinderWindow(nodeId: string, tree: FinderTreeRecord): WindowInit {
  const node = tree[nodeId];

  return {
    appId: "finder",
    kind: "document",
    title: node?.name ?? "Finder",
    canonicalRoute: null,
    nodeId,
    bounds: getDefaultBounds("finder")
  };
}

export function createNonCanonicalWindow(appId: AppId): WindowInit {
  switch (appId) {
    case "about-stephen":
      return {
        appId,
        kind: "document",
        title: "About Stephen",
        canonicalRoute: null,
        bounds: getDefaultBounds(appId)
      };
    case "extras":
      return {
        appId,
        kind: "document",
        title: "Extras",
        canonicalRoute: null,
        bounds: getDefaultBounds(appId)
      };
    case "weather":
      return {
        appId,
        kind: "document",
        title: "Weather",
        canonicalRoute: null,
        bounds: getDefaultBounds(appId)
      };
    case "help":
      return {
        appId,
        kind: "modeless-dialog",
        title: "Help",
        canonicalRoute: null,
        bounds: getDefaultBounds(appId)
      };
    case "file-corruption-dialog":
      return {
        appId,
        kind: "modeless-dialog",
        title: "Cannot Open File",
        canonicalRoute: null,
        bounds: getDefaultBounds(appId)
      };
    default:
      return {
        appId,
        kind: appId === "contact" ? "utility" : "document",
        title: appId,
        canonicalRoute: null,
        bounds: getDefaultBounds(appId)
      };
  }
}

export function createCorruptedFileDialogWindow(fileName: string): WindowInit {
  return {
    ...createNonCanonicalWindow("file-corruption-dialog"),
    payload: {
      fileName
    }
  };
}

export function createCanonicalWindow(appId: AppId, route: CanonicalRoute, options?: { slug?: string; title?: string }): WindowInit {
  switch (appId) {
    case "about-stephen":
      return {
        appId,
        kind: "document",
        title: "About Stephen",
        canonicalRoute: route,
        nodeId: "doc-about",
        bounds: getDefaultBounds(appId)
      };
    case "projects-index":
      return {
        appId,
        kind: "document",
        title: "Projects",
        canonicalRoute: route,
        nodeId: "projects-index",
        bounds: getDefaultBounds(appId)
      };
    case "project-document":
      return {
        appId,
        kind: "document",
        title: options?.title ?? options?.slug ?? "Project",
        canonicalRoute: route,
        nodeId: options?.slug ? `project-${options.slug}` : undefined,
        bounds: getDefaultBounds(appId)
      };
    case "writing-index":
      return {
        appId,
        kind: "document",
        title: "Writing",
        canonicalRoute: route,
        nodeId: "writing-index",
        bounds: getDefaultBounds(appId)
      };
    case "post-document":
      return {
        appId,
        kind: "document",
        title: options?.title ?? options?.slug ?? "Post",
        canonicalRoute: route,
        nodeId: options?.slug ? `post-${options.slug}` : undefined,
        bounds: getDefaultBounds(appId)
      };
    case "resume":
      return {
        appId,
        kind: "document",
        title: "Resume",
        canonicalRoute: route,
        nodeId: "resume",
        bounds: getDefaultBounds(appId)
      };
    case "contact":
      return {
        appId,
        kind: "utility",
        title: "Contact",
        canonicalRoute: route,
        nodeId: "contact",
        bounds: getDefaultBounds(appId)
      };
    default:
      return {
        appId,
        kind: "document",
        title: options?.title ?? String(appId),
        canonicalRoute: route,
        bounds: getDefaultBounds(appId)
      };
  }
}
