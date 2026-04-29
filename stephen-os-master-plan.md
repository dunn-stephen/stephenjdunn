# Stephen OS Master Plan and Technical Spec

## Summary

Stephen OS is a Bondi-blue, Mac OS 9-style portfolio shell built on the existing Next.js App Router site. It boots like a machine, optionally shows a one-time welcome/setup panel, then reveals a desktop with icons, Finder navigation, draggable windows, app-owned menus, and curated content windows backed by the current repo content files.

The target is not a full browser OS. The target is a tightly scoped portfolio runtime that feels like Mac OS 9 while preserving canonical routes, server metadata, and editable repo content.

This document is written for Codex to implement directly. Where a decision could have been ambiguous, this spec chooses one.

## Product Direction

- Desktop-first Mac OS 9 experience
- Bondi-blue base theme
- Startup boot screen, then brief welcome/setup, then desktop
- Light faux filesystem
- Desktop icons as direct launchers
- Finder tree navigation for deeper browsing
- Draggable and resizable windows
- Active-app menu ownership
- Startup sounds and theatrical transitions
- Mobile-optimized shell instead of a shrunk desktop
- Custom or redrawn ship assets

## Non-Goals for v1

- Full browser-OS behavior
- User-created files or folders
- General-purpose drag-and-drop file management
- Desk accessories
- Full Control Panels implementation
- Full restart or shutdown sequence
- Persisting the exact set of open windows across reloads
- Implementing every classic Mac OS menu command

## Foundation Decision

Do not use `ryOS` as the direct foundation.

Use it only as a reference for:

- App registry patterns
- Window manager patterns
- Persisted state patterns
- Theme abstraction patterns
- Multi-window app patterns

Stephen OS will be a custom runtime optimized for this site and its content model.

## Current Repo Contract

This project already runs on Next.js App Router. Stephen OS must preserve that foundation.

Confirmed current foundation:

- `app/` is the active router
- `app/layout.tsx` is the global server layout
- `AppShell` currently wraps non-standalone routes
- Content is file-backed through:
  - `content/profile.json`
  - `content/resume.json`
  - `content/projects/*.mdx`
  - `content/blog/*.mdx`
- `content/home.json` is placeholder-heavy and should not survive as an active source of truth
- Existing standalone easter egg routes already exist under `app/easter-eggs/...`

Implementation rules:

- Keep App Router pages and metadata generation server-driven
- Mount the OS shell as a client runtime inside the existing App Router layout tree
- Do not replace the routing system with a custom router

## Desktop Shell Mounting Contract

`DesktopShellBridge` mounts on all canonical routes except standalone easter egg routes.

Rules:

- `/` uses the OS shell as the primary visible experience
- `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/resume`, and `/contact` continue to server-render their canonical page content and metadata through App Router
- On non-root canonical routes, the OS shell overlays that server-rendered content client-side after hydration
- The underlying canonical route content remains the source of truth for metadata, crawlers, and no-JavaScript fallbacks
- Standalone easter egg routes keep bypassing the OS shell entirely

Implementation note:

- Codex should preserve the existing route files for canonical content and treat the shell as an enhancement layer, not a replacement router

## Existing Site Conversion Strategy

Keep the existing site as the content and route layer, then replace the current terminal-style chrome/runtime.

Primary content sources:

- `content/profile.json`
- `content/resume.json`
- `content/projects/*.mdx`
- `content/blog/*.mdx`

`content/home.json` disposition:

- Remove it from the active runtime path
- Do not create a new homepage dashboard using that file
- Replace its former concerns with:
  - desktop and shell content from static OS config
  - About Stephen content from `content/profile.json`
  - Projects and Writing summaries from the existing MDX collections
  - Resume and Contact data from `content/resume.json` and `content/profile.json`

Keep canonical URLs:

- `/`
- `/projects`
- `/projects/[slug]`
- `/blog`
- `/blog/[slug]`
- `/resume`
- `/contact`

These routes must remain shareable, indexable, and metadata-capable even when the desktop shell is active.

## Content Delivery Contract

The desktop runtime is client-side. It must not read from the filesystem directly.

Rules:

