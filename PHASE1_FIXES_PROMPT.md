# Command Center v3: Phase 1 QA Fix Prompt
## For: Claude Code
## Phase: Phase 1 QA Fixes + Phase 2 Feature Additions
## Version: v3 fixes (v2 QA passed 2026-04-21, v3 Phase 1 built, this prompt addresses all QA findings before v3 deploys)

---

## READ THESE FILES FIRST BEFORE WRITING ANYTHING

1. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js` -- existing working file, do not break anything
2. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html` -- existing working file
3. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-styles.css` -- existing working file
4. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/skills/direct-line-bridge/SKILL.md` -- bridge agent, one targeted edit needed

Do not rewrite any file from scratch. Make targeted edits only to the specific sections described below.

---

## SUPABASE SQL (run these first, before any code changes)

The Command Center Supabase project is at:
https://gcbvvausrmbbkfazojpl.supabase.co

Row-Level Security is blocking the bridge agent from writing to two tables. Run these SQL statements in the Supabase SQL editor at:
app.supabase.com/project/gcbvvausrmbbkfazojpl/sql

```
ALTER TABLE task_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE direct_line_responses DISABLE ROW LEVEL SECURITY;
```

Confirm both ran without error before proceeding to code changes.

---

## PRIORITY 1: CRITICAL BUGS (must fix before v3 deploys)

### Fix 1: Loading state is not working

The is-loading class and spinner were added in Phase 1 but the flash of prototype/filler UI still appears on every hard refresh across all pages. The task list, energy selector, and all other Supabase-dependent UI show stale or empty placeholder content for 1-2 seconds before Supabase resolves.

Verify the following sequence is correct in v2-app.js:
- `document.body.classList.add('is-loading')` fires BEFORE `initFromSupabase()` is called
- `document.body.classList.remove('is-loading')` fires in BOTH the success path and catch path of initFromSupabase()
- In v2-styles.css: `body.is-loading .task-list-wrap { visibility: hidden; }` and `body.is-loading .energy-selector { visibility: hidden; }` are present and correctly scoped

If the above is all correct, the issue may be that DEFAULT_TASKS or other hardcoded data renders before initFromSupabase() runs. Investigate whether the initial render pass is populating the UI with fallback data, then Supabase overwrites it. If so, suppress the initial render until Supabase resolves. The spinner should be the only thing visible during this window.

Do not add localStorage. Do not change Supabase connection logic.

---

### Fix 2: aria-hidden focus trap (two locations)

When the side drawer closes, the browser logs:
"Blocked aria-hidden on an element because its descendant retained focus."

This fires in two places:
- `button.x#drawerClose` inside `aside.drawer#drawer` (aria-hidden="true")
- `button.x#lineClose` inside `aside.line-panel#linePanel` (aria-hidden="true")

In both cases, when the panel closes, focus is left on the close button inside the now-hidden panel.

Fix: before setting aria-hidden="true" on either panel, move focus back to a sensible trigger element (the button that opened the panel, or document.body as fallback). Alternatively, replace aria-hidden with the inert attribute on both panels, which also prevents focus.

Apply the same fix pattern to both the drawer and linePanel close sequences.

---

### Fix 3: Direct Line queue does not reload from Supabase on refresh

When a message is sent via the Direct Line panel, it appears immediately with a "pending" status. After a hard refresh, the message is gone. The queue should persist.

On initFromSupabase(), after loading tasks and portfolio state, also query:

```
GET /rest/v1/direct_line_messages?user_id=eq.bodhi&processed=eq.false&order=created_at.asc
```

Use the same Supabase headers as the rest of the app. For each unprocessed message returned, call pushMessage() with role='user' and status='pending' to repopulate the Direct Line panel queue.

This means the Direct Line panel shows the real queue state on every load, not just in-session messages.

---

### Fix 4: Task sort order is inverted

New tasks appear at the top of the list after a hard refresh. Expected behavior: oldest tasks at the top, newest at the bottom.

The tasks table has a `sort_order` integer column (default 0) and a `created_at` timestamp. Currently all tasks get sort_order=0 on insert, which means sort is undefined.

Fix the render sort in v2-app.js: when rendering the task list for a given horizon, sort by created_at ascending (oldest first). Do not sort by sort_order unless a non-zero value is explicitly set. This gives stable, predictable ordering without needing to manage sort_order on every insert.

---

## PRIORITY 2: UI FIXES

### Fix 5: Direct Line panel layout

The current panel layout wastes space on static chrome and squeezes the queue into a small scrolling window. Rework the panel layout as follows:

- Remove the "say what needs to change" instructional copy. It is redundant.
- The queue (list of pending and replied messages) should be the dominant element in the panel. Give it maximum available vertical space.
- The three structured launch one-tap buttons (Brain Dump, Red Phone, Task) should be reduced in visual weight. Make them smaller or collapse them to icon+label. They should not take up more than 20% of the panel height.
- Remove the "More" item below the queue. It duplicates information already visible.
- The text input and send button stay at the bottom, fixed. The queue scrolls above it.

---

### Fix 6: Roadmap completed items should show strikethrough

