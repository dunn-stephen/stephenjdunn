# Product Requirements Document
## stephenjdunn.com — Mac OS 9 Portfolio

**Owner:** Stephen Dunn
**Status:** Final v2.2 (folder structure aligned, Note Pad finalized, Framer Motion confirmed)
**Last updated:** April 28, 2026

---

## 1. Vision

A personal portfolio at stephenjdunn.com built as a faithful, atmospheric recreation of Mac OS 9. The OS metaphor is the portfolio, not a wrapper around one. The goal is to impress people. That's it.

## 2. Goals & Non-Goals

### Goals

- Impress people
- Provide a working contact channel via email
- Showcase 8 personal dev projects as polished case studies (named in section 5.5.1)
- Capture the warmth and texture of Mac OS 9 (platinum gradients, Charcoal/Chicago typography, system sounds, boot sequence)
- Maintainable: adding a new project should take ~10 minutes — drop a new MDX file, push to GitHub, Netlify auto-deploys

### Non-Goals (v1)

- Mobile parity (mobile gets a graceful fallback with the boot sequence, then a Sad Mac splash)
- Blog / writing platform (deferred)
- Drag-to-trash that actually deletes things (Trash icon is visual only)
- Chooser (theme switcher) — deferred to v2
- CMS, database, auth, comments, analytics

## 3. Audience

The site has one job: impress whoever shows up. That includes recruiters, peers, potential clients, and Stephen himself.

## 4. Aesthetic & Tone

**Reference:** Mac OS 9.2.2, the final classic Mac OS. Platinum theme.

**Visual direction:** Lean hard into pixel-perfect. Chunky pixels, no anti-aliasing on chrome, faithful platinum gradients. This is not "OS9-inspired with modern touches" — it's a recreation.

