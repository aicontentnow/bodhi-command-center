# Command Center Phase 2 Bundle: P1 Focus Mode, P2 Drag-to-Reorder, P4 Done Collapse
## Version: v3 Phase 2 (builds on v3 round 4, QA confirmed 2026-04-21)
## For: Claude Code

---

## READ THESE FILES FIRST BEFORE WRITING ANYTHING

1. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`
2. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`
3. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-styles.css`

Targeted edits only. Do not rewrite any file from scratch.
Do not touch the Supabase connection, table names, or Realtime subscriptions.
No em dashes in any string literal, comment, or UI text.
No localStorage.

---

## OVERVIEW

Three features bundled into one build phase.

**P1 Focus mode:** A filter toggle that shows only tasks flagged as focus. Focus is toggled per task from the task drawer. Session-local only -- the `tasks` table has no `focus` column, so no Supabase write is needed for the flag itself.

**P2 Drag-to-reorder:** Drag `.item` rows to reorder tasks within the Today or Week list. Persists `sort_order` to Supabase after drop. Cross-list drags are ignored.

**P4 Done tasks collapse:** Done tasks move to a collapsible "Completed (N)" section at the bottom of each list. Collapsed by default. Click the toggle to expand or collapse.

---

## IMPORTANT: SHARED ROW BUILDER

Before implementing anything, extract the row-building code in `renderList(which)` into a `buildRow(it)` inner function at the top of the function body. The existing code currently builds a row inline inside a single `items.forEach`. P4 requires rendering done rows in a separate section, and P2 requires drag wiring on every row including done ones. Both features call `buildRow(it)` from their respective loops. Do this extraction first, then implement P1, P2, P4 in order.

The extraction must be exact -- no logic changes, just wrapped in a named inner function that returns the row element.

---

## P1: FOCUS MODE

### index.html changes

**1. Focus mode toggle button in task controls.**

Find `#taskControls`. It currently contains `#taskBucketFilter` and `#taskSortToggle`. Add one new button after the sort toggle:

```
<button type="button" class="ctrl-btn" id="focusModeToggle">Focus</button>
```

**2. Focus toggle in task drawer.**

Find the drawer (`#drawer`). There is already a bucket selector row (the div containing `#drawerBucketSel`). Add an identical-layout row immediately after it for the focus toggle:

```
<div style="position:relative; z-index:2; display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
  <span class="section-label" style="margin:0;">Focus</span>
  <button type="button" class="ctrl-btn" id="drawerFocusToggle" style="height:30px; font-size:0.62rem;">off</button>
</div>
```

### v2-app.js changes

**1. Module-level state.**

Near `let taskFilter = { bucket: 'all', sort: 'oldest' };`, add:

```
let focusMode = false;
```

**2. Focus mode toggle handler.**

After the `taskSortToggle` event listener block, add:

```
const focusModeToggle = document.getElementById('focusModeToggle');
focusModeToggle.addEventListener('click', () => {
  focusMode = !focusMode;
  focusModeToggle.classList.toggle('is-active', focusMode);
  focusModeToggle.textContent = focusMode ? 'Focus on' : 'Focus';
  renderList('today');
  renderList('week');
});
```

**3. Focus filter in `renderList(which)`.**

In `renderList(which)`, apply the focus filter immediately before the existing bucket filter check. Find the comment or line that starts `if (taskFilter.bucket !== 'all')` and add above it:

```
if (focusMode) {
  items = items.filter(it => it.focus === true);
}
```

**4. Populate drawer focus toggle in `openDrawer()`.**

In `openDrawer(which, id)`, after the block that populates `drawerBucketSel`, add:

```
const drawerFocusToggle = document.getElementById('drawerFocusToggle');
if (drawerFocusToggle) {
  drawerFocusToggle.textContent = it.focus ? 'on' : 'off';
  drawerFocusToggle.classList.toggle('is-active', !!it.focus);
}
```

**5. Drawer focus toggle handler.**

After the `drawerBucketSel` change handler block (the `if (drawerBucketSel) { ... }` block), add:

```
const drawerFocusToggle = document.getElementById('drawerFocusToggle');
if (drawerFocusToggle) {
  drawerFocusToggle.addEventListener('click', () => {
    if (!drawerCtx) return;
    const it = findItem(drawerCtx.which, drawerCtx.id);
    if (!it) return;
    it.focus = !it.focus;
    drawerFocusToggle.textContent = it.focus ? 'on' : 'off';
    drawerFocusToggle.classList.toggle('is-active', it.focus);
    renderList(drawerCtx.which);
  });
}
```

### v2-styles.css changes

Add an active state for `.ctrl-btn`. Add after `.ctrl-btn:hover { ... }`:

```
.ctrl-btn.is-active {
  color: var(--cyan);
  box-shadow: inset 0 0 0 1px hsla(var(--cyan-h), 90%, 65%, 0.35);
  background: hsla(var(--cyan-h), 90%, 62%, 0.08);
}
```

---

## P2: DRAG-TO-REORDER

### v2-app.js changes

**1. Fix initial task sort order.**

In `initFromSupabase()`, the Supabase tasks query currently ends with `.order('created_at', { ascending: true })`. Change it to order by `sort_order` first, then `created_at` as a tiebreaker:

```
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
```

**2. Drag wiring inside `buildRow(it)`.**

Inside the `buildRow(it)` inner function (extracted in the shared row builder step above), after building the row and wiring all existing click handlers but before the return statement, add the drag event wiring:

```
    row.draggable = true;
    row.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ id: it.id, which }));
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => row.classList.add('is-dragging'), 0);
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('is-dragging');
      document.querySelectorAll('.item.drag-over').forEach(r => r.classList.remove('drag-over'));
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('.item.drag-over').forEach(r => r.classList.remove('drag-over'));
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });
    row.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      row.classList.remove('drag-over');
      let src;
      try { src = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
      if (!src || src.which !== which || src.id === it.id) return;
      const srcIdx = state[which].findIndex(t => t.id === src.id);
      const dstIdx = state[which].findIndex(t => t.id === it.id);
      if (srcIdx === -1 || dstIdx === -1) return;
      const [moved] = state[which].splice(srcIdx, 1);
      state[which].splice(dstIdx, 0, moved);
      renderList(which);
      const patches = state[which].map((t, i) =>
        sb.from('tasks').update({ sort_order: i }).eq('id', t.id)
      );
      try { await Promise.all(patches); } catch { toastErr('Reorder save failed'); }
    });
```

### v2-styles.css changes

Add drag states for `.item`. Add after `.item:hover { color: var(--t-1); }`:

```
.item[draggable="true"] { cursor: grab; }
.item.is-dragging { opacity: 0.35; cursor: grabbing; }
.item.drag-over {
  box-shadow: 0 -2px 0 0 var(--cyan);
}
```

---

## P4: DONE TASKS COLLAPSE

### v2-app.js changes

**1. Module-level state.**

Near `let focusMode = false;`, add:

```
let completedOpen = { today: false, week: false };
```

**2. Restructure the render loop in `renderList(which)`.**

After applying all filters (focus, bucket, sort), split the visible items into active and done. Replace the current single `items.forEach` loop with the following structure:

```
    const activeItems = items.filter(i => !i.done);
    const doneItems   = items.filter(i =>  i.done);

    activeItems.forEach(it => root.appendChild(buildRow(it)));

    if (doneItems.length > 0) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'completed-toggle';
      const chevron = document.createElement('span');
      chevron.className = 'completed-toggle-chevron';
      chevron.textContent = completedOpen[which] ? '▴' : '▾';
      toggleBtn.appendChild(document.createTextNode(`Completed (${doneItems.length})`));
      toggleBtn.appendChild(chevron);
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        completedOpen[which] = !completedOpen[which];
        renderList(which);
      });
      root.appendChild(toggleBtn);

      const doneSection = document.createElement('div');
      doneSection.className = 'completed-section' + (completedOpen[which] ? ' is-open' : '');
      doneItems.forEach(it => doneSection.appendChild(buildRow(it)));
      root.appendChild(doneSection);
    }
```

### v2-styles.css changes

Add completed section styles. Add immediately after `.item.is-focus .meta-m { color: var(--cyan); }`:

```
/* P4: done tasks collapse */
.completed-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.5rem 0.25rem 0.35rem;
  border: none;
  background: none;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.55rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--t-4);
  cursor: pointer;
  margin-top: 0.25rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.completed-toggle:hover { color: var(--t-3); }
.completed-toggle-chevron { margin-left: auto; font-size: 0.5rem; opacity: 0.7; }
.completed-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.28s ease;
}
.completed-section.is-open { max-height: 2000px; }
```

---

## WHAT NOT TO DO

- Do not rewrite any file from scratch
- Do not touch Supabase connection code, table names, or Realtime subscriptions
- Do not add localStorage
- Do not break anything that passed QA in rounds 1 through 4
- No em dashes in any string, comment, or UI text
- Do not add a `focus` column write to Supabase -- focus is session-local only, the tasks table has no such column

---

## DEPLOY WHEN DONE

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add -A && git commit -m "deploy: Phase 2 bundle P1 focus P2 drag P4 done-collapse $(date +%Y-%m-%d-%H%M)" && git push origin main
```

---

## QA CHECKLIST

Work through these interactively with Bodhi. Present each step and wait for a pass or fail before moving on.

**P1 Focus mode**

1. Open a task drawer. Click the Focus toggle. It should switch from "off" to "on" and highlight cyan. Close the drawer. The task's bucket tag label should now appear in cyan in the list.
2. Click the "Focus" button in the task controls row. It should go active (cyan border). Task lists filter to show only focused tasks. All others disappear.
3. Click Focus again. Full list restores.

**P2 Drag-to-reorder**

4. On the Today tab, drag a task row to a new position in the list. It should slot into the new position on drop.
5. After the drop, check the Supabase `tasks` table directly. The `sort_order` values for the reordered tasks should reflect the new positions.
6. Attempt to drag a Today task into the Week list. Nothing should happen.

**P4 Done tasks collapse**

7. Check off a task. It should immediately disappear from the active list and a "Completed (1)" toggle should appear at the bottom, collapsed.
8. Click "Completed (1)". The done task should expand into view below the toggle.
9. Click again. It collapses.
10. Check off a second task. The toggle should now read "Completed (2)".