- Keep `lib/content.ts` and `lib/mdx.tsx` as the server-side source of truth
- Add a shared server-only loader layer in `lib/os/loaders.ts`
- Add route handlers for desktop data access under `app/api/os/...`
- JSON-backed apps may return raw JSON
- MDX-backed detail windows must return structured metadata plus trusted rendered HTML

Required route handlers:

- `app/api/os/profile/route.ts`
- `app/api/os/resume/route.ts`
- `app/api/os/projects/route.ts`
- `app/api/os/projects/[slug]/route.ts`
- `app/api/os/blog/route.ts`
- `app/api/os/blog/[slug]/route.ts`

Payload rules:

- Project and blog index handlers return lightweight lists only
- Project and blog detail handlers return frontmatter, headings, and server-rendered HTML
- Detail HTML is produced on the server from the existing MDX pipeline
- Desktop document windows render that trusted HTML payload directly

Shared loader rules:

- App Router page routes and `app/api/os/...` handlers must call the same shared loaders
- Route handlers are thin transport wrappers, not a second content implementation
- `lib/os/loaders.ts` owns DTO shaping for desktop windows so page routes and API routes cannot drift

Implementation notes:

- Do not add `@next/mdx`, `next-mdx-remote`, or Contentlayer
- Reuse the existing `@mdx-js/mdx` pipeline already in the repo

Caching and revalidation rules:

- File-backed content is deployment-time static in v1
- No runtime CMS or live content revalidation is in scope
- Content changes publish through the normal rebuild and redeploy path
- `app/api/os/...` handlers should use static-safe behavior for file-backed content and must not opt into per-request dynamic execution unless a specific route requires it

Error response rules:

- Unknown slugs return `404`
- Unexpected server errors return `500` with a stable error code payload
- Desktop windows must surface API errors as UI state inside the shell instead of crashing the runtime

## Canonical Route Contract

The browser URL represents the currently active canonical content context, not the full desktop state.

Canonical routes:

- `/`
- `/projects`
- `/projects/[slug]`
- `/blog`
- `/blog/[slug]`
- `/resume`
- `/contact`

Non-canonical desktop state that must not own the browser URL:

- Finder folder windows
- Desktop icon selection state
- Window geometry
- Extras launcher window
- About Stephen window
- Trash window
- Help window

Rules:

- Initial page load uses the incoming route as the boot target
- Boot and welcome do not create extra history entries
- Opening a canonical app or document from a user navigation action uses `router.push` unless the URL already matches
- Passive focus changes caused only by clicking an already-open window do not mutate the URL
- `router.replace` is reserved for hydration or browser-history reconciliation when the shell must realign to the current route without creating a new entry
- Opening non-canonical windows does not touch the browser URL
- `Back` and `Forward` reopen or refocus the canonical target represented by that route after boot/welcome completes
- On refresh, the shell restores preferences and geometry templates, then opens the route-target window implied by the current URL

## Experience Model

Visitors should experience the site in this order:

1. Boot screen
2. Welcome/setup panel on first visit only
3. Desktop reveal
4. Interaction via desktop icons, Finder, windows, and menus

The desktop should feel like a booted machine, not a webpage.

Persistence rules:

- First visit: show boot, then welcome, then desktop
- Return visit: show boot, skip welcome, then desktop
- Deep links still show boot first, then reveal the target window

## Runtime Architecture

Create a new OS runtime with these major modules:

- `DesktopShellBridge`
- `DesktopSessionStore`
- `WindowManagerStore`
- `MenuBarStore`
- `FinderStore`
- `AppRegistry`
- `RouteBridge`
- `SoundSystem`
- `MobileShell`

State management decision:

- Use Zustand for `DesktopSessionStore`, `WindowManagerStore`, `MenuBarStore`, and `FinderStore`
- Use local component state only for isolated UI concerns such as a menu-bar clock or temporary drag refs
- Do not use plain React context as the primary mutable store for OS runtime state

### DesktopShellBridge

Owns:

- Client entry point for the OS runtime
- Reading the current pathname and route params from App Router
- Receiving initial route context
- Choosing desktop shell vs mobile shell
- Respecting standalone routes that must bypass the OS shell

Implementation rule:

