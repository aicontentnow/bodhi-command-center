# Command Center: Direct Line Intelligence Layer
## Product Specification + Build Phases
## Status: Planning. No code written yet.

---

## The Problem

The Direct Line collects input (brain dumps, task feedback, transcripts) and writes rows
to `direct_line_messages` in Supabase. No agent reads that table. No tasks are extracted.
No intelligence is applied. The "Chief of Staff picks this up" toast is hardcoded UI copy
with no agent behind it. The CoS is a UI with a dead backend.

---

## The Vision

Every message sent via Direct Line triggers an automated pipeline:

1. Message lands in `direct_line_messages` (Supabase, processed=false)
2. Bridge Agent reads it on schedule (every 15-30 minutes)
3. Bridge Agent extracts concrete tasks, routes by bucket context (Harmonic/MIRROR/LDAG/etc.)
4. Bridge Agent writes tasks to `tasks` table
5. Bridge Agent writes a summary to `direct_line_responses`
6. Realtime subscription in v2-app.js (already built) surfaces the response in the panel
7. Bodhi opens the dashboard and sees: tasks extracted, work routed, system working

---

## Architecture

```
Direct Line UI (v2-app.js)
    |
    v  [user sends message]
direct_line_messages (Supabase)
    |
    v  [Bridge Agent -- scheduled Cowork task, runs every 15 min]
    |
    +---> tasks table [tasks surface in dashboard under correct bucket]
    |
    +---> direct_line_responses table
              |
              v  [Realtime INSERT subscription -- ALREADY IN v2-app.js]
              |
          Direct Line panel shows agent reply automatically
```

---

## Supabase Reference

Project ID: gcbvvausrmbbkfazojpl
URL: https://gcbvvausrmbbkfazojpl.supabase.co
Anon key: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P
RLS: disabled on all relevant tables (confirmed)

Note: Supabase MCP only reaches the MIRROR project. Command Center project must be
accessed via REST API calls (curl in Bash). This is the correct approach for the skill.

---

## Schema Reference (exact column names, no guessing)

### direct_line_messages
- id (uuid)
- user_id (text, always 'bodhi')
- content (text)
- kind (text): 'task' | 'freeform' | 'redphone' | 'brain_dump' | 'prompt' | 'launch'
- tag (text): bucket label like 'Brain dump · Harmonic', or a task UUID for task feedback
- processed (bool): false = queued, true = done
- created_at (timestamptz)

### direct_line_responses
- id (uuid)
- message_id (uuid, FK to direct_line_messages.id)
- agent (text)
- content (text)
- created_at (timestamptz)
Realtime enabled: INSERT events are subscribed in v2-app.js initFromSupabase()

### tasks
- id (uuid)
- user_id (text, always 'bodhi')
- title (text) -- NOT 'subject'. This is the correct column name.
- bucket (text): HARMONIC | MIRROR | LDAG | FRAMEZERO | FAMILY | BODHI360
- horizon (text): 'today' | 'week'
- done (boolean) -- NOT 'status'. This is the correct column name.
- sort_order (integer, default 0)
- created_at (timestamptz)
- updated_at (timestamptz)

### task_notes
- id (uuid)
- task_id (uuid, FK to tasks.id)
- content (text)
- created_at (timestamptz)

---

## Routing Logic

### kind = 'brain_dump'

Bucket routing by tag content (case-insensitive check):
- 'harmonic' in tag → BUCKET=HARMONIC
- 'mirror' in tag → BUCKET=MIRROR
- 'ldag' in tag → BUCKET=LDAG
- 'framezer' in tag → BUCKET=FRAMEZERO (handles FRAMEZERØ)
- 'family' in tag → BUCKET=FAMILY
- no match → BUCKET=BODHI360 (safe fallback)

Horizon: default to 'week'. Override to 'today' if content contains urgency signals:
(today, urgent, ASAP, right now, by end of day, this morning, this afternoon)

Extract 3-8 concrete action items per message.

### kind = 'task' (tag is a UUID)

This is feedback on a specific task. Do not create a new task row.
Write a task_note: task_id = the tag UUID, content = full message content.

### kind = 'redphone'

Route by tag for bucket.
Always horizon='today'.
Prefix extracted task titles with 'URGENT: '.

### kind = 'freeform'

Analyze content. Determine most relevant bucket by subject matter.
Extract any concrete action items as tasks.

### kind = 'prompt' or 'launch'

Log receipt and mark processed. No task extraction needed.
Write a response acknowledging receipt.

---

## Task Extraction Rules

From any brain_dump content:
- Extract sentences indicating work to be done (deliverables, follow-ups, decisions needed)
- Keep task titles under 80 characters, plain English
- 3-8 tasks maximum per message
- Do NOT extract: conversational filler, already-done items, pure status updates with no action

