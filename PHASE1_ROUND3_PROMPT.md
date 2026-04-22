# Command Center v3: Phase 1 Round 3 Fixes
## For: Claude Code
## Phase: Phase 1 QA Round 3 -- remaining failures after round 2 deploy
## Version: v3 (deployed round 2 on 2026-04-21, this addresses round 3 QA findings)

---

## READ THESE FILES FIRST BEFORE WRITING ANYTHING

1. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`
2. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`
3. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-styles.css`

Targeted edits only. Do not rewrite any file from scratch.

---

## CONSOLE ERRORS NOTE

QA shows errors from `inject-content-scripts.js` and `injected.js` -- these are the 1Password browser extension and are unrelated to this codebase. Do not attempt to fix or suppress them. They are not our errors.

---

## WHAT PASSED IN ROUND 2 -- DO NOT TOUCH

- Loading state (no flash)
- Queue reload from Supabase on refresh
- Roadmap strikethrough
- THE BOOK OF ONENESS all caps
- Task checkoff
- Page navigation and active state persistence
- Queue count badge
- aria-hidden warnings resolved
- Task move (T/W) functions correctly and persists
- Filter/sort controls exist and work

---

## FIX 1: Restore Brain Dump page to its original function

The Brain Dump page was overwritten in round 2 with a bucket filter view. This broke the core function of the Brain Dump page, which is the interface for sending content into the Direct Line queue (brain dumps, task feedback, red phone messages, freeform notes).

Remove the bucket filter / task list that was added to the Brain Dump page in round 2. Restore the Brain Dump page to its original state from v2. The Brain Dump page must only contain the interface for entering and sending content to the CoS queue.

Do not add any task lists, bucket filters, or task management UI to the Brain Dump page.

---

## FIX 2: Add a Buckets page to the navigation

Add a new navigation item called "Buckets" to the left sidebar navigation, below Roadmap. It should follow the same nav item pattern as the existing items (single letter shortcut, label, count badge if applicable).

When the user clicks Buckets in the nav, show a page with:
- The canonical bucket list at the top as clickable filter buttons: bodhi360, Harmonic, LDAG, THE BOOK OF ONENESS, Family, Creative, MIRROR, Career, Command. Each shows a count of tasks in that bucket.
- Below the bucket buttons: a task list showing all tasks across all horizons (today + week combined), grouped by bucket.
- Clicking a bucket button filters the list to show only that bucket.
- Clicking it again clears the filter and shows all buckets.
- Each task in this view shows: checkbox (done state), title, horizon badge (today or week), and the move-horizon button.
- An "ALL" button resets the filter.

The filter toggle must work correctly: click once to filter, click again to clear. Do not show all tasks on second click -- clear the filter so the view resets to showing all buckets grouped.

---

## FIX 3: Move filter/sort controls to be inline with the Today/Week tab pills

The filter/sort controls (bucket dropdown and sort toggle) were placed above the Today/Week tab row in round 2. This pushes the task lists down and wastes vertical space.

Move the bucket dropdown and sort toggle so they sit on the same horizontal line as the Today and This Week tab pills. The layout should be:

```
[Today] [This Week]          [bucket dropdown] [sort button]
```

Left side: the existing Today and This Week tab pills.
Right side: the bucket dropdown and sort button, right-aligned on the same row.

Remove the separate control bar row that was added above the tabs in round 2.

---

## FIX 4: Task move button -- style as a visible pill

The T and W letters that appear on task row hover are too small and not recognizable as interactive buttons. Users do not know to click them.

Replace the single letter with a small pill-shaped button. The pill should say:
- "week" on a today task (moves it to week)
- "today" on a week task (moves it to today)

The pill should:
- Appear on hover over the task row (not always visible)
- Have a subtle border or background so it reads as a button
- Use a small font (10-11px is fine) but be wide enough to read the word
- Turn cyan/accent color on hover to indicate it is clickable

Keep the same click behavior (PATCH Supabase, move the card immediately without reload).

---

## FIX 5: Quick Actions collapse -- fix peek-a-boo and improve label

The first structured launch button is still partially visible when the Quick Actions section is collapsed. The CSS overflow or max-height is not fully clipping the content.

Fix the collapse so zero button content is visible when collapsed. The collapsed state should show only the "QUICK ACTIONS" toggle label and nothing else.

Also increase the size of the "QUICK ACTIONS" label and toggle arrow. It is too small to notice. Increase the font size to at least 11px, add a small amount of padding, and make the arrow icon slightly larger. It should be clearly readable as a section toggle without hunting for it.

---

## FIX 6: Direct Line panel -- scroll to bottom on open

When the Direct Line panel opens, the message thread should scroll to the bottom (most recent message) automatically. Currently it opens somewhere in the middle.

In the `openLine()` function, after populating the thread, add:

```
const thread = document.getElementById('lineThread');
if (thread) thread.scrollTop = thread.scrollHeight;
```

This must run after the thread content is rendered, not before.

---

## FIX 7: Red Phone textarea -- scroll to top on open

When the panel opens with the Red Phone prompt pre-populated in the textarea, the visible area of the textarea shows the middle of the prompt text instead of the beginning.

After setting the textarea value (when Red Phone is triggered), set the textarea scroll position to the top:

```
textarea.scrollTop = 0;
textarea.setSelectionRange(0, 0);
```

The user should see the beginning of the prompt when the panel opens, not the middle.

---

## FIX 8: Allow bucket change on existing tasks

There is currently no way to change the bucket of a task after it has been created. The only workaround is to delete and recreate, which loses chronological position.

When a task row is clicked and the task detail drawer opens, add a bucket selector to the drawer. It should show the current bucket and allow the user to change it via a dropdown using the canonical bucket list: bodhi360, Harmonic, LDAG, THE BOOK OF ONENESS, Family, Creative, MIRROR, Career, Command.

On change, PATCH the task in Supabase:

```
PATCH /rest/v1/tasks?id=eq.<task_id>
body: {"bucket": "<new_bucket>"}
```

After a successful PATCH, update the bucket tag on the task card in the list immediately without a full reload. The task stays in its current position in the list -- do not move it to the bottom.

The bucket selector in the drawer should follow the same visual style as the bucket selector on the task add row.

---

## DO NOT

- Do not rewrite any file from scratch
- Do not touch Supabase connection code, table names, or the Realtime subscription
- Do not add localStorage
- No em dashes in any string literals, comments, or UI copy
- Do not remove or break any functionality that passed QA in rounds 1 or 2
- Do not put task management UI on the Brain Dump page

---

## AFTER COMPLETING ALL FIXES

Confirm:
1. Brain Dump page restored -- no task lists or bucket filters on it, original send-to-queue UI is back
2. Buckets nav item added -- shows grouped tasks, clickable bucket filters, filter clears correctly on second click
3. Filter/sort controls are inline with Today/Week tabs (same row, right-aligned)
4. Task move button is a readable pill (says "week" or "today"), visible on hover
5. Quick Actions collapse fully hides all buttons, label is readable, no peek-a-boo
6. Panel opens scrolled to most recent message
7. Red Phone textarea shows beginning of prompt text, not middle
8. Task drawer includes a bucket selector -- changing it PATCHes Supabase and updates the tag in place without moving the task

Do not deploy. Cowork handles QA and deployment.

---

## VERSION NOTE

Command Center deployed version: v3 round 2 (2026-04-21).
These fixes complete Phase 1 QA. Once confirmed, v3 is final and Phase 2 begins.
