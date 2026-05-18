import type { BlogFrontmatter, ProjectFrontmatter, ResumeData } from "@/lib/content-schema";
import type { ProfileData } from "@/lib/site";

export const DESKTOP_RUNTIME = {
  systemName: "Stephen OS",
  themeId: "bondi",
  wallpaperId: "bondi-clouds",
  mobileBreakpointPx: 768,
  sessionStorageKey: "stephen-os/session:v1"
} as const;

export type DesktopPhase = "boot" | "welcome" | "desktop";

export type AppId =
  | "finder"
  | "about-stephen"
  | "projects-index"
  | "project-document"
  | "writing-index"
  | "post-document"
  | "resume"
  | "contact"
  | "extras"
  | "weather"
  | "help"
  | "file-corruption-dialog";

export type WindowKind = "document" | "utility" | "modeless-dialog";

export type WindowMode = "normal" | "collapsed" | "zoomed";

export type CanonicalRoute =
  | "/"
  | "/projects"
  | `/projects/${string}`
  | "/blog"
  | `/blog/${string}`
  | "/resume"
  | "/contact";

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GeometryTemplate {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface WindowInstance {
  id: string;
  appId: AppId;
  kind: WindowKind;
  title: string;
  canonicalRoute: CanonicalRoute | null;
  nodeId?: string;
  bounds: WindowBounds;
  restoreBounds?: WindowBounds;
  mode: WindowMode;
  isFocused: boolean;
  zIndex: number;
  payload?: Record<string, unknown>;
}

export interface WindowInit {
  appId: AppId;
  kind: WindowKind;
  title: string;
  canonicalRoute: CanonicalRoute | null;
  nodeId?: string;
  bounds: WindowBounds;
  payload?: Record<string, unknown>;
}

export type FinderNodeType = "volume" | "folder" | "document" | "app" | "trash";

export type FinderOpenBehavior = "finder" | "launch-app" | "open-document" | "external" | "show-dialog";

export interface FinderNodeMeta {
  subtitle?: string;
  tags?: string[];
  date?: string;
}

export interface FinderNode {
  id: string;
  name: string;
  type: FinderNodeType;
  parentId?: string;
  iconId: string;
  route?: CanonicalRoute;
  appId?: AppId;
  openBehavior: FinderOpenBehavior;
  externalHref?: string;
  children?: string[];
  meta?: FinderNodeMeta;
}

export interface DesktopPreferences {
  soundEnabled: boolean;
  openIntroWindows: boolean;
  welcomeDismissed: boolean;
  iconPositions: Record<string, { x: number; y: number }>;
  finderViewByNodeId: Record<string, "icons" | "list">;
}

export interface PersistedDesktopStateV1 {
  version: 1;
  preferences: DesktopPreferences;
  geometryByKey: Record<string, GeometryTemplate>;
}

export interface LaunchIntent {
  route: CanonicalRoute;
  appId: AppId | null;
  nodeId?: string;
  slug?: string;
  shouldPushHistory: boolean;
}

export type MenuCommandId =
  | "about-stephen-os"
  | "toggle-sound"
  | "reset-window-geometry"
  | "new-finder-window"
  | "open-selection"
  | "close-window"
  | "copy"
  | "paste"
  | "select-all"
  | "view-as-icons"
  | "view-as-list"
  | "arrange-by-name"
  | "open-in-new-window"
  | "show-help"
  | "show-keyboard-shortcuts";

export interface MenuCommandContext {
  activeAppId: AppId | null;
  activeWindowId: string | null;
  selectionNodeIds: string[];
}

export interface MenuCommandDefinition {
  id: MenuCommandId;
  label: string;
  shortcut?: string;
  isEnabled: (ctx: MenuCommandContext) => boolean;
  run: (ctx: MenuCommandContext) => void;
}

export type FinderTreeRecord = Record<string, FinderNode>;

export const desktopIconNodeIds = [
  "volume-stephen-hd",
  "folder-projects",
  "folder-writing",
  "doc-resume",
  "doc-contact",
  "folder-applications",
  "trash"
] as const;

export type ProfilePayload = Pick<ProfileData, "name" | "description" | "sidebar" | "hero" | "socialLinks" | "home" | "contact">;

export type ProjectsPayload = {
  projects: ProjectFrontmatter[];
};

export type ProjectDocumentPayload = Omit<ProjectFrontmatter, "displayMode" | "screenshot"> & {
  displayMode: ProjectFrontmatter["displayMode"];
  screenshot?: string;
  headings: string[];
  source: string;
};

export type BlogPayload = {
  posts: BlogFrontmatter[];
};

export type PostDocumentPayload = BlogFrontmatter & {
  headings: string[];
  source: string;
};

export type ResumePayload = ResumeData;

export const defaultDesktopPreferences: DesktopPreferences = {
  soundEnabled: true,
  openIntroWindows: true,
  welcomeDismissed: false,
  iconPositions: {},
  finderViewByNodeId: {}
};