- `app/layout.tsx` stays server-rendered
- `DesktopShellBridge` is a client component mounted inside the layout wrapper

### DesktopSessionStore

Owns:

- Boot phase
- Welcome/setup visibility
- Theme and wallpaper preference
- Sound preference
- Intro-window preference
- Desktop icon positions
- Persisted desktop preferences

### WindowManagerStore

Owns:

- Open window instances
- Z-order
- Focus
- Drag
- Resize
- Collapse
- Zoom
- Close
- Geometry validation and restore

### MenuBarStore

Owns:

- Apple menu
- App menus
- Window menu
- Help menu
- Active-app menu switching
- Command enable/disable state

### FinderStore

Owns:

- Curated file tree
- Desktop shortcut definitions
- Folder contents
- File-to-app associations
- Current Finder selection
- Finder view mode per folder

### RouteBridge

Owns:

- Translating pathname into a launch intent
- Translating canonical window focus/open actions into router actions
- `push` vs `replace` behavior
- Popstate reconciliation through App Router navigation

### SoundSystem

Owns:

- Startup chime
- Menu sounds
- Window open/close sounds
- Trash sound
- Alert sound
- Reduced-motion and reduced-sound preference checks

### MobileShell

Owns:

- Mobile launcher
- Touch-friendly stacked window model
- Mobile Finder push-navigation flow
- Simplified menu interactions

## Proposed File and Module Structure

This structure is a starting implementation appendix, not a product requirement.

### Components

- `components/os/DesktopShellBridge.tsx`
- `components/os/DesktopShell.tsx`
- `components/os/BootSequence.tsx`
- `components/os/WelcomeSetup.tsx`
- `components/os/MenuBar.tsx`
- `components/os/DesktopIcons.tsx`
- `components/os/mobile/MobileShell.tsx`
- `components/os/windows/WindowLayer.tsx`
- `components/os/windows/WindowFrame.tsx`
- `components/os/windows/TitleBar.tsx`
- `components/os/finder/FinderApp.tsx`
- `components/os/finder/FinderTree.tsx`
- `components/os/finder/FinderListView.tsx`
- `components/os/finder/FinderIconView.tsx`
- `components/os/apps/AboutStephenApp.tsx`
- `components/os/apps/ProjectsIndexApp.tsx`
- `components/os/apps/ProjectDocumentApp.tsx`
- `components/os/apps/WritingIndexApp.tsx`
- `components/os/apps/PostDocumentApp.tsx`
- `components/os/apps/ResumeApp.tsx`
- `components/os/apps/ContactApp.tsx`
- `components/os/apps/ExtrasApp.tsx`
- `components/os/apps/WeatherApp.tsx`
- `components/os/apps/HelpApp.tsx`

### Library and State Files

- `lib/os/appRegistry.ts`
- `lib/os/loaders.ts`
- `lib/os/finderTree.ts`
- `lib/os/menuRegistry.ts`
- `lib/os/routeBridge.ts`
- `lib/os/sessionStorage.ts`
- `lib/os/theme.ts`
- `lib/os/sounds.ts`
- `lib/os/windowMath.ts`
- `lib/os/windowState.ts`
- `lib/os/launchIntent.ts`
- `lib/os/api.ts`

### API Routes

- `app/api/os/profile/route.ts`
- `app/api/os/resume/route.ts`
- `app/api/os/projects/route.ts`
- `app/api/os/projects/[slug]/route.ts`
- `app/api/os/blog/route.ts`
- `app/api/os/blog/[slug]/route.ts`

## Core TypeScript Spec

```ts
export const DESKTOP_RUNTIME = {
  systemName: "Stephen OS",
  themeId: "bondi",
  wallpaperId: "bondi-clouds",
  mobileBreakpointPx: 768
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
  | "help";

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

export interface WindowManagerState {
  windows: Record<string, WindowInstance>;
  activeWindowId: string | null;
  openWindow: (init: WindowInit) => string;
  focusWindow: (windowId: string, source?: "user" | "history" | "hydration") => void;
  closeWindow: (windowId: string) => void;
  moveWindow: (windowId: string, x: number, y: number) => void;
  resizeWindow: (windowId: string, width: number, height: number) => void;
  collapseWindow: (windowId: string) => void;
  zoomWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  resetAllWindowGeometry: () => void;
}

export type FinderNodeType = "volume" | "folder" | "document" | "app" | "trash";

export type FinderOpenBehavior = "finder" | "launch-app" | "open-document" | "external";

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
```

