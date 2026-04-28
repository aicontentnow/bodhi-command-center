# P5: Direct Line CoS Conversation Thread
## Building: v4r14
## Builds on: v4r13 (P9 State Persistence QA passed 2026-04-27)
## File to modify: v2-app.js and v2-styles.css

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder). It connects to Supabase (project gcbvvausrmbbkfazojpl) for live task data, portfolio state, and Direct Line messaging.

Current version: v4r13 (v4r12 QA passed 2026-04-27)

## What is already built and confirmed working

- P1: Focus mode -- amber pill, task selection, modal, Supabase PATCH, Escape/Exit close
- P2: Drag-to-reorder -- persists sort_order to Supabase
- P3: Add task button -- "+" pinned top, compact modal, validation, toast, Escape closes
- P4: Done tasks collapse -- "show completed (N)" toggle
- P6: Bridge agent -- scheduled every 30 minutes
- P8: Polish -- sort toggle, hotkey guards, bucket filter state model, All button toggle, all confirmed working
- P9: State persistence on refresh -- sort preference, active tab, bucket filter all persist across page refresh

## What this prompt builds

P5: Replace the Direct Line queue view with a persistent conversation thread. The Direct Line panel currently shows only unprocessed messages in a queue that disappears when the bridge runs. This prompt rebuilds the Direct Line UI into a two-sided conversation thread: Bodhi's messages on the right (amber), CoS responses on the left (muted). The thread loads from Supabase on every page open and persists across refresh. Realtime subscription continues to fire when new responses arrive. Sending new messages is unchanged.

## What must not be touched

- All P1 Focus mode logic and functions
- All P2 drag-to-reorder logic
- All P3 add-task modal logic
- All P4 done-tasks collapse logic
- All P8 polish (sort toggle, hotkey guards, bucket filter, All button)
- All P9 state persistence (persistState function, sbLive flag, sort_preference, bucket_filter, active_tab restore)
- All task rendering logic (renderList, renderCounts, renderBucketsPage)
- Supabase tables: tasks, portfolio_state, task_notes -- do not touch their read/write logic
- The direct_line_messages POST (sending) -- keep exactly as-is
- The setLineStatus function -- keep exactly as-is
- index.html structure -- do not add or remove HTML elements. All changes are JS and CSS only.

---

## Read first

Read both files completely before writing any code:

```
_command-center/v2-app.js
_command-center/v2-styles.css
```

Find the existing Direct Line section in v2-app.js. Identify:
- How messages are currently fetched and rendered
- Where the realtime subscription is set up for direct_line_responses
- The existing sendLine function and its logic
- The current panel HTML structure (read index.html if needed to understand the DOM)

Do not modify anything outside the Direct Line section unless a CSS change is required to support the new thread layout.

---

## Changes required

### Change 1: Add conversation loader function

Add a new async function `loadConversationThread()` that:

1. Fetches all messages for user_id='bodhi' from direct_line_messages, ordered by created_at ascending:

```
GET https://gcbvvausrmbbkfazojpl.supabase.co/rest/v1/direct_line_messages?user_id=eq.bodhi&order=created_at.asc&select=id,content,kind,tag,processed,created_at
```

2. Fetches all responses from direct_line_responses (no user_id filter -- join via message_id), ordered by created_at ascending:

```
GET https://gcbvvausrmbbkfazojpl.supabase.co/rest/v1/direct_line_responses?order=created_at.asc&select=id,message_id,agent,content,created_at
```

3. Builds a unified chronological array. Each item is either:
   - A user message: { type: 'user', id, content, kind, created_at }
   - A CoS response: { type: 'cos', id, message_id, agent, content, created_at }

4. Sort the unified array by created_at ascending.

5. Render the thread (see Change 2).

### Change 2: Add thread renderer function

Add a function `renderThread(items)` that:

1. Finds the thread container in the Direct Line panel. Use a new element with id `dl-thread`. If it does not exist in the HTML, create it dynamically and insert it inside the Direct Line panel, above the compose area.

2. Clears the container and re-renders all items.

3. For each item:
   - type = 'user': render a message bubble aligned right. Amber background (#F59E0B or close to existing amber). White text. Show content and a human-readable timestamp (HH:MM format).
   - type = 'cos': render a message bubble aligned left. Dark background (use #1a1a2e or match the existing panel dark tone). Light text (#e0e0e0 or similar). Show content and timestamp. Label it with a small "CoS" prefix in muted text above the bubble.

4. After rendering, scroll the container to the bottom so the most recent message is visible.

5. If the array is empty, show a muted placeholder: "No messages yet. Use the field below to send your first message."

### Change 3: Wire loadConversationThread to panel open

Find where the Direct Line panel is opened (the O key handler and any button that opens it). After the panel becomes visible, call `loadConversationThread()`. This ensures the thread is fresh every time the panel opens.

Also call `loadConversationThread()` once during the main init sequence, after Supabase is confirmed live (after the sbLive = true point), so the thread is pre-loaded on page open.

### Change 4: Update realtime subscription

Find the existing realtime subscription on direct_line_responses. Currently it likely fires and updates a status element. Change it to:

1. On INSERT event: append the new response to the thread immediately without a full reload. Build a single type='cos' item from the realtime payload and append it to `dl-thread`. Scroll to bottom.

2. Keep any existing setLineStatus calls -- do not remove status updates.

### Change 5: Remove or repurpose the old queue view

Find the existing code that renders unprocessed messages in the queue. If it renders a list of pending messages that disappear when processed:

- Remove the pending-queue render logic from the Direct Line panel.
- The thread (Change 2) replaces it. Processed and unprocessed messages both appear in the thread -- processing status is irrelevant to the display.
- Keep the setLineStatus function for the connection status indicator only.

### Change 6: CSS for thread layout

In v2-styles.css, add styles for:

```
#dl-thread {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  max-height: 400px; /* adjust to fit panel without overflow */
}

.dl-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.dl-bubble.user {
  align-self: flex-end;
  background: #F59E0B;
  color: #000;
}

.dl-bubble.cos {
  align-self: flex-start;
  background: #1a1a2e;
  color: #e0e0e0;
}

.dl-bubble-label {
  font-size: 10px;
  color: #666;
  margin-bottom: 3px;
}

.dl-bubble-time {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
  text-align: right;
}

.dl-bubble.user .dl-bubble-time {
  color: rgba(0,0,0,0.4);
}
```

Adjust colors to match the existing Command Center visual system if the above do not fit. The constraint is: user messages visually distinct from CoS responses, both legible, consistent with the existing dark panel aesthetic.

---

## QA checklist (run after deploy)

After deploying, tell me you are ready and I will walk through these one at a time:

1. Open the Direct Line panel. Does the conversation thread render without console errors?
2. Are existing messages (from prior sends) visible in the thread?
3. Does a user message appear on the right in amber?
4. Does a CoS response appear on the left in dark?
5. Close and reopen the panel. Does the thread persist (reload from Supabase)?
6. Hard refresh the page. Does the thread still appear when the panel is opened?
7. Send a new message. Does it appear in the thread immediately?
8. Regression: do all existing features still work? (task add, drag, done collapse, focus mode, state persistence on refresh)

---

## Deploy

After all changes are made and verified:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "deploy: P5 Direct Line conversation thread $(date +%Y-%m-%d-%H%M)" && git push origin main
```
