# Command Center P8 Round 3 -- Claude Code Prompt
## Building: v4r11
## Builds on: v4r10 (P8 R2 -- N shortcut and All button visual landed, filter logic broken)
## Supabase project: gcbvvausrmbbkfazojpl (Bodhi360 org)

---

## Read these files first (in this order)

1. `_command-center/v2-app.js`
2. `_command-center/v2-styles.css`
3. `_command-center/index.html`

Do not read any other files. Do not modify anything not listed below.

---

## What is confirmed working -- DO NOT TOUCH

- P1 Focus mode
- P2 Drag-to-reorder
- P3 Add task button and modal
- P4 Done tasks collapse
- Sort fix (newest/oldest, amber is-sort-active)
- O hotkey guard (no fire when Direct Line textarea has focus)
- N hotkey opens add-task modal
- T key is dead (fixed in v4r10)

---

## The problem: Bucket filter logic is broken

The All button and bucket tile filter logic must be rebuilt. Here is the exact required behavior:

### State model

Three states:
1. `bucketFilter = null` -- no filter active, show zero tasks, no button highlighted. This is the DEFAULT on page load.
2. `bucketFilter = 'ALL'` -- all tasks visible, All button fully highlighted (full cyan, same style as active tile), no tile highlighted
3. `bucketFilter = 'BucketName'` -- only that bucket's tasks visible, that tile fully highlighted, All button neutral

On page load, start in state 1 (null). No tasks visible. No button highlighted. Bodhi selects what he wants to see.

### Click rules

- **Click All button when state is 1 or 3:** set to state 2 (show all, highlight All button, clear any tile)
- **Click All button when state is already 2:** do nothing
- **Click a bucket tile when it is not active:** set to state 3 for that bucket (show that bucket only, highlight tile, clear All button)
- **Click a bucket tile when it IS active:** set to state 1 (null -- clear everything, show zero tasks, no button highlighted)

### What was wrong in v4r10

- On load, state was null but the task list was still rendering tasks (should render nothing when null)
- Clicking All button did nothing
- Clicking an active tile returned to ALL state instead of null

### Implementation notes

Find the bucket filter state variable and all the places it is set or read. Rebuild the logic cleanly:

1. Initialize `bucketFilter` to `null` on page load
2. Task render function: if `bucketFilter === null` show empty state (zero tasks), if `bucketFilter === 'ALL'` show all, otherwise filter by bucket name
3. All button click handler: if already ALL, return early; otherwise set to ALL, re-render, update button states
4. Tile click handler: if tile is already active, set to null; otherwise set to that bucket name; re-render, update button states
5. `syncAllBtn()` (or equivalent): `is-active` on All button only when `bucketFilter === 'ALL'`. No highlighting at all when null.

The empty state (bucketFilter null) should show the task list area as empty -- no tasks, no error, no "select a filter" hint needed. Clean empty canvas.

---

## Acceptance criteria

1. On Buckets page load: no tasks visible, no button highlighted, clean empty state.
2. Click a bucket tile: that bucket's tasks appear, tile highlights, All button stays neutral.
3. Click the active tile again: tile clears, zero tasks visible, no button highlighted.
4. Click All button from neutral state: all tasks appear, All button highlights, no tile highlighted.
5. Click All button when already active: nothing changes (no flicker).
6. All previously confirmed behavior (P1-P4, sort, hotkeys) remains unchanged.

---

## After fixes are complete, deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r11: P8 R3 -- bucket filter state model rebuild" && git push origin main
```

When deploy is done, paste the git output and the final SHA so QA can begin.
