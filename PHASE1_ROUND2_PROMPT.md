# Command Center v3: Phase 1 Round 2 Fixes
## For: Claude Code
## Phase: Phase 1 QA Round 2 -- fixes not resolved in first pass, plus UX improvements
## Version: v3 (deployed 2026-04-21, this addresses remaining QA failures from round 2 review)

---

## READ THESE FILES FIRST BEFORE WRITING ANYTHING

1. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`
2. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`
3. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-styles.css`

Do not rewrite any file from scratch. Targeted edits only.

---

## WHAT PASSED -- DO NOT TOUCH

These items confirmed working in round 2 QA. Do not change them:
- Loading state (no filler flash on hard refresh)
- Queue reload from Supabase on hard refresh (all pending messages reload)
- Roadmap strikethrough on completed items
- THE BOOK OF ONENESS all caps in nav
- Task checkoff (persists after refresh)
- Page navigation and active state persistence
- Task add (adds to list, persists)

---

## FIX 1: aria-hidden focus trap still firing on linePanel close

The aria-hidden warning is still appearing in the console for `button.x#lineClose` inside `aside.line-panel#linePanel`. The previous fix did not resolve it.

Search v2-app.js for the `closeLine()` function. Find where it sets aria-hidden on the linePanel. Before setting aria-hidden to true, move focus out of the panel explicitly:

```
linePanel.querySelector('#lineClose')?.blur();
document.body.focus();
linePanel.setAttribute('aria-hidden', 'true');
```

Or replace aria-hidden with the inert attribute entirely on the linePanel element. The inert attribute prevents focus without triggering the aria-hidden warning.

Apply the same pattern to `closeDrawer()` for the drawer panel if it has the same issue.

---

## FIX 2: Direct Line panel -- complete layout rework

The current panel layout is broken. The three structured launch buttons take up more than half the visible panel height. The message thread is crammed into a tiny scroll window. The panel opens showing the bottom of the thread (most recent message) instead of the top (queue summary).

Rework the panel layout as follows:

### Header (fixed, compact)
Keep: "The line is open" title, live indicator dot, close button.
This block should be no more than 60px tall.

### Structured launch buttons (collapsed by default)
The three buttons (Next step on roadmap, I have an issue, High-level strategy) should be collapsed behind a single small toggle labeled "QUICK ACTIONS" or similar. On click, the three buttons expand. On a second click, they collapse again. Default state: collapsed.

This frees up the space those buttons currently occupy permanently.

### Message thread (dominant, scrollable)
The message thread takes up all remaining space between the header and the input area. It should be the dominant element in the panel.

The thread scrolls. On open, scroll position should be at the BOTTOM (most recent message), which is the correct behavior for a chat interface. The user can scroll up to see older messages.

Remove the "IN THE QUEUE" summary block from inside the thread scroll area. The queue summary belongs in a separate fixed element (see below).

### Queue count badge (fixed, below header)
Add a small fixed bar below the header showing: "QUEUE: [N] pending" where N is the count of unprocessed direct_line_messages. This stays visible at all times without scrolling. It is not a scroll area -- it is a single line of text showing the count only.

### Input area (fixed, bottom)
Keep the text input and send button fixed at the bottom.

The context tag (Red Phone, Brain Dump, etc.) stays above the input, fixed.

### Critical: Red Phone prompt must NOT auto-populate on panel open

Currently the text input is pre-populated with the Red Phone prompt every time the panel opens. This is wrong. The input should be empty by default.

The Red Phone prompt should only populate the input when the user explicitly clicks the "Red Phone" structured launch button (or however the red phone action is triggered from the dashboard). Do not auto-fill the input on panel open under any other condition.

Find where the panel open logic sets the input value and remove any default pre-population. The input value should only be set when a structured launch button is clicked.

---

## FIX 3: Task horizon move button

This feature was not implemented in round 1. Add it now.

Each task row in the today list and the week list needs a small move button. The button label should be:
- On a today task: "Move to week"
- On a week task: "Move to today"

Style: small, muted, appears on hover over the task row. Do not show it constantly -- only on hover. Use a small text label or arrow icon.

On click:
1. PATCH the task in Supabase: `{"horizon": "week"}` or `{"horizon": "today"}`
2. Remove the task card from its current list
3. Append it to the other list immediately, without a full reload

The PATCH endpoint:
```
PATCH /rest/v1/tasks?id=eq.<task_id>
```

Use the same Supabase headers as the rest of the app.

---

## FIX 4: Bucket view -- replace static list with filtered task view

The buckets page under Brain Dump currently shows a static unclickable list of task titles grouped by bucket. This is not useful.

Replace it with the following:

The six bucket buttons at the top of the Brain Dump page (bodhi360, Harmonic, LDAG, The Book of Oneness, Family, Creative) already exist and show a count badge. Make each button clickable. On click, filter the task list below to show only tasks in that bucket. Clicking the same button again shows all tasks.

Below the bucket buttons, show the full task list in the same card style as the Today/Week lists. Each task shows its title, done state (checkbox), horizon tag (today or week), and the move-horizon button from Fix 3.

Tasks in the filtered bucket view include ALL tasks for that bucket regardless of horizon (today and week combined).

An "ALL" option should be available to reset the filter and show all tasks across all buckets.

The static grouped list that was added in round 1 can be removed -- replace it entirely with this filter approach.

---

## FIX 5: Task view filter and sort controls

On the main Home/Today page, add a small filter/sort control bar above the task columns. It should contain:

- A bucket filter dropdown: "All buckets" (default), then each canonical bucket name. Selecting a bucket hides tasks not in that bucket across both today and week columns.
- A sort toggle: "Oldest first" (default) / "Newest first". Clicking toggles the sort order of tasks in both columns.

Keep the controls compact. A single row of small controls above the column headers is sufficient.

---

## FIX 6: Bucket selector visual affordance

The bucket selector added to the task add row exists but is hard to discover. It looks like a plain pill with no indicator.

Add a small dropdown chevron icon (down arrow) to the right side of the bucket selector to make it clear it is clickable. Increase the height slightly so it matches the height of the text input next to it. The selector should look like a form control, not a decorative tag.

---

## DO NOT

- Do not rewrite any file from scratch
- Do not touch Supabase connection code, table names, or the Realtime subscription
- Do not add localStorage
- No em dashes in any string literals, comments, or UI copy
- Do not change the overall page layout or the sidebar navigation

---

## AFTER COMPLETING ALL FIXES

Confirm:
1. aria-hidden warning is gone from console on linePanel close
2. Direct Line panel: three buttons collapsed by default, message thread is dominant, input is empty on open
3. Red Phone prompt only pre-fills when Red Phone is explicitly triggered
4. Queue count badge shows below header (fixed, not in scroll area)
5. Task horizon move button appears on hover, works in both directions
6. Bucket buttons on Brain Dump page filter the task list below them
7. Filter and sort controls appear above the task columns on Home/Today
8. Bucket selector has a visible chevron/dropdown indicator

Do not deploy. Cowork handles QA and deployment after reviewing.

---

## VERSION NOTE

Command Center deployed version: v3 (2026-04-21).
These fixes address round 2 QA findings. Once confirmed, v3 is finalized or this becomes v4 depending on scope.
