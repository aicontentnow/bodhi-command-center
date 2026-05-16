# P8 Round 5: Fix context tag X button
## Building on v4r21 (SHA b3c06b7, deployed 2026-04-28)
## File to edit: _command-center/v2-app.js and possibly v2-styles.css

---

## The bug

The X button next to the context tag inside the Direct Line panel does nothing visible when clicked.

**To reproduce:**
1. Open the Command Center at https://aicontentnow.github.io/bodhi-command-center/
2. Click any Brain Dump bucket tile (e.g. Family). The Direct Line panel opens and shows a tag bar above the input that reads: CONTEXT [Brain dump · Family] [×]
3. Click the × button.
4. Expected: the tag bar disappears entirely (the whole CONTEXT row vanishes).
5. Actual: nothing changes. The tag bar stays visible.

**What IS working:** Clicking X clears the text input (lineInput.value = '' runs). So the click handler fires. But the tag bar does not disappear.

---

## Current code

**v2-app.js, lines 375-381:**

```
function setTag(t) {
  pendingTag = t;
  if (!t) { lineTagBar.style.display = 'none'; return; }
  lineTag.innerHTML = `<span class="pip"></span><span>${escapeHtml(t.label)}</span>`;
  lineTagBar.style.display = 'flex';
}
lineTagClear.addEventListener('click', () => { setTag(null); lineInput.value = ''; lineInput.focus(); });
```

**v2-app.js, lines 239-241 (element refs):**

```
const lineTagBar = document.getElementById('lineTagBar');
const lineTag = document.getElementById('lineTag');
const lineTagClear = document.getElementById('lineTagClear');
```

**v2-styles.css, line 2444:**

```
.tag-bar {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.25rem 0.35rem;
}
```

**index.html (the tag bar element):**

```html
<div class="tag-bar" id="lineTagBar" hidden>
  <span class="tag-label">Context</span>
  <span class="tag" id="lineTag"></span>
  <button type="button" class="tag-x" id="lineTagClear" aria-label="Clear context">×</button>
</div>
```

---

## Root cause hypothesis

The `hidden` HTML attribute is still present on the div in the initial HTML. When `setTag(t)` sets `lineTagBar.style.display = 'flex'`, that inline style overrides both the CSS class and the hidden attribute -- so the bar appears correctly. But when `setTag(null)` sets `lineTagBar.style.display = 'none'`, the result might be ambiguous or there may be another rule interfering.

Possible cause: something is calling `openLine()` or `setTag()` again immediately after the X click, re-showing the bar. Or: a parent element click handler is re-triggering. Or: the `style.display` assignment is being overwritten by a framework/effect elsewhere in the file.

---

## What to investigate first

1. Open the browser console on the live Command Center page.
2. Open a Brain Dump tile to set a tag.
3. In console run: `document.getElementById('lineTagBar').style.display` -- what does it return?
4. Click the X button.
5. Immediately in console: `document.getElementById('lineTagBar').style.display` -- did it change?
6. If it changed to 'none' but bar is still visible: a CSS rule with `!important` is overriding it. Check computed styles.
7. If it did NOT change: the click handler is not reaching `setTag(null)`. Check for event.stopPropagation() or a covering element.

---

## Preferred fix approach

Remove the `hidden` attribute from the HTML entirely. Manage visibility exclusively via a CSS class toggle. This avoids the attribute/style/class conflict entirely.

**In index.html**, change:
```html
<div class="tag-bar" id="lineTagBar" hidden>
```
to:
```html
<div class="tag-bar tag-bar--hidden" id="lineTagBar">
```

**In v2-styles.css**, add after the `.tag-bar` rule:
```css
.tag-bar--hidden { display: none !important; }
```

**In v2-app.js**, change `setTag()` to:
```
function setTag(t) {
  pendingTag = t;
  if (!t) { lineTagBar.classList.add('tag-bar--hidden'); return; }
  lineTag.innerHTML = `<span class="pip"></span><span>${escapeHtml(t.label)}</span>`;
  lineTagBar.classList.remove('tag-bar--hidden');
}
```

This approach is unambiguous: `!important` on the hidden class beats the base `display: flex`. No style attribute conflicts, no hidden attribute fights.

---

## Also verify: Red Phone button (v4r21 change)

The Red Phone button handler was changed in v4r21 to:

```
openRedPhoneBtn.addEventListener('click', () => {
  openLine();
  confirmBtn(openRedPhoneBtn, 'ok', 'Line open');
});
```

Confirm this is live -- clicking Red Phone should open a blank panel with no pre-filled text and no context tag. If the old pre-fill is still appearing, the deploy may not have taken effect and a cache-bust may be needed (force push with a cache-control meta tag change or increment a ?v= param on the script src in index.html).

---

## After fixing

1. QA: open a Brain Dump tile, confirm tag appears. Click X, confirm tag bar disappears completely.
2. QA: click Red Phone, confirm blank panel, no tag, no pre-filled text.
3. Commit as v4r22 with message: "v4r22: fix tag bar X button using class toggle instead of style.display"
4. Push to main.
