# Command Center Phase 2 Handoff
## Date: 2026-04-26
## Status: P1 Focus mode QA PASSED (v4r5). P2 and P4 previously passed. P6 complete.
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## CURRENT STATE

Phase 2 is in progress. Three features are now confirmed working and deployed.

### Completed and QA confirmed

**P6: Bridge agent scheduled -- DONE**
Running every 30 minutes via scheduled Cowork task. Skill at `skills/direct-line-bridge/SKILL.md`.

**P2: Drag-to-reorder -- QA PASSED**
Tasks drag up and down within Today and This Week. Uses HTML5 Drag and Drop API with `sort_order` column.

**P4: Done tasks collapse -- QA PASSED**
Completed tasks collapse under a toggle. Active list stays clean.

**P1: Focus mode -- QA PASSED (v4r5, 2026-04-26)**
Full interaction confirmed working:
- Amber pill button sits inside the tabs container, flush next to This Week. Color rgba(245,158,11,0.82).
- Clicking enters selection mode. Task list stays visible. Tap up to 3 tasks (amber ring on selected).
- Start Focus opens full-screen modal with dark overlay.
- Checkboxes inside modal work: clicking checks the task, shows strikethrough, PATCHes done:true to Supabase.
- Exit Focus button closes modal.
- Escape key closes modal.
- Nothing is hidden or reordered during selection. Modal is a temporary attention overlay only.

---

## NEXT BUILD: P3

Add task button at top. Replace the bottom-of-list add input with a plus button pinned at the top of each column or inline with the Today/This Week tabs. Clicking opens a compact modal: title, bucket selector, save.

This is the next Claude Code build. Write the prompt when ready to start.

---

## PHASE 2 ROADMAP (updated 2026-04-26)

### Completed
- P6: Bridge agent scheduled
- P2: Drag-to-reorder
- P4: Done tasks collapse
- P1: Focus mode

### Not started (priority order)
- P3: Add task button at top (in QA -- round 2 pending)
- P3b: Task date display -- show created_at as date only (e.g. "Apr 26"), no time. Pacific time. Styled like bucket pill. Decision: time removed as too granular, date is sufficient for filtering. created_at already in Supabase, UI-only.
- P5: Subtasks with count badge and progress
- P7: File attachment in Direct Line
- P8: Polish carryover (bucket tile deselect, O hotkey capture fix, date sort is backwards + active sort state not visible in UI -- "newest first" label shows when oldest is active; fix sort order logic AND add active state indicator to whichever sort is currently applied, add hotkey N or T to open add-task modal -- must not fire when typing in any input or the Direct Line field)
- P9: Task context surfacing and smart prioritization (task notes + CoS logic to suggest priority order)

### Queued future
- P10: Agent assignment from Focus modal (conductor-orchestra model: CoS assigns, conductor executes, output to _review/, Bodhi approves)
- P11: CoS proactive check-in via AskUserQuestion modal (CoS reads findings, synthesizes to one recommendation, surfaces as modal -- Bodhi answers, CoS acts)

---

## PIPELINE RULES (unchanged)

- Claude Code builds AND deploys. Every Claude Code prompt ends with the git push command.
- Cowork (this session) runs QA only. Never fix code here.
- Supabase SQL runs via curl from bash (not Supabase MCP, which points to MIRROR org).
- No em dashes in any file, prompt, or UI copy.
- Deploy command: `git add index.html v2-app.js v2-styles.css` (explicit staging, not -A, avoids .claude/worktrees submodule noise)

---

## SUPABASE SCHEMA (Command Center project: gcbvvausrmbbkfazojpl)

tasks: id, user_id ('bodhi'), title, bucket, horizon ('today'/'week'), done (boolean), sort_order, created_at, updated_at
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
| `skills/command-center-cos/SKILL.md` | This CoS skill |

Deployed at: aicontentnow.github.io/bodhi-command-center
GitHub repo: aicontentnow/bodhi-command-center (main branch, root folder)

---

## START NEXT SESSION WITH THIS PROMPT

```
Load this skill and follow its instructions:
skills/command-center-cos/SKILL.md

Read the most recent handoff doc in _command-center/ for current state.
Supabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl).
Check in with Bodhi before starting any build work.
```
