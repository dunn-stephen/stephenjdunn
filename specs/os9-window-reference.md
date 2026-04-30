# os9 Window Reference

Source repo analyzed: `/Users/stephendunn/Desktop/os9`

## 1. Window chrome styling

### Primary chrome CSS

- `css/window.css:6-19`
  - `.window-wrapper`
  - `.window`
  - Establishes absolute positioning, the Charcoal font, the gray OS 9 background, the 1px black border, and the inset bevel shadow.
- `css/window.css:21-29`
  - `.window.blur:not(:focus-within)`
  - `.window.blur:not(:focus-within) *`
  - Inactive-window treatment: darker border and flattened inner shadows.
- `css/window.css:31-76`
  - `.window .header`
  - `.window .header img`
  - `.window .header .title`
  - `.window .header-lines-wrapper`
  - `.window .header-lines.left`
  - `.window .header-lines.center`
  - `.window .header-lines.right`
  - Builds the classic striped title bar and title placement.
- `css/window.css:78-144`
  - `.window .control-box`
  - `.window .control-box.close-box`
  - `.window .control-box-inner`
  - `.window .control-box-highlight`
  - `.window .control-box.zoom-box`
  - `.window .zoom-box-inner`
  - `.window .control-box.windowshade-box`
  - `.window .windowshade-box-inner`
  - Defines the close, zoom, and windowshade chrome.
- `css/window.css:146-176`
  - `.window .expand-arrow`
  - `.window .expand-arrow.right`
  - `.window .expand-arrow.right.active`
  - `.window .expand-arrow.down`
  - `.window .expand-arrow.down.active`
  - `.window.blur .expand-arrow.right`
  - `.window.blur .expand-arrow.down`
  - Folder-tree expand/collapse arrow sprites.
- `css/window.css:178-205`
  - `.window .statusbar`
  - `.window .statusbar .statusbar-text`
  - `.window .contents`
  - Bottom status strip and inset content well.
- `css/window.css:207-240`
  - `.window .contents .body`
  - `.window .contents .body .grid`
  - `.window .contents .body .grid > figure`
  - `.window .resize-handle`
  - `.window .resize-handle.enabled`
  - Scrollable content region and the south-east resize handle.

### Scrollbar CSS

- `css/jquery.jscrollpane.css:1-28`
  - `.jspContainer`
  - `.jspPane`
  - `.jspVerticalBar`
  - `.jspHorizontalBar`
  - Container and bar layout.
- `css/jquery.jscrollpane.css:38-71`
  - `.jspAllInView .jspTrack`
  - `.jspAllInView .jspDrag`
  - `.jspAllInView .jspArrow*`
  - Disabled scrollbar state.
- `css/jquery.jscrollpane.css:73-124`
  - `.jspTrack`
  - `.jspTrack.disabled`
  - `.jspDrag`
  - `.jspDrag:active`
  - `.jspVerticalBar .jspDrag`
  - `.jspHorizontalBar .jspDrag`
  - Track and thumb styling, including active sprite swaps.
- `css/jquery.jscrollpane.css:131-192`
  - `.jspArrow`
  - `.jspArrow.jspActive`
  - `.jspArrowUp`
  - `.jspArrowRight`
  - `.jspArrowDown`
  - `.jspArrowLeft`
  - `.jspCorner`
  - Arrow buttons and corner treatment.

### Header markup and structural HTML

- `window.header.html:1-28`
  - `.control-box.close-box`
  - `.header-lines-wrapper.left.flex-rows.draggable`
  - `.title.flex-rows.draggable`
  - `.header-lines-wrapper.right.flex-rows.draggable`
  - `.control-box.zoom-box`
  - `.control-box.windowshade-box`
  - This is the exact DOM fragment used to build the window chrome.
- `window.folder.html:1-19`
  - `.header`
  - `.statusbar`
  - `.contents`
  - `.body`
  - `.grid`
  - `.resize-handle`
- `window.about.html:1-25`
  - `.header.no-zoom-box`
  - `.contents`
  - `.about-greets`
  - `.resize-handle`
- `window.simpletext.html:1-8`
  - `.header`
  - `.contents`
  - `.body`
  - `.resize-handle`
- `window.pictureviewer.html:1-8`
  - `.header`
  - `.contents`
  - `.body`
  - `.resize-handle`

### Fonts

- `css/window.css:14-18` uses `font-family: 'Charcoal'`.
- `css/window.css:42-47` uses the same font for the title.
- `css/jquery.jscrollpane.css` does not set font family, but the scrollbars are skinned with image sprites from `img/ui/widgets/`.
- `css/base.css` / `css/base.min.css` register the `Charcoal.ttf` font face globally.

## 2. Window interactivity

### Close

- File: `js/windows.js:343-345`
- Hook: `.close-box` `click`
- Tracked state:
  - Indirectly depends on wrapper metadata: `data-id`, `data-type`
  - Window membership in `g_openWindows`
- Mutations:
  - Calls `Actions.closeWindow($wrapper)`
- Close implementation: `js/actions.js:123-173`
  - Persists `desktopDBItem.top` and `desktopDBItem.left`
  - Removes the matching `{ id, type }` from `g_openWindows`
  - Removes the wrapper from the DOM
  - Focuses the previous topmost open window if one remains

### Minimize / collapse-to-title-bar (windowshade)

- File: `js/windows.js:347-360`
- Hooks:
  - `.windowshade-box` `click`
  - `.draggable` `dblclick` proxies to `.windowshade-box`