- **Color:** warm grays, beige desktop pattern, blue selection highlight (#3163CE-ish), red close-button accent
- **Typography:** Charcoal for system UI, Chicago for menu bar, Geneva for body text. Web-licensed substitutes (Chicago FLF or equivalent), shipped as lazy-loaded web fonts (~100kb), with system fallbacks during initial paint
- **Window chrome:** pinstripe title bars, drop shadows, scroll bar arrows on both ends
- **Cursor:** browser default (saves licensing concerns and dev time)
- **Sound:** authentic-feeling startup chime, Sosumi alert, click sounds — sourced from Creative Commons / public archives, not Apple's originals (see `specs/sounds.md`)

**Tone of writing:** dry, confident, a little playful. Sounds like Stephen, not a brand.

## 5. Functional Requirements

### 5.1 Boot Experience

On first load per session:

1. Black/gray screen, brief
2. Happy Mac icon fades in (center)
3. Startup chime plays *if browser allows autoplay* (most won't on first visit)
4. Progress bar fills across bottom (~3 seconds)
5. "Welcome to Mac OS 9" splash text appears briefly
6. Desktop fades in (Framer Motion crossfade)

**Skippable:** click anywhere skips the rest of the sequence immediately
**Persistence:** once per session (`sessionStorage` flag); refreshes within the same session skip boot
**Mobile:** boot sequence plays, then transitions to the Sad Mac fallback

### 5.2 Desktop

- Tiled platinum/beige desktop pattern (authentic OS9 default)
- Menu bar at top (see 5.3 for contents)
- Desktop icons (draggable, position persisted to `localStorage`):
  - **Trash** (bottom right, visual only)
  - **Read Me** (TextEdit doc — about Stephen)
  - **Resume** (SimpleText doc)
  - **Mail** (contact form)
  - **Space Invaders** (game launcher)
  - **Projects** (folder, opens Finder window)
  - **Note 1, Note 2, Note 3, Note 4** (one icon each; each opens its own Note Pad window)
- Double-click to open; single-click + Enter for keyboard accessibility
- Selected icon shows highlight rectangle

**Total icon count at launch: ~10–11.** Keep the desktop layout designed, not crowded.

### 5.3 Menu Bar

Always present at top of screen, OS9-style.

**Apple menu** (left):
- About This Computer → opens About dialog (centered, not a desktop window)
- ─
- Sound: On / Off (toggle, persisted to `localStorage`)
- ─
- Shut Down → confirms with "Are you sure?" dialog → on confirm, shows Sad Mac screen with refresh prompt

**Per-app menus** (change based on focused window):
- **Finder:** File > Close
- **TextEdit:** File > Close, Edit > Copy
- **Mail:** File > Send, File > Close, Edit > Copy
- **SimpleText:** File > Close, File > Print (downloads `.txt` or links to LinkedIn), Edit > Copy
- **Sherlock:** File > New Search, File > Close, Edit > Copy
- **Note Pad:** File > Close, Edit > Copy
- **Calculator:** Edit > Copy
- **Space Invaders:** File > New Game, File > Pause, File > Close

Per-app menus stay minimal and functional. No greyed-out filler. Apple menu carries the personality.

### 5.4 Window Manager

Each app opens in a draggable, resizable window with authentic OS9 chrome.

**Window features:**
- Title bar with close box (red), minimize box (yellow), zoom box (green)
- Drag from title bar to move (constrained to viewport; cannot go behind menu bar)
- Resize handle in bottom-right corner (hidden for fixed-size apps)
- Close box dismisses window
- Zoom box toggles maximize
- **Windowshade:** double-click title bar collapses window to title bar only; double-click again expands (signature OS9 behavior)
- Active window has darker pinstripes; inactive windows are dimmed
- Open animation: scale-up + fade in (Framer Motion, ~150ms)
- Close animation: scale-down + fade out (Framer Motion, ~100ms)
- Windowshade animation: height collapse/expand (Framer Motion, ~150ms)

**State (Zustand):**
- Track all open windows: `{ id, appId, position, size, zIndex, isOpen, isMinimized, isMaximized, isShaded, preShadeHeight }`
- Nothing persists across sessions (windows reset on refresh)

**No taskbar, no dock, no application switcher.** Users manage windows directly.

### 5.5 Apps (v1 scope: 9 apps + 1 dialog)

#### 5.5.1 Finder — Projects Browser

- Left panel: folder tree (8 project folders in sidebar)
- Right panel: icon grid of files + preview pane below
- Each project folder contains `index.mdx` + optional extras (screenshots, launchers)
- Click file → preview; double-click `.mdx` → opens TextEdit window
- Status bar shows breadcrumb + item count

**Final project list (8 projects):**

1. **vocabmonster** — vocabulary learning app
2. **Numista-to-Notion MCP server** — MCP integration for coin collection management
3. **Star Wars ASCII art viewer** — terminal-based ASCII art browser
4. **Blueshift MCP TypeScript wrapper** — TypeScript wrapper for Blueshift's MCP
5. **iOS Gomoku** — native iOS implementation of the Gomoku board game
6. **Spotify Wrapped React app** — personal Spotify Wrapped recreation
7. **Email signature generator** — utility for generating styled email signatures
8. **stephenjdunn.com** — this site, as a meta entry

#### 5.5.2 TextEdit — About / Read Me

- Read-only MDX document viewer
- Opened from Finder (double-click index.mdx) or from "Read Me" desktop icon
- Stephen's bio at launch; also renders project case studies from Finder

#### 5.5.3 Mail — Contact Form

- Name, Email, Message form styled like Classic Mac Mail
- Submit → Next.js API route → Resend to Stephen's email
- Honeypot hidden field for spam prevention
- Success state: classic alert dialog
- Error state: Sosumi alert

#### 5.5.4 SimpleText — Resume Viewer

- Placeholder resume rendered as plain text (Stephen to replace before launch)
- "View on LinkedIn" button in header
- File > Print → downloads `.txt` version

#### 5.5.5 Space Invaders

- Embedded HTML5 canvas game
- Arrow keys + Space; in-game sounds respect global mute
- High score in `localStorage`
- Pauses when window loses focus

#### 5.5.6 Sherlock — Site Search

- Search across all 8 project MDX files (client-side Fuse.js, index built at compile time)
- Click result → opens Finder navigated to that project
- Empty query shows all 8 projects

#### 5.5.7 Note Pad — Pre-written Notes

- 3–4 pre-written notes with their own desktop icons (Stephen to write content before launch)
- Each desktop icon opens a separate Note Pad window
- Visitor can type and edit notes freely in-session
- **Nothing persists** — all edits are ephemeral; closing and reopening resets to Stephen's original content
- No localStorage writes

#### 5.5.8 Calculator

- Working four-function calculator (+, −, ×, ÷)
- OS9-style button design
- Fixed window size (not resizable)

#### 5.5.9 About This Computer (dialog)

- Opens from **Apple menu only** — not a desktop icon
- Fixed 360×280px dialog, not resizable
- Fake specs: "Mac OS 9.2.2", made-up CPU/RAM, real uptime counter (since session start)
- Tech credits: Next.js, TypeScript, Tailwind, Zustand, Framer Motion, MDX, Resend; deployed on Netlify
- Icon credits: bearz314/MacOS9-icons (MIT)

### 5.6 Mobile Experience

Detection: viewport width ≤ 768px.

Mobile users get the boot sequence (atmospheric continuity), then transition to a Sad Mac splash:

> **Sorry!**
>
> This site is best experienced on a desktop computer.
>
> While you're here:
> - [View Resume → LinkedIn]
> - [Email Stephen]
> - [GitHub]
> - [LinkedIn]
> - Project links: [list of all 8]

Functional, on-brand, doesn't try to fake a windowed UX on a phone.

### 5.7 Sound Design

- **Behavior:** default ON if browser allows autoplay, OFF if blocked. Toggle in Apple menu.
- **Reality check:** modern browsers block autoplay aggressively. In practice, sound is OFF on first visit for nearly everyone until they interact with the page.
- **First-interaction cue:** a subtle muted-speaker icon in the menu bar lets users know sound exists and can be enabled.
- **Sounds:** startup chime, window open/close, click, Sosumi alert, Space Invaders effects
- **Sourcing:** Creative Commons / public archives only (see `specs/sounds.md`)
- Sound preference persists to `localStorage`

## 6. Technical Architecture

### 6.1 Stack

- **Framework:** Next.js (latest stable) — App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **State:** Zustand for window manager
- **Animation:** Framer Motion (window open/close, windowshade, boot crossfade, icon stagger)
- **Search:** Fuse.js for client-side fuzzy search
- **Content:** MDX with frontmatter, organized as `content/projects/[slug]/`
- **Mail:** Resend via Next.js API route
- **Hosting:** Netlify (existing, with GitHub continuous deployment)
- **Domain:** stephenjdunn.com (existing)
- **Analytics:** none

### 6.2 Repository Structure

```
stephenjdunn/
├── AGENTS.md
├── PRD.md
├── ARCHITECTURE.md
├── BUILD_PLAN.md
├── EASTER_EGGS.md          ← created in Phase 5
├── specs/
│   ├── window-manager.md
│   ├── finder.md
│   ├── apps.md
│   └── sounds.md
├── app/
│   ├── layout.tsx
│   ├── page.tsx            ← desktop shell (handles both desktop and mobile)
│   └── api/
│       └── contact/route.ts
├── components/
│   ├── desktop/            ← Desktop, Wallpaper, MenuBar, AppleMenu, AppMenu,
│   │                          DesktopIcons, DesktopIcon, BootSequence, MobileFallback
│   ├── windows/            ← WindowFrame, WindowManager, TitleBar
│   ├── apps/
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
│   └── projects/
│       └── [slug]/
│           ├── index.mdx
│           └── screenshots/
├── lib/
│   ├── window-store.ts
│   ├── projects.ts
│   ├── app-registry.ts
│   ├── sound.ts
│   ├── search.ts
│   ├── notes-config.ts
│   └── utils.ts
├── hooks/
│   ├── useSound.ts
│   └── useMediaQuery.ts
├── types/
│   └── index.ts
├── public/
│   ├── icons/
│   ├── fonts/
│   ├── sounds/
│   └── wallpapers/
├── netlify.toml
└── next.config.ts
```

### 6.3 Performance Targets

- LCP < 2.5s on desktop
- Lazy-load app components via `next/dynamic` so apps only mount when opened
- Lazy-load OS9 fonts (system fallback during initial paint)
- Sounds preloaded but not auto-played (browser policy)
- Total initial JS bundle < 250kb gzipped

### 6.4 Accessibility

The OS metaphor is a hard accessibility problem. Honest commitments:

- All apps reachable via keyboard (Tab cycles windows, Enter opens icons)
- Skip-boot link for screen readers
- Mobile fallback is fully accessible (semantic HTML)
- Sound is opt-in by default for most users (autoplay blocked)
- Color contrast meets WCAG AA in app content
- Plain Text Mode is a v2 obligation

## 7. Content Requirements

Before launch, Stephen needs to replace all placeholder content:

- 8 finalized project folders (each with `index.mdx` — stubs exist, need real case studies)
- Bio / About text (Read Me content — goes in TextEdit, loaded from MDX)
- Plain-text resume (replaces placeholder in SimpleText)
- 3–4 Note Pad note contents (fun facts, hot takes — replaces placeholders in `lib/notes-config.ts`)
- Sound files (see `specs/sounds.md`)
- Font files (`public/fonts/chicago.woff2`, `public/fonts/charcoal.woff2`)
- App icons (from bearz314/MacOS9-icons — see Section 7.1)
- Wallpaper asset (authentic OS9 desktop pattern or placeholder #C0C0C0)
- Custom favicon (Happy Mac or floppy disk)
- About This Computer copy (fake specs are templated; uptime is real)

### 7.1 Icon Assets

App icons, folder icons, file icons, and document icons are sourced from existing classic Mac OS icon libraries:

1. **bearz314/MacOS9-icons** (https://github.com/bearz314/MacOS9-icons) — primary source. MIT-licensed, PNGs at 512px and 64px, well-organized.
2. **Slimes' MacOS 9 / 7 Icon Sets** (TinkerDifferent forum) — secondary source.
3. **macOS 9 Icon Theme for macOS X** (macintoshrepository.org) — tertiary source.

**Attribution:** About This Computer dialog credits the icon sources, satisfying the MIT license requirement.

**Legal note (accepted risk):** the icons originate from Apple's classic Mac OS. Community usage for 20+ years without enforcement, site is non-commercial. Stephen has reviewed and accepted this risk.

## 8. Out of Scope for v1 (v2 Backlog)

- Chooser app (theme switcher)
- Working Sleep, Restart, Eject, Empty Trash menu items
- Trash that accepts dragged windows or icons
- Apple menu: Recent Items, Control Panels
- Note Pad with persistent content
- Personal-interest apps (cycling, numismatics, FPL, biblical languages)
- Plain Text Mode accessibility view
- Designed resume PDF
- Multi-window memory between sessions

## 9. Easter Eggs (3–5, hidden)

To be designed and documented in `EASTER_EGGS.md` during Phase 5. Starting suggestions:

- Konami code on desktop → bounces all open windows + plays boot chime
- Click Happy Mac icon 5× in About This Computer → hidden message
- Calculator inputs 1337, 80085 → display joke
- Open all 9 apps simultaneously → special desktop notification
- Type "hello" with any window focused → Note Pad opens with welcome message

## 10. Definition of Done (v1)

The site ships when:

- [ ] Boot sequence works on Chrome, Safari, Firefox (latest)
- [ ] All 9 apps function correctly
- [ ] Windowshade works on all resizable windows
- [ ] Menu bar works: Apple menu (About, Sound toggle, Shut Down) + per-app menus
- [ ] All 8 project folders are live with `index.mdx` content
- [ ] Mobile fallback is live (boot + Sad Mac)
- [ ] Contact form sends real email via Resend
- [ ] Custom domain configured, HTTPS active
- [ ] Sound toggle works and is respected across all apps
- [ ] No console errors on any page
- [ ] Tested on at least one Retina and one non-Retina display
- [ ] Zero TypeScript errors, zero lint errors

No dates. Ship when the list is complete.

## 11. Risks

- **Scope creep is the dominant risk.** The DoD checklist above is the ship gate.
- **Font licensing.** Use FLF or other clean-room reproductions; verify licenses before shipping.
- **Sound licensing.** Source from CC archives only (see `specs/sounds.md`).
- **Icon legal status.** Sourced from community archives; underlying IP is Apple's. Risk accepted (see Section 7.1).
- **Mobile bounce.** The fallback must be genuinely functional.
- **Performance.** Profile early, lazy-load aggressively.
- **Content drag.** The build can finish before the content does. All placeholder content has been designed to be swapped out — prioritize writing the 8 project READMEs and Note Pad notes before announcing launch.

---

*End of document.*
