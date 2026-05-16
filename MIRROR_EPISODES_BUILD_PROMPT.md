# MIRROR Episodes Feature -- Claude Code Build Prompt
## Version: Building v5 on v4r19 QA-confirmed baseline
## Target files: _command-center/index.html + _command-center/v2-app.js
## DO NOT touch: v2-styles.css Supabase connection logic task tables Direct Line logic

---

You are adding a MIRRØR Episodes feature to an existing Command Center dashboard.
Read the existing files before writing anything. Restyle and extend only -- do not rebuild.
No em dashes anywhere in code or comments.
No localStorage anywhere. All state is Supabase or in-memory per session.

---

## WHAT TO BUILD

Two additions:

**1. A "Next Episode" widget on the home/today page.**
Fetches the episode anchor with the lowest `number` where `status = 'pending'` from the `mirror_episode_anchors` table.
Displays: episode number, title, cluster.
Clicking the widget navigates to the mirror-episodes tab (same page-switching logic used by existing navitems).

**2. A full MIRRØR Episodes tab.**
Shows all 59 episode anchors from Supabase.
Three filter tabs: All / Pending / Recorded.
Default view: Pending.
Each card shows title + cluster by default.
Clicking a card expands it to reveal: door_in, charge, threads, and a "Mark Recorded" button.
Mark Recorded: PATCH `status` to `'recorded'` and `recorded_at` to `now()` for that row. Remove it from the pending view immediately without full reload.
Episodes can be marked recorded in any order -- no sequential constraint.
The nav badge shows the current pending count.

---

## EXISTING CODEBASE FACTS (read these before touching anything)

**Supabase client** is already initialized at top of v2-app.js:
```
const SUPABASE_URL = 'https://gcbvvausrmbbkfazojpl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```
Use `sb` directly. Do not create a second client.

**Supabase table:** `mirror_episode_anchors`
Columns: id (uuid), number (integer, sort key), title (text), cluster (text), door_in (text), charge (text), threads (text), status (text: 'pending' | 'recorded'), created_at (timestamptz), recorded_at (timestamptz nullable)

**Page switching pattern** (from existing code):
```
document.querySelectorAll('.navitem').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('is-on'));
    document.querySelectorAll('.navitem').forEach(n => n.classList.remove('is-on'));
    const target = btn.dataset.page;
    document.querySelector(`.page[data-page="${target}"]`).classList.add('is-on');
    btn.classList.add('is-on');
  });
});
```
Use the same pattern to navigate from the Next Episode widget to `mirror-episodes`.

**Existing nav buttons** in the sidebar (lines 74-79 of index.html):
```
<button class="navitem is-on" data-page="today">...</button>
<button class="navitem" data-page="buckets">...</button>
<button class="navitem" data-page="bucket-view">...</button>
<button class="navitem" data-page="prompts">...</button>
<button class="navitem" data-page="roadmap">...</button>
<button class="navitem" data-page="share">...</button>
```
Add the new navitem after `share`:
```
<button class="navitem" data-page="mirror-episodes"><span class="ni-key">E</span><span>MIRRØR Episodes</span><span class="ni-badge" id="ni-episodes">0</span></button>
```

**Existing pages** use `<div class="page" data-page="...">` toggled by the `.is-on` class.
Add the new page div after the existing share page div.

**CSS design pattern:** existing cards use class `liquid-glass` or `liquid-glass-strong`. Match this for the episode cards and the next-episode widget.

**Toast notifications:** existing code uses `toastErr(msg)` for errors. Use the same.

---

## CHANGES TO index.html

**Change 1:** Add nav button after the share navitem:
```
<button class="navitem" data-page="mirror-episodes"><span class="ni-key">E</span><span>MIRRØR Episodes</span><span class="ni-badge" id="ni-episodes">0</span></button>
```

