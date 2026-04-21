# Hub Interaction Spec
## Last updated: 2026-04-19 (Sunday, potato day)
## Canonical source for how the Bodhi 360° Command Center behaves from the user side
## Companion to: _command-center/ARCHITECTURE.md (tech stack and data schema)

---

## North star

The system exists to let Bodhi operate as many projects simultaneously as possible with as little effort as possible, so that passive income can continue to compound for his family while he still has the energy and opportunity to build. This is survival architecture, not productivity theater. Every interaction pattern below serves that goal. Friction that does not serve it gets removed.

---

## Core interaction patterns

### 1. Voice input everywhere

Every surface on the dashboard has a voice feedback path. Any card, any task, any notification, any project tile, any agent row has a tappable input field that captures voice (via Wispr Flow) and routes the dump to the chief of staff.

- Tap the item -> input field opens
- Bodhi speaks, Wispr Flow transcribes
- Send button delivers the transcript to the chief of staff queue
- The bell rings on the chief of staff desk (see Notifications)
- The chief of staff picks up and acts, or routes the work to the right specialist

This replaces every need to context-switch into external chat, retype context, or open a separate tool. Every status update compresses to: tap, talk, send.
### 2. Red phone and bell

Two notification priorities. Visually distinct at all times.

**Red phone.** Urgent. Requires Bodhi's direct attention now. Examples: blockers escalated by an agent, high-priority attention items, blocking approvals before downstream work can proceed, safety-sensitive items. Red phone items interrupt the normal flow. They sit at the top of the queue until acknowledged.

**Bell.** Normal. Things completed, assets created, reports ready to read, confirmations of work done. Click to view detail inline, mark as read, or drill into the source.

The bell is always at the top-right of the dashboard with a count badge. Clicking it opens a slide-out panel listing recent notifications with links back to their source (project, agent, file, or conversation thread).

Bodhi can also promote any bell item to red phone status with a tap, or demote a red phone item to bell if it turns out to be less urgent.

### 3. Morning standup flow

Bodhi wakes up. Opens the command center. The morning queue is already waiting.

Sequence:
1. Dashboard shows overnight changes, completed work, new blockers, today's calendar (including kids logistics like pickups and appointments), and a short "where things stand" summary from the chief of staff.
2. Bodhi reviews. Clicks DONE on anything already completed that needs acknowledgment. Reads anything marked for attention. Leaves voice feedback on anything he has thoughts on.
3. Energy state gets declared (green, yellow, red, or custom label like "potato day").
4. Bodhi opens the chief of staff chat panel inside the dashboard. They talk through priorities for the day. Special interest pull, mood, dopamine state are all factored in. The chief of staff never prescribes a single rigid next step. It proposes options matched to Bodhi's current state.
5. Chief of staff dispatches work to the relevant specialists based on that conversation.

Standup lives IN the dashboard. The chief of staff conversation lives IN the dashboard. External Claude chat is for deep strategic work that does not fit the dashboard yet, not for daily operations.

### 4. Dispatch and report back

Chief of staff sends work to specialists after standup. Specialists go execute. They report back via the bell (or red phone for blockers) when any of the following happens:

- A document or asset is created. Bell item with link to the asset. Preview available inline.
- A task is completed. Bell item with one-line summary and link to the result.
- A roadblock is hit. Red phone item with a clear blocker description and a proposed unblock (if one exists).
- Further instructions are required. Red phone item with the specific question and the context needed to answer.
- A scheduled run produces notable output. Bell or red phone depending on severity.
- An approval has been queued. Bell item that expands to an approval card with DONE / revise / reject actions inline.

Bodhi never has to poll. The system pushes notifications to him. He decides what to pick up and when.

### 5. Feedback is the dialogue

Anywhere Bodhi sees a thing, he can leave feedback on that thing. Feedback is a voice dump tagged with the source (this asset, this task, this notification, this card, this agent). The chief of staff routes the feedback to the right specialist or acts on it directly.

This means the dashboard is never a read-only report. It is a bidirectional interface. The composer talks to any part of the symphony and the conductor routes it. The specialist receiving feedback incorporates it into the next iteration and reports back through the bell.

---

## What lives in the dashboard vs external Claude chat

### Dashboard handles

- Morning standup and daily state declaration
- Status dumps and contextual feedback
- Approval queues with click-DONE (not click-through-to-chat)
- Bell notifications and red phone alerts
- Sub-dashboard drill-downs: MIRROR Ops, LDAG, Harmonic, SEASØNS, FRAMEZERØ
- Chief of staff chat panel, embedded
- Agent status and last-run reports
- Calendar and kids logistics integration
- Project status cards with live state
- Scheduled task control (enable, disable, snooze)

### External Claude chat handles

- Strategic sessions before a feature exists in the dashboard (sessions like this one)
- Deep synthesis across multiple domains that needs Opus
- First-time spec writing and brain building
- Exploratory work and vision sessions

Over time the dashboard absorbs more. External chat becomes rarer as the system matures.

---

## Model routing

- **Sonnet** handles the red phone, the bell chatter, the morning standup, the dispatch conversations, and the steady everyday work. This is the default.
- **Opus** is reserved for high-stakes strategic sessions and multi-project synthesis. Not the default. Called in specifically by Bodhi or by the chief of staff flagging a task as strategic-enough to warrant it.
- **Specialists** (agents running skills) pick the model appropriate to their task, defaulting to Sonnet or cheaper where the task is mechanical (file moves, scheduled checks, routine content generation).

Token burn is a real constraint. The routing logic above exists so high-cost models only run on high-leverage work.

---

## Relationship to other brain files

- `Claude-Workspace/CLAUDE.md` master brain: operational law for all sessions. Read first.
- `_brain/BODHI_360_BRAIN.md`: human context layer. Read after master brain for any session that touches Bodhi personally.
- `_command-center/ARCHITECTURE.md`: tech stack, Supabase schema, roadmap v0.1 to v1.5.
- `_command-center/INTERACTION_SPEC.md` (this file): how the hub behaves from the user side. Product brief.
- Project brains (`mirror/CLAUDE.md`, `harmonic/CLAUDE.md`, `seasons/CLAUDE.md`, `latedxaudhd/CLAUDE.md`, `framezero/CLAUDE.md`): read by the relevant specialist when dispatched.
- `_inbox/_processed/STATUS_UPDATE_YYYY-MM-DD.md`: rolling status dumps from Bodhi. Read by every session to know current truth beyond what the static brain files capture.

---

## Open questions to resolve in a future Cowork build session

- Routing rubric: how does the chief of staff decide which specialist receives a given dump? First pass probably uses tags (project name mentioned), energy state, and the source card the feedback was attached to.
- Cross-device reach: red phone escalations surface how? Push notifications on iPhone? Apple Watch glance? Email fallback? SMS? Needs decision.
- Minimum viable v0.2 build that demonstrates voice-dump-to-bell-ring end-to-end. Probably: one project card with a voice input that writes to Supabase attention_items and surfaces a bell count.
- Sub-dashboard sequencing. LDAG dashboard already lives at latedxaudhdguy.com/dashboard.html. Which sub-dashboard ships next: MIRROR Ops (existing ops.thebookofoneness.com), Harmonic, or SEASØNS?
- Calendar integration: Google Calendar (already connected per master brain) plus Apple Calendar? Just Google? Needs decision.
- Wispr Flow integration: does it write to a staging endpoint and the dashboard polls, or does it write directly to Supabase via a configured webhook? Needs technical design.

---

This spec evolves. Every future session that touches the hub design updates this file before closing. Snapshots go to `_archive/brain-snapshots/` if the file is mature enough to warrant version history.
