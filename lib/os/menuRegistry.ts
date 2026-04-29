import type { MenuCommandDefinition } from "@/lib/os/types";

export const menuRegistry: MenuCommandDefinition[] = [
  {
    id: "about-stephen-os",
    label: "About Stephen OS",
    isEnabled: () => true,
    run: () => {}
  },
  {
    id: "toggle-sound",
    label: "Sound On/Off",
    isEnabled: () => true,
    run: () => {}
  },
  {
    id: "reset-window-geometry",
    label: "Reset Window Positions",
    isEnabled: () => true,
    run: () => {}
  },
  {
    id: "new-finder-window",
    label: "New Finder Window",
    shortcut: "Cmd+N",
    isEnabled: () => true,
    run: () => {}
  },
  {
    id: "open-selection",
    label: "Open",
    shortcut: "Cmd+O",
    isEnabled: (ctx) => ctx.selectionNodeIds.length > 0,
    run: () => {}
  },
  {
    id: "close-window",
    label: "Close Window",
    shortcut: "Cmd+W",
    isEnabled: (ctx) => ctx.activeWindowId !== null,
    run: () => {}
  },
  {
    id: "copy",
    label: "Copy",
    shortcut: "Cmd+C",
    isEnabled: () => false,
    run: () => {}
  },
  {
    id: "paste",
    label: "Paste",
    shortcut: "Cmd+V",
    isEnabled: () => false,
    run: () => {}
  },
  {
    id: "select-all",
    label: "Select All",
    shortcut: "Cmd+A",
    isEnabled: () => false,
    run: () => {}
  },
  {
    id: "view-as-icons",
    label: "as Icons",
    isEnabled: () => false,
    run: () => {}
  },
  {
    id: "view-as-list",
    label: "as List",
    isEnabled: () => false,
    run: () => {}
  },
  {
    id: "arrange-by-name",
    label: "Arrange by Name",
    isEnabled: () => false,
    run: () => {}
  },
  {
    id: "open-in-new-window",
    label: "Open in New Window",
    isEnabled: (ctx) => ctx.selectionNodeIds.length > 0,
    run: () => {}
  },
  {
    id: "show-help",
    label: "Stephen OS Help",
    isEnabled: () => true,
    run: () => {}
  },
  {
    id: "show-keyboard-shortcuts",
    label: "Keyboard Shortcuts",
    isEnabled: () => true,
    run: () => {}
  }
];
