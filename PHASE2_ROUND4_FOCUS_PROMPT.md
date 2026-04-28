# Command Center Phase 2 Round 4: Focus Mode Final Fixes
## Building: v4 round 4
## Builds on: round 3 deploy
## Round 3 QA: modal opens pass, overlay pass, Escape key pass. Two fails below.

---

## DO NOT TOUCH

The Focus modal dark overlay, Escape key exit, Exit Focus button, and task selection flow (amber ring, Start Focus button) all work correctly. Do not touch them.

Do not touch drag-to-reorder, done tasks collapse, or any other feature.
No em dashes anywhere.

---

## TWO FIXES ONLY

### Fix 1: Focus button must move INSIDE the tabs container

In `index.html`, the `.focus-pill-btn` is currently a sibling of the `.tabs` div inside `.tabs-row`. The `tabs-row` uses `justify-content: space-between`, which pushes it to the right. The fix is to move it inside the `.tabs` div so it sits flush next to Today and This Week.

**Current structure (wrong):**
```
<div class="tabs" role="tablist">
  <button class="tab is-on" data-tab="today">Today ...</button>
  <button class="tab" data-tab="week">This week ...</button>
</div>
<button type="button" class="focus-pill-btn" id="focusModeToggle">Focus</button>
```

**Required structure (correct):**
```
<div class="tabs" role="tablist">
  <button class="tab is-on" data-tab="today">Today ...</button>
  <button class="tab" data-tab="week">This week ...</button>
  <button type="button" class="focus-pill-btn" id="focusModeToggle">Focus</button>
</div>
```

Move the `focus-pill-btn` button to be the third child inside the `.tabs` div. Remove it from its current position after the closing `</div>` of `.tabs`.

Also update the CSS for `.focus-pill-btn` to remove `flex-shrink: 0` if present and ensure it works as an inline sibling of the tab buttons. The tabs div already has `display: flex; gap: 0.3rem; padding: 0.3rem; border-radius: 999px;` so the pill will naturally sit next to the tabs.

### Fix 2: Modal checkboxes must reliably check off tasks

The current implementation stores task IDs in `focusSelectedIds` (an array of id strings) and then looks up tasks at modal-open time using `allTasks.find(t => t.id === id)`. If task objects have been reloaded from Supabase between selection and modal open, the lookup can fail silently.

**The fix: store full task objects at selection time.**

In `v2-app.js`:

1. Replace the `focusSelectedIds` array with `focusSelectedTasks` array that stores full task objects.

2. Where tasks are added to selection (the click handler that adds to `focusSelectedIds`), change it to push the full task object instead:
```
focusSelectedTasks.push(task);  // store the object, not just id
```

3. Where tasks are removed from selection, filter by task id:
```
focusSelectedTasks = focusSelectedTasks.filter(t => t.id !== task.id);
```

4. Where selection is checked (`focusSelectedIds.includes(id)`), change to:
```
focusSelectedTasks.some(t => t.id === id)
```

5. In `openFocusModal()`, iterate over `focusSelectedTasks` directly instead of mapping IDs to lookups:
```
focusSelectedTasks.forEach(it => {
  const which = state.today.find(t => t.id === it.id) ? 'today' : 'week';
  const row = document.createElement('div');
  row.className = 'focus-modal-task' + (it.done ? ' done' : '');
  const boxEl = document.createElement('div');
  boxEl.className = 'box';
  boxEl.style.cursor = 'pointer';
  boxEl.addEventListener('click', async () => {
    it.done = !it.done;
    row.classList.toggle('done', it.done);
    renderList(which);
    renderCounts();
    const { error } = await sb.from('tasks').update({ done: it.done, updated_at: new Date().toISOString() }).eq('id', it.id);
    if (error) {
      toastErr('Save failed');
      it.done = !it.done;
      row.classList.toggle('done', it.done);
      renderList(which);
      renderCounts();
    }
  });
  const lblEl = document.createElement('div');
  lblEl.className = 'focus-modal-lbl';
  lblEl.textContent = it.label || it.title || '';
  const metaEl = document.createElement('div');
  metaEl.className = 'focus-modal-meta';
  metaEl.textContent = it.meta || it.bucket || '';
  row.appendChild(boxEl);
  row.appendChild(lblEl);
  row.appendChild(metaEl);
  tasksEl.appendChild(row);
});
```

6. Where `focusSelectedIds` is reset (on exit or cancel), reset `focusSelectedTasks` to `[]` instead.

7. Anywhere `focusSelectedIds.length` is used for count/disable logic, change to `focusSelectedTasks.length`.

Make sure to declare `let focusSelectedTasks = [];` at the top where `focusSelectedIds` was declared.

---

## FILES TO READ FIRST

- `_command-center/v2-app.js` (find focusSelectedIds, openFocusModal, and the selection click handler)
- `_command-center/index.html` (find the tabs-row section with focus-pill-btn)

---

## DEPLOY

After making changes, deploy with explicit file staging:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "v4r4: focus button inside tabs, modal checkboxes via stored objects" && git push origin main
```

Report back confirming the push succeeded.
