# Command Center Phase 2 Round 2: Focus Mode Rebuild
## Building: v4 (P1 Focus mode, full rebuild)
## Builds on: v3 (P2 drag-to-reorder and P4 done tasks collapse QA passed)
## Previous QA: P2 and P4 passed. P1 (Focus mode) failed -- wrong interaction model. Full rebuild required.

---

## DO NOT TOUCH

P2 drag-to-reorder and P4 done tasks collapse are confirmed working. Do not modify any code related to those features.

Do not touch Supabase connections, table names, or JS logic unrelated to Focus mode.
No em dashes anywhere.

---

## WHAT TO BUILD: Focus mode

Focus mode is a full-screen modal overlay. It blocks out the entire dashboard -- sidebar, nav, task lists, everything. The only things visible are the 3 chosen tasks and a button to exit.

### The interaction flow

**Step 1: Entry**
There is a Focus button in the task controls bar near the Today / This Week tabs. It should be visually distinct -- amber or yellow, not blue. Label: "Focus".

Clicking Focus does NOT hide the task list. It enters selection mode.

**Step 2: Selection mode**
The task list stays visible. A selection prompt appears at the top: "Tap up to 3 tasks to focus on."

Each task row gets a tap target. Tapping a task highlights it with an amber ring. Tapping again deselects it. Max 3 selected at once. If 3 are already selected and the user taps a 4th, nothing happens (or show a brief shake/reject animation).

A "Start Focus" button appears once at least 1 task is selected. It is disabled (greyed) until at least 1 task is tapped.

**Step 3: The Focus modal**
Clicking "Start Focus" triggers a full-screen modal overlay:

- Background: dark, semi-opaque (rgba 0,0,0, 0.92) covering the entire viewport including sidebar and nav
- The modal itself: centered, no scrolling, contains only the 3 selected tasks
- Each task is rendered large and readable -- task title, bucket tag, nothing else
- A checkbox on each task. Checking it does not exit Focus mode; it just marks done (same Supabase PATCH as normal checkoff)
- An "Exit Focus" button at the bottom. Clicking it closes the modal and returns to normal view with no state change to the task list
- No other UI. No nav. No sidebar. No distractions.

**Step 4: Exit**
Clicking "Exit Focus" closes the modal. The task list returns to normal. No tasks are moved or reordered by Focus mode.

---

## VISUAL SPEC

- Focus button: amber / yellow (#F59E0B or similar), not blue
- Selection mode highlight ring: amber, 2px solid
- Modal background: rgba(0,0,0,0.92), full viewport including sidebar
- Modal card: dark glass, centered, max-width 480px, padding 32px
- Task rows in modal: larger font (1.1rem title), generous padding, readable at a glance
- Exit Focus button: subtle, white outline style, bottom of modal
- "Start Focus" button in selection mode: amber, same color as the Focus button

---

## REMOVE

Delete or completely replace the current Focus mode implementation. It hides tasks when clicked, which is the opposite of what is needed. Start fresh on this feature only.

---

## FILES TO READ FIRST

- `_command-center/v2-app.js` (find the current Focus mode implementation)
- `_command-center/v2-styles.css` (find any existing Focus-related CSS)
- `_command-center/index.html` (find the Focus button and any Focus-related HTML)

---

## DEPLOY

After making changes, deploy with:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add -A && git commit -m "v4: focus mode rebuild as full-screen modal" && git push origin main
```

Wait for the push to confirm before reporting done. If you see a worktree submodule warning, run:

```
git rm --cached .claude 2>/dev/null; echo ".claude/" >> .gitignore; git add .gitignore && git commit -m "fix: remove .claude from tracking" && git push origin main
```

Report back with confirmation that the push succeeded and a summary of what changed.