## Persistence Contract

Use versioned local storage for v1.

Storage key:

- `stephen-os/session:v1`

Persist in v1:

- Desktop preferences
- Welcome dismissed state
- Sound preference
- Intro-window preference
- Desktop icon positions
- Finder folder view mode
- Geometry templates by app/window key

Do not persist in v1:

- Exact full set of open windows
- Exact Finder selection state
- Active text selections
- In-progress form content

Validation rules:

- Reject persisted state when `version` is missing or unsupported
- Clamp all restored geometry to current viewport bounds
- If a stored window would render mostly off-screen, fall back to app default bounds
- If stored icon positions are invalid for the current viewport, reset that icon to its default slot

## Faux Filesystem Model

This project uses a curated, read-only faux filesystem. It is not a general-purpose file manager.

Desktop icons:

- `Stephen HD`
- `Projects`
- `Writing`
- `Resume`
- `Contact`
- `Applications`
- `Trash`

Top-level Finder tree:

- `Stephen HD`
- `Applications`
- `Projects`
- `Writing`
- `Resume`
- `Contact`
- `About Stephen`
- `Trash`

`Extras` lives inside `Applications`, not as a top-level volume sibling.

Behavior:

- Desktop icons are fast launchers and shortcuts, not full filesystem aliases
- Finder exposes the same curated content through folder navigation
- Content is read-only
- No uploads or user-created folders in v1

## Desktop Icon Grid Spec

Desktop icons use a fixed slot grid in v1.

Grid rules:

- Grid origin: `x = 24`, `y = 88`
- Cell size: `96 x 86`
- Icons snap back to the nearest valid grid slot when dragged
- `Trash` is pinned to the bottom-right corner with `24px` horizontal margin and `32px` bottom margin

Default slot map:

- `Stephen HD` -> column `0`, row `0`
- `Projects` -> column `0`, row `1`
- `Writing` -> column `0`, row `2`
- `Resume` -> column `0`, row `3`
- `Contact` -> column `0`, row `4`
- `Applications` -> column `0`, row `5`
- `Trash` -> pinned corner slot

## Finder Tree Bootstrap Spec

Codex should implement the initial tree as a static data source in `lib/os/finderTree.ts`.

Node modeling rule:

- `Projects` and `Writing` are launcher folders in v1
- They use `type: "folder"` for iconography and Finder placement
- They use `openBehavior: "launch-app"` and are not opened as normal Finder folder windows
- Finder code must treat them as canonical index shortcuts, not browsable folder windows

Required base nodes:

```ts
export const finderTree: FinderNode[] = [
  { id: "volume-stephen-hd", name: "Stephen HD", type: "volume", iconId: "drive", openBehavior: "finder", children: ["folder-applications", "folder-projects", "folder-writing", "doc-resume", "doc-contact", "doc-about", "trash"] },
  { id: "folder-applications", name: "Applications", type: "folder", parentId: "volume-stephen-hd", iconId: "folder-apps", openBehavior: "finder", children: ["app-finder", "app-extras", "app-weather"] },
  { id: "folder-projects", name: "Projects", type: "folder", parentId: "volume-stephen-hd", iconId: "folder-projects", openBehavior: "launch-app", appId: "projects-index", route: "/projects" },
  { id: "folder-writing", name: "Writing", type: "folder", parentId: "volume-stephen-hd", iconId: "folder-writing", openBehavior: "launch-app", appId: "writing-index", route: "/blog" },
  { id: "doc-resume", name: "Resume", type: "document", parentId: "volume-stephen-hd", iconId: "resume-doc", openBehavior: "launch-app", appId: "resume", route: "/resume" },
  { id: "doc-contact", name: "Contact", type: "document", parentId: "volume-stephen-hd", iconId: "contact-doc", openBehavior: "launch-app", appId: "contact", route: "/contact" },
  { id: "doc-about", name: "About Stephen", type: "document", parentId: "volume-stephen-hd", iconId: "about-doc", openBehavior: "launch-app", appId: "about-stephen" },
  { id: "app-finder", name: "Finder", type: "app", parentId: "folder-applications", iconId: "finder-app", openBehavior: "launch-app", appId: "finder" },
  { id: "app-extras", name: "Extras", type: "app", parentId: "folder-applications", iconId: "extras-app", openBehavior: "launch-app", appId: "extras" },
  { id: "app-weather", name: "Weather", type: "app", parentId: "folder-applications", iconId: "weather-app", openBehavior: "launch-app", appId: "weather" },
  { id: "trash", name: "Trash", type: "trash", parentId: "volume-stephen-hd", iconId: "trash", openBehavior: "finder" }
];
```

