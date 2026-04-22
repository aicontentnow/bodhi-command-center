# Bodhi 360 Command Center: Bug Fix Handoff
## Date: 2026-04-21
## Status: Tasks load then immediately disappear on every page refresh

---

## What you are working on

The Bodhi 360 Command Center dashboard lives at:
`/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/`

Three files:
- `index.html` (shell, no logic)
- `v2-app.js` (all logic, ~1080 lines)
- `v2-styles.css` (all styles)

Deployed to GitHub Pages at: https://aicontentnow.github.io/bodhi-command-center/
Git repo: https://github.com/aicontentnow/bodhi-command-center

Your job is to read the actual file, diagnose the disappearing-tasks bug, fix it, and verify interactively with Bodhi.

---

## The bug

On every hard refresh:
1. Tasks appear immediately (hardcoded defaults in JS state, lines 37-58 of v2-app.js)
2. About 1 second later, all tasks vanish
3. The task list is now empty

This happens consistently. No error toasts appear. The "live" status badge does appear (meaning Supabase connected successfully).

---

## What has already been tried and fixed (do not revert these)

### Fix 1: Column name alignment (commit a89f56f)
The JS was using wrong column names inherited from a different Supabase project. Corrected to match the actual Bodhi 360 schema:
- `row.subject` corrected to `row.title`
- `row.status === 'done'` corrected to `row.done === true`
- `.order('created_at')` corrected to `.order('sort_order')`
- INSERT uses `title:` not `subject:`
- UPDATE uses `done:` not `status:`
- `.select()` lists correct columns: `id, title, bucket, horizon, done, sort_order, created_at`

### Fix 2: portfolio_state active_page guard (commit 0fade7d)
The `initFromSupabase` function was restoring `active_page = 'home'` from Supabase on every load, which called `setPage('home')` and hid the task pane. Guard added at line 970:

```
if (ps.active_page && ps.active_page !== 'home') state.page = ps.active_page;
```

### Fix 3: portfolio_state SQL UPDATE (run by Bodhi in Supabase dashboard)
The existing portfolio_state row was updated to set `active_page = 'today'` and `active_tab = 'today'`.

### Fix 4: Supabase tables seeded
The tasks table in the Bodhi 360 project (`gcbvvausrmbbkfazojpl`) has real rows:
8 tasks with `horizon = 'today'` and `user_id = 'bodhi'`.

---

## Supabase project details (do not change these)

```
SUPABASE_URL = 'https://gcbvvausrmbbkfazojpl.supabase.co'
SUPABASE_ANON_KEY = 'sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P'
```

This is the Bodhi 360 org. There is a second Supabase org (MIRROR Publishing, `pobddtmnzimcdiaujyyf`) used for a different project entirely. Do not change the URL or key in v2-app.js.

---

## Actual Bodhi 360 schema

### tasks
| Column | Type | Notes |
|---|---|---|
| id | uuid | gen_random_uuid() |
| user_id | text | always 'bodhi' |
| title | text | task label |
| bucket | text | bodhi360, MIRROR, Harmonic, Family, etc. |
| horizon | text | 'today' or 'week' |
| done | boolean | true/false |
| sort_order | integer | order tasks by this, ascending |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### portfolio_state
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | text | UNIQUE, always 'bodhi' |
| energy_state | text | 'workday', 'green', 'yellow', 'red', 'potato', 'focus', 'crash', 'harmonic' |
| active_view | text | 'cockpit' or 'orbit' |
| active_page | text | 'home', 'today', 'buckets', 'prompts', 'roadmap', 'share' |
| active_tab | text | tab identifier |
| updated_at | timestamptz | |

---

## What to diagnose

Read v2-app.js in full before doing anything. Then:

1. Open the browser console on the deployed page (or run locally). Check for any JS errors or Supabase error responses in the console after the tasks disappear.

2. Check whether `initFromSupabase` is being called more than once. If it fires twice, the second call would overwrite state.

3. Check whether the tasks table query is returning 0 rows (permissions issue, wrong horizon values, etc.). If it returns 0 rows, lines 1025-1026 would set `state.today = []` and `state.week = []`, wiping the hardcoded defaults.

4. Check RLS policies on the tasks table. The anon key must have SELECT permission. Verify via the Supabase dashboard at https://app.supabase.com/project/gcbvvausrmbbkfazojpl.

5. Check whether the realtime subscription for `tasks-live` (line 1032 area) fires an event on connect that clears or overwrites state unexpectedly.

6. Confirm the latest deployed JS is actually being served (CDN caching). The current HEAD commit is `0fade7d`. Check `https://aicontentnow.github.io/bodhi-command-center/v2-app.js` to confirm the guard on line 970 reads `ps.active_page && ps.active_page !== 'home'`. If the old version is still cached, force a cache-bust by appending `?v=2` to the script src in index.html, then redeploy.

---

## Constraints

- Do not change SUPABASE_URL or SUPABASE_ANON_KEY
- Do not change Supabase table names
- Do not add localStorage anywhere (not supported in this environment)
- No em dashes in any code comments or strings
- Stage-by-stage approach: fix one thing at a time, verify with Bodhi before the next change

---

## Interactive QA checklist (run with Bodhi after fix is deployed)

Each step: Claude presents it, Bodhi tests it, reports pass/fail. Do not advance until each step passes.

1. Hard refresh the dashboard. Tasks remain visible after 2 seconds. PASS or FAIL.
2. Check the browser console. Zero errors related to Supabase or column names. PASS or FAIL.
3. Add a new task using the input field. Task appears in the list and persists after refresh. PASS or FAIL.
4. Check a task checkbox. Done state persists after refresh. PASS or FAIL.
5. Open the Direct Line panel. Type a message and click Send. Message appears in thread (even without a CoS reply). PASS or FAIL.
6. Switch to the Week tab. Week tasks load. PASS or FAIL.
7. Switch energy states (top state pills). State persists after refresh. PASS or FAIL.

---

## Deploy command (after any change)

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add -A && git commit -m "fix: [description]" && git push origin main
```

Run via Desktop Commander `start_process`. Home directory is `/Users/bodhivalentine`.

---

## What done looks like

All 7 QA steps pass. Bodhi confirms. Then update the master brain's SUPABASE SCHEMA REFERENCE if any schema discoveries were made.

---

## START NEXT SESSION WITH THIS PROMPT

Paste into a Claude Code session:

Read the full file at:
/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js

Then read the handoff document at:
/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/CLAUDE_CODE_BUGFIX_PROMPT.md

The bug is: tasks appear on hard refresh then vanish about 1 second later. All previously attempted fixes are documented in the handoff. Do not revert them. Read the file, diagnose from the console output and code, fix the root cause, and run the QA checklist interactively with Bodhi.
