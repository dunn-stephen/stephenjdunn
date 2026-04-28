# AGENTS.md — Codex Master Operating Manual
# Project: stephenjdunn.com
# Read this file before doing anything else. Every subagent inherits these rules.

---

## 1. Project Overview

You are building **stephenjdunn.com** — a pixel-faithful macOS 9 desktop environment that serves as a personal developer portfolio. It runs in the browser. Visitors interact with it like a real OS: they boot it, open apps, drag windows, and discover content.

- **Live site:** https://www.stephenjdunn.com
- **Repo:** https://github.com/dunn-stephen/stephenjdunn
- **Netlify project:** stephenjdunn (ID: 652f6ca1-b6b3-47bb-8628-b7ed2f80e4b0)
- **Netlify admin:** https://app.netlify.com/projects/stephenjdunn

---

## 2. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (latest stable) — App Router |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Content | MDX (via `@next/mdx`) |
| State | Zustand |
| Animation | Framer Motion (window open/close scale, desktop icon stagger, boot crossfade) |
| Search | Fuse.js |
| Email | Resend |
| Fonts | Chicago/Charcoal-style web fonts, lazy-loaded |
| Icons | bearz314/MacOS9-icons (primary), Slimes set (secondary) |
| Deployment | Netlify |
| Package manager | npm |

**No UI component libraries.** No Radix, no shadcn, no MUI. Every component is custom-built.
**No analytics.** Don't add any tracking scripts.

### Framer Motion — install check
Before using Framer Motion, verify it is installed:
```bash
npm list framer-motion
```
If not listed, install it:
```bash
npm install framer-motion
```
Verify installation passes type-check before proceeding:
```bash
npx tsc --noEmit
```

---

## 3. File & Folder Conventions

```
stephenjdunn/
├── AGENTS.md               ← you are here
├── PRD.md
├── ARCHITECTURE.md
├── BUILD_PLAN.md
├── EASTER_EGGS.md          ← created in Phase 5
├── specs/                  ← per-feature deep-dive specs
│   ├── window-manager.md
│   ├── finder.md
│   ├── apps.md
│   ├── sounds.md           ← sound sourcing instructions
│   └── ...
├── app/                    ← Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            ← renders the desktop shell (desktop + mobile detection)
│   └── api/
│       └── contact/
│           └── route.ts    ← Resend mail endpoint
├── components/
│   ├── desktop/            ← Desktop, Menubar, Icons, Wallpaper, BootSequence, MobileFallback
│   ├── windows/            ← WindowFrame, WindowManager, TitleBar
│   ├── apps/               ← one folder per app
│   │   ├── finder/
│   │   ├── textedit/
│   │   ├── simpletext/
│   │   ├── mail/
│   │   ├── space-invaders/
│   │   ├── sherlock/
│   │   ├── notepad/
│   │   ├── calculator/
│   │   └── about/
│   └── ui/                 ← shared primitives (Button, Dialog, ScrollArea)
├── content/
│   └── projects/           ← one folder per project
│       ├── vocabmonster/
│       │   ├── index.mdx
│       │   └── screenshots/
│       ├── numista-notion-mcp/
│       ├── star-wars-ascii/
│       ├── blueshift-mcp-ts/
│       ├── ios-gomoku/
│       ├── spotify-wrapped/
│       ├── email-sig-generator/
│       └── this-portfolio/
├── public/
│   ├── icons/              ← OS9 icons (PNG, 64px and 512px)
│   ├── fonts/              ← Chicago.woff2, Charcoal.woff2
│   ├── sounds/             ← boot.mp3, click.mp3, open.mp3, close.mp3, error.mp3, alert.mp3
│   └── wallpapers/         ← OS9 desktop pattern(s)
├── lib/
│   ├── window-store.ts     ← Zustand window state
│   ├── projects.ts         ← MDX project loader (getAllProjects, getProject)
│   ├── sound.ts            ← sound system + Zustand store
│   ├── search.ts           ← Fuse.js search index builder
│   ├── app-registry.ts     ← AppDefinition registry (all 9 apps)
│   └── utils.ts
├── hooks/
│   ├── useSound.ts
│   └── useMediaQuery.ts    ← custom hook for responsive detection
├── types/
│   └── index.ts
├── netlify.toml
└── next.config.ts
```

**Naming rules:**
- Components: PascalCase (`WindowFrame.tsx`)
- Files/folders: kebab-case (`window-manager.md`)
- Hooks: camelCase prefixed with `use` (`useSound.ts`)
- Types: PascalCase interfaces (`WindowState`)
- CSS classes: Tailwind utility classes only, no custom CSS files except for font-face declarations in `app/globals.css`

---

## 4. TypeScript Rules

- `strict: true` in `tsconfig.json` — no exceptions
- No `any` types. Use `unknown` and narrow if truly needed.
- All props must be typed with interfaces, not inline types
- All Zustand store slices must be fully typed
- Run `npx tsc --noEmit` before every commit — must pass with zero errors

---

## 5. Tools Available to You

### npm scripts
```bash
npm run dev          # start local dev server (port 3000)
npm run build        # production build — MUST pass before deploy
npm run lint         # ESLint — must pass with zero errors
npm run type-check   # tsc --noEmit — must pass with zero errors
```

