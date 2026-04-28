# Command Center Phase 2 Round 3: Focus Mode Fixes
## Building: v4 round 3
## Builds on: round 2 deploy (modal works, selection works, overlay works)
## Round 2 QA: amber color pass, modal opens pass, task selection pass, exit pass. Three fails below.

---

## DO NOT TOUCH

The Focus modal logic, dark overlay, task selection (amber ring), Start Focus button, and Exit Focus all work correctly. Do not touch them.

Do not touch drag-to-reorder, done tasks collapse, or any other feature.
No em dashes anywhere.

---

## THREE FIXES ONLY

### Fix 1: Focus button position and size

Move the Focus button so it sits directly next to the Today and This Week tab toggles, not on the far right of the controls bar. It should feel like a third tab option, not a utility control.

Make it pill-shaped. Larger than it currently is. It should be visually prominent and easy to tap. Amber/yellow fill (#F59E0B), dark text, rounded pill shape (border-radius 999px), padding at least 8px 20px.

### Fix 2: Checkboxes inside the Focus modal

Tasks displayed inside the Focus modal must have working checkboxes. Checking a task inside the modal should PATCH `done: true` to Supabase (same logic as the normal task checkoff in the main list). The task should show a visual strikethrough when checked. Checking a task inside Focus modal does NOT close the modal.

### Fix 3: Exit Focus should also work via Escape key

Pressing Escape while the Focus modal is open should close it, same as clicking Exit Focus.

---

## FILES TO READ FIRST

- `_command-center/v2-app.js` (find the Focus mode implementation from round 2)
- `_command-center/v2-styles.css` (find Focus button and modal styles)
- `_command-center/index.html` (find the Focus button markup)

---

## DEPLOY

After making changes, deploy with explicit file staging (not git add -A):

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r3: focus button position, modal checkboxes, escape key" && git push origin main
```

Report back confirming the push succeeded.
