# ARCHITECTURE.md — Technical Blueprint
# Project: stephenjdunn.com
# Read AGENTS.md first. This document defines how the codebase is structured.

---

## 1. Mental Model

The app is a **single Next.js page** (`app/page.tsx`) that renders a full-viewport desktop shell. Everything the user sees is React state — open windows, their positions, which app is focused, whether sound is on. There is no routing between pages for the desktop experience. The only real routes are:

- `/` — the desktop (the entire app)

MDX content is loaded at build time via Next.js static generation. No database. No server-side state.

---

## 2. State Architecture

All global UI state lives in **Zustand**. No prop drilling. No React Context for shared state.

### Window Store (`lib/window-store.ts`)

```typescript
interface WindowState {
  id: string                    // unique per instance, e.g. "finder-1"
  appId: AppId                  // which app this window belongs to
  title: string
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  isShaded: boolean             // windowshade: true = collapsed to title bar only
  position: { x: number; y: number }
  size: { width: number; height: number }
  preShadeHeight: number        // stores height before shading so it can be restored
  zIndex: number
  props?: Record<string, unknown> // app-specific data passed to the window
}

interface WindowStore {
  windows: WindowState[]
  focusedWindowId: string | null
  openWindow: (appId: AppId, props?: Record<string, unknown>) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  shadeWindow: (id: string) => void   // toggles windowshade (collapse/expand)
  moveWindow: (id: string, position: { x: number; y: number }) => void
  resizeWindow: (id: string, size: { width: number; height: number }) => void
}
```

### Sound Store (`lib/sound.ts`)

```typescript
interface SoundStore {
  enabled: boolean
  toggle: () => void
  play: (sound: SoundId) => void
}

type SoundId = 'boot' | 'click' | 'open' | 'close' | 'error' | 'alert'
```

### App Registry (`lib/app-registry.ts`)

```typescript
type AppId =
  | 'finder'
  | 'textedit'
  | 'simpletext'
  | 'mail'
  | 'space-invaders'
  | 'sherlock'
  | 'notepad'
  | 'calculator'
  | 'about'

interface AppDefinition {
  id: AppId
  name: string
  icon: string              // path to PNG in /public/icons/
  defaultSize: { width: number; height: number }
  minSize: { width: number; height: number }
  singleton: boolean        // if true, only one instance can be open
  resizable: boolean        // false for fixed-size apps like Calculator and About
  component: React.ComponentType<AppProps>
}

interface AppProps {
  windowId: string
  props?: Record<string, unknown>
}
```

### App sizes (use these exact values in `lib/app-registry.ts`)

| App | defaultSize | minSize | singleton | resizable |
|---|---|---|---|---|
| Finder | 640 × 440 | 420 × 300 | false | true |
| TextEdit | 520 × 420 | 320 × 220 | false | true |
| SimpleText | 500 × 520 | 320 × 260 | true | true |
| Mail | 480 × 380 | 380 × 300 | true | true |
| Space Invaders | 480 × 540 | 420 × 480 | true | true |
| Sherlock | 420 × 380 | 340 × 280 | true | true |
| Note Pad | 300 × 260 | 220 × 160 | false | true |
| Calculator | 240 × 320 | 240 × 320 | true | false |
| About | 360 × 280 | 360 × 280 | true | false |

Calculator and About have `resizable: false` and `minSize === defaultSize`. Their resize handles should not render.

---

## 3. Component Tree

```
app/page.tsx
└── <Desktop>
    ├── <BootSequence />             visible on first load, unmounts after boot
    ├── <Wallpaper />                static background
    ├── <MenuBar>                    top bar, always visible
    │   ├── <AppleMenu />            dropdown: About, Sound toggle, Shut Down
    │   └── <AppMenu />              reflects focused window's app
    ├── <DesktopIcons>               grid of clickable app icons
    │   └── <DesktopIcon /> ×n      (see §5.2 desktop icons list)
    ├── <WindowManager>              renders all open windows
    │   └── <WindowFrame /> ×n      one per open window
    │       ├── <TitleBar />         drag handle, traffic-light buttons, shade on dbl-click
    │       └── <AppContent>         renders the correct app component
    │           └── [AppComponent]
    └── <MobileFallback />           only visible on mobile viewports
```

---

## 4. Window Manager

The window manager is **not a library**. It is a custom implementation using mouse events and Zustand. Framer Motion handles open/close animations only — not drag physics.

### Drag behavior
- `mousedown` on TitleBar → start drag, record offset from window position
- `mousemove` on document → update window position in store
- `mouseup` on document → end drag
- Constrain to viewport bounds (window cannot be dragged fully off screen; top edge ≥ 28px to stay below menu bar)
- `mousedown` on any part of window → `focusWindow(id)` → highest zIndex

