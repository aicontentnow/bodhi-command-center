# Bodhi 360° Command Center · PRD v2
## Full rebuild spec for Claude Code
## Date: 2026-04-20
## Status: Ready for implementation

This document is the complete handoff for building the Bodhi 360° Command Center v2.
Read every section before writing a single line of code. The design screenshots are in the same folder.
Ask no clarifying questions -- everything needed is here.

---

## WHAT THIS IS

A personal command center for one user: Bodhi Valentine (AuDHD operator running five parallel
life/work tracks). It functions as a web app, not a website. Every element must be functional.
Nothing decorative that doesn't do something. Every interaction writes to Supabase.

The center has one primary ritual: start every session by lifting the Red Phone.
Everything else supports that ritual and the work that follows.

---

## HARD RULES (non-negotiable, read first)

- No em dashes anywhere. Not in copy, not in comments, not in placeholders.
- No localStorage. Every persistent value goes to Supabase. Zero exceptions.
- No placeholder UI. If an element appears on screen, it works.
- No skeleton screens or "coming soon" states.
- Red is reserved exclusively for the Red Phone. No other UI element uses red.
- Cyan (hsl 188 90% 62%) is the system signal color only.
- Every user interaction is logged to the interaction_log table.
- Deploy target: GitHub Pages (static HTML + JS). No build step. No Node server.
- Single HTML file output. CSS and JS inline or in same file.
- Fonts loaded from Google Fonts CDN. Supabase JS loaded from CDN.

---

## TECH STACK

- HTML5 / CSS3 / vanilla JavaScript (no frameworks)
- Supabase JS client v2 (CDN: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2)
- Google Fonts: Poppins (300,400,500,600), Source Serif 4 (400 italic), JetBrains Mono (400)
- No React. No Vue. No build tools.
- Deployed via git push to GitHub Pages (aicontentnow/bodhi-command-center repo)

### Supabase credentials (hardcode these -- do not ask Bodhi)

At the top of the JS, define:
```js
const SUPABASE_URL = 'https://gcbvvausrmbbkfazojpl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P';
```

Project: bodhi-360 (standalone from MIRROR -- separate Supabase project).
The publishable key is public-safe. Do not use the service role key.
Note: this key uses the newer `sb_publishable_` format (Supabase 2025+) -- this is correct.

---

## SUPABASE SCHEMA

Run this SQL in Supabase > SQL Editor before deploying the app.

```sql
-- Portfolio state: one row, always upserted
CREATE TABLE IF NOT EXISTS portfolio_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE DEFAULT 'bodhi',
  energy_state text DEFAULT 'workday',
  active_view text DEFAULT 'cockpit',
  active_page text DEFAULT 'home',
  active_tab text DEFAULT 'today',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO portfolio_state (user_id) VALUES ('bodhi') ON CONFLICT (user_id) DO NOTHING;

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'bodhi',
  title text NOT NULL,
  bucket text DEFAULT 'SELF',
  horizon text DEFAULT 'today',
  done boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task notes (context the agent reads)
CREATE TABLE IF NOT EXISTS task_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Interaction log: every action recorded
CREATE TABLE IF NOT EXISTS interaction_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'bodhi',
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Direct line messages: Bodhi sends here, agent reads and processes
CREATE TABLE IF NOT EXISTS direct_line_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'bodhi',
  content text NOT NULL,
  kind text DEFAULT 'freeform',  -- redphone | brain_dump | prompt | task | launch | freeform
  tag text,                       -- bucket name, prompt key, or task id depending on kind
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Direct line responses: CoS agent writes here, dashboard reads via realtime
CREATE TABLE IF NOT EXISTS direct_line_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES direct_line_messages(id),
  agent text DEFAULT 'bodhi-chief-of-staff',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable realtime on tasks, portfolio_state, and direct_line_responses
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE portfolio_state;
ALTER PUBLICATION supabase_realtime ADD TABLE direct_line_responses;
```

### Interaction log event types

Log every one of these to interaction_log with event_data as JSON:
- task_checked: { task_id, task_title, done: true/false }
- task_added: { task_id, task_title, horizon, bucket }
- note_saved: { task_id, note_preview (first 80 chars) }
- message_sent: { kind, tag, char_count } -- replaces prompt_copied and brain_dump_sent
- state_changed: { from, to }
- view_changed: { from, to }
- page_changed: { from, to }
- line_opened: { trigger } -- when Direct Line panel is opened; trigger = 'redphone' | 'bucket' | 'prompt' | 'task'
- app_opened: { view, page, energy_state }

