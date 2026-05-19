import { createElement } from "react";
import dynamic from "next/dynamic";
import type { AppDefinition, AppId, AppProps } from "@/types";

const Finder = dynamic<AppProps>(() => import("@/components/apps/finder/Finder").then((module) => module.Finder));
const ProjectBrowser = dynamic<AppProps>(() => import("@/components/apps/project-browser/ProjectBrowser").then((module) => module.ProjectBrowser));
const TextEdit = dynamic<AppProps>(() => import("@/components/apps/textedit/TextEdit").then((module) => module.TextEdit));
const SimpleText = dynamic<AppProps>(() => import("@/components/apps/simpletext/SimpleText").then((module) => module.SimpleText));
const Mail = dynamic<AppProps>(() => import("@/components/apps/mail/Mail").then((module) => module.Mail));
const SpaceInvaders = dynamic<AppProps>(() => import("@/components/apps/space-invaders/SpaceInvaders").then((module) => module.SpaceInvaders));
const NotePad = dynamic<AppProps>(() => import("@/components/apps/notepad/NotePad").then((module) => module.NotePad));
const Calculator = dynamic<AppProps>(() => import("@/components/apps/calculator/Calculator").then((module) => module.Calculator));
const CorruptedFileDialog = dynamic<AppProps>(() => import("@/components/apps/corrupted-file-dialog/CorruptedFileDialog").then((module) => module.CorruptedFileDialog));

function PlaceholderApp({ props }: AppProps) {
  return createElement(
    "div",
    { className: "flex h-full flex-col gap-3 bg-[#f5f5f5] p-4 text-[12px] text-[#2b2b2b]" },
    createElement(
      "p",
      { className: "font-['Chicago'] text-[13px]" },
      "App content coming in Phase 4."
    ),
    props
      ? createElement(
          "pre",
          { className: "os9-surface-inset overflow-auto p-2 text-[11px] leading-4 text-[#4a4a4a]" },
          JSON.stringify(props, null, 2)
        )
      : createElement(
          "p",
          { className: "text-[#5a5a5a]" },
          "This is a window-shell placeholder."
        )
  );
}

export const appRegistry: Record<AppId, AppDefinition> = {
  finder: {
    id: "finder",
    name: "Finder",
    icon: "/icons/png/4.png",
    defaultSize: { width: 640, height: 440 },
    minSize: { width: 480, height: 320 },
    singleton: true,
    resizable: true,
    component: Finder
  },
  "project-browser": {
    id: "project-browser",
    name: "Projects",
    icon: "/icons/png/37.png",
    defaultSize: { width: 640, height: 440 },
    minSize: { width: 420, height: 300 },
    singleton: false,
    resizable: true,
    component: ProjectBrowser
  },
  textedit: {
    id: "textedit",
    name: "TextEdit",
    icon: "/icons/png/5.png",
    defaultSize: { width: 520, height: 420 },
    minSize: { width: 320, height: 220 },
    singleton: false,
    resizable: true,
    component: TextEdit
  },
  simpletext: {
    id: "simpletext",
    name: "SimpleText",
    icon: "/icons/png/8.png",
    defaultSize: { width: 500, height: 520 },
    minSize: { width: 320, height: 260 },
    singleton: true,
    resizable: true,
    component: SimpleText
  },
  mail: {
    id: "mail",
    name: "Mail",
    icon: "/icons/png/9.png",
    defaultSize: { width: 480, height: 380 },
    minSize: { width: 380, height: 300 },
    singleton: true,
    resizable: true,
    component: Mail
  },
  "space-invaders": {
    id: "space-invaders",
    name: "Space Invaders",
    icon: "/icons/png/10.png",
    defaultSize: { width: 480, height: 540 },
    minSize: { width: 420, height: 480 },
    singleton: true,
    resizable: true,
    component: SpaceInvaders
  },
  notepad: {
    id: "notepad",
    name: "Note Pad",
    icon: "/icons/png/12.png",
    defaultSize: { width: 300, height: 260 },
    minSize: { width: 220, height: 160 },
    singleton: false,
    resizable: true,
    component: NotePad
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    icon: "/icons/png/13.png",
    defaultSize: { width: 280, height: 320 },
    minSize: { width: 280, height: 320 },
    singleton: true,
    resizable: false,
    component: Calculator
  },
  about: {
    id: "about",
    name: "About This Computer",
    icon: "/icons/png/14.png",
    defaultSize: { width: 360, height: 280 },
    minSize: { width: 360, height: 280 },
    singleton: true,
    resizable: false,
    component: PlaceholderApp
  },
  "corrupted-file-dialog": {
    id: "corrupted-file-dialog",
    name: "Cannot Open File",
    icon: "/icons/png/14.png",
    defaultSize: { width: 380, height: 180 },
    minSize: { width: 380, height: 180 },
    singleton: false,
    resizable: false,
    component: CorruptedFileDialog
  }
};

export function getAppDefinition(appId: AppId) {
  return appRegistry[appId];
}
