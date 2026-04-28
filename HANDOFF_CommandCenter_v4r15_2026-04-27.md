# Command Center Handoff
## Date: 2026-04-27
## Version: v4r15 -- P6 QA PASSED
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## CURRENT STATE

P6 Subtasks fully closed. v4r15 is the confirmed working baseline.
Deployed at: aicontentnow.github.io/bodhi-command-center
Final SHA: 653b790

---

## Confirmed working (full list)

**P1: Focus mode** -- amber pill, task selection, modal, Supabase PATCH, Escape/Exit close, F hotkey opens/closes Focus mode

**P2: Drag-to-reorder** -- persists sort_order to Supabase

**P3: Add task button** -- "+" pinned top, compact modal, validation, toast, Escape closes

**P4: Done tasks collapse** -- toggle works

**P5: Direct Line CoS Conversation Thread** -- two-sided bubble layout, user right/blue (#4A9EFF), CoS left (#1a1a2e), loads from Supabase, realtime appends, persists on refresh (v4r14, SHA 72c3705)

**P6: Bridge agent** -- scheduled every 30 minutes via Cowork scheduled tasks. SKILL.md v3.0 with hierarchical grouping logic and subtasks write. Note: kind routing bug still present (see Known Issues).

**P6: Subtask count badge** -- task cards show badge below title if subtasks exist in Supabase. Badge text: "N subtask(s)" / "X/N done" / "N/N done" (green). Display-only, no click behavior.

**P8 Polish (all rounds):**
- Sort inverted: fixed (newest/oldest, amber is-sort-active)
- O hotkey guard
- N shortcut: opens add-task modal when no input has focus
- F shortcut: opens/closes Focus mode when no input has focus
- Bucket filter state model: null / ALL / BucketName
- All button: true toggle
- Bucket tiles: true toggle

**P9 State Persistence on Refresh:**
- Sort preference, active tab, bucket filter all persist on refresh
- sbLive guard prevents load-time state restoration from writing back to Supabase

---

## Known Issues

**Bridge kind routing is broken.** Messages sent from the Direct Line panel arrive in Supabase with kind='freeform'. Bridge routes freeform to task extraction, not CoS synthesis. The bridge skill v3.0 has correct redphone logic -- it just never fires because the kind is wrong. Fix is P7 Part A: confirm what kind is set by the sendLine function in v2-app.js, then correct it.

---

## SUPABASE SCHEMA (Command Center project: gcbvvausrmbbkfazojpl)

tasks: id, user_id ('bodhi'), title, bucket, horizon ('today'/'week'), done (boolean), sort_order, created_at, updated_at

portfolio_state: id, user_id (UNIQUE, 'bodhi'), energy_state, active_view, active_page, active_tab, sort_preference, bucket_filter, updated_at
- sort_preference: 'newest' or 'oldest' (default 'newest')
- bucket_filter: null (empty canvas) / 'ALL' / lowercase bucket key

direct_line_messages: id, user_id, content, kind, tag, processed (bool), created_at

direct_line_responses: id, message_id, agent, content, created_at
- RLS disabled, realtime enabled on INSERT

task_notes: id, task_id, content, created_at
- RLS disabled

subtasks: id (uuid PK), task_id (uuid FK references tasks.id ON DELETE CASCADE), title (text), done (boolean default false), sort_order (integer default 0), created_at (timestamptz)
- RLS disabled, index on task_id

---

## PHASE ROADMAP (updated 2026-04-27)

### Completed
- P9: State persistence on refresh (fully closed)
- P8: Polish (all rounds, fully closed)
- P5: Direct Line CoS Conversation Thread (fully closed, v4r14)
- P6: Subtasks -- bridge hierarchical grouping (Part A) + badge display + F hotkey (Part B) (fully closed, v4r15)
- P4: Done tasks collapse
- P3: Add task button
- P2: Drag-to-reorder
- P1: Focus mode

### Next phase
**P7 -- Direct Line walkie-talkie notification model (CURRENT)**

Two parts to build together:

Part A: Fix bridge kind routing. Messages from the UI arrive as 'freeform', bypassing the redphone handler. Confirm the kind field being written by the sendLine function in v2-app.js (check the file before writing any code). Either set kind='redphone' for CoS conversation messages in the UI send function, or detect redphone intent in the bridge from content.

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
- F: opens/closes Focus mode when no input has focus (confirmed working, v4r15)
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

## FILES

| File | Purpose |
|------|---------|
| `_command-center/index.html` | Dashboard HTML |
| `_command-center/v2-app.js` | All JS logic |
| `_command-center/v2-styles.css` | All CSS |
| `skills/direct-line-bridge/SKILL.md` | Bridge agent (scheduled, running, v3.0) |
| `skills/command-center-cos/SKILL.md` | CoS skill |

Deployed at: aicontentnow.github.io/bodhi-command-center
GitHub repo: aicontentnow/bodhi-command-center (main branch, root folder)

---

## START NEXT SESSION WITH THIS PROMPT

```
Load this skill and follow its instructions:
skills/command-center-cos/SKILL.md

Read: _command-center/HANDOFF_CommandCenter_v4r15_2026-04-27.md
Supabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl).

Active phase: P7 Direct Line walkie-talkie notification model. Proceed immediately. First: read the sendLine function in _command-center/v2-app.js to confirm what kind value is being set when a message is sent. Report what you find, then write the P7 Claude Code prompt. Do not ask Bodhi what he wants to work on. The roadmap is the answer.
```