---

## THREE VIEWS

The app has three view modes. All three show the same data and pages.
The view is purely a layout/navigation shell. Switching views is instant, no reload.
The active view persists to portfolio_state.active_view.

A "Views" button (bottom right, gear icon) opens a panel to switch between them.

### View 1: Cockpit (default)

Left sidebar (300px fixed) + main content area.

Sidebar contains (top to bottom):
- Brand block: lotus icon + "bodhi 360°" / "COMMAND CENTER" + cyan pulse dot
- State picker: collapsed pill showing current state + "CHANGE" button. Clicking expands a dropdown.
- Navigate section: keyboard-shortcuttable list (H, B, P, M, S). Each item shows page name + item count badge.
  - H: Home · Today
  - B: Brain dump (badge = bucket count: 6)
  - P: Key prompts (badge = prompt count)
  - M: Roadmap (badge = total phase count)
  - S: Share with Cowork (badge: "kit")
- Live Surfaces section: LDAG dashboard, MIRROR ops, Book of Oneness. Each opens in new tab.

Main area: the current page content (see Pages section).

### View 2: Altar (sacred / centered)

No sidebar. Single top bar: logo left, state pill center-right, page tabs right, Links dropdown right.
All page content centered in a max-width container (680px).
Minimal. High contrast. No ambient motion (or very subtle breathing only).
"Views" button bottom right.

Top bar navigation: Home · Today pill, Links dropdown (for Live Surfaces).

### View 3: Orbit (planetary canvas)

Full-screen dark canvas. Deep space background with subtle CSS star field.
No sidebar. No top bar. Navigation IS the canvas.

Central element: bodhi 360° glowing cyan orb (120px diameter). Subtle radial glow pulsing.
Label: "bodhi 360°" + "HOME" below in JetBrains Mono. Clicking returns to Home.

Orbiting nodes (pill-shaped, glass style, 8-12px cyan dot left):
- Harmonic (upper left orbit)
- Family (upper right orbit)
- Book of Oneness (left orbit)
- LDAG (right orbit)
- bodhi360 (lower left orbit)
- Creative (lower center orbit)

Special node:
- Red Phone: red pill, positioned near the sun (not in outer orbit). Always visible. Clicking opens the Direct Line panel (kind: redphone) and logs line_opened. Does NOT navigate away.

Orbit behavior:
- Nodes have a slow elliptical CSS animation (different speeds per node, 20-40s rotation).
- Clicking any project node navigates to Brain dump with that bucket pre-selected.
- Instructions at bottom: "TAP A PLANET · RED PHONE OPENS LINE · SUN RETURNS HOME" in JetBrains Mono, muted.

View switcher: bottom right "VIEW" panel showing Cockpit, Altar, Orbit options. Active one highlighted cyan.

---

## PAGES

### Home (default)

Two sections, always visible:

**Red Phone card** (pinned, always at top):
- Background: dark glass (liquid-glass-strong style)
- Eyebrow: "RED PHONE · START EVERY SESSION HERE" in JetBrains Mono, red dot
- Heading: "One *next action* -- nothing more." (Source Serif 4 italic on "next action")
- Subtext: "Open the line. Tell the Chief of Staff what's on your mind."
- CTA: "Open the line" button (red, large, phone icon). Clicking opens the Direct Line panel with kind: 'redphone', logs line_opened.

The panel slides in from the right. The header reads "The line is open." in the panel.
Three structured quick-launch buttons appear first (see Direct Line panel spec).
The free-text area is below with placeholder "Say what needs to change".

**Task section**:
- Tab switcher: "Today X/Y" and "This week X/Y" (counts update live)
- Task list card (glass style)
- Each task row: checkbox square (clicking toggles done, writes to Supabase, logs task_checked) + task title + bucket label below in JetBrains Mono
- Clicking the label area (not checkbox) opens the context drawer for that task
- Add input at bottom: "Add to today..." or "Add to this week..." depending on active tab. Plus button submits. Writes to Supabase, logs task_added.
- Footer hint: "Click an item to check · click its label area to open context" in JetBrains Mono, muted