Dynamic nodes:

- Add one document node per project MDX file under `folder-projects`
- Add one document node per blog MDX file under `folder-writing`
- The node `route` for those documents must match their canonical slug route
- Their `appId` must be `project-document` or `post-document`

Sorting:

- Folders before documents
- Then alphabetical by `name`
- Dynamic project and blog document nodes sort newest-first in app index views, but alphabetically in Finder list view unless a later arrange-by-date command is added

## App Registry Spec

The app model must distinguish launcher windows, root index windows, and document windows.

```ts
export type RootWindowPolicy = "singleton" | "multi" | "none";
export type DocumentWindowPolicy = "none" | "multi";

export interface DesktopAppDefinition {
  id: AppId;
  name: string;
  iconId: string;
  rootWindowPolicy: RootWindowPolicy;
  documentWindowPolicy: DocumentWindowPolicy;
  desktopShortcut: boolean;
  defaultKind: WindowKind;
  defaultBounds: WindowBounds;
  menuGroup: "finder" | "content" | "utility" | "help";
  canonicalRoute: CanonicalRoute | null;
  createRootWindow: () => WindowInit | null;
  createDocumentWindow?: (args: { slug: string; route: CanonicalRoute; title: string }) => WindowInit;
}
```

### App Behavior Matrix

- `finder`
  - Root window policy: `multi`
  - Document window policy: `none`
  - Canonical route: `null`
  - Opens folder windows only
- `about-stephen`
  - Root window policy: `singleton`
  - Document window policy: `none`
  - Canonical route: `null`
- `projects-index`
  - Root window policy: `singleton`
  - Document window policy: `none`
  - Canonical route: `/projects`
- `project-document`
  - Root window policy: `none`
  - Document window policy: `multi`
  - Canonical route: `/projects/[slug]`
- `writing-index`
  - Root window policy: `singleton`
  - Document window policy: `none`
  - Canonical route: `/blog`
- `post-document`
  - Root window policy: `none`
  - Document window policy: `multi`
  - Canonical route: `/blog/[slug]`
- `resume`
  - Root window policy: `singleton`
  - Document window policy: `none`
  - Canonical route: `/resume`
- `contact`
  - Root window policy: `singleton`
  - Document window policy: `none`
  - Canonical route: `/contact`
  - Window kind: `utility`
- `extras`
  - Root window policy: `singleton`
  - Document window policy: `none`
  - Canonical route: `null`
- `weather`
  - Root window policy: `singleton`
  - Document window policy: `none`
  - Canonical route: `null`
- `help`
  - Root window policy: `singleton`
  - Document window policy: `none`
  - Canonical route: `null`

### Duplicate Launch Rules

- Launching a singleton root app focuses the existing window if open
- Launching a Finder folder opens a new folder window
- Opening the same project or blog slug twice focuses the existing document window instead of duplicating it
- The canonical route should always point at the focused canonical window when one exists

## Boot and Welcome Spec

State flow:

```txt
boot -> welcome -> desktop
```

There is no production shutdown flow in v1.

### Boot Screen

Show:

- `Stephen OS` name
- Bondi-blue startup styling
- Platinum loading motif
- Short fake loading illusion

Constraints:

- Total boot duration target: 1200ms to 2200ms
- Allow immediate fast-forward if reduced motion is preferred
- Boot must not block route-target launch intent creation
- Boot is silent by default in v1

### Welcome/Setup

Show on first visit only.

