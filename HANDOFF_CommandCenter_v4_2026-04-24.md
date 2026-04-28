# Command Center Phase 2 Handoff
## Date: 2026-04-24
## Status: P1 Focus mode rebuild in progress. P2 and P4 QA passed. P6 complete.
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## CURRENT STATE

v3 is the deployed baseline. Phase 2 is in progress.

### Completed this session

**P6: Bridge agent scheduled -- DONE**
Bridge agent skill at `skills/direct-line-bridge/SKILL.md` is running as a scheduled Cowork task every 30 minutes. No manual run needed.

**P2: Drag-to-reorder -- QA PASSED**
Tasks can be dragged up and down within Today and This Week lists. Uses HTML5 Drag and Drop API with `sort_order` column in Supabase. Cross-list drags are correctly rejected.

**P4: Done tasks collapse -- QA PASSED**
Completed tasks collapse under a "X completed" toggle. They do not pollute the active list.

**P1: Focus mode -- QA FAILED, rebuild prompt written**
Current implementation hides all tasks when Focus is clicked. Wrong interaction model. Full rebuild prompt at `_command-center/PHASE2_ROUND2_FOCUS_PROMPT.md`. Send this to Claude Code and run QA when it deploys.

---

## FOCUS MODE SPEC (what Claude Code is building)

Full-screen modal overlay. Blocks entire dashboard including sidebar and nav.

Interaction flow:
1. Amber/yellow Focus button near Today/This Week tabs
2. Clicking enters selection mode -- task list stays visible, user taps up to 3 tasks
3. "Start Focus" button activates once at least 1 task is selected
4. Full-screen modal shows only the 3 chosen tasks, large and readable, with checkboxes
5. "Exit Focus" closes modal, returns to normal view

Nothing is hidden until the modal opens. Nothing is reordered by Focus mode. It is a temporary attention overlay, not a task management action.

---

## PHASE 2 ROADMAP (updated)

### In progress
- P1: Focus mode (full-screen modal, round 2 prompt written, waiting for Claude Code)

### Not started (priority order)
- P3: Add task button at top (replaces bottom input, compact modal on click)
- P5: Subtasks with count badge and progress
- P7: File attachment in Direct Line
- P8: Polish carryover (bucket tile deselect, O hotkey badge, O hotkey capture fix)
- P9: Task context surfacing and smart prioritization

### P9 detail (new, added 2026-04-24)
Tasks should surface attached notes and transcript context on demand. CoS logic should use recency, project stage, and overdue signals to suggest priority order. The current task list is a dumb brain dump with no context. The `task_notes` table and bridge agent already exist as the foundation. What is missing is the UI layer and the CoS logic that reads those notes to suggest what to work on next. This is the feature that turns the command center from a list viewer into an actual thinking partner.

### P10: Agent assignment from Focus modal (added 2026-04-24)
From inside the Focus modal, tasks that are Claude-executable (writing, research, building) should have an "Assign to Agent" action. Tapping it routes the task to the correct conductor via the Direct Line. The conductor (Harmonic, FRAMEZERØ, LDAG, MIRROR, etc.) picks up the task, executes it, and routes the output to `_review/` for Bodhi to approve. The Direct Line bridge polls for the response, surfaces it in the command center, and updates the task status. Bodhi reviews, approves or sends back for revision, and the loop closes. Tasks that are approved get checked off. Tasks that need revision go back to the same conductor with the feedback attached.

This is the conductor-orchestra model: CoS assigns, conductor executes with its specialist skills, output comes back for review, Bodhi approves. The command center is the control surface for the entire system.

### P11: CoS proactive check-in with AskUserQuestion modal (added 2026-04-24)
The CoS should not write documents for Bodhi to go read. It should read documents itself, synthesize them to one recommendation, and surface the recommendation as an AskUserQuestion modal directly in the conversation. Bodhi answers the modal (yes/no/pick one), the CoS acts. No file reading required from Bodhi. No document hunting. The system does the thinking and asks only for the decision.

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
| `_command-center/PHASE2_ROUND2_FOCUS_PROMPT.md` | Claude Code prompt for Focus mode rebuild |
| `_command-center/DIRECT_LINE_BUILD_SPEC.md` | Full Direct Line product spec |
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
