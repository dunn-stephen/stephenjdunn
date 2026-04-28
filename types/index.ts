import type { ComponentType } from "react";

export type AppId =
  | "finder"
  | "textedit"
  | "simpletext"
  | "mail"
  | "space-invaders"
  | "sherlock"
  | "notepad"
  | "calculator"
  | "about";

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface AppProps {
  windowId: string;
  props?: Record<string, unknown>;
}

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: string;
  defaultSize: WindowSize;
  minSize: WindowSize;
  singleton: boolean;
  resizable: boolean;
  component: ComponentType<AppProps>;
}

export interface WindowRestoreBounds {
  position: WindowPosition;
  size: WindowSize;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isShaded: boolean;
  position: WindowPosition;
  size: WindowSize;
  preShadeHeight: number;
  zIndex: number;
  restoreBounds?: WindowRestoreBounds;
  props?: Record<string, unknown>;
}

export interface WindowStore {
  windows: WindowState[];
  focusedWindowId: string | null;
  openWindow: (appId: AppId, props?: Record<string, unknown>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  shadeWindow: (id: string) => void;
  moveWindow: (id: string, position: WindowPosition) => void;
  resizeWindow: (id: string, size: WindowSize) => void;
}

export type SoundId = "boot" | "click" | "open" | "close" | "error" | "alert";

export interface SoundStore {
  enabled: boolean;
  initialized: boolean;
  setEnabled: (enabled: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initializeFromInteraction: () => Promise<void>;
  toggle: () => void;
  play: (sound: SoundId) => void;
}

export interface ProjectFile {
  name: string;
  type: "mdx" | "image";
  path: string;
  content?: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  year: number;
  tags: string[];
  github: string;
  live?: string;
  icon: string;
  files: ProjectFile[];
}
