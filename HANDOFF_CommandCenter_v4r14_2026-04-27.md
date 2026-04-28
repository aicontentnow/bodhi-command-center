# Command Center Handoff
## Date: 2026-04-27
## Version: v4r14 -- P5 QA PASSED
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## CURRENT STATE

P5 Direct Line CoS Conversation Thread fully closed. v4r14 is the confirmed working baseline.
Deployed at: aicontentnow.github.io/bodhi-command-center
Final SHA: 72c3705

---

## Confirmed working (full list)

**P6: Bridge agent** -- scheduled every 30 minutes. Note: kind routing has a bug (see Known Issues below). Bridge skill is v2.0 with correct redphone handler written, but messages from the UI arrive as 'freeform', not 'redphone', so task extraction fires instead of CoS synthesis. Fix is P7.

**P2: Drag-to-reorder** -- persists sort_order to Supabase

**P4: Done tasks collapse** -- toggle works

**P1: Focus mode** -- amber pill, selection, modal, Supabase PATCH, Escape/Exit close. F hotkey NOT YET BUILT -- bundles with P6.

**P3: Add task button** -- "+" pinned top, compact modal, validation, toast, Escape closes

**P8 Polish (all rounds):**
- Sort inverted: fixed (newest/oldest, amber is-sort-active)
- O hotkey guard
- N shortcut: opens add-task modal when no input has focus
- Bucket filter state model: null / ALL / BucketName
- All button: true toggle
- Bucket tiles: true toggle

**P9 State Persistence on Refresh:**
- Sort preference, active tab, bucket filter all persist on refresh
- sbLive guard prevents load-time state restoration from writing back to Supabase

**P5 Direct Line CoS Conversation Thread:**
- Two-sided bubble layout: user messages right/blue (#4A9EFF), CoS responses left/dark (#1a1a2e)
- Thread loads from Supabase on every page open
- Persists on hard refresh
- Realtime subscription appends new CoS responses live without reload
- New user message appends to thread immediately on send
- CoS bubbles labeled "CoS" (renders as "COS" due to font -- accepted cosmetic issue)
- Old queue view removed; full conversation history shown

---

## Known Issues

**Bridge kind routing is broken.** Messages sent from the Direct Line panel arrive in Supabase with kind='freeform' (or whatever the UI defaults to). The bridge routes freeform messages to task extraction, not CoS synthesis. So redphone-style messages produce tasks instead of answers. The bridge skill v2.0 has correct redphone logic -- it just never fires because the kind is wrong. Fix is P7 Part A: correct the kind being set at send time.

---

## PHASE ROADMAP (updated 2026-04-27)

### Completed
- P6: Bridge agent scheduled (note: kind routing bug -- see Known Issues)
- P2: Drag-to-reorder
- P4: Done tasks collapse
- P1: Focus mode
- P3: Add task button
- P8: Polish (all rounds, fully closed)
- P9: State persistence on refresh (fully closed)
- P5: Direct Line CoS Conversation Thread (fully closed, v4r14)

### Next phase
**P6: Subtasks with count badge and progress** (CURRENT)

Tasks can have nested subtasks. Parent task shows a count badge and progress indicator.

**ARCHITECTURAL DIRECTION (confirmed 2026-04-27):** Subtask structure starts at the transcription/intake phase, not built manually in the UI. When a transcript is processed and tasks extracted, related tasks must be grouped hierarchically at the point of extraction. The Command Center displays that pre-built structure. Drag-and-drop nesting UI is not the goal.

P6 has two parts:

Part A (intake layer): Update the transcript intake system to write parent/child task relationships to Supabase at extraction time. Recommended schema: dedicated `subtasks` table (id uuid, task_id uuid FK, title text, done boolean, sort_order int, created_at timestamptz). CONFIRM TABLE EXISTS before writing any code. If it does not exist, create it via Supabase MCP before writing the Claude Code prompt.

Part B (UI layer): Update the Command Center to read and display the nested structure with count badge and progress indicator. Part A must be scoped and built before Part B is meaningful.

**Bundle with P6:** Add F hotkey to open Focus mode when no input has focus. Wire it the same way N is wired.

### P7 -- Direct Line walkie-talkie notification model
Two parts to build together:

Part A: Fix bridge kind routing. Messages from the UI arrive as 'freeform', bypassing the redphone handler. Either the UI send function must set kind='redphone' for CoS conversation messages, or the bridge must detect redphone intent from content. Confirm the kind field being written by the send function (check v2-app.js sendLine function) before writing any code.

Part B: Response notification. When bridge writes a response to direct_line_responses, fire: (1) macOS desktop push notification via osascript through Desktop Commander, (2) dashboard notification bell showing unread count. Model is walkie-talkie: Bodhi sends, bridge processes async, notification fires when response arrives.

### P8 (formerly P7) -- File attachment in Direct Line
Upload a .txt or .md file directly into the Direct Line queue.

### P10 -- Agent assignment from Focus modal
From inside the Focus modal, Claude-executable tasks get an "Assign to Agent" action.

### P11 -- CoS proactive check-in via AskUserQuestion modal
CoS reads findings, surfaces one recommendation as an AskUserQuestion modal.

---

## HOTKEY REFERENCE

- O: opens side panel (confirmed working)
- F: NOT YET BUILT -- opens Focus mode when no input has focus (bundle into P6)
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
subtasks: NOT YET CONFIRMED -- check before building P6. Recommended: id (uuid), task_id (uuid FK), title (text), done (boolean), sort_order (int), created_at (timestamptz)

---

## FILES

| File | Purpose |
|------|---------|
| `_command-center/index.html` | Dashboard HTML |
| `_command-center/v2-app.js` | All JS logic |
| `_command-center/v2-styles.css` | All CSS |
| `skills/direct-line-bridge/SKILL.md` | Bridge agent (scheduled, running, v2.0) |
| `skills/command-center-cos/SKILL.md` | CoS skill |

Deployed at: aicontentnow.github.io/bodhi-command-center
GitHub repo: aicontentnow/bodhi-command-center (main branch, root folder)

---

## START NEXT SESSION WITH THIS PROMPT

```
Load this skill and follow its instructions:
skills/command-center-cos/SKILL.md

Read: _command-center/HANDOFF_CommandCenter_v4r14_2026-04-27.md
Supabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl).

Active phase: P6 Subtasks. Proceed immediately. First: confirm whether the `subtasks` table exists in Supabase (gcbvvausrmbbkfazojpl). If it does not exist, create it. Schema: id (uuid), task_id (uuid FK references tasks.id), title (text), done (boolean), sort_order (int), created_at (timestamptz). Then write the P6 Part A Claude Code prompt and deliver it. Do not ask Bodhi what he wants to work on. The roadmap is the answer.
```