### Resize behavior
- Resize handle: 8px invisible zone on bottom-right corner
- Same mouse event pattern as drag
- Respect `minSize` from AppDefinition
- Do not render resize handle for apps with `resizable: false`

### Windowshade behavior
- Double-click on TitleBar → toggle `isShaded`
- When `isShaded = true`: content area height collapses to 0 (overflow hidden), `preShadeHeight` stores the previous height
- When `isShaded = false`: content area height restores from `preShadeHeight`
- Animate the collapse/expand with Framer Motion (`AnimatePresence` + height transition)
- Window remains draggable while shaded (title bar is still visible)

### Z-index management
- Each `focusWindow` call sets the focused window's zIndex to `max(all zIndexes) + 1`
- Start zIndexes at 100 to avoid conflicts with other elements
- Menu bar lives at `z-index: 9999`

### Window open/close animation (Framer Motion)
```typescript
// WindowFrame wraps content in motion.div
const variants = {
  initial: { scale: 0.85, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.15 } },
  exit:    { scale: 0.85, opacity: 0, transition: { duration: 0.1 } },
}
// Wrap WindowManager output in <AnimatePresence> so exit animations play
```

### WindowFrame anatomy
```
┌─────────────────────────────────────────┐
│ ● ─ □  Window Title              [drag] │  ← TitleBar (h-7, draggable, dbl-click = shade)
├─────────────────────────────────────────┤
│                                         │
│         App content here                │  ← overflow-auto, collapses on shade
│                                         │
└──────────────────────────────────────┘▪ │  ← resize handle (hidden for non-resizable apps)
```

