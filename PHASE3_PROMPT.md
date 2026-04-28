# Command Center: Phase 3 Build
## Version: v4r6 (builds on v4r5, P1 Focus mode QA passed 2026-04-26)
## Task: P3 -- Add task button at top

---

## Read these files first

Read all three in full before writing any code:

- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`
- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`
- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-styles.css`

---

## What passed QA -- DO NOT TOUCH

The following features are confirmed working on v4r5. Do not modify any logic, markup, or styles that support them:

- P1: Focus mode. Amber pill button next to This Week tab. Selection mode, amber ring on selected tasks, full-screen modal overlay, checkboxes that PATCH done:true to Supabase, Exit Focus button, Escape key closes.
- P2: Drag-to-reorder. Tasks drag up and down within Today and This Week. Persists to sort_order column in Supabase.
- P4: Done tasks collapse. Completed tasks hide behind a toggle. Active list stays clean.
- P6: Bridge agent. Realtime listener on direct_line_responses. Do not touch.

---

## What to build: P3

Replace the existing bottom-of-list add task input with a compact modal triggered by a "+" button at the top of each task list.

### Remove

Find the existing add-task input at the bottom of each column (Today and This Week). Remove it entirely -- both the HTML and any JS event handlers attached to it.

### Add: "+" button

Add a small "+" button to each column header area, positioned at the top right of each list section (Today and This Week). Style it as a small circular or pill button. Use rgba(245,158,11,0.82) to match the existing amber accent. Give it a clear but minimal label: just "+" or a plus icon via text.

Each button targets its own list: the Today "+" adds to horizon 'today', the This Week "+" adds to horizon 'week'.

### Add: compact add-task modal

When the "+" button is clicked, open a compact modal (not full-screen). It should feel like a focused input popover, not the full-screen Focus overlay.

Modal layout:
- Dark overlay behind it (same overlay pattern already in use), but the modal box itself is compact, roughly 400px wide, centered on screen
- Title: "Add Task"
- Title input field (auto-focus when modal opens)
- Bucket selector dropdown with these options: bodhi360, MIRROR, Harmonic, FRAMEZERØ, Career, LDAG, Family, Command
- Two buttons: Save (amber, primary) and Cancel (ghost/secondary)
- Escape key closes the modal without saving

### Save behavior

On Save:
1. Validate: title must not be empty. If empty, shake the input or show a small inline error. Do not close the modal.
2. POST the new task to Supabase:
   - user_id: 'bodhi'
   - title: value from title input
   - bucket: value from bucket selector
   - horizon: 'today' or 'week' depending on which "+" was clicked
   - done: false
   - sort_order: 0 (new tasks go to top of list)
3. After successful POST, close the modal and re-fetch the task list so the new task appears immediately. No page reload.
4. Clear the modal inputs so it is ready for next use.

Use the same Supabase fetch pattern already in the codebase (same URL, same anon key, same headers).

### Style rules

- No em dashes anywhere in copy or comments
- Modal should match the existing dark glassmorphism aesthetic already in the codebase
- Keep the "+" button small and unobtrusive -- it should not compete visually with the column header or the Focus mode button
- Mobile: modal should be full-width on small screens

---

## Deploy

After all changes are written and saved, deploy with this exact command:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r6: P3 add task button at top" && git push origin main
```

Confirm the push succeeded before reporting done.
