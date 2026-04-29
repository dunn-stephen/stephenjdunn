# specs/window-manager.md — Window Manager Spec
# Read AGENTS.md and ARCHITECTURE.md before starting this task.

---

## Overview

The window manager is the most critical system in the app. Everything else depends on it. It must be built and verified before any app components are started.

It is a **custom implementation** — no libraries for drag/resize. Framer Motion handles open/close and windowshade animations only.

---

## WindowFrame Anatomy

```
┌─────────────────────────────────────────────────┐  ← outer border (1px solid #808080)
│ ●  ─  □   Window Title                          │  ← TitleBar (28px height, double-click = shade)
├─────────────────────────────────────────────────┤  ← inner border (1px solid #404040)
│                                                 │
│                                                 │
│         App content renders here               │  ← overflow-auto, collapses on shade
│                                                 │
│                                                 │
└──────────────────────────────────────────────┘▪ │  ← resize handle bottom-right (8x8px)
                                                     ← (hidden for non-resizable apps)
```

**Traffic light buttons (left to right):**
- Red (close): 12px circle, #FF5F57
- Yellow (minimize): 12px circle, #FEBC2E
- Green (zoom): 12px circle, #28C840
- Spacing: 8px between buttons, 8px from left edge

**Active TitleBar:** gradient from #CCCCCC to #AAAAAA, title text centered, bold
**Inactive TitleBar:** solid #DDDDDD, title text centered, normal weight, muted color

---

## Drag Implementation

```typescript
// Inside TitleBar component
const handleMouseDown = (e: React.MouseEvent) => {
  // Only drag on single click — not on double-click (which triggers shade)
  if (e.detail > 1) return
  e.preventDefault()
  focusWindow(windowId)

  const startX = e.clientX - position.x
  const startY = e.clientY - position.y

  const handleMouseMove = (e: MouseEvent) => {
    const newX = Math.max(0, Math.min(e.clientX - startX, window.innerWidth - size.width))
    const newY = Math.max(28, Math.min(e.clientY - startY, window.innerHeight - size.height)) // 28 = menubar height
    moveWindow(windowId, { x: newX, y: newY })
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
```

Key constraint: window top edge cannot go above 28px (below the menu bar). Window cannot be dragged off any edge.

---

## Resize Implementation

Resize handle is an 8×8px div anchored to the bottom-right corner of WindowFrame. **Do not render for apps with `resizable: false`.**

```typescript
const handleResizeMouseDown = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  const startX = e.clientX
  const startY = e.clientY
  const startWidth = size.width
  const startHeight = size.height

  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = Math.max(minSize.width, startWidth + (e.clientX - startX))
    const newHeight = Math.max(minSize.height, startHeight + (e.clientY - startY))
    resizeWindow(windowId, { width: newWidth, height: newHeight })
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
```

---

## Windowshade Implementation

Windowshade is the OS9 signature behavior where double-clicking the title bar collapses the window to just the title bar, then double-clicking again expands it.

**State additions to `WindowState`:**
```typescript
isShaded: boolean       // true = content collapsed to title bar only
preShadeHeight: number  // stores size.height before shading so it can be restored
```

**Store action:**
```typescript
shadeWindow: (id) => set((state) => ({
  windows: state.windows.map(w => {
    if (w.id !== id) return w
    if (w.isShaded) {
      // Unshade: restore previous height
      return { ...w, isShaded: false, size: { ...w.size, height: w.preShadeHeight } }
    } else {
      // Shade: collapse, store current height
      return { ...w, isShaded: true, preShadeHeight: w.size.height }
    }
  })
}))
```

**TitleBar double-click handler:**
```typescript
const handleDoubleClick = (e: React.MouseEvent) => {
  e.preventDefault()
  shadeWindow(windowId)
}
```

**WindowFrame content area animation (Framer Motion):**
```typescript
// In WindowFrame, wrap the content area:
<AnimatePresence initial={false}>
  {!window.isShaded && (
    <motion.div
      key="window-content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: window.size.height - TITLEBAR_HEIGHT, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      style={{ overflow: 'hidden' }}
    >
      <AppContent window={window} />
    </motion.div>
  )}
</AnimatePresence>

const TITLEBAR_HEIGHT = 28 // px
```

