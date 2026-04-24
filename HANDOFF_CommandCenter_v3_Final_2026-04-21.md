# Command Center v3 -- Final Handoff
## Date: 2026-04-21
## Status: v3 QA complete. Phase 1 done. Phase 2 ready to begin.
## Supabase MCP: must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl)

---

## WHAT SHIPPED IN v3

All Phase 1 items confirmed working via interactive QA with Bodhi.

### Core pipeline
- Bridge agent SKILL.md created at `skills/direct-line-bridge/SKILL.md`
- Agent reads from `direct_line_messages`, extracts tasks, writes to `tasks`, writes responses to `direct_line_responses`, marks messages processed
- RLS disabled on `task_notes` and `direct_line_responses` (run via Supabase MCP 2026-04-21)
- Supabase MCP now connected to Bodhi360 org by default (see switching rule below)

### Dashboard UI (confirmed working)
- Loading state: no flash of filler content on hard refresh
- Direct Line queue reloads from Supabase on hard refresh (all pending messages visible)
- Task checkoff persists after refresh, toggleable
- Task sort: oldest first (created_at ascending)
- Task add persists after refresh
- Roadmap completed items show strikethrough
- THE BOOK OF ONENESS all caps in nav
- Energy state persists after refresh
- Page navigation and active state persist on refresh
- aria-hidden warnings resolved on both drawer and linePanel
- Task move (today/week) works in both directions with `week >` and `< today` pill buttons (hover only)
- Bucket change in task drawer: PATCHes Supabase, updates tag in place, task stays in position
- Direct Line panel: Quick Actions collapsed by default, queue badge shows count, thread scrolls to bottom on open
- Red Phone textarea scrolls to top on open, prompt only pre-fills when Red Phone is explicitly triggered
- Brain Dump page restored as send-to-queue interface (not a task list)
- Buckets nav page (K): tasks grouped by bucket, clickable tile filters, All button returns to grouped view
- Filter/sort controls inline with Today/Week tabs (same row, right-aligned)
- O hotkey opens Direct Line panel
- Only one panel open at a time (opening a new panel closes the current one)
- Favicon added
- Bucket selector on task add with chevron indicator
- Bucket casing normalized across task writes

### Known polish items (not blocking Phase 2)
- Bucket tile on Buckets page does not visually deselect after second tap (filter clears correctly, just no visual feedback)
- O hotkey captured by text input if Direct Line is already open (Escape closes panel as workaround)
- O hotkey badge in panel header is very small (readable but could be larger)

---

## SUPABASE SCHEMA (Command Center project: gcbvvausrmbbkfazojpl)

### tasks
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | gen_random_uuid() |
| user_id | text | always 'bodhi' |
| title | text | task label |
| bucket | text | bodhi360, MIRROR, Harmonic, Family, FRAMEZERO, LDAG, Career, Command |
| horizon | text | 'today' or 'week' |
| done | boolean | true/false |
| sort_order | integer | default 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### direct_line_messages
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| user_id | text | always 'bodhi' |
| content | text | message body |
| kind | text | 'task', 'freeform', 'redphone', 'brain_dump', 'prompt', 'launch' |
| tag | text | label or task UUID, nullable |
| processed | bool | false = in queue |
| created_at | timestamptz | |

### direct_line_responses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| message_id | uuid | FK to direct_line_messages |
| agent | text | agent identifier |
| content | text | reply body |
| created_at | timestamptz | |

RLS disabled. Realtime enabled on INSERT events.

### task_notes
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | |
| task_id | uuid | FK to tasks |
| content | text | |
| created_at | timestamptz | |

RLS disabled.

---

## SUPABASE MCP SWITCHING RULE (NON-NEGOTIABLE)

Two orgs under the same account (stillpointventuresllc@pm.me):
- **Bodhi360 org**: Command Center project (gcbvvausrmbbkfazojpl) -- CURRENT DEFAULT
- **stillpoint ops org**: MIRROR-publishing-ops project (pobddtmnzimcdiaujyyf)

The MCP can only connect to one org at a time. Any session working on MIRROR, Book of Oneness, or anything in stillpoint ops must disconnect and reconnect the MCP to that org first. State which org is required at the top of every Supabase handoff.

---

## PIPELINE RULES (confirmed working, apply to all future phases)

