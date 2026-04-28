# Command Center P8 Round 1 Handoff
## Date: 2026-04-26
## Version: v4r9 -- P8 Round 1 QA PASSED (2 items carry to Round 2)
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## CURRENT STATE

P8 Round 1 complete on v4r9. Round 2 prompt written. Two small fixes carry forward before P8 is fully closed.

---

## Confirmed working (all QA passed)

**P6: Bridge agent scheduled** -- running every 30 minutes

**P2: Drag-to-reorder** -- persists sort_order to Supabase

**P4: Done tasks collapse** -- toggle works

**P1: Focus mode** -- amber pill, selection, modal, Supabase PATCH, Escape/Exit close

**P3: Add task button** -- "+" pinned top left, compact modal, validation, toast, Escape closes

**P8 Round 1 fixes (v4r9):**
- Sort inverted: fixed. Newest first = descending created_at. Oldest first = ascending. Amber `is-sort-active` class on active button.
- Bucket tile deselect: fixed. Clicking a tile highlights it. Clicking it again clears highlight and shows all tasks.
- O hotkey guard: fixed. O does not trigger panel toggle when Direct Line textarea has focus.
- N shortcut: N opens add-task modal (Today column) when no input has focus.

---

## P8 Round 2 -- next build (prompt ready)

File: `_command-center/PHASE8_ROUND2_PROMPT.md`
Building: v4r10

Two fixes:
1. Remove T shortcut entirely. N only for new task modal.
2. All button active state: highlighted when no bucket filter is active, clears when a tile is selected, re-highlights when filter is cleared.

---

## P9 -- State persistence (next phase after P8 closes)

On page refresh, sort preference, active page, and active tab reset to defaults. The `portfolio_state` table in Supabase (gcbvvausrmbbkfazojpl) already exists for this purpose. P9 will read state from `portfolio_state` on load and write state back on every user interaction that changes it (sort toggle, page change, tab change, bucket filter).

This is a dedicated phase -- do not fold it into P8 Round 2.

---

## PHASE 2 ROADMAP (updated 2026-04-26)

### Completed
- P6: Bridge agent scheduled
- P2: Drag-to-reorder
- P4: Done tasks collapse
- P1: Focus mode
- P3: Add task button + date label

### In progress
- P8: Polish -- Round 2 prompt written, v4r10 pending

### Not started (priority order)
- P9: State persistence on refresh (sort, page, tab -- use portfolio_state table)
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
| `_command-center/PHASE8_ROUND2_PROMPT.md` | Round 2 Claude Code prompt (ready) |
| `skills/direct-line-bridge/SKILL.md` | Bridge agent (scheduled, running) |
| `skills/command-center-cos/SKILL.md` | CoS skill |

Deployed at: aicontentnow.github.io/bodhi-command-center
GitHub repo: aicontentnow/bodhi-command-center (main branch, root folder)

---

## START NEXT SESSION WITH THIS PROMPT

```
Load this skill and follow its instructions:
skills/command-center-cos/SKILL.md

Read: _command-center/HANDOFF_CommandCenter_v4r9_2026-04-26.md
P8 Round 2 prompt is ready at _command-center/PHASE8_ROUND2_PROMPT.md
Give Bodhi the file link and tell him to take it to Claude Code.
Supabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl).
```
