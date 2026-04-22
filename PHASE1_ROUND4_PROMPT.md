# Command Center v3: Phase 1 Round 4 Fixes
## For: Claude Code
## Phase: Phase 1 QA Round 4 -- remaining failures after round 3, plus new findings
## Version: v3 (round 3 deployed 2026-04-21, this addresses round 4 QA findings)

---

## READ THESE FILES FIRST BEFORE WRITING ANYTHING

1. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`
2. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`
3. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-styles.css`

Targeted edits only. Do not rewrite any file from scratch.
Deploy when complete.

---

## WHAT PASSED IN ROUND 3 -- DO NOT TOUCH

- Brain Dump page restored
- Filter/sort controls inline with Today/Week tabs
- Move button shows as readable pill on hover
- Quick Actions collapse (no gaps, no peek-a-boo)
- Direct Line thread scrolls to bottom on open
- Red Phone textarea scrolls to top on open
- Bucket change in task drawer (PATCHes Supabase, tag updates in place)
- Buckets page exists with 9 tiles and count badges
- Initial bucket filter (tap once) works correctly

---

## FIX 1: Bucket filter toggle -- return to grouped view on second tap

On the Buckets page, tapping a tile once filters the task list to that bucket. Tapping the same tile again currently shows a flat list of all tasks instead of returning to the default grouped view.

Fix the toggle logic:

- Default state: tasks grouped by bucket (each bucket is a section header with its tasks below)
- Tap a tile: filter to show only that bucket's tasks (flat list for that bucket)
- Tap the same active tile again: return to the default grouped view (clear the filter)
- All button: always returns to the default grouped view

There should never be a flat ungrouped "show all" state. The only states are: one bucket filtered, or all buckets grouped. The All button and the second-tap behavior should both resolve to the grouped default view.

---

## FIX 2: Only one panel open at a time

If the Direct Line panel is open and the user clicks a task row (which opens the task drawer), the drawer currently opens behind the Direct Line panel, invisible and inaccessible.

Fix: any action that opens a panel must first close any currently open panel.

- If the Direct Line panel is open and a task is clicked: close the Direct Line panel, then open the task drawer.
- If the task drawer is open and the Direct Line is triggered: close the task drawer, then open the Direct Line panel.
- Apply the same rule to the navigation drawer if it has the same issue.

Only one panel can be open at any time.

---

## FIX 3: Move button arrow direction

The task move pill button currently shows "week" or "today" as text only. Add a directional arrow to clarify which direction the task is moving:

- On a TODAY tab task: button reads `week >` (arrow pointing right)
- On a WEEK tab task: button reads `< today` (arrow pointing left)

The arrow makes the direction of movement immediately clear without needing to think about it. Keep the same hover-only visibility and pill styling from round 3.

---

## FIX 4: Hotkey O to open Direct Line

Add a keyboard shortcut: pressing O (when not focused on a text input) opens the Direct Line panel. If the Direct Line is already open, pressing O closes it.

Follow the same pattern as the existing single-letter hotkeys (H for home, B for brain dump, etc.). Add O to the hotkey handler in v2-app.js. Add O as the shortcut label next to the Direct Line nav item or header button if there is a visible hotkey reference.

---

## DO NOT

- Do not rewrite any file from scratch
- Do not touch Supabase connection code, table names, or the Realtime subscription
- Do not add localStorage
- No em dashes in any string literals, comments, or UI copy
- Do not break anything that passed QA in rounds 1, 2, or 3

---

## AFTER COMPLETING ALL FIXES

Confirm each item is in place, then deploy to GitHub Pages:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add -A && git commit -m "deploy: v3 round4 fixes $(date +%Y-%m-%d-%H%M)" && git push origin main
```

Checklist:
1. Buckets page second-tap returns to grouped view, not flat all-tasks list
2. Opening any panel closes any other open panel first
3. Move button shows `week >` on today tasks and `< today` on week tasks
4. Pressing O opens/closes the Direct Line panel from anywhere

---

## VERSION NOTE

Command Center deployed version: v3 round 3 (2026-04-21).
Round 4 fixes complete Phase 1 QA. Once all items pass, v3 is final and Phase 2 begins.