On the Roadmap page, completed items currently show a green status pill on the far right. Reading left to right, there is no visual indication that the item is done until you scan all the way across the row.

Add a CSS strikethrough (text-decoration: line-through) to the text of any roadmap item whose status is done/complete. Keep the green pill as-is. The strikethrough makes done state readable at a glance without hunting for the pill.

---

### Fix 7: Bucket label casing inconsistency

Tasks created by the bridge agent use the canonical bucket names. Tasks added manually via the UI default to bodhi360 but the casing is inconsistent (sometimes "BODHI360", sometimes "bodhi360").

Normalize all bucket labels on both write and display to these exact strings:
- bodhi360
- MIRROR
- Harmonic
- Family
- FRAMEZERO
- LDAG
- Career
- Command

On every task write (whether from manual UI add or bridge agent), validate the bucket value against this list before inserting. If the value does not match (case-insensitive), normalize it to the canonical form. If it matches nothing, default to bodhi360.

On display, always render the canonical form.

---

### Fix 8: Favicon 404

The browser logs a 404 for favicon.ico. Add a simple favicon to the project. A plain SVG or 32x32 PNG is fine. Reference it in the index.html head:

```
<link rel="icon" type="image/svg+xml" href="favicon.svg">
```

If creating an SVG: use a simple dark circle or square with a white "B" or similar minimal mark. Keep it under 20 lines.

---

### Fix 9: THE BOOK OF ONENESS capitalization

In the dashboard, the link or label for the Book of Oneness project should display as:
THE BOOK OF ONENESS

All caps. Find every instance where this string appears in index.html or v2-app.js and update to all caps.

---

## PRIORITY 3: NEW FEATURES

### Feature 1: Task horizon move (today / week, two directions)

Add a way to move any task between today and week horizons. This must work in both directions: today to week, and week to today.

Implementation: add a small move button or icon to each task row. On click, it toggles the task's horizon between 'today' and 'week' and updates the row in Supabase:

```
PATCH /rest/v1/tasks?id=eq.<task_id>
body: {"horizon": "<new_horizon>"}
```

After a successful PATCH, move the task card to the correct column in the UI immediately without a full reload.

The button should be subtle -- not a primary action. A small arrow icon or abbreviated label (e.g., "move to week" / "move to today") appearing on hover is sufficient.

---

### Feature 2: Bucket selector on manual task add

When a user adds a task manually via the UI, there is currently no way to choose a bucket. All manual tasks default to bodhi360.

Add a bucket selector to the task add UI. It should appear alongside the task title input. A compact dropdown or segmented control showing the canonical bucket names is sufficient.

Default selection: bodhi360.

On submit, write the selected bucket value to Supabase along with the task title.

---

### Feature 3: Bucket view -- group tasks by bucket

The Buckets page currently shows tasks with bucket tags on each row but does not group or filter by bucket.

Rework the Buckets page to group tasks by bucket. Each bucket gets a header and a list of its tasks underneath. Buckets with zero tasks are hidden.

Use the same task card styling as the Today/Week lists. This page shows ALL tasks regardless of horizon, grouped by bucket.

---

### Feature 4: Smarter horizon assignment in bridge agent

Edit the SKILL.md file at:
`/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/skills/direct-line-bridge/SKILL.md`

Find the ROUTING LOGIC section. Change the horizon default from 'week' (not 'today'). Currently the agent defaults everything to 'today' and only overrides for urgency signals. Reverse this:

- Default: 'week'
- Override to 'today' ONLY if content contains explicit urgency signals: today, urgent, ASAP, right now, by end of day, this morning, this afternoon, EOD (case-insensitive)

This is a one-line logic change in the SKILL.md. Make the edit. Do not touch any other section of the SKILL.md.

---

## DO NOT

- Do not rewrite any file from scratch
- Do not touch Supabase connection code, table names, or the Realtime subscription
- Do not add localStorage
- No em dashes in any string literals, comments, or UI copy
- Do not change v2-app.js file name or move it
- Do not modify DEFAULT_TASKS data structure unless explicitly required by Fix 1

---

## AFTER COMPLETING ALL FIXES

Confirm:
1. Supabase SQL ran (RLS disabled on task_notes and direct_line_responses)
2. Loading state works -- no flash of filler content, spinner visible during load
3. aria-hidden fix applied to both drawer and linePanel
4. Queue reloads from Supabase on hard refresh
5. Task sort is oldest-first
6. Direct Line panel layout updated
7. Roadmap strikethrough on completed items
8. Bucket casing normalized
9. Favicon added
10. THE BOOK OF ONENESS all caps
11. Task horizon move button working in both directions
12. Bucket selector on manual add
13. Buckets page groups by bucket
14. SKILL.md horizon default changed to 'week'

Do not deploy. Cowork handles QA and deployment after reviewing the changes.

---

## VERSION NOTE

Command Center current deployed version: v2 (QA passed 2026-04-21).
v3 Phase 1 was built (bridge agent SKILL.md, loading state fix) but NOT yet deployed pending QA.
This prompt addresses all Phase 1 QA findings. Once these fixes are confirmed, v3 deploys.
Phase 2 features (in Priority 3 above) may be batched into v3 or become v4 depending on build scope.