**Context drawer** (slides in from right or expands inline):
- Task title + horizon + bucket displayed
- Notes textarea: live-saved to task_notes on blur. Logs note_saved.
- "Send to the line" button: opens the Direct Line panel with kind: 'task', tag: task_id.
  Pre-seeds the textarea with:
  "Task: [task title]
  Context: [all notes for this task, joined]
  What do you need from me on this?"
  Logs line_opened with trigger: 'task'.
- Close button.

### Brain dump

6 bucket cards in a grid: bodhi360, Harmonic, LDAG, The Book of Oneness, Family, Creative.
Each card: bucket name + short description.

Clicking any bucket card opens the Direct Line panel with:
- kind: 'brain_dump'
- tag: the bucket name (e.g., 'LDAG', 'Harmonic')
- The panel header shows "Dump into: [Bucket name]"
- The textarea placeholder reads "Brain dump here. Raw is fine."
- On send: writes to direct_line_messages with kind and tag set, logs message_sent.
- The panel shows the confirmation: "Sent. Chief of Staff picks this up on next run."

No separate modal. No copy-to-clipboard. Everything goes through the Direct Line panel.

Note: brain_dumps table is no longer the primary write target. direct_line_messages handles all brain dump routing. The agent reads kind/tag to know which bucket to process into.

### Key prompts

Grid of prompt cards. Clicking any card opens the Direct Line panel with the prompt text pre-seeded in the textarea.
All prompts log message_sent to interaction_log when the user hits Send.

Exception: "Share with Cowork" is the only page that still uses copy-to-clipboard. That page is the clipboard bridge by design.

On card click:
- Opens Direct Line panel with kind: 'prompt', tag: [prompt_key]
- The textarea is pre-filled with the prompt text (editable before sending)
- The panel header shows the prompt name
- User can edit the pre-filled text (e.g., fill in [describe] placeholders) before sending
- On Send: writes to direct_line_messages, logs message_sent

Prompt cards (with their pre-seed text):

**Morning: where am I** (tag: 'morning_cos')
Pre-seed:
Load this skill and follow its instructions:
skills/bodhi-chief-of-staff/SKILL.md
State: [green / yellow / red / potato day / workday / describe]
What's on my mind: [one line, or "I don't know, tell me"]

**LDAG: pick up production** (tag: 'ldag_cos')
Pre-seed:
Load this skill and follow its instructions:
skills/ldag-cos/SKILL.md

**LDAG: draft an episode** (tag: 'ldag_episode')
Pre-seed:
Load this skill and follow its instructions:
skills/ldag-episode-script/SKILL.md
Episode concept: [describe]
Moment IDs (if any): [paste]

**Status update: something changed** (tag: 'status_update')
Pre-seed:
I have a status update. Something shipped or shifted and I want the system to know.
Write a status file at: _inbox/_processed/STATUS_UPDATE_[today].md
Update _brain/bodhi-state.md with anything that changes portfolio state.
Here's what happened: [talk]

**Skills reorg: Phase 3** (tag: 'skills_reorg_p3')
Pre-seed:
Skills reorganization audit -- Phase 3: canonical structure proposal.
Read: _command-center/reorg/INVENTORY_2026-04-20.md
Write proposal to: _command-center/reorg/PROPOSAL_2026-04-20.md
Do NOT move any files. Proposal only. Wait for approval before Phase 4.

**Build QA: did it follow the PRD?** (tag: 'build_qa')
Pre-seed:
Claude Code just finished a build. QA it against the PRD.

PRD location: _command-center/PRD_dashboard_v2.md
Built files: _command-center/index.html, _command-center/v2-app.js, _command-center/v2-styles.css

Read the PRD in full. Then read the built files. For each major section of the PRD, check:
- Is this section implemented?
- Does the implementation match the spec?
- Are there gaps, deviations, or cosmetic-only wiring?

Output a gap report in three sections:
CORRECT: what matches the PRD
MISSING: what the PRD specifies but the build did not implement
WRONG: what the build implemented differently than the PRD specified

Be specific. Name the file, function, and line number where possible.
Do not suggest fixes -- just report the gaps. Bodhi decides what to fix next.

**UI feedback: restyle in Claude Code** (tag: 'ui_feedback')
Pre-seed:
You are restyling an existing file. Do NOT rebuild from scratch. CSS and visual layer only. Do not touch any Supabase connection, table names, or JS logic. No em dashes. No localStorage.

