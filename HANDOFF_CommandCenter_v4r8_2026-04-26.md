# Command Center Phase 3 Handoff
## Date: 2026-04-26
## Version: v4r8 -- P3 QA PASSED
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## CURRENT STATE

P3 is complete and QA confirmed on v4r8 (SHA a57c2ba).

### Completed and QA confirmed

**P6: Bridge agent scheduled -- DONE**
Running every 30 minutes via scheduled Cowork task.

**P2: Drag-to-reorder -- DONE**
Tasks drag up and down within Today and This Week. Persists to sort_order in Supabase.

**P4: Done tasks collapse -- DONE**
Completed tasks collapse under a toggle.

**P1: Focus mode -- DONE**
Amber pill button, selection mode, full-screen modal overlay, checkboxes PATCH done:true to Supabase, Exit Focus and Escape close.

**P3: Add task button at top -- DONE (v4r8)**
- "+" button pinned top left of Today and This Week columns
- Compact modal: title (auto-focus), bucket selector, Save and Cancel
- Empty title validation: shake + inline error, modal stays open
- Save: POSTs to Supabase, task appears at top of list immediately, toast "Task added"
- This Week "+" correctly adds to week horizon
- Escape closes modal
- Date label ("Apr 26") on second line under task title for all Supabase-loaded tasks
- Move button never overflows its pill
- Done tasks retain strikethrough

---

## NEXT BUILD: P8 Polish

P8 is the logical next phase -- it cleans up known friction before adding new features. All items are logged:

- Bucket tile does not visually deselect after filter is cleared (stays highlighted)
- O hotkey gets captured by text input when Direct Line is open (Escape is workaround)
- Date sort is inverted: "newest first" label is active when oldest is actually showing; fix sort logic AND add a visible active-state indicator to whichever sort is currently applied
- Add hotkey N or T to open the add-task modal (must not fire when typing in any input or the Direct Line field)

---

## PHASE 2 ROADMAP (updated 2026-04-26)

### Completed
- P6: Bridge agent scheduled
- P2: Drag-to-reorder
- P4: Done tasks collapse
- P1: Focus mode
- P3: Add task button at top + date label (v4r8)

### Not started (priority order)
- P8: Polish carryover (bucket tile deselect, O hotkey fix, date sort inverted + no active indicator, hotkey N/T for add-task modal)
- P5: Subtasks with count badge and progress
- P7: File attachment in Direct Line
- P9: Task context surfacing and smart prioritization (task notes + CoS logic to suggest priority order)

### Queued future
- P10: Agent assignment from Focus modal (conductor-orchestra model: CoS assigns, conductor executes, output to _review/, Bodhi approves)
- P11: CoS proactive check-in via AskUserQuestion modal (CoS reads findings, synthesizes to one recommendation, surfaces as modal -- Bodhi answers, CoS acts)

---

## PIPELINE RULES (unchanged)

- Claude Code builds AND deploys. Every Claude Code prompt ends with the git push command.
- Cowork (this session) runs QA only. Never fix code here.
- No em dashes in any file, prompt, or UI copy.
- Deploy command: `git add index.html v2-app.js v2-styles.css` (explicit staging, not -A)

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
| `skills/command-center-cos/SKILL.md` | CoS skill |

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
