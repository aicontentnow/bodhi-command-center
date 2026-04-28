# P9: State Persistence on Refresh
## Building: v4r13
## Builds on: v4r12 (P8 Polish QA passed 2026-04-27)
## File to modify: v2-app.js only

---

## Read first

Read this file completely before writing any code:

```
_command-center/v2-app.js
```

Do not read index.html or v2-styles.css. This change is JS only.

---

## What is already working -- do not touch

- `persistState(field, value, eventType)` function: works, do not change it
- `setPage()` persisting `active_page`: works, do not touch
- Energy state restore and persist: works, do not touch
- `active_view` restore and persist: works, do not touch
- `sbLive` flag: already guards all persistState calls during load, do not change the flag itself
- All P1-P4 logic (Focus mode, drag-to-reorder, done collapse, add task): do not touch
- Direct Line: do not touch
- All CSS and HTML: do not touch

---

## What P9 must add

Seven targeted additions to v2-app.js. No other changes.

---

### Change 1: Extend the portfolio_state SELECT

Find the line inside `initFromSupabase` that reads portfolio_state. It currently selects:

```
'energy_state, active_view, active_page, active_tab'
```

Change it to:

```
'energy_state, active_view, active_page, active_tab, sort_preference, bucket_filter'
```

---

### Change 2: Restore sort_preference on load

Inside the `if (!psErr && ps)` block in `initFromSupabase`, after the existing restores for energy_state, active_view, active_page, and active_tab, add:

```
if (ps.sort_preference) {
  taskFilter.sort = ps.sort_preference;
  if (taskSortToggle) {
    taskSortToggle.textContent = taskFilter.sort === 'oldest' ? 'Oldest first' : 'Newest first';
    taskSortToggle.dataset.sort = taskFilter.sort;
    taskSortToggle.classList.toggle('is-sort-active', taskFilter.sort === 'newest');
  }
}
```

---

### Change 3: Restore bucket_filter on load

In the same `if (!psErr && ps)` block, directly after the sort_preference restore block from Change 2, add:

```
bucketFilter = (ps.bucket_filter !== undefined) ? ps.bucket_filter : null;
document.querySelectorAll('.bucket').forEach(x => x.classList.remove('is-active'));
if (bucketFilter && bucketFilter !== 'ALL') {
  const tile = document.querySelector(`.bucket[data-bucket="${bucketFilter}"]`);
  if (tile) tile.classList.add('is-active');
}
syncAllBtn();
```

Note: use `!== undefined` not a falsy check. `bucketFilter = null` is valid state (empty canvas).

---

### Change 4: Render buckets page on load if filter is active

In `initFromSupabase`, find the section where tasks finish loading and `renderList` and `renderCounts` are called. After those calls and before `setLineStatus(true)`, add:

```
if (bucketFilter !== null) renderBucketsPage();
```

This ensures that if the user was on the buckets page with a filter active, the filtered view renders correctly after tasks load.

---

### Change 5: Persist sort preference on toggle

Find the `taskSortToggle` click event listener. It currently updates `taskFilter.sort`, updates the button text and classes, and calls `renderList`. After the two `renderList` calls, add:

```
if (sbLive) persistState('sort_preference', taskFilter.sort, 'sort_changed');
```

---

### Change 6: Persist active_tab on tab change

Find the `setTab(name)` function. After the existing logic that toggles `.is-on` classes and sets `hidden`, add:

```
if (sbLive) persistState('active_tab', name, 'tab_changed');
```

---

### Change 7: Persist bucket_filter on bucket tile and All button clicks

Find the bucket tile click handler (inside `document.querySelectorAll('.bucket').forEach`). After `syncAllBtn()` and `renderBucketsPage()`, add:

```
if (sbLive) persistState('bucket_filter', bucketFilter, 'bucket_filter_changed');
```

Find the `bfAllBtn` click handler. After `syncAllBtn()` and `renderBucketsPage()`, add the same line:

```
if (sbLive) persistState('bucket_filter', bucketFilter, 'bucket_filter_changed');
```

---

## Deploy

After all 7 changes are made and verified:

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "deploy: P9 state persistence $(date +%Y-%m-%d-%H%M)" && git push origin main
```