---

## Build Phases (ordered by priority and dependency)

### Phase 1: Bridge Agent Skill (CRITICAL -- DO THIS FIRST)

**What:** A skill file that a scheduled Cowork session loads and runs. Contains all logic
to poll direct_line_messages, extract tasks, write to Supabase, mark processed.

**Files to create:**
- `~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/skills/direct-line-bridge/SKILL.md`

**Dependency:** None. Build first.

**QA:**
- Send test brain dump via Direct Line with Harmonic tag
- Confirm row appears in direct_line_messages with processed=false
- Trigger bridge agent (load skill manually in Cowork)
- Confirm tasks appear in tasks table with bucket=HARMONIC
- Confirm direct_line_responses row exists with bridge agent summary
- Confirm processed=true on source message
- Confirm response surfaces in Direct Line panel (realtime subscription auto-handles this)

**After Phase 1 QA passes:** Create the scheduled task in Cowork using
mcp__scheduled-tasks__create_scheduled_task pointing to the new skill.

---

### Phase 2: [ALREADY BUILT - NO ACTION NEEDED]

Realtime response display in the Direct Line panel is already wired.
initFromSupabase() in v2-app.js subscribes to direct_line_responses INSERT events
and calls pushMessage() to surface them. Once Phase 1 bridge agent writes responses,
they will appear automatically.

---

### Phase 3: Loading State Fix in v2-app.js

**What:** On hard refresh, hardcoded default tasks flash before Supabase loads.
Fix: hide task lists and energy selector on boot, show spinner, reveal after
initFromSupabase() resolves.

**Files to edit:**
- `~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`

**Pattern:**
Before calling initFromSupabase():
- Add class 'is-loading' to document.body or a wrapper element
- This hides task list containers and state selector via CSS

In initFromSupabase() at the very end (both success and catch paths):
- Remove class 'is-loading'
- Reveal the containers

Add matching CSS to handle .is-loading state (hiding the task lists, showing spinner).

**This can be bundled into the same Claude Code session as Phase 1.**

**QA:**
- Hard refresh dashboard
- Verify no flash of stale hardcoded tasks before Supabase resolves
- Verify loading indicator appears and disappears cleanly

---

### Phase 4: File Attachment for Direct Line

**What:** Add file picker to Direct Line input area so Bodhi can attach .txt or .md files
(Otter transcript exports) instead of copy-pasting.

**Files to edit:**
- `~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`
- `~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`

**Pattern:**
- Add a hidden file input (accept=".txt,.md,.text") and a paperclip button in lineComposer
- On file select: read content with FileReader API, populate lineInput textarea
- Preserve current lineTag selection
- User reviews content in textarea before sending

**QA:**
- Click paperclip icon
- Select a .txt file
- Verify content appears in textarea, tag is preserved
- Send message, verify it lands in direct_line_messages with correct content

---

### Phase 5: Bucket Selector on Task Creation + Save Button Hint

**What:** New tasks currently hardcode bucket='bodhi360'. Add a bucket dropdown.
Also add a visible + button or placeholder text as a save hint.

**Files to edit:**
- `~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`

**Pattern:**
- Bucket dropdown options: BODHI360, HARMONIC, MIRROR, LDAG, FRAMEZERO, FAMILY
- Default to bucket matching current tab context where possible
- Placeholder text on task input: "Type task, press Enter"
- Small + button next to input triggers same save action as Enter

**QA:**
- Create task in MIRROR bucket
- Verify it appears with bucket=MIRROR in Supabase and in the dashboard
- Verify bucket selector defaults to current tab context

---

### Phase 6: Clear Completed

**What:** Checked tasks stay in list indefinitely. Add a Clear completed button per tab.

**Files to edit:**
- `~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`

**Pattern:**
- "Clear completed" link below each tab's task list (only visible if done tasks exist)
- On click: DELETE from tasks WHERE done=true AND horizon=current tab AND user_id='bodhi'
- Re-render task list after delete
- Toast confirmation

**QA:**
- Check off several tasks
- Click Clear completed
- Verify done tasks disappear from UI
- Verify rows deleted from Supabase (check tasks table directly)
- Verify undone tasks remain

---

## What Cowork Does vs Claude Code

Claude Code builds: all file changes (SKILL.md, v2-app.js, index.html)
Cowork does after Phase 1 QA: creates the scheduled task via mcp__scheduled-tasks__create_scheduled_task

---

## Deploy Command (after any Claude Code session)

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add -A && git commit -m "deploy: $(date +%Y-%m-%d-%H%M)" && git push origin main
```
