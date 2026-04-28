# Command Center: Phase 3 Round 3
## Version: v4r8 (builds on v4r7, SHA 61b37ec)
## Fixes: date label layout breaking move button

---

## Read these files first

Read all three in full before writing any code:

- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`
- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`
- `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-styles.css`

---

## What passed QA on v4r7 -- DO NOT TOUCH

- "+" button is top left of each column header
- Modal opens, title auto-focused, bucket defaults to bodhi360
- Empty title validation works
- Save: modal closes, task appears at top of list, toast "Task added"
- This Week "+" correctly adds to week horizon
- Escape key closes modal
- All previously confirmed features: Focus mode, drag-to-reorder, done tasks collapse, bridge agent

---

## Fix: date label is crowding the row and breaking the move button

The current task row has too many elements on one line. The timestamp is overflowing the move-to-week/move-to-today pill button (text spills out of it).

### Two changes required

**1. Show date only, not time**

Change the `formatTaskTs` function to return date only. Format: `Apr 26` (no year, no time). Use `Intl.DateTimeFormat` with timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric'. Remove the time portion entirely.

**2. Move the date label to a second line under the task title**

Do not keep the date on the same row as the bucket label and move button. Instead, render it as a second line directly under the task title text. Style it as small, muted text (opacity ~0.5, font-size smaller than the title). It should read as supplementary info, not a primary element.

The action row (bucket pill + move button + drag handle + checkbox) stays on its own line with full room to breathe. The move button must never overflow its pill -- make sure it has enough padding and white-space: nowrap so its text always fits.

---

## Deploy

After all changes are written and saved:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r8: P3r3 date only, second line layout" && git push origin main
```

Confirm the push succeeded before reporting done.