### Git
```bash
git status
git add -A
git commit -m "descriptive message"
git push origin main
```

Commit message format: `[scope] short description`
Examples:
- `[window-manager] add drag and resize logic`
- `[finder] render project folder hierarchy`
- `[boot] add startup chime with autoplay fallback`

### Netlify CLI

**First-time setup (run once, verify before proceeding):**
```bash
netlify login         # opens browser for authentication — must complete before any deploy
netlify status        # confirms auth + confirms project is linked to stephenjdunn
```
If `netlify status` does not show the correct project, run:
```bash
netlify link          # link local repo to the Netlify project
```

**Per-task commands:**
```bash
netlify build                     # run Netlify build locally
netlify deploy --prod             # deploy to production
netlify open                      # open live site in browser
```

Always run `npm run build` before `netlify deploy --prod`. Never deploy a broken build.

---

## 6. Verification Gates

**Every task must pass all gates before moving to the next task.**

### Gate 1 — Type check
```bash
npx tsc --noEmit
```
Must exit with code 0. Zero type errors.

### Gate 2 — Lint
```bash
npm run lint
```
Must exit with code 0. Zero lint errors.

### Gate 3 — Build
```bash
npm run build
```
Must exit with code 0. A failed build never gets deployed.

### Gate 4 — Visual check
```bash
npm run dev
```
Open http://localhost:3000. Manually verify the feature you just built works as described in the task's acceptance criteria. Check browser console — zero errors, zero unhandled warnings.

### Gate 5 — Commit & push
```bash
git add -A
git commit -m "[scope] description"
git push origin main
```

### Gate 6 — Deploy & verify live
```bash
netlify deploy --prod
netlify open
```
Confirm the feature works on the live URL (https://www.stephenjdunn.com). Check on both desktop and mobile viewport sizes.

---

## 7. When to Halt

**Stop immediately and surface the issue (do not guess or work around it) if:**

- A verification gate fails and you cannot fix it within 2 attempts
- A required file, dependency, or asset is missing and you cannot source it
- A task's acceptance criteria are ambiguous or contradictory
- Two subagents have made conflicting changes to the same file
- A `netlify deploy --prod` results in a broken live site

When halting, output:
```
🛑 HALT
Task: [task name]
Gate failed: [which gate]
Error: [exact error message]
Attempted fix: [what you tried]
Needs: [what's required to unblock]
```

---

## 8. Subagent Rules

### Spawning subagents
Codex may delegate work to subagents. Each subagent:
- Receives a copy of `AGENTS.md` (this file) as its operating context
- Receives the relevant feature spec from `specs/`
- Owns a clearly scoped set of files — no two subagents touch the same file simultaneously
- Must pass all 6 verification gates before reporting back

### Safe to parallelize
These systems have no shared file dependencies and can be built simultaneously:
- Shell Agent (desktop, wallpaper, menubar) — owns `components/desktop/`
- Infra Agent (Netlify config, Next.js config, font loading, sound system) — owns `netlify.toml`, `next.config.ts`, `lib/sound.ts`, `public/fonts/`, `public/sounds/`

### Must be sequential
- **Window Manager** must be complete before any App Agent starts
- **`lib/projects.ts`** must be complete before Finder or Sherlock start
- **Finder** must be complete before project content is wired in
- **All apps** must be complete before the boot sequence is finalized (boot transitions into a working desktop)

### Merge discipline
- Each subagent works on a feature branch: `git checkout -b feature/[scope]`
- Branch merges to `main` only after all 6 gates pass
- Never force push to main

---

## 9. Do Not

- Do not install UI component libraries (Radix, shadcn, MUI, Chakra, etc.)
- Do not add analytics or tracking of any kind
- Do not use `any` in TypeScript
- Do not deploy without passing `npm run build`
- Do not commit broken code to main
- Do not create CSS files (use Tailwind classes only, except `@font-face` in `globals.css`)
- Do not skip verification gates, even for "small" changes
- Do not make assumptions about ambiguous requirements — halt and surface them

---

## 10. Definition of Done (Project-level)

The project is shippable when every item below is checked:

- [ ] Boot sequence plays on load (chime if audio allowed, animation always)
- [ ] Desktop renders with wallpaper, menubar, and desktop icons
- [ ] All 9 apps open, are draggable/resizable/windowshade-collapsible, and close correctly
- [ ] Finder shows full project folder hierarchy with MDX content
- [ ] SimpleText shows placeholder resume with LinkedIn button
- [ ] Mail sends via Resend and shows confirmation dialog
- [ ] Space Invaders is playable
- [ ] Sherlock search works across all project content
- [ ] Calculator computes correctly
- [ ] Note Pad shows 3–4 pre-populated notes; visitor-editable, ephemeral (no localStorage)
- [ ] About This Computer dialog renders with fake specs + icon credits (opened from Apple menu)
- [ ] 3–5 easter eggs are hidden and discoverable
- [ ] Sound toggle in Apple menu works
- [ ] Mobile: boot sequence plays, then Sad Mac + links renders correctly
- [ ] Live site passes `npm run build` and deploys cleanly to Netlify
- [ ] Zero TypeScript errors, zero lint errors
- [ ] Tested in Chrome, Firefox, Safari
