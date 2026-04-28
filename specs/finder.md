# specs/finder.md — Finder App Spec
# Read AGENTS.md and ARCHITECTURE.md before starting this task.
# Pre-requisite: lib/projects.ts must be complete (BUILD_PLAN.md Task 0.6) before Finder is built.

---

## Overview

Finder is the file browser. It shows the project portfolio as a folder hierarchy. Visitors navigate into project folders and read case study content. It is the primary content discovery surface of the site.

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│ ● ─ □  Finder                                           │  ← WindowFrame TitleBar
├──────────────┬──────────────────────────────────────────┤
│ 📁 Projects  │  📄 index.mdx      📷 screenshot-1.png  │  ← file list (right panel)
│   📁 vocabm… │  📷 screenshot-2.png                    │
│   📁 numist… │                                          │
│   📁 star-w… │  ──────────────────────────────────────  │
│   📁 bluesh… │                                          │
│   📁 ios-go… │  [Preview pane - renders on file click]  │
│   📁 spotif… │                                          │
│   📁 email-… │                                          │
│   📁 portfo… │                                          │
├──────────────┴──────────────────────────────────────────┤
│ 📂 Projects > vocabmonster                 3 items      │  ← status bar
└─────────────────────────────────────────────────────────┘
```

---

## Panels

### Left Panel — Folder Tree (fixed width: 180px)
- Shows top-level "Projects" folder and all 8 project sub-folders
- Click folder → selects it, right panel shows its contents
- Selected folder is highlighted (OS9 blue selection)
- Folder names (from `lib/projects.ts` → `project.title`):
  - VocabMonster
  - Numista → Notion MCP
  - Star Wars ASCII
  - Blueshift MCP (TS)
  - iOS Gomoku
  - Spotify Wrapped
  - Email Sig Generator
  - This Portfolio

### Right Panel — File List + Preview (flexible width)
Upper half: icon grid of files in the selected folder
Lower half: preview pane for the selected file

**File types per project folder:**
- `index.mdx` — always present, shows the case study
- `screenshot-N.png` — 1–3 screenshots (if present in `content/projects/[slug]/screenshots/`)

**Click behavior:**
- Click file → preview appears in lower half
  - `.mdx` files → render MDX in preview pane
  - `.png` files → render image in preview pane
- Double-click `.mdx` → opens TextEdit window with that file's content and title

### Status Bar (fixed height: 20px, bottom of window)
Shows breadcrumb path and item count. Example: `📂 Projects > VocabMonster    3 items`

---

## Data Loading

`lib/projects.ts` must be built before this task (see BUILD_PLAN.md Task 0.6 and ARCHITECTURE.md §8).

At build time, Next.js statically generates the project file tree from `content/projects/`.

```typescript
// lib/projects.ts
export interface ProjectFile {
  name: string
  type: 'mdx' | 'image'
  path: string
  content?: string    // for MDX files, the raw MDX string
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

export async function getAllProjects(): Promise<Project[]>
export async function getProject(slug: string): Promise<Project>
```

Finder receives the full project list as a prop (passed down via `app/page.tsx` → `<Desktop>` → window `props`).

---

## State (local to Finder component)

This state is local (`useState`) — not in the global Zustand store. Each Finder window instance has its own navigation state.

```typescript
interface FinderState {
  selectedProjectSlug: string | null
  selectedFile: ProjectFile | null
  view: 'grid' | 'list'         // toggle in toolbar (grid is default)
}
```

---

## Window Size

defaultSize: 640×440, minSize: 420×300, resizable, not singleton (multiple Finder windows can be open)

---

## Acceptance Criteria

- [ ] `lib/projects.ts` is complete and `getAllProjects()` returns all 8 projects before this task starts
- [ ] All 8 project folders visible in left panel
- [ ] Clicking a project folder highlights it and shows its files in the right panel
- [ ] Clicking a file shows a preview in the lower right panel
- [ ] MDX preview renders the full case study content with correct formatting
- [ ] Image preview renders the screenshot
- [ ] Double-clicking `index.mdx` opens a TextEdit window with that file's content
- [ ] Status bar shows correct path and item count
- [ ] Window is resizable and both panels reflow correctly
- [ ] Left panel is scrollable if folder list overflows
- [ ] Right panel is scrollable if file list overflows
- [ ] OS9 aesthetic: correct fonts, colors, icon sizes, selection highlight
