# specs/apps.md — App Specs (All Remaining Apps)
# Read AGENTS.md, ARCHITECTURE.md, and specs/window-manager.md before starting.

---

## TextEdit

**File:** `components/apps/textedit/TextEdit.tsx`

**Window size:** defaultSize 520×420, minSize 320×220, resizable

**Props:**
```typescript
interface TextEditProps {
  windowId: string
  props: {
    content: string     // MDX string
    title: string       // displayed in window title bar
  }
}
```

**Behavior:**
- Read-only MDX renderer
- Scrollable content area
- White background, 16px margins on all sides
- Typography: body text in Chicago 12pt, headings in Charcoal, code blocks in monospace
- Launched from Finder (double-click index.mdx) or from desktop "Read Me" icon

**Acceptance criteria:**
- [ ] Renders headings, paragraphs, lists, code blocks correctly
- [ ] Scrollable when content overflows
- [ ] Window title shows filename passed in props

---

## SimpleText (Resume)

**File:** `components/apps/simpletext/SimpleText.tsx`

**Window size:** defaultSize 500×520, minSize 320×260, singleton, resizable

**Props:** `{ windowId: string }` — no dynamic props, content is hardcoded

**Content structure:**
```
Stephen Dunn
Software Engineer · New York, NY

[View on LinkedIn →]          ← button, opens https://www.linkedin.com/in/dunn-stephen in new tab

────────────────────────────────────────────────
EXPERIENCE

Senior Software Engineer · Blueshift                         2022 – Present
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Software Engineer · [Previous Company]                       2019 – 2022
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore.

────────────────────────────────────────────────
SKILLS

Languages:    TypeScript, JavaScript, Swift, Python
Frameworks:   Next.js, React, Node.js
Tools:        MCP, Zustand, Tailwind CSS, Resend, Netlify
Other:        System design, API integration, developer tooling

────────────────────────────────────────────────
EDUCATION

B.S. Computer Science · [University]                         [Year]

────────────────────────────────────────────────
LINKS

GitHub:    github.com/dunn-stephen
LinkedIn:  linkedin.com/in/dunn-stephen
Site:      stephenjdunn.com

────────────────────────────────────────────────
⚠️  PLACEHOLDER — Stephen to rewrite before launch.
```

**Styling:**
- Monospace font throughout
- Document-window aesthetic (white background, margins)
- LinkedIn button: looks like a classic Mac button (beveled border, gray background)

**Acceptance criteria:**
- [ ] LinkedIn button opens correct URL in new tab
- [ ] Placeholder resume content is present and readable
- [ ] Scrollable

---

## Mail

**Files:**
- `components/apps/mail/Mail.tsx`
- `app/api/contact/route.ts`

**Window size:** defaultSize 480×380, minSize 380×300, singleton, resizable

**Form fields:**
- Name (text input, required)
- Email (email input, required)
- Message (textarea, required, min-height 120px)
- Honeypot (hidden text input, `name="website"` — if populated server-side, silently drop)
- Send button

**API route:**
```typescript
// POST /api/contact
// Body: { name: string, email: string, message: string, website?: string }
// If website is non-empty → silently return { success: true } (honeypot triggered)
// Uses Resend to send to stephendunn2424@gmail.com
// Returns: { success: true } or { error: string }
```

