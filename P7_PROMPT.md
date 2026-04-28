# P7 -- Direct Line Walkie-Talkie Notification Model
## Version: v4r16 (v4r15 QA passed 2026-04-27 -- this builds on that working baseline)

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder). It connects to Supabase (project gcbvvausrmbbkfazojpl) for live task data, portfolio state, and Direct Line messaging.

Current version: v4r15 (v4r14 QA passed 2026-04-27)

## What is already built and confirmed working

- P1: Focus mode -- amber pill, task selection, modal, Supabase PATCH, Escape/Exit close, F hotkey
- P2: Drag-to-reorder -- persists sort_order to Supabase
- P3: Add task button -- "+" pinned top, compact modal, validation, toast, Escape closes
- P4: Done tasks collapse -- toggle works
- P5: Direct Line CoS Conversation Thread -- two-sided bubble layout, user right/blue, CoS left, loads from Supabase, realtime appends, persists on refresh
- P6: Bridge agent scheduled every 30 minutes. Subtask count badge on task cards. F hotkey opens/closes Focus mode.
- P8 Polish: sort toggle, hotkey guards (N, O, F, Escape), bucket filter state model, All button toggle
- P9: State persistence on refresh -- sort preference, active tab, bucket filter all persist

## What this prompt builds

P7: Direct Line walkie-talkie notification model. Two parts:

Part A: Fix the kind routing bug in the `send()` function. Messages sent without a pendingTag currently arrive in Supabase as kind='freeform', which routes to task extraction in the bridge. Free-text Direct Line messages must arrive as kind='redphone' so the bridge routes them to CoS synthesis.

Part B: Add a notification bell badge to the Red Phone widget. When the bridge writes a new response to direct_line_responses while the panel is closed, increment the badge, fire a Web Notifications API browser notification, and show the bell. Clicking the bell opens the line and clears the badge. Opening the line via any mechanism also clears the badge.

## What must not be touched

- Supabase connection setup, Supabase project URL, Supabase anon key
- The `tasks` table queries, task rendering, drag-to-reorder, done/undone logic
- The `subtasks` table queries and badge display on task cards
- The `portfolio_state` upsert logic and state persistence
- P8 polish: sort toggle, hotkey guards, bucket filter state model
- The `loadConversationThread()` function and conversation rendering
- The Red Phone button's existing click handler and RED_PHONE seed text
- The existing realtime subscriptions for tasks-live and portfolio-state-live
- No em dashes in any string, comment, or UI copy
- No localStorage

---

## PART A -- Kind routing fix

In `v2-app.js`, find this line (approximately line 486):

```
const kind = kindOverride || (pendingTag?.kind ?? 'freeform');
```

Change `'freeform'` to `'redphone'`:

```
const kind = kindOverride || (pendingTag?.kind ?? 'redphone');
```

That is the entire Part A change. One word. Do not change anything else in the `send()` function.

---

## PART B -- Notification bell

### HTML changes (index.html)

Find the `.actions` div inside `#section-redphone` (the Red Phone widget). It currently contains only the "Open the line" button. Add a notification bell button ABOVE the "Open the line" button:

```
<div class="actions" style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
  <button class="btn dl-notif-btn" id="dlNotifBtn" title="Chief of Staff replied" aria-label="New CoS responses" hidden>
    <span class="ico">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    </span>
    <span id="dlNotifCount">0</span>
    <span>replied</span>
  </button>
  <button class="btn red-phone-btn" id="openRedPhone">
    <span class="ico">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z"/></svg>
    </span>
    <span>Open the line</span>
  </button>
</div>
```

The bell button starts hidden (`hidden` attribute). It only shows when `dlUnread > 0`.

### JS changes (v2-app.js)

**1. Add unread counter state** -- add this immediately after the existing `let pendingTag = null;` declaration:

```
let dlUnread = 0;

function updateBell() {
  const btn = document.getElementById('dlNotifBtn');
  const countEl = document.getElementById('dlNotifCount');
  if (!btn || !countEl) return;
  if (dlUnread > 0) {
    countEl.textContent = dlUnread;
    btn.hidden = false;
  } else {
    btn.hidden = true;
  }
}
```

**2. Clear badge when line opens** -- inside `openLine()`, after `linePanel.classList.add('is-open')`, add:

```
dlUnread = 0;
updateBell();
```

**3. Bell click handler** -- after the existing `openRedPhoneBtn.addEventListener('click', ...)` block, add:

```
const dlNotifBtn = document.getElementById('dlNotifBtn');
dlNotifBtn.addEventListener('click', () => {
  openLine();
});
```

**4. Web Notifications helper** -- add this function near the top of the IIFE, alongside other utility functions like `toast()`:

```
function fireCoSNotif(content) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification('Chief of Staff replied', {
      body: (content || '').slice(0, 120),
      silent: false,
    });
  } catch (e) {
    console.warn('Browser notification failed:', e);
  }
}
```

**5. Request notification permission on first send** -- inside the `send()` function, immediately after `if (!t) return;`, add:

```
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().catch(() => {});
}
```

**6. Extend the existing realtime handler** -- find the existing `direct-line-responses-live` realtime callback. The current code inside the callback is:

```
if (linePanel.classList.contains('is-open')) {
  lineThread.appendChild(buildCosBubble(cosItem));
  lineThread.scrollTop = lineThread.scrollHeight;
  lineEmpty.hidden = true;
  lineLaunch.hidden = true;
} else {
  toastOk('Chief of Staff replied · open the line');
}
```

Replace the `else` branch with:

```
} else {
  dlUnread++;
  updateBell();
  toastOk('Chief of Staff replied · open the line');
  fireCoSNotif(resp.content);
}
```

The `if` branch (panel open) remains unchanged. Do not touch the `lineThread.appendChild` path.

### CSS changes (v2-styles.css)

Add these styles. Find a logical section near existing `.btn` or `.red-phone-btn` styles and add:

```
.dl-notif-btn {
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.35);
  color: #4A9EFF;
  font-size: 0.72rem;
  gap: 0.35rem;
  letter-spacing: 0.03em;
  animation: dlNotifPulse 2.4s ease-in-out infinite;
}
.dl-notif-btn:hover {
  background: rgba(74, 158, 255, 0.25);
  border-color: rgba(74, 158, 255, 0.6);
}
.dl-notif-btn .ico svg {
  width: 14px;
  height: 14px;
}
@keyframes dlNotifPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(74, 158, 255, 0.0); }
  50%       { box-shadow: 0 0 0 5px rgba(74, 158, 255, 0.18); }
}
```

---

## Final verification before deploy

After making all changes, confirm:

1. The `send()` function now has `?? 'redphone'` not `?? 'freeform'`
2. The `dlNotifBtn` element exists in index.html and starts with `hidden` attribute
3. `updateBell()` is defined and called from both `openLine()` and the realtime callback
4. `fireCoSNotif()` is defined
5. The realtime callback's `else` branch now calls both `updateBell()` and `fireCoSNotif()`
6. No em dashes anywhere in the diff

---

## Deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "deploy: P7 walkie-talkie notifications v4r16 $(date +%Y-%m-%d-%H%M)" && git push origin main
```