- Tracked state:
  - No explicit JS state object
  - Uses the current rendered width to compensate for DOM reflow when content is hidden
- Mutations:
  - `.statusbar, .contents` `.toggle()`
  - Reapplies `width` with `$window.css("width", width)`
- Behavior note:
  - This is the actual OS 9-style collapse behavior in the repo.

### Expand / maximize

- There is no real maximize-to-viewport implementation in the source repo.
- The only “expand” behavior is folder-tree expansion:
  - File: `js/windows.js:363-375`
  - Hooks:
    - `.expand-arrow` `mousedown`
    - `.expand-arrow` `mouseup`
  - Tracked state:
    - CSS class state on the arrow and the window
  - Mutations:
    - Adds/removes `.active`
    - Toggles `.right` / `.down`
    - Toggles `.expanded` on `$window`
- `window.header.html:17-22` defines a `.zoom-box`, but no click handler is bound to it in `js/windows.js`.

### Drag to move

- File: `js/windows.js:245-249`
- Hook: jQuery UI `.draggable({ handle: ".draggable", containment: $(".desktop") })`
- Supporting hook: `js/windows.js:333-341`
  - `.draggable` `mousedown` manually triggers window focus because jQuery UI drag handling does not bubble focus the way the author wanted.
- Tracked state:
  - jQuery UI internal drag state
  - Persisted `desktopDBItem.top` / `desktopDBItem.left` are later written on close
- Mutated CSS:
  - jQuery UI mutates the wrapper’s `top` and `left`
  - The wrapper itself is `.window-wrapper`, not `.window`

### Resize

- Structural handle:
  - `window.folder.html:18`
  - `window.about.html:24`
  - `window.simpletext.html:7`
  - `window.pictureviewer.html:7`
  - `css/window.css:228-240`
- Focus styling:
  - `js/windows.js:265-267` adds `.enabled`
  - `js/windows.js:315-317` removes `.enabled`
- Actual resize behavior:
  - `js/actions.js:85-94` contains the only resize logic, but it is commented out.
  - Intended hooks:
    - jQuery UI `.resizable({ handles: "se" })`
  - Intended tracked state:
    - jQuery UI internal resize state
    - `minWidth`, `minHeight`
  - Intended mutations:
    - Element width and height
    - Reinitialization of jScrollPane during resize
- Conclusion:
  - The source repo ships resize chrome and focus affordances, but not a live resize implementation.

### Focus and z-order

- File: `js/windows.js:260-331`
- Hooks:
  - `.window` `focusin`
  - `.window` `focusout`
  - `input, textarea` `blur` proxies back to the window
- Tracked state:
  - `g_highestZIndex`
  - Focus/blur classes on the window
  - Desktop-figure focus classes
- Mutated CSS / DOM:
  - `.control-box, .header-lines` shown/hidden
  - `.resize-handle` `.enabled` toggled
  - `.focus` / `.blur` toggled on the window
  - `.jspTrack.disabled` toggled
  - `.jspArrow` / `.jspDrag` shown/hidden
  - `$wrapper.css("z-index", ++g_highestZIndex)`
  - Width is reapplied during blur to stabilize layout

## 3. Window instantiation and layering

### Creation path

- Entry point: `js/actions.js:28-119` `Actions.openWindow(wrapperID, windowClass, transferAnimation, callbackFn)`
- Creation sequence:
  1. Checks `g_openWindows` for an existing `{ id, type }` entry.
  2. If already open, finds `.window-wrapper[data-id="..."]` and focuses the existing `.window`.
  3. Otherwise appends `<div class="window-wrapper">` to `.desktop`.
  4. Appends `<div class="window {windowClass}">` to the wrapper.
  5. Loads `window.{windowClass}.html`.
  6. Loads `window.header.html` into the first `.header`.
  7. Sets `data-id` and `data-type` on the wrapper.
  8. Calls `initWindow(wrapperID, windowClass)` from `js/windows.js:4-39`.
  9. Restores saved `top` and `left` from the desktop DB item if present.
  10. Initializes jScrollPane for `.body` if needed.
  11. Focuses the new window.

### Window data structure

- Open-window registry:
  - `js/windows.js:1-2`
  - `g_openWindows = []`
  - Each entry is shaped like `{ id, type }`
- Persisted per-item geometry:
  - `js/app.js:23-24`
  - `desktopDBItem.top`
  - `desktopDBItem.left`
- Desktop metadata:
  - `js/app.js:1-25`
  - The desktop DB item is the long-lived record for icon/window metadata.

### Layering / z-index management

- Base z-index:
  - `css/window.css:12-19` sets `.window { z-index: 3; }`
- Runtime top-of-stack tracking:
  - `js/windows.js:1-2` initializes `g_highestZIndex = 3`
  - `js/windows.js:276-277` raises the active wrapper with `$wrapper.css("z-index", ++g_highestZIndex)`
- Close fallback:
  - `js/actions.js:153-165` focuses the most recently tracked open window after a close

## 4. Translation notes for this repo

- The source repo’s most reusable pieces are:
  - Header DOM shape from `window.header.html`
  - Chrome selectors and dimensions from `css/window.css`
  - Focus/blur affordances from `js/windows.js`
  - Window-open registry and focus ordering from `js/actions.js`
- The source repo’s resize and zoom behavior are incomplete:
  - Resize is scaffolded but commented out.
  - The zoom box is styled but not wired.
- In this repo, those gaps should be translated onto the existing React + Zustand window actions rather than copied literally.
