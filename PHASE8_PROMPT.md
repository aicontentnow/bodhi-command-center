# Command Center P8 Polish -- Claude Code Prompt
## Building: v4r9
## Builds on: v4r8 (P3 QA passed 2026-04-26, SHA a57c2ba)
## Supabase project: gcbvvausrmbbkfazojpl (Bodhi360 org)

---

## Read these files first (in this order)

1. `_command-center/v2-app.js` -- all JS logic
2. `_command-center/v2-styles.css` -- all CSS
3. `_command-center/index.html` -- HTML structure

Do not read any other files. Do not modify anything not listed in the fixes below.

---

## What is confirmed working -- DO NOT TOUCH

- P1 Focus mode: amber pill button, selection mode, full-screen modal, checkboxes PATCH done:true to Supabase, Exit Focus and Escape close
- P2 Drag-to-reorder: tasks drag within Today and This Week, persists sort_order to Supabase
- P3 Add task button: "+" pinned top left of Today and This Week columns, compact modal with title auto-focus, bucket selector, empty title validation (shake + inline error), Save POSTs to Supabase, task appears at top immediately, toast "Task added", Escape closes
- P4 Done tasks collapse: completed tasks collapse under a toggle
- All Supabase reads and writes (tasks, direct_line_messages, direct_line_responses)
- Realtime subscription on direct_line_responses INSERT
- Date label on task tiles (second line under title, format "Apr 26")
- Move button pill overflow fix
- Done task strikethrough

---

## Fixes to build in P8

### Fix 1: Date sort inverted + add active sort indicator

Find the sort control (buttons or toggle for "newest first" / "oldest first" or similar labels in the Today and This Week columns).

Two problems to fix:

Problem A -- The sort logic is inverted. When "newest first" is active, tasks are actually sorting oldest first. Fix the sort so that "newest first" sorts by `created_at` descending (largest timestamp at top) and "oldest first" sorts by `created_at` ascending.

Problem B -- There is no visual indicator showing which sort is currently active. Add an `active` or `sort-active` CSS class to whichever sort button or option is currently selected. Style it with a visible highlight (use the existing amber or accent color already in the design -- do not introduce a new color). The active state must update when the user switches sort order.

### Fix 2: Bucket tile stays highlighted after filter is cleared

Find the bucket filter tiles (the row of bucket name buttons used to filter the task list by bucket).

When the user clears the bucket filter (either by clicking "All" or by clicking the already-selected tile to deselect it), the tile keeps its active/selected CSS class visually. Fix this so that when no bucket filter is active, no tile shows as selected.

Steps:
- Find the function that handles clearing the bucket filter
- Ensure that function removes the active/selected class from all bucket tiles
- The active class should only be present on a tile when that bucket filter is actually applied

### Fix 3: O hotkey captured by Direct Line text input

Find the keydown handler for the O key (which opens or toggles the Direct Line panel or orbit view).

Add an input guard at the top of that handler:

```
if (
  document.activeElement.tagName === 'INPUT' ||
  document.activeElement.tagName === 'TEXTAREA' ||
  document.activeElement.isContentEditable
) return;
```

This must be the first check in the handler before any other logic runs. When the user is typing in the Direct Line input or any other text field, O must pass through as a normal character and not trigger the hotkey action.

### Fix 4: Hotkey N or T to open the add-task modal

Add a new keydown listener for both N and T (case-insensitive, so both uppercase and lowercase must work).

Rules for this handler:
- Apply the same input guard as Fix 3 first -- if any INPUT, TEXTAREA, or contentEditable element has focus, return immediately and do not open the modal
- When the keypress is valid (no input focused), open the add-task modal for the Today column
- The modal that opens must be the same modal used by the Today "+" button -- do not create a new modal
- If the add-task modal is already open, pressing N or T again should do nothing (do not toggle it closed)
- This handler must not interfere with any existing hotkey

---

## Acceptance criteria

After your changes:
1. Clicking "newest first" sort shows the most recently created task at the top. The "newest first" button or control has a visible active style. Clicking "oldest first" reverses this and the active style moves to that control.
2. Selecting a bucket tile filters correctly. Clicking "All" or deselecting the tile removes the highlight from the tile. No tile appears selected when no filter is active.
3. Opening the Direct Line panel and typing a message that contains the letter O does not trigger the O hotkey action.
4. Pressing N or T (not inside any text field) opens the add-task modal focused on the title input.
5. Pressing N or T while typing in any input or textarea does nothing except type the character.
6. All P1-P4 behavior listed above remains unchanged.

---

## After all fixes are complete, deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r9: P8 polish -- sort fix, bucket deselect, hotkey guard, N/T modal shortcut" && git push origin main
```

When deploy is done, paste the git output and the final SHA so QA can begin.
