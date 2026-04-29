# BUILD_PLAN.md — Ordered Build Plan
# Project: stephenjdunn.com
# Read AGENTS.md and ARCHITECTURE.md before starting. Tasks must be completed in order within each phase.
# Phases 0–3 are fully sequential. Within Phase 4, subagents can work in parallel per the rules in AGENTS.md §8.

---

## Phase 0 — Repo & Tooling Setup
*No features. Just a working, deployable skeleton with all assets and content stubs in place.*

---

### Task 0.0 — Pre-flight check
**Goal:** Verify every CLI tool and prerequisite is in place before writing a single line of code. This task must pass completely before any other task begins. Do not proceed if any check fails.

**⚠️ This task makes no file changes. Gates 5 and 6 are skipped. Do not create an empty commit.**

**Run these checks in order:**

```bash
# ── 1. Node.js ────────────────────────────────────────────
node --version
# Must print v18 or higher. If missing: install from nodejs.org

# ── 2. npm ────────────────────────────────────────────────
npm --version
# Must print a version number.

# ── 3. Git — branch and remote ────────────────────────────
git --version
# Must print a version number.

git branch --show-current
# Must print: staging
# If on a different branch: git checkout staging

git remote -v
# Must show origin pointing to https://github.com/dunn-stephen/stephenjdunn
# If wrong remote: git remote set-url origin https://github.com/dunn-stephen/stephenjdunn

git status --short
# Should be clean or show only expected untracked files.
# If there are unexpected uncommitted changes, review before proceeding.

# ── 4. Netlify CLI ────────────────────────────────────────
netlify --version
# Must print a version number. If missing: npm install -g netlify-cli

netlify status
# Must show:
#   Current user: [your account]
#   Netlify Site Info: stephenjdunn  (ID: 652f6ca1-b6b3-47bb-8628-b7ed2f80e4b0)
# If "Not linked": run `netlify link` and select the stephenjdunn project
# If "Not logged in": run `netlify login` (opens browser for OAuth — human step, halt if needed)

# ── 5. Python 3 (for sound generation in Task 0.4) ────────
python3 --version
# Must print Python 3.8 or higher. If missing: install from python.org

pip3 install numpy scipy --break-system-packages 2>/dev/null || pip3 install numpy scipy
# Must install without errors.

# ── 6. ffmpeg (for audio conversion) ─────────────────────
ffmpeg -version 2>/dev/null && echo "ffmpeg available" || echo "ffmpeg not found"
# Preferred but optional — the sound script has a fallback without it.
# To install: brew install ffmpeg  (macOS)  or  apt install ffmpeg  (Linux)

# ── 7. curl ───────────────────────────────────────────────
curl --version
# Must print a version number. Used for font download in Task 0.3.
```

**If any required check fails**, halt using the format in AGENTS.md §7 before proceeding.

**Acceptance criteria:**
- [ ] `node --version` returns v18 or higher
- [ ] `npm --version` returns a version number
- [ ] `git branch --show-current` returns `staging`
- [ ] `git remote -v` shows origin pointing to the correct GitHub repo
- [ ] `netlify status` shows project linked to `stephenjdunn` (ID: 652f6ca1-b6b3-47bb-8628-b7ed2f80e4b0)
- [ ] `python3 --version` returns Python 3.8+
- [ ] `numpy` and `scipy` install without errors
- [ ] `curl --version` returns a version number
- [ ] Gates 5 and 6 skipped (no file changes in this task)

---

### Task 0.1 — Authenticate Netlify CLI and verify project link
**Goal:** Confirm the Netlify CLI is authenticated and linked to the correct project before any build or deploy commands are run. This must be done once before any other task.

**Commands:**
```bash
netlify login         # opens browser — authenticate with your Netlify account
netlify status        # must show: "Linked to stephenjdunn (ID: 652f6ca1-b6b3-47bb-8628-b7ed2f80e4b0)"
```

If `netlify status` shows the wrong project or "Not linked":
```bash
netlify link          # follow prompts to link to stephenjdunn project
netlify status        # verify again
```

