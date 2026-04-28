# Command Center P8 Round 2 -- Claude Code Prompt
## Building: v4r10
## Builds on: v4r9 (P8 Round 1 QA passed 2026-04-26)
## Supabase project: gcbvvausrmbbkfazojpl (Bodhi360 org)

---

## Read these files first (in this order)

1. `_command-center/v2-app.js`
2. `_command-center/v2-styles.css`
3. `_command-center/index.html`

Do not read any other files. Do not modify anything not listed below.

---

## What is confirmed working -- DO NOT TOUCH

Everything confirmed in v4r9:
- P1 Focus mode
- P2 Drag-to-reorder
- P3 Add task button and modal (title auto-focus, bucket selector, validation, toast)
- P4 Done tasks collapse
- Sort fix: newest/oldest correctly ordered, amber `is-sort-active` class on active button
- Bucket tile highlight and deselect: clicking a tile highlights it, clicking it again clears it and shows all tasks
- O hotkey guard: O does not fire when Direct Line textarea has focus
- N hotkey: pressing N opens the add-task modal (Today column)

---

## Two fixes to build

### Fix 1: Remove T shortcut, keep N only

Find the keydown handler added in v4r9 that listens for both N and T.

Remove T entirely. N remains the only shortcut for opening the add-task modal. T must be a dead key again -- no action bound to it.

After this change, pressing T anywhere on the page (outside a text input) must do nothing.

### Fix 2: All button active state in the Buckets module

Find the "All" button (or equivalent control) in the Buckets filter area.

Current behavior: clicking All shows all tasks but the button has no active/selected visual state. Clicking it again does nothing visible.

Required behavior:
- On page load with no bucket filter active, the All button shows as highlighted (add `is-active` class or equivalent, consistent with how bucket tiles show their active state)
- When the user clicks a bucket tile, the All button loses its highlight and the selected tile gains it
- When the user deselects a tile (clicks it again to clear the filter), the All button re-highlights and no tile is highlighted
- Clicking the All button when it is already highlighted does nothing (all tasks are already showing)
- The All button highlight style must match the existing bucket tile active style exactly -- same class, same visual treatment, no new colors introduced

This should be a small addition to the existing bucket filter click handler. Wherever the filter state is set or cleared, update All button active state to match.

---

## Acceptance criteria

1. Pressing T anywhere outside a text input does nothing.
2. Pressing N outside a text input still opens the add-task modal.
3. On the Buckets page with no filter active, the All button appears highlighted.
4. Clicking a bucket tile: All button loses highlight, tile gains it.
5. Clicking the active tile again: tile loses highlight, All button re-highlights.
6. All previously confirmed behavior remains unchanged.

---

## After fixes are complete, deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r10: P8 R2 -- N only shortcut, All button active state" && git push origin main
```

When deploy is done, paste the git output and the final SHA so QA can begin.
