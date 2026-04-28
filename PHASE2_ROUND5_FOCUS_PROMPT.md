# Command Center Phase 2 Round 5: Focus Button Position and Color
## Building: v4 round 5
## Builds on: round 3 deploy (checkboxes pass, Escape pass, selection pass)
## Round 3/4 QA: modal checkboxes pass, Escape key pass, task selection pass. One fail below.

---

## DO NOT TOUCH

Everything else in Focus mode works correctly: selection mode, amber ring on selected tasks, Start Focus button, full-screen modal, task checkboxes with Supabase PATCH, Escape key exit, Exit Focus button. Do not touch any of it.

Do not touch drag-to-reorder, done tasks collapse, or any other feature.
No em dashes anywhere.

---

## ONE FIX ONLY

### Focus button: move inside tabs container, soften color

**Problem 1: Position**

The `.focus-pill-btn` is currently a sibling of the `.tabs` div inside `.tabs-row`. With `justify-content: space-between` on `.tabs-row`, it ends up in the middle of the row instead of flush next to Today and This Week.

Fix: move the button INSIDE the `.tabs` div in `index.html`.

Current structure in `index.html`:
```
<div class="tabs" role="tablist">
  <button class="tab is-on" data-tab="today">Today ...</button>
  <button class="tab" data-tab="week">This week ...</button>
</div>
<button type="button" class="focus-pill-btn" id="focusModeToggle">Focus</button>
```

Required structure:
```
<div class="tabs" role="tablist">
  <button class="tab is-on" data-tab="today">Today ...</button>
  <button class="tab" data-tab="week">This week ...</button>
  <button type="button" class="focus-pill-btn" id="focusModeToggle">Focus</button>
</div>
```

Move the `focus-pill-btn` to be the third child inside `.tabs`. Remove it from its current position outside the `.tabs` closing tag.

**Problem 2: Color too bright**

The amber fill is too intense at full saturation. In `v2-styles.css`, change the `.focus-pill-btn` background from solid `#F59E0B` to a slightly muted version:

```
background: rgba(245, 158, 11, 0.82);
```

And update the hover state to match:
```
.focus-pill-btn:hover { background: rgba(245, 158, 11, 0.95); }
```

---

## FILES TO READ FIRST

- `_command-center/index.html` (find the tabs-row section, move the button)
- `_command-center/v2-styles.css` (find .focus-pill-btn background color)

---

## DEPLOY

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r5: focus button inside tabs container, soften amber color" && git push origin main
```

Report back confirming the push succeeded.
