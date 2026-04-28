import type { AppDefinition, AppId, AppProps } from "@/types";

function PlaceholderApp(_: AppProps) {
  return null;
}

export const appRegistry: Record<AppId, AppDefinition> = {
  finder: {
    id: "finder",
    name: "Finder",
    icon: "/icons/png/4.png",
    defaultSize: { width: 640, height: 440 },
    minSize: { width: 420, height: 300 },
    singleton: false,
    resizable: true,
    component: PlaceholderApp
  },
  textedit: {
    id: "textedit",
    name: "TextEdit",
    icon: "/icons/png/5.png",
    defaultSize: { width: 520, height: 420 },
    minSize: { width: 320, height: 220 },
    singleton: false,
    resizable: true,
    component: PlaceholderApp
  },
  simpletext: {
    id: "simpletext",
    name: "SimpleText",
    icon: "/icons/png/8.png",
    defaultSize: { width: 500, height: 520 },
    minSize: { width: 320, height: 260 },
    singleton: true,
    resizable: true,
    component: PlaceholderApp
  },
  mail: {
    id: "mail",
    name: "Mail",
    icon: "/icons/png/9.png",
    defaultSize: { width: 480, height: 380 },
    minSize: { width: 380, height: 300 },
    singleton: true,
    resizable: true,
    component: PlaceholderApp
  },
  "space-invaders": {
    id: "space-invaders",
    name: "Space Invaders",
    icon: "/icons/png/10.png",
    defaultSize: { width: 480, height: 540 },
    minSize: { width: 420, height: 480 },
    singleton: true,
    resizable: true,
    component: PlaceholderApp
  },
  sherlock: {
    id: "sherlock",
    name: "Sherlock",
    icon: "/icons/png/11.png",
    defaultSize: { width: 420, height: 380 },
    minSize: { width: 340, height: 280 },
    singleton: true,
    resizable: true,
    component: PlaceholderApp
  },
  notepad: {
    id: "notepad",
    name: "Note Pad",
    icon: "/icons/png/12.png",
    defaultSize: { width: 300, height: 260 },
    minSize: { width: 220, height: 160 },
    singleton: false,
    resizable: true,
    component: PlaceholderApp
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    icon: "/icons/png/13.png",
    defaultSize: { width: 240, height: 320 },
    minSize: { width: 240, height: 320 },
    singleton: true,
    resizable: false,
    component: PlaceholderApp
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
  }
};

export function getAppDefinition(appId: AppId) {
  return appRegistry[appId];
}