**Resend setup:**
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'Portfolio Contact <noreply@stephenjdunn.com>',
  to: 'stephendunn2424@gmail.com',
  subject: `Portfolio message from ${name}`,
  text: `From: ${name} <${email}>\n\n${message}`,
})
```

**UI states:**
- Default: form ready to fill
- Loading: Send button shows "Sending…", inputs disabled
- Success: form replaced with "Your message has been sent." + OK button that closes window
- Error: alert dialog "Something went wrong. Please try again." form remains filled

**Acceptance criteria:**
- [ ] All three fields validate (non-empty, valid email format)
- [ ] Honeypot field present and checked server-side
- [ ] Loading state prevents double-submit
- [ ] Email arrives at stephendunn2424@gmail.com
- [ ] Success state renders and close button works
- [ ] Error state renders with form still filled

---

## Space Invaders

**Files:** `components/apps/space-invaders/` (split into logical modules)

**Window size:** defaultSize 480×540, minSize 420×480, singleton, resizable

**Implementation approach:**
- HTML5 Canvas
- Game loop via `requestAnimationFrame`
- All game logic self-contained, no external game libraries

**Game spec:**
- Player ship at bottom, moves left/right (arrow keys)
- 3 rows × 8 columns of enemies (classic invader shapes via canvas drawing)
- Enemies march side-to-side, descend one row when hitting edge
- Player fires upward (spacebar), one bullet at a time
- Enemies fire downward randomly
- Score: +10 per enemy killed
- Lives: 3 (shown as ship icons)
- Game over: enemies reach bottom, or player out of lives
- Win: all enemies destroyed (show score, prompt to restart)
- High score persisted to `localStorage` key `space-invaders-highscore`
- Game pauses when window loses focus (blur event on canvas)

**Canvas size:** fills the window's content area (responsive to window resize)

**Controls (shown in window):**
- ← → Arrow keys: move
- Space: fire
- Small legend text at bottom of window

**Sound effects (respect global mute):**
- Shoot: plays `click` sound on fire
- Enemy destroyed: plays `alert` sound
- Player hit: plays `error` sound

**Acceptance criteria:**
- [ ] Game renders and is playable
- [ ] Score increments correctly
- [ ] Enemy movement speeds up as enemies are killed
- [ ] Game over state shown with final score
- [ ] 'R' key or on-screen button restarts game
- [ ] Canvas resizes if window is resized
- [ ] Sound effects respect global mute toggle
- [ ] High score persists across sessions

---

## Sherlock

**Files:**
- `components/apps/sherlock/Sherlock.tsx`
- `lib/search.ts`

**Window size:** defaultSize 420×380, minSize 340×280, singleton, resizable

**Search index build (`lib/search.ts`):**
```typescript
import Fuse from 'fuse.js'
import { getAllProjects } from './projects'

export interface SearchResult {
  projectSlug: string
  projectTitle: string
  excerpt: string
  score: number
}

// Called at build time, result exported as static JSON
export async function buildSearchIndex() { ... }

// Called client-side
export function search(query: string, index: SearchableItem[]): SearchResult[] {
  const fuse = new Fuse(index, {
    keys: ['title', 'description', 'content', 'tags'],
    includeScore: true,
    threshold: 0.4,
  })
  return fuse.search(query).map(result => ({
    projectSlug: result.item.slug,
    projectTitle: result.item.title,
    excerpt: result.item.description,
    score: result.score ?? 1,
  }))
}
```

**UI layout:**
```
┌────────────────────────────────────┐
│  🔍  [search input                ]│  ← search bar, autofocused on open
├────────────────────────────────────┤
│  Results:                          │
│  ┌──────────────────────────────┐  │
│  │ 📁 VocabMonster              │  │
│  │ A vocabulary learning app... │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ 📁 Star Wars ASCII           │  │
│  │ ASCII art viewer for...      │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Behavior:**
- Search runs on every keystroke (debounced 200ms)
- Click result → opens Finder, navigated to that project folder
- Empty query → show all 8 projects
- No results → "No items found."

**Acceptance criteria:**
- [ ] Search returns relevant results across all 8 projects
- [ ] Clicking result opens Finder at correct project
- [ ] Empty query shows all 8 projects
- [ ] No-results state renders
- [ ] Search input is autofocused when window opens

---

## Note Pad

**File:** `components/apps/notepad/NotePad.tsx`

**Window size:** defaultSize 300×260, minSize 220×160, NOT singleton (multiple instances), resizable

**Architecture:**
- There are 3–4 Note Pad desktop icons, one per pre-written note
- Each icon calls `openWindow('notepad', { noteId: N })` on double-click
- Each window is independent — multiple notes can be open simultaneously
- Content is pre-populated from `lib/notes-config.ts` (see BUILD_PLAN.md Task 4.7)

**Props:**
```typescript
interface NotePadProps {
  windowId: string
  props: {
    noteId: number    // 1, 2, 3, or 4
  }
}
```