Project: [name the project]
File to restyle: [exact path, e.g. _command-center/index.html]

Feedback:
[describe exactly what looks wrong or what you want changed]

If you need to see the file first, read it before writing a single line of output.

### Roadmap

Two sections:

**Dashboard roadmap** (phases 00-09):
Phase 00 Done: LDAG dashboard v4.6 live
Phase 00 Done: bodhi-chief-of-staff skill
Phase 01 Done: Command Center MVP (red phone)
Phase 02 Active: Brain dump buckets + task feedback
Phase 03 Next: Visual design system (Claude designer)
Phase 04: Supabase-backed state (cross-device) -- THIS BUILD
Phase 05: Harmonic sub-hub
Phase 06: LDAG website rebuild
Phase 07: Wispr Flow direct integration
Phase 08: Push notifications (bell + red phone)
Phase 09: Agent orchestration + PRD routing

Done phases: strikethrough, muted.
Active phase: cyan left border, bright text.
Each upcoming phase with a defined prompt: show a "Copy starter" button that copies that prompt.

**Skills Reorg Audit** sub-section:
Phase 1 Done: Full inventory written (_command-center/reorg/INVENTORY_2026-04-20.md)
Phase 2 Done: CoS skill errors corrected
Phase 3 Next: Canonical structure proposal -- "Copy starter" button active
Phase 4 Pending: Migration + archive -- locked until Phase 3 approved
Cleanup Pending: Rogue Hard Hat Healthcare/ folder -- "Copy cleanup" button active

### Share with Cowork

This page packages current app state into a prompt Bodhi can paste into a Cowork session.

Display a live preview of what will be copied:
- Current energy state
- Active view
- Today's task list (done/not done status + any notes)
- This week's task list
- Any pending brain dump count

"Copy full context" button: bundles everything above into a structured prompt and copies it.
Logs message_sent with kind: 'freeform', tag: 'share_with_cowork'.

The copied prompt format:
"Bodhi 360° current state as of [timestamp]:
Energy: [state]
Today's tasks: [list with done status and notes]
This week: [list]
[pending brain dumps if any]
Read _brain/bodhi-state.md for full portfolio context."

---

## DESIGN LANGUAGE

### Colors

```css
--bg: #050810;                        /* deep space black */
--surface: rgba(255,255,255,0.04);    /* liquid-glass */
--surface-strong: rgba(255,255,255,0.08); /* liquid-glass-strong */
--border: rgba(255,255,255,0.07);     /* masked gradient border */
--text: #f0f0f0;
--text-2: #a8b4c0;
--text-3: #5a6a7a;
--cyan: hsl(188, 90%, 62%);           /* system signal -- active states, checkmarks, progress, pulse */
--red: #e04b4b;                       /* Red Phone ONLY. Never used for anything else. */
--warn: #f0b960;
--ok: #7fb56f;
```

Glass tiers (both use backdrop-filter: blur):
- liquid-glass: background rgba(255,255,255,0.04), blur 20px, border rgba(255,255,255,0.07)
- liquid-glass-strong: background rgba(255,255,255,0.08), blur 30px, border rgba(255,255,255,0.10)

No solid visible borders. Borders are masked gradient overlays only.
Border radius: 16px on cards, 999px on pills, 8px on inputs.

### Typography

- Poppins 300/400/500/600: all UI text, labels, body
- Source Serif 4 italic: emphasized phrases only (e.g., "next action" in the Red Phone heading)
- JetBrains Mono 400: eyebrow labels, keyboard shortcuts, status text, hints, timestamps

### Motion

Cockpit and Altar: subtle breathing animation on the background gradient (scale 1.0 to 1.02, 8s ease-in-out infinite).
Orbit: slow elliptical CSS keyframe animation per node. Sun has a radial glow pulse (opacity 0.6 to 1.0, 3s).
No jarring transitions. Page changes: fade 150ms. Modal: fade + scale from 0.96 to 1.0.

### State picker options and colors

- Green: ship mode (cyan dot)
- Yellow: maintenance (warn dot)
- Red: rest / process only (red dot -- this is the one exception; the dot is red, not the text)
- Potato day (warn dot)
- Hyperfocus (cyan dot, brighter)
- Crashed (muted dot)
- Workday: Harmonic (info dot, blue)

State pill is collapsed by default showing current state name + colored dot + "change" button.

---

## APP INITIALIZATION