Controls:

- Sound on/off, default on
- Open intro windows on/off, default on
- Enter button

Persist:

- `soundEnabled`
- `openIntroWindows`
- `welcomeDismissed`

Audio unlock rules:

- The Welcome Enter action is the first guaranteed user gesture on first visit
- If `soundEnabled` is true, the startup chime plays immediately after that gesture unlocks audio
- On return visits, the shell stays silent until the first pointer or keyboard interaction unlocks audio
- No boot-time audio is required for correctness

### Desktop Reveal

Show:

- Wallpaper
- Menu bar
- Desktop icons
- Optional intro windows on first completed setup:
  - `About Stephen`
  - one Finder window rooted at `Stephen HD`

## Finder Spec

Finder supports:

- Tree navigation
- Icon view
- List view
- Folder windows
- Double-click open behavior
- Desktop shortcut support
- Selection state

Finder rules:

- Finder folders open in Finder windows, not route-backed pages
- `Stephen HD` and `Applications` always open Finder folder windows
- `Projects` and `Writing` are launcher folders and open their canonical index apps instead of normal Finder folder windows
- Finder selection is single-select in v1
- Double-click threshold uses the platform and browser default event timing
- Default view:
  - `Stephen HD`: icons
  - `Applications`: icons
  - `Projects`: list
  - `Writing`: list
- `Get Info` can ship as a modeless dialog after Finder MVP if needed; it must not block basic Finder implementation

## Menu Spec

Global menu layout:

- Apple
- File
- Edit
- View
- Special
- Help

Rules:

- Active app owns the menu bar
- Finder gets the richest menu set
- Help stays last
- Commands can be disabled but still visible when that improves fidelity
- Do not invent placeholder commands with no implementation path

### Apple

Functional in v1:

- About Stephen OS
- Sound On/Off
- Reset Window Positions

Deferred from v1:

- Control Panels
- Recent Items
- Restart

### File

Functional in v1:

- New Finder Window
- Open
- Close Window

Deferred:

- Get Info

### Edit

Functional in v1 only when context allows:

- Copy
- Paste
- Select All

Disabled in most non-text contexts:

- Undo
- Cut

### View

Functional in Finder:

- as Icons
- as List
- Arrange by Name

### Special

Functional in v1:

- Open in New Window

Deferred or disabled:

- Empty Trash
- Put Away

### Help

Functional in v1:

- Stephen OS Help
- Keyboard Shortcuts

### Command Registry Contract

All implemented menu items in v1 must be defined in `lib/os/menuRegistry.ts`.

Each command definition must include:

- Stable command ID
- Owning top-level menu
- Label
- Optional keyboard shortcut
- `isEnabled(state)` predicate
- `run(context)` handler

Minimum required command enablement:

- `about-stephen-os`: always enabled
- `toggle-sound`: always enabled
- `reset-window-geometry`: always enabled
- `new-finder-window`: always enabled
- `open-selection`: enabled when a Finder selection or actionable window target exists
- `close-window`: enabled when `activeWindowId !== null`
- `copy`, `paste`, `select-all`: enabled only when the active app exposes those actions
- `view-as-icons`, `view-as-list`, `arrange-by-name`: enabled only for Finder windows
- `open-in-new-window`: enabled only when the current selection supports a second window
- `show-help`, `show-keyboard-shortcuts`: always enabled

## Window Behavior Spec

### Document Windows

- Draggable
- Resizable
- Close box
- Zoom box
- Collapse box
- Active and inactive visual states
- Scrollbars when needed

### Modeless Dialogs

- Look like document windows
- No resize handle by default
- Stay open until explicitly closed

### Utility Windows

- Float above document windows
- Remain accessible while document windows are active
- `Contact` is the primary utility window in v1

### Interaction Rules

- Use pointer events for drag and resize
- Start drag only after pointer movement exceeds 4px
- Focus a window on pointer down in the title bar or window body
- Constrain windows within viewport bounds with at least 24px of title bar visible
- Minimum size:
  - document: `320x220`
  - utility: `280x180`
  - dialog: `260x140`
- `zoom` toggles between current bounds and computed preferred bounds
- `collapse` reduces a window to a title-bar strip anchored to the bottom stacking area
- Esc does not globally close windows in v1

