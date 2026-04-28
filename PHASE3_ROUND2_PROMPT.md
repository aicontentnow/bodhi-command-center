# Command Center: Phase 3 Round 2
## Version: v4r7 (builds on v4r6, SHA e39b861)
## Fixes: button position + timestamp label

---

## Read these files first

Read all three in full before writing any code:

- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`
- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`
- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-styles.css`

---

## What passed QA on v4r6 -- DO NOT TOUCH

- Modal opens on "+" click, title auto-focused, bucket defaults to bodhi360
- Empty title validation: input shakes, error message, modal stays open
- Save: modal closes, task appears at top of list, toast "Task added"
- This Week "+" correctly adds to week horizon
- Escape key closes modal without saving
- All previously confirmed features: Focus mode, drag-to-reorder, done tasks collapse, bridge agent

---

## Fix 1: Move "+" button to top left

The "+" button currently sits at the top right of each column header. Move it to the top left. Everything else about the button stays the same -- amber color, size, behavior. Position only.

---

## Fix 2: Add timestamp label to each task

Display the task's `created_at` value as a small, non-intrusive label on each task card. Style it exactly like the bucket pill -- same size, same muted tone, same font weight. Place it inline with the bucket label.

Format the timestamp in Pacific time (America/Los_Angeles). Use this format: Apr 26, 2:34pm

Use the browser's `Intl.DateTimeFormat` with timeZone: 'America/Los_Angeles' to format it. Do not use any external libraries.

The `created_at` field already exists on every task row returned from Supabase. No schema changes needed.

---

## Deploy

After all changes are written and saved:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r7: P3r2 button left + timestamp label" && git push origin main
```

Confirm the push succeeded before reporting done.