**Change 2:** Add the Next Episode widget inside the existing today/home page div. Find the home page section (data-page="today") and add the widget somewhere logical in the layout -- after the task list or as its own section near the top. Widget HTML:
```
<div id="next-episode-widget" class="card liquid-glass" style="cursor:pointer; margin-top:1rem;" role="button" tabindex="0" aria-label="Next episode up">
  <div class="card-inner">
    <div class="eyebrow">MIRRØR Episodes · Next Up</div>
    <div id="next-episode-title" style="font-size:1.1rem; font-weight:600; margin:.25rem 0;">Loading...</div>
    <div id="next-episode-meta" style="font-size:.8rem; opacity:.6;"></div>
  </div>
</div>
```

**Change 3:** Add the mirror-episodes page div after the closing tag of the share page. Full structure:
```
<div class="page" data-page="mirror-episodes">
  <div class="page-inner">
    <h2 class="page-title">MIRRØR Episodes</h2>
    <div class="ep-filter-bar" style="display:flex; gap:.5rem; margin-bottom:1.25rem;">
      <button class="ep-filter is-on" data-filter="pending">Pending</button>
      <button class="ep-filter" data-filter="all">All</button>
      <button class="ep-filter" data-filter="recorded">Recorded</button>
    </div>
    <div id="episodes-list" style="display:flex; flex-direction:column; gap:.75rem;"></div>
  </div>
</div>
```

---

## CHANGES TO v2-app.js

Add a self-contained episodes module. Place it after the existing init logic near the bottom of the file, before the final closing of any wrapping IIFE or DOMContentLoaded handler.

The module does the following:

**A. fetchEpisodes()**
Queries `mirror_episode_anchors` ordered by `number` ascending.
Returns the full array.
Caches result in a module-level variable `let _episodes = []`.

**B. renderEpisodes(filter)**
`filter` is `'pending'`, `'recorded'`, or `'all'`.
Filters `_episodes` by status if not `'all'`.
Clears `#episodes-list` and renders one card per episode.

Card HTML pattern:
```
<div class="card liquid-glass ep-card" data-id="EPISODE_UUID" data-status="pending|recorded" style="overflow:hidden;">
  <div class="ep-card-summary" style="cursor:pointer; padding:1rem;">
    <div style="display:flex; justify-content:space-between; align-items:baseline;">
      <span style="font-weight:600;">EP_NUMBER. TITLE</span>
      <span style="font-size:.75rem; opacity:.55;">CLUSTER</span>
    </div>
    <div class="ep-status-pill" style="font-size:.7rem; margin-top:.3rem; opacity:.6;">STATUS_LABEL</div>
  </div>
  <div class="ep-card-detail" style="display:none; padding:0 1rem 1rem; border-top:1px solid rgba(255,255,255,.08);">
    <div class="ep-field"><span class="eyebrow">Door In</span><p>DOOR_IN_TEXT</p></div>
    <div class="ep-field"><span class="eyebrow">Charge</span><p>CHARGE_TEXT</p></div>
    <div class="ep-field"><span class="eyebrow">Threads</span><p>THREADS_TEXT</p></div>
    <button class="ep-record-btn" style="margin-top:.75rem;" data-id="EPISODE_UUID">Mark Recorded</button>
  </div>
</div>
```

Replace the ALL-CAPS placeholders with actual data. Hide the detail div by default. Show it on card-summary click (toggle). If status is 'recorded', hide the Mark Recorded button.

**C. markRecorded(id)**
```
const { error } = await sb
  .from('mirror_episode_anchors')
  .update({ status: 'recorded', recorded_at: new Date().toISOString() })
  .eq('id', id);
if (error) { toastErr('Could not mark recorded: ' + error.message); return; }
// update _episodes in memory
const ep = _episodes.find(e => e.id === id);
if (ep) { ep.status = 'recorded'; ep.recorded_at = new Date().toISOString(); }
// re-render current filter
renderEpisodes(currentFilter);
// update badge + next-episode widget
updateEpisodeBadge();
renderNextEpisodeWidget();
```