### Geometry Persistence Rules

- Persist geometry by a stable key:
  - root apps by `appId`
  - documents by `appId + slug`
  - Finder folder windows by `finder + nodeId`
- Store geometry as reusable templates, not a full open-session snapshot

## Route and Browser History Rules

Route hydration is a foundation concern, not a late phase.

Launch intent mapping:

- `/` -> no canonical content window required; open desktop normally
- `/projects` -> focus or open `projects-index`
- `/projects/[slug]` -> focus or open the matching `project-document`
- `/blog` -> focus or open `writing-index`
- `/blog/[slug]` -> focus or open the matching `post-document`
- `/resume` -> focus or open `resume`
- `/contact` -> focus or open `contact`

Hydration rules:

- Server route renders canonical metadata as usual
- Client shell reads pathname on mount and creates a launch intent
- After boot and welcome, the launch intent is fulfilled exactly once

Popstate rules:

- Browser history navigation reconciles by canonical route only
- If the target canonical window is already open, focus it
- If it is not open, open it
- Do not close unrelated non-canonical windows during popstate reconciliation in v1

SEO rules:

- Do not remove route-level metadata generation
- Canonical pages must remain meaningful without window-drag interactions
- The desktop shell enhances the page; it does not replace the site with an opaque client-only app

## Extras and External Experience Rules

`Extras` is a launcher app, not a dumping ground.

v1 extras policy:

- `Weather` becomes an in-shell desktop app window
- `Star Wars` remains a standalone route-backed experience
- `Space Invaders` remains a standalone route-backed experience

Launch behavior:

- The `Extras` app shows all extras and their launch modes
- `Weather` opens inside the desktop shell
- `Star Wars` and `Space Invaders` open their existing standalone routes in a new tab
- Finder nodes for standalone extras use `openBehavior: "external"`

## Mobile Spec

Mobile preserves the illusion but changes the interaction model.

Rules:

- Same Bondi-blue and Platinum visual language
- Same boot sequence
- Welcome/setup still appears on first visit
- Icon-grid launcher instead of free desktop placement
- Stacked windows or sheets instead of arbitrary freeform desktop windows
- Finder becomes touch-friendly push navigation
- Larger touch targets
- No drag-to-position desktop icons
- No freeform window resize on mobile

Shared contract:

- Same content sources
- Same route-to-launch-intent mapping
- Same app registry IDs where possible

Activation rule:

- `DesktopShellBridge` selects `MobileShell` when `window.matchMedia("(max-width: 767px)")` matches on the client
- No manual desktop/mobile override exists in v1

## Error and Empty State Spec

Shell stability rules:

- API fetch failure must not unmount or crash the desktop shell
- Invalid canonical slugs loaded directly still resolve through the existing App Router route behavior
- Invalid slugs requested through `app/api/os/...` return `404` and open a not-found dialog or in-window not-found state
- Unexpected API failures return `500` and open a modeless error dialog or inline error state

Empty-state rules:

- Empty projects list renders a project-index empty state inside the app window
- Empty writing list renders a writing-index empty state inside the app window
- Empty Finder folders render a standard empty-folder view rather than a blank panel

## Accessibility and Preference Spec

Minimum v1 requirements:

- Keyboard focus states for all controls
- Keyboard navigation for menus and window chrome
- Reduced motion support for boot and window animations
- Sound preference respected and persisted
- Semantic labels for window controls
- Sufficient color contrast for title bars, text, and icons
- Touch targets of at least 44px on mobile interactive controls

## Visual Design Spec

Use:

- Bondi-blue base palette
- Platinum chrome
- Striped active title bars
- Inactive window states
- Beveled controls
- Redrawn custom icons based on classic Mac OS references

Avoid:

- Generic SaaS styling
- Purple defaults
- Flat UI
- Modern glassmorphism

Visual acceptance checklist:

- Menu bar reads as classic Mac OS, not a web navbar
- Window frames read as Platinum-era chrome
- Desktop icons and Finder icons are intentionally redrawn, not borrowed screenshots
- The desktop background and icon spacing feel like a machine desktop, not a landing page grid