Traffic light buttons (close = red #FF5F57, minimize = yellow #FEBC2E, zoom = green #28C840) are pixel-faithful to OS9 style.

---

## 5. App Implementations

### 5.1 Desktop icons

The desktop renders these icons at launch. Each is a `<DesktopIcon>` with an `onDoubleClick` that calls `openWindow(appId)`:

| Icon | AppId / action |
|---|---|
| Trash | Visual only — opens a "This feature is not available." dialog |
| Read Me | `textedit` (opens with bio content) |
| Resume | `simpletext` |
| Mail | `mail` |
| Space Invaders | `space-invaders` |
| Projects | `finder` |
| Note 1–4 | `notepad` (each passes a different `props.noteId`) |

**About This Computer** is NOT a desktop icon. It opens only from the Apple menu.

Desktop icons are draggable and save their positions to `localStorage` key `desktop-icon-positions`.

### 5.2 Finder
- Left panel: folder tree (projects as folders, each with sub-items)
- Right panel: file list or file preview
- Project folders map 1:1 to `content/projects/[slug]/`
- Each project has an `index.mdx` rendered in the preview pane
- Breadcrumb navigation at top
- Double-click folder → navigate in
- Double-click `index.mdx` → opens in TextEdit

### 5.3 TextEdit
- Renders MDX content passed via `props.content`
- Read-only. Scrollable. Styled to look like a classic Mac document window.
- Launched from Finder when user opens a file, or from desktop "Read Me" icon

### 5.4 SimpleText (Resume)
- Placeholder resume content (Stephen to replace before launch — see `specs/apps.md`)
- Monospace font, document-style layout
- "View on LinkedIn" button in the header

### 5.5 Mail
- Classic Mac compose-window styling
- Read-only `To:` field pre-filled with `stephendunn2424@gmail.com`
- "Open in Mail" button opens `mailto:stephendunn2424@gmail.com?subject=Hello from stephenjdunn.com`
- No API route or server-side mail handling

### 5.6 Space Invaders
- Canvas-based game, self-contained in `components/apps/space-invaders/`
- Keyboard controls (arrow keys + space)
- Classic pixel art style
- Score displayed in title bar

### 5.7 Sherlock
- Search input at top
- Fuse.js searches across all project MDX content (indexed at build time via `lib/search.ts`)
- Results list below, click result → opens Finder to that project
- Search input is autofocused on window open

### 5.8 Note Pad
- 3–4 pre-populated notes, each with its own desktop icon
- Each note is loaded by `props.noteId` from a static notes config
- Visitor can type and edit the note in-session
- **Nothing persists** — all edits are ephemeral (no localStorage)
- Yellow legal pad aesthetic

### 5.9 Calculator
- Standard arithmetic: +, -, ×, ÷, =, C, ±, %
- Display shows current input/result
- Pixel-faithful OS9 calculator aesthetic

### 5.10 About This Computer
- Modal dialog (not a resizable window), opened from Apple menu only
- Displays: fake Mac OS 9 version, fake CPU/RAM specs, Stephen's actual name + role
- Tech stack credits + icon source attribution (bearz314/MacOS9-icons)

---

## 6. Boot Sequence

1. Page loads → `<BootSequence>` mounts, covers full viewport
2. Happy Mac icon fades in (center screen)
3. Progress bar fills across bottom (~3 seconds)
4. Boot chime plays (if audio context allowed by browser; silent otherwise)
5. "Welcome to Mac OS 9" text appears briefly
6. Crossfade to desktop (Framer Motion opacity transition)
7. `<BootSequence>` unmounts
8. Desktop icons appear with a stagger animation (Framer Motion, 50ms delay per icon)

**Session persistence:** boot runs once per browser session (flag in `sessionStorage`). Deep links and refreshes after first visit skip it.

**Skippable:** click anywhere during boot → immediately jump to desktop.

**Mobile path:** boot sequence plays, then transitions to `<MobileFallback>` instead of the desktop.

---

## 7. Content Schema (MDX)

Each project lives at `content/projects/[slug]/index.mdx`.

**Frontmatter:**
```yaml
---
title: "VocabMonster"
description: "A vocabulary learning app with spaced repetition"
year: 2024
tags: ["React", "TypeScript", "Node.js"]
github: "https://github.com/dunn-stephen/vocabmonster"
live: "https://vocabmonster.app"        # optional
icon: "/icons/projects/vocabmonster.png"
---
```

**Body:** standard MDX. Can include headings, paragraphs, lists, inline code, code blocks, and custom components imported from `components/ui/`.

**Build-time index:** at build time, `lib/search.ts` reads all MDX frontmatter + body text, builds a Fuse.js index, and exports it as a static JSON. Sherlock imports this JSON client-side.

---

## 8. `lib/projects.ts`

This module is a build-time dependency for Finder and Sherlock. It must be built before either app is started.

```typescript
// lib/projects.ts

export interface ProjectFile {
  name: string
  type: 'mdx' | 'image'
  path: string
  content?: string    // populated for MDX files
}

export interface Project {
  slug: string
  title: string
  description: string
  year: number
  tags: string[]
  github: string
  live?: string
  icon: string
  files: ProjectFile[]
}

// Reads all MDX files from content/projects/ at build time
export async function getAllProjects(): Promise<Project[]>

// Returns a single project by slug
export async function getProject(slug: string): Promise<Project>
```

`app/page.tsx` calls `getAllProjects()` and passes the result as a prop to `<Desktop>`, which passes it down to Finder and Sherlock via the window store `props`.

---

## 9. Sound System

```typescript
// lib/sound.ts
const SOUNDS: Record<SoundId, string> = {
  boot:  '/sounds/boot.mp3',
  click: '/sounds/click.mp3',
  open:  '/sounds/open.mp3',
  close: '/sounds/close.mp3',
  error: '/sounds/error.mp3',
  alert: '/sounds/alert.mp3',
}
```

- On first user interaction (click anywhere), attempt to create `AudioContext`
- If browser allows: set `enabled = true`, play sounds on UI events
- If browser blocks: set `enabled = false`, remain silent
- Apple menu toggle overrides: user can force-off even if browser allows
- A subtle speaker-with-slash icon in the menu bar indicates sound is muted
- `useSound(soundId)` hook — call `.play()` anywhere in the app

---

## 10. Font Loading

```css
/* app/globals.css */
@font-face {
  font-family: 'Chicago';
  src: url('/fonts/chicago.woff2') format('woff2');
  font-display: swap;   /* system font renders first, Chicago swaps in */
}

@font-face {
  font-family: 'Charcoal';
  src: url('/fonts/charcoal.woff2') format('woff2');
  font-display: swap;
}
```

Tailwind config extends `fontFamily`:
```typescript
// tailwind.config.ts
fontFamily: {
  chicago: ['Chicago', 'system-ui', 'monospace'],
  charcoal: ['Charcoal', 'system-ui', 'sans-serif'],
}
```

---

## 11. `hooks/useMediaQuery.ts`

Used by `<Desktop>` to detect mobile viewports. Implement as a custom hook — do not use a third-party library.

```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

Usage in `<Desktop>`:
```typescript
const isMobile = useMediaQuery('(max-width: 768px)')
if (isMobile) return <MobileFallback />
```

---

## 12. Mobile Fallback

`<MobileFallback>` renders after the boot sequence on mobile:
- Sad Mac icon (centered, ~128px)
- "stephenjdunn.com"
- "This experience is designed for desktop. Come back on a real computer."
- GitHub link, LinkedIn link
- Links to each of the 8 project URLs (for recruiters on mobile)

---

## 14. Netlify Config

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

The `@netlify/plugin-nextjs` plugin handles SSR, API routes, and image optimization automatically. Install it: `npm install -D @netlify/plugin-nextjs`.

---

## 15. next.config.ts

```typescript
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({})

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: true,
  },
}

export default withMDX(nextConfig)
```