**D. updateEpisodeBadge()**
Counts `_episodes.filter(e => e.status === 'pending').length`.
Sets `document.getElementById('ni-episodes').textContent` to that count.

**E. renderNextEpisodeWidget()**
Finds the episode with the lowest `number` where `status === 'pending'` from `_episodes`.
If found: sets `#next-episode-title` to `EP_NUMBER. TITLE` and `#next-episode-meta` to the cluster name.
If none: sets title to "All recorded" and clears meta.

**F. Filter bar click handler**
```
let currentFilter = 'pending';
document.querySelectorAll('.ep-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ep-filter').forEach(b => b.classList.remove('is-on'));
    btn.classList.add('is-on');
    currentFilter = btn.dataset.filter;
    renderEpisodes(currentFilter);
  });
});
```

**G. Next Episode widget click handler**
```
const widget = document.getElementById('next-episode-widget');
if (widget) {
  widget.addEventListener('click', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('is-on'));
    document.querySelectorAll('.navitem').forEach(n => n.classList.remove('is-on'));
    document.querySelector('.page[data-page="mirror-episodes"]').classList.add('is-on');
    document.querySelector('.navitem[data-page="mirror-episodes"]').classList.add('is-on');
  });
  widget.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') widget.click(); });
}
```

**H. Init call**
Add to the existing init sequence (near the bottom where `initFromSupabase()` is called):
```
// MIRRØR Episodes init
fetchEpisodes().then(() => {
  updateEpisodeBadge();
  renderNextEpisodeWidget();
  // Only render the list if the page is already visible (unlikely on load, but safe)
  if (document.querySelector('.page[data-page="mirror-episodes"]').classList.contains('is-on')) {
    renderEpisodes(currentFilter);
  }
});
// Also render when the tab is activated
document.querySelector('.navitem[data-page="mirror-episodes"]').addEventListener('click', () => {
  if (_episodes.length > 0) renderEpisodes(currentFilter);
});
```

**I. ep-record-btn click delegation**
Use event delegation on `#episodes-list`:
```
document.getElementById('episodes-list').addEventListener('click', e => {
  const recordBtn = e.target.closest('.ep-record-btn');
  if (recordBtn) { markRecorded(recordBtn.dataset.id); return; }
  const summary = e.target.closest('.ep-card-summary');
  if (summary) {
    const detail = summary.nextElementSibling;
    if (detail) detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
  }
});
```

---

## DO NOT TOUCH

- The Supabase client initialization (SUPABASE_URL, SUPABASE_ANON_KEY, sb)
- The tasks table, task rendering, task CRUD logic
- The Direct Line bridge agent logic
- The Focus mode modal
- The portfolio_state or energy state logic
- The prompts, roadmap, buckets, or share pages
- v2-styles.css (do not add a separate CSS file; inline any needed styles as style attributes or a small style block in index.html)
- Any localStorage references (there should be none and there should remain none)

---

## QA CHECKLIST (run after build, report each item)

1. Does the page load without console errors?
2. Does the MIRRØR Episodes navitem appear in the sidebar with a pending count badge?
3. Does the Next Episode widget appear on the home page showing the correct episode title and cluster?
4. Does clicking the Next Episode widget navigate to the mirror-episodes tab?
5. Does the Episodes tab load and show all pending episodes by default?
6. Does clicking a card expand to show door_in, charge, threads, and Mark Recorded button?
7. Does clicking Mark Recorded update the card immediately (removed from pending view) without a full page reload?
8. Does the pending badge count decrease after marking an episode recorded?
9. Does the Next Episode widget update after marking the first episode recorded?
10. Does the "All" filter show both pending and recorded episodes?
11. Does the "Recorded" filter show only marked-recorded episodes?
12. Do recorded episodes show their status but no Mark Recorded button?