**Behavior:**
- On mount: load `NOTES[props.noteId].content` into textarea
- Visitor can type and edit freely in-session
- **Nothing persists** — no localStorage, no writes anywhere
- On close and reopen: note resets to original pre-populated content from `NOTES` config
- Auto-focus textarea when window opens

**Aesthetic:**
- Yellow-ish background (`#FFFDE7`)
- Monospace font
- Thin ruled lines (CSS `repeating-linear-gradient` trick for line effect)
- No toolbar, no formatting — plain text only

**Pre-populated content placeholders** (Stephen to replace before launch):
```typescript
// lib/notes-config.ts
export const NOTES = {
  1: { title: 'Note 1', content: '[Stephen: add a hot take or fun fact here]' },
  2: { title: 'Note 2', content: '[Stephen: add a hot take or fun fact here]' },
  3: { title: 'Note 3', content: '[Stephen: add a hot take or fun fact here]' },
  4: { title: 'Note 4', content: '[Stephen: add a hot take or fun fact here]' },
}
```

**Acceptance criteria:**
- [ ] Each Note Pad icon opens a distinct window with different pre-populated content
- [ ] Multiple Note Pad windows can be open simultaneously
- [ ] Visitor can type freely in each textarea
- [ ] Closing and reopening a note resets it to original content (no persistence)
- [ ] No writes to localStorage
- [ ] Yellow legal pad aesthetic with ruled lines

---

## Calculator

**File:** `components/apps/calculator/Calculator.tsx`

**Window size:** defaultSize 240×320, minSize 240×320 (fixed — not resizable)

**Button layout (classic Mac calculator):**
```
┌─────────────────────────┐
│                   0     │  ← display
├────┬────┬────┬──────────┤
│ C  │ ±  │ %  │    ÷     │
├────┼────┼────┼──────────┤
│ 7  │ 8  │ 9  │    ×     │
├────┼────┼────┼──────────┤
│ 4  │ 5  │ 6  │    −     │
├────┼────┼────┼──────────┤
│ 1  │ 2  │ 3  │    +     │
├─────────┼────┼──────────┤
│    0    │ .  │    =     │
└─────────┴────┴──────────┘
```

**Logic:**
- Standard arithmetic calculator (not scientific)
- Handles: chained operations, decimal input, sign toggle, percentage
- Divide by zero → display "Error", C clears it
- Max display digits: 10

**Acceptance criteria:**
- [ ] All operations work correctly
- [ ] Divide by zero shows "Error"
- [ ] C clears display and resets state
- [ ] Chained operations work (5 + 3 = 8, then × 2 = 16)
- [ ] Decimal input works (.5, 0.5)
- [ ] Percentage (50% = 0.5, 100 × 50% = 50)
- [ ] Fixed window size — resize handle does not render

---

## About This Computer

**File:** `components/apps/about/About.tsx`

**Window size:** 360×280px, fixed, not resizable. **Opened from Apple menu ONLY — not a desktop icon.**

**Renders as:** centered dialog.

**Content:**
```
[Happy Mac icon, 64px]

Mac OS 9.2.2
© Apple Computer, Inc.

Built-in Memory:    256 MB
Virtual Memory:     Off
Uptime:             [real uptime since session start — e.g. "0:04:32"]

────────────────────────────
stephenjdunn.com

Built with: Next.js · TypeScript · Tailwind
            Zustand · Framer Motion · MDX · Resend

Deployed on: Netlify
Icons: bearz314/MacOS9-icons (MIT)
```

**Uptime counter:** real elapsed time since page load (or since first visit in session). Update every second with `setInterval`.

**Easter egg hook:** clicking the Happy Mac icon 5× calls an `onEasterEgg` callback (wired in Task 5.1). Wire the click counter even if the easter egg behavior isn't implemented yet — don't leave it as a TODO that breaks compilation.

**Acceptance criteria:**
- [ ] Dialog is centered on screen
- [ ] Fixed size, no resize handle
- [ ] All content renders correctly
- [ ] Uptime counter increments every second
- [ ] Close button works
- [ ] Happy Mac click counter is wired (5 clicks → calls easter egg callback)
