# Command Center Handoff
## Date: 2026-04-27
## Version: v4r13 -- P9 QA PASSED
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## CURRENT STATE

P9 State Persistence fully closed. v4r13 is the confirmed working baseline.
Deployed at: aicontentnow.github.io/bodhi-command-center
SHA: 1a73e86

---

## Confirmed working (full list)

**P6: Bridge agent** -- scheduled every 30 minutes

**P2: Drag-to-reorder** -- persists sort_order to Supabase

**P4: Done tasks collapse** -- toggle works

**P1: Focus mode** -- amber pill, selection, modal, Supabase PATCH, Escape/Exit close
- Hotkey: F key NOT YET BUILT. Focus mode currently opens via task button click only. F hotkey to be added in next Claude Code prompt (bundle with P5).

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

**P9 State Persistence on Refresh (all items):**
- Sort preference (oldest/newest) persists on refresh
- Active tab (Today/This Week) persists on refresh
- Bucket tile filter persists on refresh (tile re-highlights, tasks re-render)
- All button filter persists on refresh
- Empty canvas (cleared filter) persists on refresh
- sbLive guard prevents load-time state restoration from writing back to Supabase

---

## PHASE 2 ROADMAP (updated 2026-04-27)

### Completed
- P6: Bridge agent scheduled
- P2: Drag-to-reorder
- P4: Done tasks collapse
- P1: Focus mode
- P3: Add task button
- P8: Polish (all rounds, fully closed)
- P9: State persistence on refresh (fully closed)

### Next phase
**P5: Direct Line CoS Conversation Thread** (CURRENT -- prompt ready at `_command-center/P5_PROMPT.md`)

Replace the Direct Line queue view with a persistent two-sided conversation thread. User messages on the right (amber), CoS responses on the left (dark). Thread loads from Supabase on every page open and persists across refresh. Realtime subscription appends new CoS responses live.

Claude Code prompt: `_command-center/P5_PROMPT.md` -- Building v4r14, builds on v4r13.

The bridge skill (v2.0) is already live with real redphone handling. Part B is the dashboard conversation thread UI. Deliver P5_PROMPT.md to Claude Code, then run QA from the checklist in that file.

**P6: Subtasks with count badge and progress** (NEXT AFTER P5)

Tasks can have nested subtasks. Parent task shows a count badge and progress indicator. Reduces visual noise, helps with multi-step work.

**ARCHITECTURAL DIRECTION (confirmed 2026-04-27):** Subtask structure starts at the transcription/intake phase, not built manually in the UI. When a transcript is processed and tasks extracted, related and coordinated tasks must be grouped hierarchically at the point of extraction -- parent task written first, child subtasks nested under it. The Command Center then displays that pre-built structure. This is AuDHD-optimized: the cognitive work of grouping happens at intake, not at the dashboard. Drag-and-drop nesting UI is not the goal. The goal is arriving at the dashboard with tasks already organized.

P6 has two parts:

**Part A (intake layer):** Update the transcript intake system (inbox-watcher skill, ldag-transcript-intake skill, direct-line-bridge) to write parent/child task relationships to Supabase at extraction time. A dedicated `subtasks` table is recommended: id, task_id (FK), title, done (boolean), sort_order, created_at. Confirm table exists before writing any code.

**Part B (UI layer):** Update the Command Center to read and display the nested structure with count badge and progress indicator. Part A must be scoped and built before Part B is meaningful.

**Bundle into P6 Claude Code prompt:** Add F hotkey to open Focus mode when no input has focus. Wire it the same way N is wired (no input focus guard). Focus mode currently opens only via task button click.

### Not started (priority order after P5)
- P7: File attachment in Direct Line

### Queued future
- P10: Agent assignment from Focus modal
- P11: CoS proactive check-in via AskUserQuestion modal

---

## HOTKEY REFERENCE (corrected 2026-04-27)

- O: opens side panel (confirmed working)
- F: NOT YET BUILT -- should open Focus mode when no input has focus (bundle into P5 prompt)
- N: opens add-task modal when no input has focus (confirmed working)
- Escape: closes any open modal or panel (confirmed working)
- T: dead (no action)

---

## PIPELINE RULES (unchanged)

- Claude Code builds AND deploys. Every prompt ends with the git push command.
- Cowork runs QA only. Never fix code here.
- No em dashes in any file, prompt, or UI copy.
- Deploy command: `git add index.html v2-app.js v2-styles.css` (explicit staging, not -A)

---

## SUPABASE SCHEMA (Command Center project: gcbvvausrmbbkfazojpl)

tasks: id, user_id ('bodhi'), title, bucket, horizon ('today'/'week'), done (boolean), sort_order, created_at, updated_at
portfolio_state: id, user_id (UNIQUE, 'bodhi'), energy_state, active_view, active_page, active_tab, sort_preference, bucket_filter, updated_at
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

Read: _command-center/HANDOFF_CommandCenter_v4r13_2026-04-27.md
Supabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl).
Check in with Bodhi before starting any build work.
```