On load:
1. Initialize Supabase client
2. Load portfolio_state from Supabase (user_id = 'bodhi')
3. Set active view, active page, active tab, energy state from loaded state
4. Load tasks for today and this week
5. Render the active view
6. Log app_opened event with current view, page, energy_state

If Supabase fails to load (network error): show a minimal error state.
"Supabase connection failed. Check your URL and anon key." Do not show a broken UI.

---

## KEYBOARD SHORTCUTS (Cockpit view)

- H: navigate to Home
- B: navigate to Brain dump
- P: navigate to Key prompts
- M: navigate to Roadmap
- S: navigate to Share with Cowork
- V: open Views panel
- Escape: close any open modal, drawer, or panel

---

## WHAT THE COWORK SESSIONS WRITE TO SUPABASE

Cowork sessions (and scheduled agents) write to the same Supabase tables.
This is how state flows from agent sessions back to the dashboard.

Cowork writes:
- tasks: when a CoS session adds a task based on a brain dump or status update
- task_notes: when an agent adds context to an existing task
- interaction_log: when an agent completes a significant action
- portfolio_state: energy_state field, when Bodhi updates his state verbally in a session

The dashboard reads all of this on load and via realtime subscriptions on tasks and portfolio_state.

---

## DEPLOYMENT

Repo: aicontentnow/bodhi-command-center
Branch: main
File: index.html (root)
Deploy command:
```bash
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add -A && git commit -m "deploy: [description] $(date +%Y-%m-%d-%H%M)" && git push origin main
```

GitHub Pages serves index.html from root of main branch.
The Supabase anon key is safe to include in the HTML (it is public-safe by design).

---

## WHAT NOT TO BUILD

- No React, no Vue, no build pipeline
- No Node.js server, no serverless functions
- No localStorage (zero uses, anywhere)
- No placeholder cards or "coming soon" states
- No decorative sidebar items that don't navigate or do something
- No em dashes in any text
- No red used anywhere except the Red Phone button and state dot
- No "Loading..." states that hang -- fail gracefully with a real error message

---

## CLAUDE CODE SESSION STARTER

Paste this to start the build in Claude Code:

```
Build the Bodhi 360° Command Center v2 per the PRD at:
~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/PRD_dashboard_v2.md

Design reference screenshots are in the same folder. Three screenshots to share with Claude Code before it starts:
- Cockpit view (sidebar + main)
- Altar view (centered)
- Orbit view (planetary canvas)
Plus the v2 share kit showing the Direct Line panel open and closed.

Before writing any code:
1. Read the entire PRD -- every section, including DIRECT LINE PANEL
2. Confirm you understand the three views (Cockpit, Altar, Orbit)
3. Confirm you understand that localStorage is forbidden -- Supabase only, zero exceptions
4. Confirm you understand that the Direct Line panel is the primary interaction surface --
   clicking a bucket card, prompt card, or task "Send to the line" ALL open this panel.
   The only copy-to-clipboard remaining is the "Share with Cowork" page.
5. The Supabase credentials are already in the PRD. Do not ask Bodhi for them.
6. Run the SQL schema from the PRD in Supabase > SQL Editor BEFORE starting to build

Output: a single index.html file saved to:
~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html

This overwrites the current dashboard. The current dashboard is backed up at:
~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_archive/dashboard-v1-backup/index.html

Deploy after Bodhi approves the build:
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add -A && git commit -m "deploy: dashboard-v2" && git push origin main
```

---

## PRD STATUS

Written: 2026-04-20
Design source: Claude Design (three views -- Cockpit, Altar, Orbit -- plus share kit)
Phase: Ready for Claude Code implementation
Blocked on: Bodhi supplying Supabase URL + anon key before build starts

Next action: open Claude Code, paste the session starter above, share the three screenshots.

---

## DIRECT LINE PANEL (authoritative spec)

The Direct Line panel is the primary interaction surface of the entire dashboard.
It replaces every copy-to-clipboard pattern except "Share with Cowork."

**Every entry point into the line:**
- Red Phone card "Open the line" button (Home)
- Bucket card click (Brain dump page)
- Prompt card click (Key prompts page)
- "Send to the line" in task context drawer (Home)
- Red Phone node click (Orbit view)

### Visual design (from v2 share kit)

