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

### Supabase credentials (Bodhi supplies these)

At the top of the JS, define:
```js
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Bodhi finds these at: supabase.com > his project > Settings > API.
The anon key is public-safe. Do not use the service role key.

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

-- Brain dumps
CREATE TABLE IF NOT EXISTS brain_dumps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'bodhi',
  bucket text NOT NULL,
  content text NOT NULL,
  prompt_copied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable realtime on tasks and portfolio_state
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE portfolio_state;
```

### Interaction log event types

Log every one of these to interaction_log with event_data as JSON:
- task_checked: { task_id, task_title, done: true/false }
- task_added: { task_id, task_title, horizon, bucket }
- note_saved: { task_id, note_preview (first 80 chars) }
- prompt_copied: { prompt_key, prompt_label }
- state_changed: { from, to }
- view_changed: { from, to }
- page_changed: { from, to }
- brain_dump_sent: { bucket, char_count }
- red_phone_lifted: {}
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
- Red Phone: red pill, positioned near the sun (not in outer orbit). Always visible. Clicking copies the CoS prompt and logs red_phone_lifted. Does NOT navigate away.

Orbit behavior:
- Nodes have a slow elliptical CSS animation (different speeds per node, 20-40s rotation).
- Clicking any project node navigates to Brain dump with that bucket pre-selected.
- Instructions at bottom: "TAP A PLANET · RED PHONE COPIES · SUN RETURNS HOME" in JetBrains Mono, muted.

View switcher: bottom right "VIEW" panel showing Cockpit, Altar, Orbit options. Active one highlighted cyan.

---

## PAGES

### Home (default)

Two sections, always visible:

**Red Phone card** (pinned, always at top):
- Background: dark glass (liquid-glass-strong style)
- Eyebrow: "RED PHONE · START EVERY SESSION HERE" in JetBrains Mono, red dot
- Heading: "One *next action* -- nothing more." (Source Serif 4 italic on "next action")
- Subtext: "Copy the prompt. Paste it into a new **Cowork** session."
- CTA: "Lift the Red Phone" button (red, large, phone icon). Clicking copies the CoS prompt and logs red_phone_lifted.

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
- "Copy w/ context" button: bundles task title + all notes into a Cowork-ready prompt, copies to clipboard, logs prompt_copied.
- Close button.

### Brain dump

6 bucket cards in a grid: bodhi360, Harmonic, LDAG, The Book of Oneness, Family, Creative.
Each card: bucket name + short description. Clicking opens a compose modal.

Compose modal:
- "Dump: [Bucket name]" header
- Large textarea (Wispr Flow compatible -- just a standard textarea)
- "Send" button: saves content to brain_dumps table, then copies a routed Cowork prompt to clipboard, logs brain_dump_sent, closes modal.
- The copied prompt format:
  "I'm dumping into my [Bucket] bucket from the command center.
  Write this to: _inbox/[bucket]/dump_[timestamp].md
  Then process it: extract action items, flag anything urgent, update _brain/bodhi-state.md if portfolio state changed.
  Content: [content]"
- Cancel button.

### Key prompts

Grid of prompt cards. Clicking any card copies the prompt and shows a brief toast.
All prompts write to interaction_log with event_type prompt_copied.

Prompts (with their text):

**Morning: where am I**
Load this skill and follow its instructions:
skills/bodhi-chief-of-staff/SKILL.md
State: [green / yellow / red / potato day / workday / describe]
What's on my mind: [one line, or "I don't know, tell me"]

**LDAG: pick up production**
Load this skill and follow its instructions:
skills/ldag-cos/SKILL.md

**LDAG: draft an episode**
Load this skill and follow its instructions:
skills/ldag-episode-script/SKILL.md
Episode concept: [describe]
Moment IDs (if any): [paste]

**Status update: something changed**
I have a status update. Something shipped or shifted and I want the system to know.
Write a status file at: _inbox/_processed/STATUS_UPDATE_[today].md
Update _brain/bodhi-state.md with anything that changes portfolio state.
Here's what happened: [talk]

**Skills reorg: Phase 3**
Skills reorganization audit -- Phase 3: canonical structure proposal.
Read: _command-center/reorg/INVENTORY_2026-04-20.md
Write proposal to: _command-center/reorg/PROPOSAL_2026-04-20.md
Do NOT move any files. Proposal only. Wait for approval before Phase 4.

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
Logs prompt_copied with prompt_key: 'share_with_cowork'.

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

Paste this to start the build:

```
Build the Bodhi 360° Command Center v2 per the PRD at:
~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/PRD_dashboard_v2.md

Design reference screenshots are in the same folder (share the screenshots when starting).

Before writing any code:
1. Read the entire PRD
2. Confirm you understand the three views (Cockpit, Altar, Orbit)
3. Confirm you understand that localStorage is forbidden -- Supabase only
4. Ask Bodhi for his Supabase URL and anon key (he gets them from supabase.com > his project > Settings > API)

Output: a single index.html file saved to:
~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html

This overwrites the current dashboard. The current dashboard is backed up at:
~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_archive/dashboard-v1-backup/index.html

Deploy after Bodhi approves the build:
cd "~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add -A && git commit -m "deploy: dashboard-v2" && git push origin main
```

---

## PRD STATUS

Written: 2026-04-20
Design source: Claude Design (three views -- Cockpit, Altar, Orbit -- plus share kit)
Phase: Ready for Claude Code implementation
Blocked on: Bodhi supplying Supabase URL + anon key before build starts

Next action: open Claude Code, paste the session starter above, share the three screenshots.

---

## RED PHONE: DIRECT LINE PANEL (updated spec -- replaces simple copy button)

The Red Phone is not a "copy prompt" button. It is a direct line to the Chief of Staff.
Inspired by the MIRROR ops dashboard pattern: a slide-out panel with a live message queue.

### Panel behavior

Clicking "Lift the Red Phone" slides out a panel from the right side of the screen (all three views).
Panel width: 420px on desktop, full-width on mobile.
Panel has an X to close.
Panel header: "Chief of Staff" + "Direct line -- queues into agent_triggers" in JetBrains Mono.

### Two modes inside the panel

**Mode 1: Direct line (default)**
A textarea at the bottom: "What needs to change? What's on your mind?"
Send button (red, arrow icon).
On send: writes message to `direct_line_messages` table in Supabase, shows confirmation
("Sent. Chief of Staff picks this up on next run.").
The panel shows a conversation thread: user messages on the right, agent responses on the left.
Responses appear when the scheduled CoS agent writes back to Supabase (realtime subscription).

**Mode 2: Structured launch (tab or toggle inside the panel)**
Three quick-launch options. Each is a button, not a copy-paste:
- "Next step on roadmap" -- reads current roadmap state from Supabase, identifies the active phase,
  opens Cowork with the correct starter prompt pre-loaded (via clipboard + instruction to paste).
- "I have an issue" -- switches to Mode 1 with the prompt pre-filled: "Issue: " and focus on textarea.
- "High-level strategy" -- flags message as strategy-tier, adds a note to copy to Opus Chat
  (these need synthesis, not execution). Copies a framing prompt for Claude Chat (not Cowork).

### Supabase tables for direct line

```sql
CREATE TABLE IF NOT EXISTS direct_line_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'bodhi',
  content text NOT NULL,
  mode text DEFAULT 'direct',
  launch_type text,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS direct_line_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES direct_line_messages(id),
  agent text DEFAULT 'bodhi-chief-of-staff',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE direct_line_responses;
```

### Agent dependency (separate build, not part of this dashboard build)

For responses to appear in the panel, the bodhi-chief-of-staff needs a scheduled task variant
that polls `direct_line_messages` where processed = false, processes them, and writes to
`direct_line_responses`. This is the same pattern as the MIRROR CoS (runs on a schedule,
reads Supabase, writes back).

For v1 of the dashboard: the panel sends messages and shows a pending state.
Responses appear when the agent processes them. No fake immediate responses.
The confirmation message is honest: "Sent. Chief of Staff picks this up on next run."

Add to the SQL schema above when building the CoS scheduled task.

---

## FINAL PRD STATUS

Written: 2026-04-20
Updated: 2026-04-20 (direct line panel spec added)
Design source: Claude Design (Cockpit, Altar, Orbit views) + MIRROR ops reference pattern
Phase: Ready for Claude Code implementation

What Claude Code needs to start:
1. This PRD
2. The three design screenshots (Cockpit, Altar, Orbit)
3. Bodhi's Supabase URL + anon key (Settings > API in his Supabase project)

What is NOT in scope for this build (separate tasks):
- The bodhi-chief-of-staff scheduled task that processes direct line messages
- The skills reorganization Phase 3 and 4
- The rogue Hard Hat Healthcare folder cleanup

Claude Code session starter prompt is in the CLAUDE CODE SESSION STARTER section above.
