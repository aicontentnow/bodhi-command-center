# P7 Round 2 -- Bell visibility fix (cascade order)
## Version: v4r18 (v4r17 base, single fix)

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder).

Current version: v4r17

## Root cause of the bug

The `.btn` CSS class is defined at line 847 in v2-styles.css, AFTER the `.dl-notif-btn` rule at line 784. Both are single-class selectors with equal specificity (0,1,0). The later rule wins. So `.btn { display: flex }` overrides `.dl-notif-btn { display: none }` at page load, making the bell visible.

`updateBell()` already uses `btn.style.display` (inline style) which correctly overrides class rules. The fix is to give the initial hidden state that same inline priority.

## What must not be touched

Everything except the single change below. Do not touch v2-app.js, v2-styles.css, Supabase connection, task logic, conversation thread, portfolio state, hotkeys, or any other feature.

---

## Change -- HTML only (index.html)

Find the `dlNotifBtn` button element. It currently looks like:

```
<button class="btn dl-notif-btn" id="dlNotifBtn" title="Chief of Staff replied" aria-label="New CoS responses">
```

Add `style="display:none"` to it:

```
<button class="btn dl-notif-btn" id="dlNotifBtn" style="display:none" title="Chief of Staff replied" aria-label="New CoS responses">
```

That is the entire change. One attribute added to one element.

This works because:
- Inline styles (style attribute) beat class rules in the CSS cascade regardless of rule order
- `updateBell()` already sets `btn.style.display = 'flex'` or `btn.style.display = 'none'` -- it modifies the same inline style, so it overrides correctly when dlUnread changes

---

## Deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "deploy: P7 Round2 bell cascade fix v4r18 $(date +%Y-%m-%d-%H%M)" && git push origin main