**Behavior notes:**
- The window remains draggable while shaded (title bar is still visible and handles mousedown)
- The resize handle is hidden while shaded
- The window's `size.width` does not change when shading — only height collapses

---

## Z-Index Management

```typescript
// In window store
focusWindow: (id) => set((state) => {
  const maxZ = Math.max(...state.windows.map(w => w.zIndex))
  return {
    windows: state.windows.map(w =>
      w.id === id ? { ...w, zIndex: maxZ + 1 } : w
    ),
    focusedWindowId: id,
  }
})
```

Base zIndex: 100. Each focus increments by 1. The menu bar lives at z-index 9999 and is always on top.

---

## Window Open/Close Animation (Framer Motion)

```typescript
// In WindowManager.tsx — wrap with AnimatePresence
import { AnimatePresence } from 'framer-motion'

export function WindowManager() {
  const windows = useWindowStore(s => s.windows)

  return (
    <AnimatePresence>
      {windows
        .filter(w => w.isOpen && !w.isMinimized)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(w => (
          <WindowFrame key={w.id} window={w} />
        ))
      }
    </AnimatePresence>
  )
}

// In WindowFrame.tsx — wrap the entire window in motion.div
import { motion } from 'framer-motion'

const windowVariants = {
  initial: { scale: 0.85, opacity: 0 },
  animate: { scale: 1,    opacity: 1, transition: { duration: 0.15 } },
  exit:    { scale: 0.85, opacity: 0, transition: { duration: 0.1  } },
}

// <motion.div variants={windowVariants} initial="initial" animate="animate" exit="exit" ...>
```

---

## Singleton Enforcement

```typescript
openWindow: (appId, props) => set((state) => {
  const def = appRegistry[appId]

  if (def.singleton) {
    const existing = state.windows.find(w => w.appId === appId && w.isOpen)
    if (existing) {
      // Focus existing window instead of opening a new one
      return focusWindowLogic(state, existing.id)
    }
  }

  // Create new window — cascade position
  const newWindow: WindowState = {
    id: `${appId}-${Date.now()}`,
    appId,
    title: def.name,
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    isShaded: false,
    preShadeHeight: def.defaultSize.height,
    position: { x: 80 + (state.windows.length * 20), y: 60 + (state.windows.length * 20) },
    size: def.defaultSize,
    zIndex: Math.max(100, ...state.windows.map(w => w.zIndex)) + 1,
    props,
  }

  return {
    windows: [...state.windows, newWindow],
    focusedWindowId: newWindow.id,
  }
})
```

New windows cascade (offset by 20px each) so they don't perfectly overlap.

---

## Acceptance Criteria

- [ ] Windows open at cascading positions
- [ ] Drag works: smooth, constrained to viewport, doesn't go behind menu bar
- [ ] Resize works: smooth, respects minSize
- [ ] Resize handle hidden for `resizable: false` apps
- [ ] Click anywhere on a window brings it to front (correct zIndex)
- [ ] Close button removes window from DOM with exit animation
- [ ] Minimize hides window (no taskbar — minimized windows just disappear)
- [ ] Zoom toggles between defaultSize+original position and near-fullscreen
- [ ] **Double-click TitleBar collapses window to title bar only (windowshade)**
- [ ] **Double-click again expands window back to full height (restores preShadeHeight)**
- [ ] Windowshade animation is smooth (Framer Motion, ~150ms)
- [ ] Window remains draggable while shaded
- [ ] Window open animation: scale 0.85→1 + fade in
- [ ] Window close animation: scale 1→0.85 + fade out
- [ ] Active TitleBar vs inactive TitleBar renders correctly based on focus
- [ ] Menu bar AppMenu shows focused window's app name
- [ ] Singleton apps: opening a second instance focuses the existing one
- [ ] Zero TypeScript errors
- [ ] No performance issues with 9 windows open simultaneously
