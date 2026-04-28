# P6 Part B: Subtask Display + F Hotkey
## Building: Command Center v4r15
## Baseline: v4r14 (P5 QA passed 2026-04-27)
## Date: 2026-04-27

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder). It connects to Supabase (project gcbvvausrmbbkfazojpl) for live task data, portfolio state, and Direct Line messaging.

Current version: v4r14 (v4r14 QA passed 2026-04-27)
This prompt builds: v4r15

A `subtasks` table now exists in Supabase:
- id uuid PK
- task_id uuid FK references tasks(id) ON DELETE CASCADE
- title text
- done boolean default false
- sort_order integer default 0
- created_at timestamptz

Supabase anon key: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P
Supabase URL: https://gcbvvausrmbbkfazojpl.supabase.co

## What is already built and confirmed working

- P1: Focus mode -- amber pill, task selection, modal, Supabase PATCH, Escape/Exit close
- P2: Drag-to-reorder -- persists sort_order to Supabase
- P3: Add task button -- "+" pinned top, compact modal, validation, toast, Escape closes
- P4: Done tasks collapse -- "show completed (N)" toggle
- P5: Direct Line CoS Conversation Thread -- two-sided bubble layout, loads from Supabase, realtime appends, persists on refresh
- P8: Polish -- sort toggle, hotkey guards (N key, O key, Escape), bucket filter state model
- P9: State persistence on refresh -- sort preference, active tab, bucket filter

## What this prompt builds

Three changes to v2-app.js, v2-styles.css, and index.html:

1. Subtask fetch on load: after loading the tasks array from Supabase, fetch all subtasks for those tasks in one request. Store them in a map keyed by task_id (array of subtask objects per key).

2. Subtask count badge and progress on task cards: any task card that has one or more subtasks in the map shows a small badge below the task title. Badge format: "N subtasks -- X done" where N is total count and X is done count. If all are done: "N/N done" styled with a muted green tint. If none done: "N subtasks". The badge is plain text, small (0.72rem), muted color (#888), no icons, no click behavior.

3. F hotkey: when no input or textarea has focus, pressing F opens Focus mode using the same function triggered by clicking a task's focus button. Guard it identically to the N hotkey guard (check document.activeElement is not an input or textarea before acting). If no task is currently in focus state, open the Focus modal in task-selection mode (same as clicking "Focus" with nothing selected). If Focus modal is already open, F closes it (same as Escape).

## What must not be touched

- All P5 Direct Line code: conversation thread, bubble layout, send function, realtime subscription
- All P1 Focus mode logic (task selection, modal, Supabase PATCH, Escape/Exit behavior). The F hotkey calls the existing open function, it does not rewrite it.
- All P2 drag-to-reorder logic
- All P3 add-task modal logic
- All P4 done tasks collapse logic
- All P8 sort toggle, O hotkey, N hotkey, bucket filter, All button
- All P9 state persistence (sbLive guard, localStorage reads on load)
- Supabase connection setup and all existing table queries
- The tasks table schema and all existing task writes/reads
- v2-styles.css beyond adding the new badge style class

## Implementation guidance

### Subtask fetch

Read the existing task-load function to understand where tasks are fetched from Supabase. After that fetch resolves and the tasks array is populated, make one additional request:

```
GET /rest/v1/subtasks?task_id=in.(<comma-separated task UUIDs>)&select=id,task_id,title,done,sort_order&order=sort_order.asc
```

Use the same apikey and Authorization headers as all other Supabase calls in this file.

If the tasks array is empty, skip the subtask fetch entirely.

Build a subtask map: an object where each key is a task_id string and each value is an array of subtask objects. Example: `{ "uuid1": [{id, title, done, sort_order}, ...] }`

Store this map in a variable accessible to the task card render function.

If the subtask fetch fails (non-200), log the error and continue rendering tasks without badge data. Do not block the task list from rendering.

### Badge render

Find the task card render function (wherever individual task card HTML is built). After the task title element, conditionally insert the badge if `subtaskMap[task.id]` exists and has length > 0.

Badge HTML (inline is fine, or add a CSS class):

```
<span class="subtask-badge">[N subtasks -- X done]</span>
```

Where N = subtaskMap[task.id].length and X = subtaskMap[task.id].filter(s => s.done).length.

Text variations:
- X === 0: "[N] subtask[s]" (use plural if N > 1)
- 0 < X < N: "[X]/[N] done"
- X === N: "[N]/[N] done" (all complete)

Add to v2-styles.css:

```
.subtask-badge {
  display: block;
  font-size: 0.72rem;
  color: #888;
  margin-top: 2px;
  user-select: none;
}

.subtask-badge.all-done {
  color: #4caf7d;
}
```

Apply `all-done` class when X === N and N > 0.

### F hotkey

Find the keydown event listener where N and O hotkeys are handled. Add F key handling in the same block:

```
if (e.key === 'f' || e.key === 'F') {
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
  // call the function that opens Focus mode
}
```

Read the existing Focus mode open function name from the code -- do not assume a name. Call it directly. If Focus modal is already visible, close it (same as Escape behavior for that modal).

## Deploy

After making all changes, deploy:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r15: P6B subtask badges and F hotkey" && git push origin main
```

Confirm the push SHA and report it.