- **Claude Code**: builds AND deploys. Include the git push command at the end of every prompt. Claude Code does not wait for Cowork to deploy.
- **Cowork**: runs interactive QA against the live site after Claude Code deploys. Reports pass/fail per item.
- **Failures go back to Claude Code** as a new round prompt. Cowork does not fix code.
- **Supabase SQL**: run via Supabase MCP from Cowork (project gcbvvausrmbbkfazojpl). Not via curl, not manually by Bodhi.
- **No em dashes** in any file, prompt, or UI copy. Ever.
- **Version every phase**: phase N complete + QA passed = vN ready. State version in every Claude Code prompt header.

### Claude Code prompt format (non-negotiable)
- Saved as a `.md` file in `_command-center/`
- Plain ``` fences only, no language labels
- Header states: version being built, version it builds on, date previous version QA passed
- Ends with the git deploy command so Claude Code ships without waiting

---

## PHASE 2 FEATURE LIST (priority order)

### P1 -- Focus mode (AuDHD-first, core differentiator)
Today view has a Focus zone at the top holding exactly 3 tasks. These are elevated, color-coded by urgency (red = do this now). When Focus mode is active, tasks outside the Focus zone dim so only 3 things are visible. Clicking out of Focus mode returns to full view.

Any task can be escalated to Focus with one action. Something urgent comes in: one tap, it jumps to the top of Focus 3 as a red alert.

### P2 -- Drag-to-reorder
Tasks within any list can be manually dragged up and down to reflect real priority. The `sort_order` column already exists in the schema for this.

### P3 -- Add task at top
The task add input currently sits at the bottom of each list. Replace with a plus button pinned at the top of each column or inline with the Today/This Week tabs. Clicking opens a compact modal: task title, bucket selector, (later) subtask count. Save or Enter to commit. No scrolling to add.

### P4 -- Done tasks collapse
Completed tasks currently stay visible and push the add button further down. Completed tasks should auto-collapse or be hidden behind a "show completed N" toggle. They should not pollute the active list.

### P5 -- Subtasks
Tasks can have nested subtasks. Parent task shows a subtask count badge and a progress ring or count (e.g. 2/5 done). Expanding a task shows the subtask list. This reduces visual noise (many small tasks nest under one parent) and helps with multi-step work.

### P6 -- Bridge agent as scheduled task
The bridge agent SKILL.md is built and confirmed working. Next step: create a scheduled Cowork task pointing to `skills/direct-line-bridge/SKILL.md` so it runs automatically (every 30 min or on a cadence Bodhi sets). Until this is set up, the bridge agent must be run manually from a Cowork session.

### P7 -- File attachment in Direct Line
Transcripts are currently sent as raw text dumps, which are very long. A file attachment capability in the Direct Line (upload a .txt or .md file) would allow Bodhi to attach Otter exports and voice memo transcripts directly without pasting.

### P8 -- Polish carryover
- Bucket tile visual deselect on second tap
- O hotkey badge size increase
- O hotkey should not be captured by text input when Direct Line is already open

---

## FILES (all under Claude-Workspace)

| File | Purpose |
|------|---------|
| `_command-center/index.html` | Dashboard HTML |
| `_command-center/v2-app.js` | All JS logic |
| `_command-center/v2-styles.css` | All CSS |
| `_command-center/favicon.svg` | Favicon |
| `skills/direct-line-bridge/SKILL.md` | Bridge agent (v1.0) |
| `_command-center/DIRECT_LINE_BUILD_SPEC.md` | Full product spec for all 6 Direct Line phases |
| `_command-center/PHASE1_ROUND4_PROMPT.md` | Last Claude Code prompt (reference) |

Deployed at: aicontentnow.github.io/bodhi-command-center
GitHub repo: aicontentnow/bodhi-command-center (main branch, root folder)

---

## START NEXT SESSION WITH THIS PROMPT

```
You are picking up Command Center work after Phase 1 QA was completed.

Read these files first:
1. Claude-Workspace/CLAUDE.md (master brain -- pay attention to SUPABASE MCP SWITCHING RULE)
2. Claude-Workspace/_command-center/HANDOFF_CommandCenter_v3_Final_2026-04-21.md (this handoff)
3. Claude-Workspace/_command-center/DIRECT_LINE_BUILD_SPEC.md (full product spec)

Supabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl) for this session.

v3 is live and QA-confirmed at aicontentnow.github.io/bodhi-command-center.

Phase 2 begins now. The priority list is in the handoff under PHASE 2 FEATURE LIST.

First task: set up the bridge agent as a scheduled task (P6 in the feature list) so it runs automatically without a manual Cowork session. Use the mcp__scheduled-tasks__create_scheduled_task tool pointing to skills/direct-line-bridge/SKILL.md.

Then confirm with Bodhi which Phase 2 features to build first before writing any Claude Code prompt.

Wait for Bodhi to confirm priorities before starting any build work.
```
