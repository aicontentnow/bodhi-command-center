# Command Center Handoff
## Date: 2026-04-27
## Version: v4r12 -- P8 QA PASSED (all rounds complete)
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## CURRENT STATE

P8 Polish fully closed. v4r12 is the confirmed working baseline.
Deployed at: aicontentnow.github.io/bodhi-command-center

---

## Confirmed working (full list)

**P6: Bridge agent** -- scheduled every 30 minutes

**P2: Drag-to-reorder** -- persists sort_order to Supabase

**P4: Done tasks collapse** -- toggle works

**P1: Focus mode** -- amber pill, selection, modal, Supabase PATCH, Escape/Exit close

**P3: Add task button** -- "+" pinned top, compact modal, validation, toast, Escape closes

**P8 Polish (all rounds):**
- Sort inverted: fixed (newest/oldest, amber is-sort-active)
- O hotkey guard: O does not fire when Direct Line textarea has focus
- N shortcut: opens add-task modal when no input has focus
- T key: dead (no action)
- Bucket filter state model: null / ALL / BucketName, explicit, no coercion
- Buckets page loads empty by default (null state, no tasks, no buttons highlighted)
- All button: true toggle (click to show all, click again to clear to empty)
- Bucket tiles: true toggle (click to filter, click again to clear to empty)
- All filter state transitions confirmed working with no frozen states

---

## PHASE 2 ROADMAP (updated 2026-04-27)

### Completed
- P6: Bridge agent scheduled
- P2: Drag-to-reorder
- P4: Done tasks collapse
- P1: Focus mode
- P3: Add task button
- P8: Polish (all rounds, fully closed)

### Next phase
**P9: State persistence on refresh**

On page refresh, sort preference, active page, and active tab reset to defaults.
The `portfolio_state` table already exists in Supabase (gcbvvausrmbbkfazojpl):

```
portfolio_state: id, user_id (UNIQUE 'bodhi'), energy_state, active_view, active_page, active_tab, updated_at
```

P9 reads state from `portfolio_state` on load and writes state back on every user interaction that changes: sort toggle, page change, tab change, bucket filter.

This is a dedicated phase -- do not fold anything else into it.

### Not started (priority order after P9)
- P5: Subtasks with count badge and progress
- P7: File attachment in Direct Line

### Queued future
- P10: Agent assignment from Focus modal
- P11: CoS proactive check-in via AskUserQuestion modal

---

## PIPELINE RULES (unchanged)

- Claude Code builds AND deploys. Every prompt ends with the git push command.
- Cowork runs QA only. Never fix code here.
- No em dashes in any file, prompt, or UI copy.
- Deploy command: `git add index.html v2-app.js v2-styles.css` (explicit staging, not -A)

---

## SUPABASE SCHEMA (Command Center project: gcbvvausrmbbkfazojpl)

tasks: id, user_id ('bodhi'), title, bucket, horizon ('today'/'week'), done (boolean), sort_order, created_at, updated_at
portfolio_state: id, user_id (UNIQUE, 'bodhi'), energy_state, active_view, active_page, active_tab, updated_at
direct_line_messages: id, user_id, content, kind, tag, processed (bool), created_at
direct_line_responses: id, message_id, agent, content, created_at (RLS disabled, realtime on INSERT)
task_notes: id, task_id, content, created_at (RLS disabled)

---

## FILES

| File | Purpose |
|------|---------|
| `_command-center/index.html` | Dashboard HTML |
| `_command-center/v2-app.js` | All JS logic |
| `_command-center/v2-styles.css` | All CSS |
| `skills/direct-line-bridge/SKILL.md` | Bridge agent (scheduled, running) |
| `skills/command-center-cos/SKILL.md` | CoS skill |

Deployed at: aicontentnow.github.io/bodhi-command-center
GitHub repo: aicontentnow/bodhi-command-center (main branch, root folder)

---

## START NEXT SESSION WITH THIS PROMPT

```
Load this skill and follow its instructions:
skills/command-center-cos/SKILL.md

Read: _command-center/HANDOFF_CommandCenter_v4r12_2026-04-27.md
Supabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl).
Check in with Bodhi before starting any build work.
```