## Audio and Theatrics Spec

Planned sounds:

- Startup chime
- Menu interaction sounds
- Window open/close sounds
- Trash sound
- Alert sound

Planned theatrics:

- Boot animation
- Desktop reveal
- Window open/close motion

Constraints:

- Sounds must never autoplay before user interaction if the browser blocks them
- The runtime must degrade gracefully when audio cannot play
- Motion and sound are enhancements, not blockers

## Implementation Phases

### Phase 0: Migration Baseline

- Remove the terminal-style shell from the active runtime path
- Remove `content/home.json` from active runtime usage
- Preserve existing content readers, route files, and metadata behavior
- Leave existing standalone easter egg routes intact

### Phase 1: Shell Mount and RouteBridge Foundation

- Add `DesktopShellBridge`
- Define launch intent mapping from pathname
- Define browser URL ownership rules
- Replace the current `AppShell` path with the OS shell bridge
- Preserve standalone-route bypass logic

### Phase 2: Session, Persistence, and Window Foundation

- Add Zustand stores
- Add local storage persistence with schema versioning
- Add geometry validation and default placement logic
- Add shared server loaders and the content API routes for desktop windows

### Phase 3: Boot and Welcome

- Build boot screen
- Build welcome/setup panel
- Wire first-visit vs return-visit behavior
- Fulfill launch intent after boot and welcome

### Phase 4: Core OS Primitives

- Menu bar
- Window frame
- Title bar controls
- Platinum controls
- Sound system
- Keyboard and focus behavior for chrome controls

### Phase 5: Finder and Desktop

- Desktop icons
- Finder tree
- Folder windows
- Finder list and icon views
- Desktop icon positioning
- Finder command enablement and empty states

### Phase 6: Content App Conversion

- About Stephen
- Projects index
- Project document windows
- Writing index
- Post document windows
- Resume
- Contact

### Phase 7: Extras

- Extras launcher app
- Weather in-shell app
- Standalone launch handling for Star Wars and Space Invaders

### Phase 8: Mobile Shell

- Touch-first launcher
- Stacked mobile windows
- Mobile Finder flow

### Phase 9: Polish and QA

- Animation tuning
- Sound tuning
- Icon pass
- Accessibility regression audit
- Performance pass
- Regression testing

## Testing Strategy

Required automated coverage:

- Unit tests for launch-intent parsing
- Unit tests for route-to-window reconciliation
- Unit tests for geometry clamping and persistence restore
- Unit tests for Finder tree generation from file-backed content
- Unit tests for menu command enablement predicates
- Playwright tests for first-visit boot and welcome flow
- Playwright tests for return-visit boot flow
- Playwright tests for deep linking into project and blog document windows
- Playwright tests for `Back` and `Forward` route reconciliation
- Playwright tests for desktop icon launches and Finder launches
- Playwright tests for mobile-shell activation below the breakpoint

## Acceptance Criteria

- First-time visitors see boot, welcome, then desktop
- Return visitors see boot, then desktop without the welcome panel
- The runtime stays mounted on the existing App Router foundation
- Non-root canonical routes keep meaningful server-rendered content and metadata under the shell
- Canonical URLs remain usable for SEO and sharing
- Opening a canonical app or document updates the route correctly
- `Back` and `Forward` refocus or reopen the canonical target correctly
- Desktop icons open the expected apps or folders
- Finder tree navigation works with the curated node graph
- Windows drag, resize, collapse, zoom, close, and maintain focus order
- Utility windows float above document windows
- The active app changes the menu bar command set
- API and content-loading failures do not crash the shell runtime
- `content/home.json` is no longer part of the active runtime path
- Content remains editable through `profile.json`, `resume.json`, and MDX files
- Mobile uses a purpose-built touch model instead of a shrunk desktop

## Immediate Next Step for Codex

Implement in this order:

1. Replace the current shell wrapper with `DesktopShellBridge` while preserving App Router metadata and standalone-route bypass behavior
2. Implement launch-intent parsing and the route ownership contract before building the full window UI
3. Add Zustand stores, persistence, and content API routes
4. Build boot and welcome flow
5. Build window chrome and Finder
6. Convert content apps after the runtime contract is stable