Panel slides in from the right. Width: 440px on desktop, full-width on mobile.
Panel persists across page navigation within a session -- it does not close when switching pages.
X button closes. Escape key closes.
Panel header: "Chief of Staff" in Poppins 500 + a connection status pill in JetBrains Mono.

**Panel open state -- three sections (top to bottom):**

1. Header bar: "The line is open." in Poppins 300, plus the X close button.

2. Structured launch buttons (shown when kind = 'redphone' or panel opened with no pre-seed):
   Three buttons in a column:
   - "Next step on roadmap" -- pre-seeds the textarea with a roadmap-status prompt (reads active phase)
   - "I have an issue" -- pre-seeds textarea with "Issue: " and focuses it
   - "High-level strategy" -- pre-seeds textarea with a strategy framing prompt and notes
     this is Opus Chat territory, not Cowork (adds a subtle note: "Flag: bring this to Opus Chat")
   
   When kind is brain_dump / prompt / task: skip the structured buttons and go straight to pre-seeded textarea.

3. Message thread area:
   - User messages (role: 'me') appear on the right, glass pill style
   - Agent responses (role: 'cos') appear on the left, darker glass, labeled "CoS"
   - Empty state: "No messages yet. Say what needs to change."
   - New messages appear at the bottom (standard chat scroll)

4. Compose area (bottom):
   - Textarea (4 rows, expands up to 8). Placeholder: "Say what needs to change."
   - When pre-seeded: textarea shows the pre-seeded text (editable)
   - Context tag pill (top-left of textarea area): shows the kind/tag (e.g., "Red Phone" / "LDAG bucket" / "Morning CoS"). Muted cyan, small.
   - Queue status line (below textarea, JetBrains Mono, muted): "QUEUED TO SUPABASE · CoS reads on next run"
   - Send button (right side, cyan arrow icon). Sends on click or Cmd+Enter.

### Message shape (written to direct_line_messages)

```js
{
  id: uuid,
  user_id: 'bodhi',
  content: string,         // the textarea content at send time
  kind: string,            // 'redphone' | 'brain_dump' | 'prompt' | 'task' | 'launch' | 'freeform'
  tag: string | null,      // bucket name, prompt key, task_id, or launch_type depending on kind
  processed: false,
  created_at: timestamp
}
```

kind values:
- redphone: opened from Red Phone card or Orbit node
- brain_dump: opened from a bucket card (tag = bucket name)
- prompt: opened from a prompt card (tag = prompt_key)
- task: opened from task context drawer "Send to the line" (tag = task_id)
- launch: opened via structured launch button (tag = 'roadmap' | 'issue' | 'strategy')
- freeform: opened any other way

### Thread persistence

The panel shows all messages from the current session in the thread. On panel close and reopen, the thread reloads from Supabase (direct_line_messages + direct_line_responses joined). Thread is scoped to the last 50 messages for performance.

### Agent dependency (separate build -- NOT part of this dashboard)

Responses appear when the bodhi-chief-of-staff scheduled task polls direct_line_messages (processed = false), processes them, and writes to direct_line_responses. Same pattern as MIRROR CoS. Realtime subscription on direct_line_responses pushes new agent responses into the panel without reload.

For v1 of the dashboard: the panel sends messages and shows a pending state.
No fake immediate responses. The confirmation after send: "Sent. Chief of Staff picks this up on next run."
The queue status line at the bottom of the compose area is always honest about this.

---

## FINAL PRD STATUS

Written: 2026-04-20
Updated: 2026-04-20 (v2 share kit incorporated -- Direct Line panel replaces all copy patterns)
Design source: Claude Design (Cockpit, Altar, Orbit + v2 Direct Line panel) + MIRROR ops reference
Phase: READY FOR CLAUDE CODE. No open questions. Build can start.

What Claude Code needs to start:
1. This PRD (complete -- no missing info)
2. The design screenshots from the same folder:
   - cockpit view screenshot
   - altar view screenshot
   - orbit view screenshot
   - v2 Direct Line panel screenshots (panel closed + panel open)
3. Supabase credentials: already in the PRD (hardcoded). Do not ask Bodhi.

What is NOT in scope for this build (separate tasks):
- The bodhi-chief-of-staff scheduled task that processes direct line messages and writes responses
- The skills reorganization Phase 3 and 4
- The rogue Hard Hat Healthcare folder cleanup

Claude Code session starter prompt is in the CLAUDE CODE SESSION STARTER section above.
Copy it exactly. Do not abbreviate it.