**Acceptance criteria:**
- [ ] `netlify status` shows the correct project name and ID
- [ ] `netlify build` runs without auth errors (build will fail on missing deps — that's fine at this stage)

---

### Task 0.2 — Initialize Next.js project
**Goal:** Fresh Next.js app with TypeScript, Tailwind, and all base dependencies installed.

**Commands:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npm install zustand @next/mdx fuse.js framer-motion
npm install -D @netlify/plugin-nextjs
```

**Verify Framer Motion installed correctly:**
```bash
npm list framer-motion   # must show a version number
npx tsc --noEmit         # must pass with zero errors
```

**Files to create/modify:**
- `next.config.ts` — add MDX config (see ARCHITECTURE.md §15)
- `netlify.toml` — add build config (see ARCHITECTURE.md §14)
- `tailwind.config.ts` — extend with Chicago/Charcoal font families (see ARCHITECTURE.md §10)
- `app/globals.css` — add `@font-face` declarations (font files added in Task 0.3)
- `tsconfig.json` — confirm `strict: true`

**Acceptance criteria:**
- [ ] `npm run build` passes
- [ ] `npm run dev` serves a page at localhost:3000
- [ ] TypeScript strict mode on, zero type errors
- [ ] Framer Motion resolves without type errors
- [ ] `netlify build` passes locally

**Verification:** Run Gates 1–5 from AGENTS.md §6. Push to `staging` — Netlify will auto-deploy. For Gate 6, run `netlify open` and confirm the staging deploy loads (even if blank). Do not deploy to production.

---

### Task 0.3 — Download and install font files
**Goal:** Download Chicago and Charcoal woff2 files from their CDN URLs and self-host them in `public/fonts/`. This avoids a third-party CDN dependency at runtime.

**Download commands:**
```bash
mkdir -p public/fonts

# Chicago
curl -L "https://db.onlinewebfonts.com/t/53dc764fd0dbbb3140b7909afd437722.woff2" \
  -o public/fonts/chicago.woff2

# Charcoal (source font is named "Charcoal CY" — we normalize to "Charcoal" in CSS)
curl -L "https://db.onlinewebfonts.com/t/2727dfea67d52833ce5e2268f9747d4a.woff2" \
  -o public/fonts/charcoal.woff2
```

**Verify downloads succeeded (files should be > 10kb):**
```bash
ls -lh public/fonts/
```

**`@font-face` declarations in `app/globals.css`** (already specified in ARCHITECTURE.md §10 — use exactly this, not the CDN `@import`):
```css
@font-face {
  font-family: 'Chicago';
  src: url('/fonts/chicago.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'Charcoal';
  src: url('/fonts/charcoal.woff2') format('woff2');
  font-display: swap;
}
```

**Note on font-family name:** The source font declares itself as "Charcoal CY" but we declare it as "Charcoal" in `@font-face`. This is intentional — we control the name since we're self-hosting the file. The Tailwind config and all component classes reference `'Charcoal'`, not `'Charcoal CY'`.

**If the curl download fails** (CDN URL changes or returns an error), fall back to system fonts and add a comment:
```css
/* TODO: font file unavailable — replace public/fonts/charcoal.woff2 when sourced */
@font-face {
  font-family: 'Charcoal';
  src: local('system-ui');
  font-display: swap;
}
```
Do not block the rest of the build on fonts — system fallbacks render fine during development.

**Acceptance criteria:**
- [ ] `public/fonts/chicago.woff2` and `public/fonts/charcoal.woff2` exist and are > 10kb each
- [ ] `@font-face` declarations in `globals.css` use local `/fonts/` paths (not CDN `@import`)
- [ ] `npm run build` passes
- [ ] Chicago font renders in menu bar; Charcoal font renders in body text
- [ ] No 404s for font files in browser console

---

### Task 0.4 — Generate sound files programmatically
**Goal:** Generate all 6 OS9-style sound files using a Python script and place them in `public/sounds/`. See `specs/sounds.md` for the full script.

**Step 1 — Create and run the sound generation script:**
```bash
mkdir -p public/sounds
python3 scripts/generate-sounds.py
```

Create `scripts/generate-sounds.py` with the content from `specs/sounds.md`. The script synthesizes each sound using `numpy`/`scipy` and outputs MP3 files directly to `public/sounds/`.

**Step 2 — Verify output:**
```bash
ls -lh public/sounds/
# Must show 6 files, each > 1kb:
# alert.mp3  boot.mp3  click.mp3  close.mp3  error.mp3  open.mp3
```

**Step 3 — Quick audio sanity check (optional but recommended):**
```bash
ffplay public/sounds/boot.mp3 -nodisp -autoexit 2>/dev/null || echo "ffplay not available — verify files in browser"
```

**Acceptance criteria:**
- [ ] `scripts/generate-sounds.py` exists in the repo
- [ ] All 6 `.mp3` files exist in `public/sounds/` and are > 1kb
- [ ] `npm run build` passes
- [ ] No 404 errors in browser console for sound files
- [ ] Sounds are audible when tested in the browser (may require clicking to unblock autoplay)

---

### Task 0.5 — Create stub MDX content for all 8 projects
**Goal:** Each project folder exists with an `index.mdx` file containing real frontmatter and lorem ipsum body text. This unblocks Finder, Sherlock, and the search index. Stephen will rewrite the content before launch.

**Create these files:**

```
content/projects/vocabmonster/index.mdx
content/projects/numista-notion-mcp/index.mdx
content/projects/star-wars-ascii/index.mdx
content/projects/blueshift-mcp-ts/index.mdx
content/projects/ios-gomoku/index.mdx
content/projects/spotify-wrapped/index.mdx
content/projects/email-sig-generator/index.mdx
content/projects/this-portfolio/index.mdx
```

**Template for each file** (replace slug, title, description, year, tags, github, live per project):

```mdx
---
title: "VocabMonster"
description: "A vocabulary learning app with spaced repetition and gamified review sessions."
year: 2024
tags: ["React", "TypeScript", "Node.js", "PostgreSQL"]
github: "https://github.com/dunn-stephen/vocabmonster"
live: "https://vocabmonster.app"
icon: "/icons/projects/vocabmonster.png"
---

## Overview

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## The Problem

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

## The Solution

Sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Stack

Built with **React**, **TypeScript**, and **Node.js**. Lorem ipsum dolor sit amet.

## What I Learned

Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
```

**Per-project frontmatter values:**

| Slug | Title | Year | Tags | GitHub | Live |
|---|---|---|---|---|---|
| vocabmonster | VocabMonster | 2024 | React, TypeScript, Node.js | dunn-stephen/vocabmonster | vocabmonster.app |
| numista-notion-mcp | Numista → Notion MCP | 2025 | MCP, TypeScript, Notion API | dunn-stephen/numista-notion-mcp | — |
| star-wars-ascii | Star Wars ASCII | 2023 | JavaScript, Canvas, ASCII | dunn-stephen/star-wars-ascii | — |
| blueshift-mcp-ts | Blueshift MCP (TS) | 2025 | TypeScript, MCP, Blueshift | dunn-stephen/blueshift-mcp-ts | — |
| ios-gomoku | iOS Gomoku | 2022 | Swift, iOS, UIKit | dunn-stephen/ios-gomoku | — |
| spotify-wrapped | Spotify Wrapped | 2023 | React, Spotify API, TypeScript | dunn-stephen/spotify-wrapped | — |
| email-sig-generator | Email Sig Generator | 2024 | React, HTML, CSS | dunn-stephen/email-sig-generator | — |
| this-portfolio | stephenjdunn.com | 2025 | Next.js, TypeScript, Tailwind | dunn-stephen/stephenjdunn | stephenjdunn.com |

**Acceptance criteria:**
- [ ] All 8 `index.mdx` files exist with valid frontmatter
- [ ] `npm run build` passes (MDX compiles without errors)
- [ ] `getAllProjects()` (once implemented in Task 0.6) returns 8 projects

---

### Task 0.6 — Scaffold types, lib modules, and asset folders
**Goal:** All type definitions, empty lib modules, and public asset folders exist so import paths don't break during development.

**Files to create:**
```
types/
  index.ts         ← AppId, AppDefinition, AppProps, WindowState, SoundId (see ARCHITECTURE.md §2)

lib/
  window-store.ts  ← full Zustand store (see ARCHITECTURE.md §2 and specs/window-manager.md)
  projects.ts      ← getAllProjects() and getProject() (see ARCHITECTURE.md §8)
  app-registry.ts  ← AppDefinition for all 9 apps (see ARCHITECTURE.md §2 — app sizes table)
  sound.ts         ← SoundStore stub (implement fully in Task 1.4)
  search.ts        ← buildSearchIndex() and search() stubs (implement fully in Task 4.6)
  utils.ts         ← export {} for now

hooks/
  useSound.ts      ← stub
  useMediaQuery.ts ← full implementation (see ARCHITECTURE.md §11)

public/
  icons/           ← populated by icon download commands below
  wallpapers/      ← at least one OS9 platinum wallpaper (solid #C0C0C0 acceptable as placeholder)
```

**Icon asset download — run these commands to populate `public/icons/`:**
```bash
mkdir -p public/icons

# Clone bearz314/MacOS9-icons (primary source — MIT licensed)
git clone --depth=1 https://github.com/bearz314/MacOS9-icons.git /tmp/macos9-icons

# Copy all PNG icons into public/icons/
# The repo organizes icons by category — copy everything and organize later
cp -r /tmp/macos9-icons/* public/icons/ 2>/dev/null || true

# Clean up
rm -rf /tmp/macos9-icons

# Verify icons landed
ls public/icons/ | head -20
echo "Total icon files: $(find public/icons -name '*.png' | wc -l)"
```

If the repo structure is nested (e.g., `icons/64px/`, `icons/512px/`), preserve that structure — the app references icons by path, so consistency matters. After copying, check that `.png` files exist at usable paths before proceeding.

If the bearz314 repo is unavailable, halt and report using the format in AGENTS.md §7.

**Acceptance criteria:**
- [ ] All folders exist
- [ ] `types/index.ts` exports all types with no errors
- [ ] `lib/projects.ts` exports `getAllProjects()` and reads `content/projects/` — returns 8 projects
- [ ] `lib/app-registry.ts` has all 9 app definitions with correct sizes from ARCHITECTURE.md
- [ ] `hooks/useMediaQuery.ts` is fully implemented (not a stub)
- [ ] `npm run build` still passes

---

## Phase 1 — Shell (Sequential)
*The desktop exists. Nothing opens yet.*

### Task 1.1 — Desktop shell + wallpaper
**Goal:** Full-viewport gray OS9 desktop. No icons, no menubar yet.

**Files:**
- `components/desktop/Desktop.tsx` — full viewport wrapper, uses `useMediaQuery` to gate mobile
- `components/desktop/Wallpaper.tsx` — background fill (#C0C0C0 platinum, or tiled texture image)
- `app/page.tsx` — renders `<Desktop>`, passes `projects` prop (from `getAllProjects()`)

**Acceptance criteria:**
- [ ] Full viewport covered, no scrollbars on body
- [ ] Wallpaper renders (solid color or image)
- [ ] No console errors
- [ ] `useMediaQuery` check is wired (renders `<MobileFallback>` placeholder at ≤768px)

---

### Task 1.2 — Menu bar
**Goal:** Fixed top bar, always on top, shows Apple logo and app name.

**Files:**
- `components/desktop/MenuBar.tsx`
- `components/desktop/AppleMenu.tsx` — dropdown with: About This Computer (opens About dialog), Sound (toggle), ─── (divider), Shut Down
- `components/desktop/AppMenu.tsx` — placeholder "Finder" for now; updates once window focus works

**Acceptance criteria:**
- [ ] Menu bar sticks to top of viewport at z-index 9999
- [ ] Apple menu opens/closes on click
- [ ] Clicking outside Apple menu closes it
- [ ] Sound toggle is present (wired up in Task 1.4)
- [ ] About This Computer opens About dialog (implement About component now or stub with console.log)
- [ ] Correct OS9 font and styling

---

### Task 1.3 — Desktop icons grid
**Goal:** App icons appear on the desktop. Double-click does nothing yet (wired in Phase 2).

**Files:**
- `components/desktop/DesktopIcons.tsx`
- `components/desktop/DesktopIcon.tsx` — draggable, saves position to `localStorage`

**Icons to display at launch (10–11 total):**
- Trash (visual only)
- Read Me (TextEdit)
- Resume (SimpleText)
- Mail
- Space Invaders
- Projects (Finder)
- Note 1, Note 2, Note 3, Note 4 (Note Pad, each with `props.noteId`)

**Do NOT add "About This Computer" as a desktop icon.** About opens from the Apple menu only.

**Acceptance criteria:**
- [ ] All icons render with labels beneath them
- [ ] Correct OS9 icon images from `/public/icons/`
- [ ] Icons are draggable (position persists to `localStorage` key `desktop-icon-positions`)
- [ ] Double-click event handler exists (logs to console, no window opens yet)

---

### Task 1.4 — Sound system
**Goal:** Sound plays on UI interactions. Respects browser autoplay policy.

**Files:**
- `lib/sound.ts` — full Zustand store + AudioContext logic
- `hooks/useSound.ts`
- Verify `public/sounds/` — all 6 sound files present (placeholders acceptable)

**Logic:**
1. On first click anywhere on the page, attempt `new AudioContext()`
2. If allowed → set `enabled = true`, begin playing sounds on UI events
3. If browser blocks → set `enabled = false`, remain silent
4. Apple menu "Sound" toggle overrides user preference to localStorage key `sound-enabled`
5. Subtle muted-speaker icon visible in menu bar when sound is off

**Acceptance criteria:**
- [ ] Click sound plays on icon single-click (if browser allows)
- [ ] Sound toggle in Apple menu correctly enables/disables
- [ ] Sound preference persists to `localStorage`
- [ ] No console errors when audio is blocked

---

### Task 1.5 — Mobile fallback
**Goal:** Mobile visitors see Sad Mac after boot, not a broken desktop.

**Files:**
- `components/desktop/MobileFallback.tsx`

**Content:**
- Sad Mac icon (centered, ~128px)
- "stephenjdunn.com"
- "This experience is designed for desktop. Come back on a real computer."
- GitHub link, LinkedIn link
- Links to all 8 project URLs (useful for recruiters on mobile)

**Acceptance criteria:**
- [ ] Renders correctly at 375px viewport width
- [ ] Desktop renders correctly at 1024px
- [ ] Transition between breakpoints doesn't flash

---

## Phase 2 — Window Manager (Sequential)
*Windows exist and behave correctly. No apps yet.*

### Task 2.1 — Window store
**Goal:** Zustand store for all window state.

**Files:**
- `lib/window-store.ts` — full store implementation per ARCHITECTURE.md §2

**Acceptance criteria:**
- [ ] All store actions work: `openWindow`, `closeWindow`, `minimizeWindow`, `maximizeWindow`, `restoreWindow`, `focusWindow`, `shadeWindow`, `moveWindow`, `resizeWindow`
- [ ] `shadeWindow` toggles `isShaded`, stores/restores `preShadeHeight`
- [ ] zIndex increments correctly on focus
- [ ] Singleton enforcement: calling `openWindow` for a singleton app that's already open focuses it instead of opening a second instance
- [ ] Full TypeScript coverage, zero errors

---

### Task 2.2 — WindowFrame component
**Goal:** A working window shell. Draggable, resizable, closeable, with windowshade.

**Files:**
- `components/windows/WindowFrame.tsx`
- `components/windows/TitleBar.tsx`
- `components/windows/WindowManager.tsx` — renders all open windows from store, wrapped in `<AnimatePresence>`

**Behavior:**
- Drag via TitleBar (see `specs/window-manager.md`)
- Resize via bottom-right 8px handle (hidden for apps with `resizable: false`)
- Close button → `closeWindow`, plays `close` sound
- Minimize button → `minimizeWindow` (window disappears; no taskbar — minimized windows are just hidden)
- Zoom button → `maximizeWindow` / `restoreWindow` toggle
- **Double-click TitleBar → `shadeWindow`** — content area collapses/expands with Framer Motion height animation
- Click anywhere on window → `focusWindow`
- Focused window has active TitleBar style; unfocused has inactive style
- Open animation: `scale: 0.85 → 1, opacity: 0 → 1` via Framer Motion (150ms)
- Close animation: `scale: 1 → 0.85, opacity: 1 → 0` via Framer Motion (100ms)

**Windowshade implementation:**
```typescript
// In WindowFrame, wrap content area in AnimatePresence + motion.div:
<AnimatePresence initial={false}>
  {!window.isShaded && (
    <motion.div
      key="content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: window.size.height - TITLEBAR_HEIGHT, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{ overflow: 'hidden' }}
    >
      <AppContent window={window} />
    </motion.div>
  )}
</AnimatePresence>
```

**Acceptance criteria:**
- [ ] Window can be dragged anywhere within viewport; cannot go behind menu bar
- [ ] Window can be resized from bottom-right corner, respects `minSize`
- [ ] Resize handle does not render for apps with `resizable: false`
- [ ] Close removes window from DOM with exit animation
- [ ] Z-index stacking is correct (last clicked is always on top)
- [ ] Active/inactive TitleBar states render correctly
- [ ] Double-click TitleBar collapses content area; double-click again expands it
- [ ] Windowshade animation is smooth
- [ ] Window open/close animations play via Framer Motion
- [ ] Pixel-faithful OS9 window chrome styling

---

### Task 2.3 — Wire desktop icons to window manager
**Goal:** Double-clicking a desktop icon opens a window.

**Modify:**
- `components/desktop/DesktopIcon.tsx` — `onDoubleClick` → `openWindow(appId, props)`
- `app/page.tsx` — render `<WindowManager>` inside `<Desktop>`

**Note Pad icons:** each Note Pad desktop icon passes a different `props.noteId` (1–4) to `openWindow('notepad', { noteId: 1 })`.

**Acceptance criteria:**
- [ ] Double-clicking any icon opens a window
- [ ] Window title matches app name
- [ ] Singleton apps only open one window (second double-click focuses existing window)
- [ ] Note Pad icons each open a separate Note Pad window with distinct `noteId`
- [ ] App menu in MenuBar updates to reflect focused window's app name

---

## Phase 3 — Boot Sequence (Sequential)
*The site has a proper entrance. Build this after Phase 2 so the desktop it boots into is real.*

### Task 3.1 — Boot sequence animation
**Goal:** OS9-style boot on page load, skippable, once per session.

**Files:**
- `components/desktop/BootSequence.tsx`

**Sequence:**
1. Full-screen gray background (covers full viewport)
2. Happy Mac icon fades in (center, Framer Motion opacity)
3. Progress bar fills across bottom (~3 seconds, CSS animation)
4. Boot chime plays (via sound system, graceful silent fallback)
5. "Welcome to Mac OS 9" text fades in briefly
6. Crossfade to desktop (Framer Motion opacity transition on `<BootSequence>` exit)
7. `<BootSequence>` unmounts, desktop icons stagger-animate in

**Session handling:**
```typescript
// In Desktop.tsx or BootSequence.tsx
const hasBooted = sessionStorage.getItem('has-booted')
if (hasBooted) skip to desktop immediately
// On boot complete: sessionStorage.setItem('has-booted', '1')
```

**Skippable:** `onClick` on `<BootSequence>` → immediately complete boot and show desktop.

**Mobile:** `<BootSequence>` still plays on mobile, then transitions to `<MobileFallback>` instead of the desktop.

**Acceptance criteria:**
- [ ] Full sequence plays on first load
- [ ] Crossfade to desktop is smooth (Framer Motion)
- [ ] Boot chime plays when audio allowed, silent when not
- [ ] Clicking during boot skips to desktop immediately
- [ ] Does not re-run on page refresh within the same session
- [ ] Stagger animation on desktop icons after boot

---

## Phase 4 — Apps (Can parallelize after Phase 2 & 3 complete)

*Each app is a self-contained subagent task. All apps receive `windowId: string` and `props?: Record<string, unknown>` as props. Read `specs/apps.md` for full detail on each app.*

---

### Task 4.1 — Finder
See `specs/finder.md` for full detail.

**Pre-requisite:** `lib/projects.ts` must be complete (done in Task 0.6).

**Summary:**
- Left panel: folder tree (8 project folders)
- Right panel: icon grid of files + preview pane
- Each project folder contains `index.mdx` + optional extras
- Click file → preview; double-click `.mdx` → opens TextEdit

**Acceptance criteria:**
- [ ] All 8 project folders visible in left panel
- [ ] Navigate into folder → see its files
- [ ] Click file → preview appears in right panel
- [ ] Double-click `index.mdx` → opens TextEdit window with content
- [ ] Breadcrumb nav and status bar update correctly
- [ ] Resizable; both panels reflow

---

### Task 4.2 — TextEdit
**Files:** `components/apps/textedit/TextEdit.tsx`

**Accepts:** `props.content` (MDX string), `props.title` (filename)

**Acceptance criteria:**
- [ ] Renders MDX with correct typography (headings, paragraphs, lists, code blocks)
- [ ] Scrollable
- [ ] White background, document-window aesthetic

---

### Task 4.3 — SimpleText (Resume)
**Files:** `components/apps/simpletext/SimpleText.tsx`

**Content:** Placeholder resume — see `specs/apps.md` for the full placeholder text. Stephen will rewrite before launch.

**Acceptance criteria:**
- [ ] "View on LinkedIn" button opens `https://www.linkedin.com/in/dunn-stephen` in new tab
- [ ] Monospace font, document layout
- [ ] Scrollable

---

### Task 4.4 — Mail
**Files:**
- `components/apps/mail/Mail.tsx`

**Flow:** Classic Mac compose-window styling with:
- a pre-filled `To:` field showing `stephendunn2424@gmail.com`
- one OS9-style button: `Open in Mail`
- clicking the button opens the visitor's default email client via `mailto:stephendunn2424@gmail.com?subject=Hello from stephenjdunn.com`

**Acceptance criteria:**
- [ ] Window renders with Classic Mac compose styling
- [ ] `To:` field is pre-filled with `stephendunn2424@gmail.com`
- [ ] `Open in Mail` button opens `mailto:stephendunn2424@gmail.com?subject=Hello from stephenjdunn.com`
- [ ] No API route, no Resend dependency, no environment variables required

---

### Task 4.5 — Space Invaders
**Files:** `components/apps/space-invaders/` (multiple files)

**Acceptance criteria:**
- [ ] Game renders in canvas inside the window
- [ ] Arrow keys move player, Space fires
- [ ] Enemies move, descend, and fire back
- [ ] Score tracked and displayed
- [ ] Enemy movement speeds up as enemies are killed
- [ ] Game over state shown with final score
- [ ] 'R' key or on-screen button restarts game
- [ ] Canvas resizes when window is resized
- [ ] Sound effects (shoot, explode) respect global mute

---

### Task 4.6 — Sherlock
**Files:**
- `components/apps/sherlock/Sherlock.tsx`
- `lib/search.ts` — Fuse.js index (complete the stub from Task 0.6)

**Pre-requisite:** All 8 MDX stubs from Task 0.5 must exist.

**Acceptance criteria:**
- [ ] Search returns results across all 8 projects
- [ ] Results show project name + matching excerpt
- [ ] Clicking a result opens Finder navigated to that project
- [ ] Empty query shows all 8 projects
- [ ] No-results state renders
- [ ] Search input is autofocused when window opens

---

### Task 4.7 — Note Pad
**Files:** `components/apps/notepad/NotePad.tsx`

**Architecture:** Multiple notes, each with its own desktop icon. Each Note Pad window receives `props.noteId` (1–4). A static config file defines the pre-populated content for each note ID.

**Create:** `lib/notes-config.ts` — maps noteId → title and default content:
```typescript
export const NOTES: Record<number, { title: string; content: string }> = {
  1: { title: 'Note 1', content: '📝 [Stephen: replace with hot take / fun fact]' },
  2: { title: 'Note 2', content: '📝 [Stephen: replace with hot take / fun fact]' },
  3: { title: 'Note 3', content: '📝 [Stephen: replace with hot take / fun fact]' },
  4: { title: 'Note 4', content: '📝 [Stephen: replace with hot take / fun fact]' },
}
```

**Behavior:**
- On open, load content from `NOTES[props.noteId].content` into textarea
- Visitor can type and edit freely in-session
- **Nothing persists** — no localStorage, no state sharing between windows
- On close and reopen, note resets to the original pre-populated content

**Acceptance criteria:**
- [ ] Each Note Pad icon opens a distinct Note Pad window with its pre-populated content
- [ ] Visitor can type freely in the textarea
- [ ] Closing and reopening a note resets it to original content
- [ ] Yellow legal pad aesthetic
- [ ] No localStorage writes

---

### Task 4.8 — Calculator
**Files:** `components/apps/calculator/Calculator.tsx`

**Operations:** +, -, ×, ÷, =, C (clear), ± (toggle sign), % (percent)

**Acceptance criteria:**
- [ ] All operations compute correctly
- [ ] Divide by zero shows "Error"
- [ ] C clears display and resets state
- [ ] Chained operations work (5 + 3 = 8, then × 2 = 16)
- [ ] Decimal input works
- [ ] Fixed window size — resize handle does not render
- [ ] Pixel-faithful OS9 calculator aesthetic

---

### Task 4.9 — About This Computer
**Files:** `components/apps/about/About.tsx`

**Renders as:** centered dialog, fixed 360×280px, not resizable. **Opened from Apple menu only — not a desktop icon.**

**Content:**
- Happy Mac icon (64px)
- "Mac OS 9.2.2" + "© Apple Computer, Inc."
- "Built-in Memory: 256 MB" + "Virtual Memory: Off"
- "Stephen Dunn — Software Engineer"
- Tech stack: Next.js, TypeScript, Tailwind, Zustand, Framer Motion, MDX
- Icons: bearz314/MacOS9-icons (MIT)

**Easter egg hook:** clicking the Happy Mac icon 5× triggers the easter egg from Task 5.1.

**Acceptance criteria:**
- [ ] Dialog is centered on screen
- [ ] Fixed size, not resizable, no resize handle
- [ ] All content renders correctly
- [ ] Close button works
- [ ] Happy Mac click counter is wired (5 clicks → triggers easter egg)

---

## Phase 5 — Polish & Easter Eggs

### Task 5.1 — Easter eggs (3–5)
Plan and implement 3–5 discoverable easter eggs. Suggestions (choose 3–5):

1. **Konami code** on the desktop → plays the boot chime and bounces all open windows
2. **Click the Happy Mac icon 5×** in About This Computer → dialog shows a hidden message
3. **Calculator inputs 1337, 80085** → display shows a text joke
4. **Open all 9 apps simultaneously** → a special desktop notification appears briefly
5. **Type "hello"** with any window focused → Note Pad opens with a pre-written welcome message

Add `EASTER_EGGS.md` to repo documenting each egg and how to trigger it.

**Acceptance criteria:**
- [ ] 3–5 easter eggs implemented and discoverable
- [ ] None break normal app functionality
- [ ] `EASTER_EGGS.md` documents all of them with trigger instructions

---

### Task 5.2 — Final polish pass
**Goal:** Pixel-perfect OS9 aesthetic throughout.

Checklist:
- [ ] All windows use consistent chrome (border, shadow, TitleBar height of 28px)
- [ ] All icons are correct size (64px on desktop, correctly scaled in Finder)
- [ ] Fonts render correctly in all apps (Chicago for UI chrome, Charcoal for body)
- [ ] Sound plays on: window open, window close, button clicks, error dialogs
- [ ] Menu bar app name updates on every window focus change
- [ ] No layout jank on window drag, resize, or windowshade
- [ ] Consistent cursor styles (pointer on interactive elements, resize cursor on handle)
- [ ] Boot sequence timing feels right — not too long, not rushed

---

## Phase 6 — Final Verification & Ship

### Task 6.1 — Full project Definition of Done audit
Run through every item in AGENTS.md §10. Every box must be checked before proceeding to 6.2.

### Task 6.2 — Cross-browser test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
Test the full user journey in each browser: boot → desktop → open all 9 apps → launch Mail → search → mobile viewport.

### Task 6.3 — Performance check
```bash
npm run build
```
Check build output for bundle sizes. No single chunk should exceed 500kb. Verify lazy-loading is working for app components (`next/dynamic`).

### Task 6.4 — Promote staging → production

All prior tasks have been verified on staging. This task merges staging into main, triggering the production deploy.

**Step 1 — Ensure staging is clean and fully up to date:**
```bash
git checkout staging
git status              # must be clean
git push origin staging # ensure all commits are pushed
```

**Step 2 — Open a PR on GitHub and merge staging → main:**
```
https://github.com/dunn-stephen/stephenjdunn/compare/main...staging
```
Title: `Release: stephenjdunn.com v1`
Merge when ready. Netlify will automatically deploy `main` to production (https://www.stephenjdunn.com).

**Step 3 — Wait for production deploy, then verify:**
```bash
netlify open            # opens the production site
```
Walk through the full user journey on the live production URL:
1. Boot sequence plays
2. Desktop loads with all icons
3. Open each of the 9 apps
4. Open the Mail app and verify the `mailto:` launcher
5. Search via Sherlock
6. Trigger at least one easter egg
7. Mobile viewport shows boot + Sad Mac

**⚠️ This is the only time `main` is ever touched. Do not push to `main` directly — only via PR merge.**

**Ship when all 6.1–6.4 tasks pass. Not before.**
