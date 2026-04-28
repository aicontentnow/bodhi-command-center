# Command Center P8 Round 4 -- Claude Code Prompt
## Building: v4r12
## Builds on: v4r11 (P8 R3 QA -- steps 1-4a passed, step 4b fails)
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
- O hotkey guard
- N hotkey opens add-task modal
- T key is dead
- Bucket filter null state: loads empty, no tasks, no buttons highlighted
- Clicking a bucket tile: shows that bucket, tile highlights, All neutral
- Clicking active tile: clears to empty state (null), no highlights

---

## One fix

### All button must be a toggle, not a one-way switch

Current behavior: clicking All when already active does nothing (frozen).

Required behavior: All button behaves exactly like a bucket tile toggle.

- Click All when state is null or a bucket: set to ALL, show all tasks, highlight All button, clear any tile
- Click All when state is already ALL: set to null, clear to empty canvas, no tasks, no button highlighted

Find the All button click handler. Remove the early-return guard that prevents action when already ALL. Replace it with a toggle:

```
if (bucketFilter === 'ALL') {
  bucketFilter = null;
} else {
  bucketFilter = 'ALL';
}
re-render and sync button states
```

That is the entire change. Nothing else touches.

---

## Acceptance criteria

1. Buckets page loads empty (confirmed working, do not break).
2. Click a bucket tile: that bucket shows, tile cyan (confirmed working).
3. Click active tile: clears to empty (confirmed working).
4. Click All from neutral: all tasks appear, All button cyan.
5. Click All when already active: clears to empty canvas, All button loses highlight, no buttons highlighted.
6. Click All, then click a tile: tile highlights, All clears, only that bucket shows.
7. Click the active tile: back to empty, clean state.

---

## After fix is complete, deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r12: P8 R4 -- All button toggle to empty state" && git push origin main
```

When deploy is done, paste the git output and the final SHA so QA can begin.