---

## CURRENT STATE AUDIT (2026-04-21) -- READ THIS BEFORE NEXT CLAUDE CODE SESSION

This section documents what is actually wired vs what is cosmetic in the deployed v2 dashboard.
The next Claude Code session uses this as the honest starting point.

### What is fake right now

- `save()` is `const save = () => {};` -- a no-op. Nothing persists anywhere.
- Messages pushed to the Direct Line panel exist in browser memory only. They vanish on refresh.
- "On the line, queued" toast is cosmetic. Nothing writes to Supabase direct_line_messages.
- Tasks in the dashboard are hardcoded in the JS state object. They are NOT loaded from Supabase.
- Supabase is initialized but tasks are never fetched from it (no `supabase.from('tasks').select()` call wired to the task list).
- Task checkboxes do not write to Supabase. Toggling done is local state only.
- Task notes textarea does not write to Supabase.
- Interaction log receives zero writes.

### What is real

- Supabase tables exist: tasks, portfolio_state, task_notes, interaction_log, direct_line_messages, direct_line_responses
- 15 tasks exist in the Supabase tasks table (inserted by CoS flush session)
- Realtime enabled on tasks, portfolio_state, direct_line_responses
- The schema is correct and ready
- The Supabase credentials in the PRD are correct

### The full Direct Line queue architecture (Bodhi's vision, confirmed 2026-04-21)

This is what the system must become. The next Claude Code session implements this.

**The two actions are distinct:**

"Send to the line" (appears on task drawers, bucket cards, prompt cards):
- Silently writes the message to Supabase direct_line_messages
- Shows a small confirmation toast: "Queued. CoS picks this up when you open the line."
- Does NOT open the panel. Does NOT interrupt focus.
- Bodhi can queue up multiple items throughout the day across different surfaces

"Open the line" (red button only):
- Opens the Direct Line panel
- The panel shows the current queue: all unprocessed messages from direct_line_messages
- Bodhi reviews what's queued, can add a final free-text message
- When he hits Send from the panel, the CoS reads ALL unprocessed messages in one pass
- CoS response covers everything: "Here's what I saw, here's what I'm doing about it"

**Why this matters:**
Bodhi may leave context on 4 different tasks, drop 2 brain dumps, and add a creative note throughout the morning. When he opens the line, the CoS sees all of it as a unified debrief. It does not require Bodhi to recap anything. The queue IS the debrief.

**What the CoS does with the queue:**
- Reads all unprocessed direct_line_messages ordered by created_at
- Groups by kind (tasks get task handling, brain_dumps get routing to correct bucket, prompts get skill loading)
- Responds with a unified summary: "Here's everything I saw. Here's what I'm doing."
- Marks all processed messages as processed = true
- Any action items become tasks in the Supabase tasks table
- Any brain files that need updating get flagged for the next session with Bodhi present

**What the next Claude Code session must wire:**
1. Replace hardcoded state.today and state.week with real Supabase queries
2. Task checkbox writes done status to Supabase tasks table
3. Task notes textarea saves to task_notes on blur
4. "Send to the line" (from drawer, bucket card, prompt card) writes to direct_line_messages silently
5. Direct Line panel loads current queue from direct_line_messages on open
6. Panel send button writes a final message and triggers the CoS reading of the full queue
7. Direct_line_responses realtime subscription pushes CoS replies into the panel thread
8. Portfolio state loads from and saves to portfolio_state table
9. All interaction_log writes wired for every action

**The queue display in the panel:**
When the panel opens, before the compose area, show a "In the queue" summary:
- Count of unprocessed messages
- Brief list: "[kind] -- [first 60 chars of content]" per message
- A "Clear queue" option (marks all processed without sending -- for cleanup only)
- Then the compose area for adding a final message before launching

### Session wrap prompt update

The Key Prompts "Session wrap" card pre-seed text must include the queue flush: before closing,
any unsent queue items should be sent so the CoS can act on them in the next run.

Updated session wrap pre-seed:
"Before we close: check direct_line_messages for any unprocessed items and include them
in the session summary. Then write everything we covered -- all tasks, decisions, status updates,
and action items -- to two places:
1. _inbox/_processed/STATUS_UPDATE_[today].md
2. Supabase tasks table: every concrete action item as a task row with user_id='bodhi'
After writing, confirm what was inserted."
