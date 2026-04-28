# P7 Round 1 -- Bell visibility fix
## Version: v4r17 (v4r16 base, single fix)

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder).

Current version: v4r16

## What this prompt fixes

The notification bell button is visible at page load showing "0 replied" when it should be hidden. Root cause: the `.btn` CSS class applies `display: flex` or similar, which overrides the HTML `hidden` attribute. The bell must be invisible until `dlUnread > 0`.

## What must not be touched

Everything except the two specific changes listed below. Do not touch Supabase connection, task logic, conversation thread, portfolio state, hotkeys, or any other feature.

---

## Change 1 -- CSS (v2-styles.css)

Find the `.dl-notif-btn` rule added in P7 and add `display: none;` as the first property:

```
.dl-notif-btn {
  display: none;
  background: rgba(74, 158, 255, 0.15);
  border: 1px solid rgba(74, 158, 255, 0.35);
  color: #4A9EFF;
  font-size: 0.72rem;
  gap: 0.35rem;
  letter-spacing: 0.03em;
  animation: dlNotifPulse 2.4s ease-in-out infinite;
}
```

This makes the button hidden by default regardless of the `hidden` attribute.

## Change 2 -- JS (v2-app.js)

Find the `updateBell()` function added in P7. Replace it entirely:

```
function updateBell() {
  const btn = document.getElementById('dlNotifBtn');
  const countEl = document.getElementById('dlNotifCount');
  if (!btn || !countEl) return;
  if (dlUnread > 0) {
    countEl.textContent = dlUnread;
    btn.style.display = 'flex';
  } else {
    btn.style.display = 'none';
  }
}
```

The `hidden` attribute approach is replaced with explicit `style.display` toggling to ensure the `.btn` flex rule cannot override it.

Also: find the `dlNotifBtn` element in `index.html` and remove the `hidden` attribute from it (the CSS now controls visibility -- the attribute is redundant and confusing):

```
<button class="btn dl-notif-btn" id="dlNotifBtn" title="Chief of Staff replied" aria-label="New CoS responses">
```

---

## Deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "deploy: P7 Round1 bell visibility fix v4r17 $(date +%Y-%m-%d-%H%M)" && git push origin main
```
