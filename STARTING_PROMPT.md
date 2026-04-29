# Starting Prompt for Codex
# Copy the text below this line and paste it as your first message to Codex.
# ─────────────────────────────────────────────────────────────────────────────

You are building **stephenjdunn.com** — a pixel-faithful Mac OS 9 desktop environment that serves as a personal developer portfolio. The GitHub repo and Netlify project already exist.

**Before writing any code, read these files in this order:**
1. `AGENTS.md` — your master operating manual. Every rule lives here.
2. `ARCHITECTURE.md` — the technical blueprint (state shape, component tree, all interfaces).
3. `BUILD_PLAN.md` — the exact ordered task list. Follow it phase by phase.
4. `PRD.md` — product requirements if you need context on *why* something is built a certain way.
5. `specs/` — read the relevant spec file before starting each Phase 4 app task.

**Then start with `BUILD_PLAN.md` Task 0.0** (pre-flight check) and work through every task in order.

**Rules:**
- Complete and verify each task fully before moving to the next. Do not work ahead.
- Pass all 6 verification gates in `AGENTS.md §6` before marking any task done.
- If a gate fails and you cannot fix it in 2 attempts, halt using the exact format in `AGENTS.md §7`.
- Commit after every task using the message format in `AGENTS.md §5`.
- If a task's acceptance criteria are ambiguous or a required file is missing, halt — do not guess.
