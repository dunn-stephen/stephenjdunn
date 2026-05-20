import dynamic from "next/dynamic";
import type { AppDefinition, AppId, AppProps } from "@/types";

const About = dynamic<AppProps>(() => import("@/components/apps/about/About").then((module) => module.About));
const Finder = dynamic<AppProps>(() => import("@/components/apps/finder/Finder").then((module) => module.Finder));
const ProjectBrowser = dynamic<AppProps>(() => import("@/components/apps/project-browser/ProjectBrowser").then((module) => module.ProjectBrowser));
const TextEdit = dynamic<AppProps>(() => import("@/components/apps/textedit/TextEdit").then((module) => module.TextEdit));
const SimpleText = dynamic<AppProps>(() => import("@/components/apps/simpletext/SimpleText").then((module) => module.SimpleText));
const Mail = dynamic<AppProps>(() => import("@/components/apps/mail/Mail").then((module) => module.Mail));
const SpaceInvaders = dynamic<AppProps>(() => import("@/components/apps/space-invaders/SpaceInvaders").then((module) => module.SpaceInvaders));
const NotePad = dynamic<AppProps>(() => import("@/components/apps/notepad/NotePad").then((module) => module.NotePad));
const Calculator = dynamic<AppProps>(() => import("@/components/apps/calculator/Calculator").then((module) => module.Calculator));
const CorruptedFileDialog = dynamic<AppProps>(() => import("@/components/apps/corrupted-file-dialog/CorruptedFileDialog").then((module) => module.CorruptedFileDialog));

export const appRegistry: Record<AppId, AppDefinition> = {
  finder: {
    id: "finder",
    name: "Finder",
    icon: "/icons/finder-os9.png",
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
    icon: "/icons/mail-os9.png",
    defaultSize: { width: 480, height: 380 },
    minSize: { width: 380, height: 300 },
    singleton: true,
    resizable: true,
    component: Mail
  },
  "space-invaders": {
    id: "space-invaders",
    name: "Space Invaders",
    icon: "/icons/space-invaders.svg",
    defaultSize: { width: 480, height: 540 },
    minSize: { width: 420, height: 480 },
    singleton: true,
    resizable: true,
    component: SpaceInvaders
  },
  notepad: {
    id: "notepad",
    name: "Note Pad",
    icon: "/icons/notepad-app-os9.png",
    defaultSize: { width: 300, height: 260 },
    minSize: { width: 220, height: 160 },
    singleton: false,
    resizable: true,
    component: NotePad
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    icon: "/icons/calculator-os9.png",
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
    defaultSize: { width: 540, height: 470 },
    minSize: { width: 420, height: 320 },
    singleton: true,
    resizable: true,
    component: About
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
