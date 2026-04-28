# P8 Round 1 -- X button full reset
## Version: v4r20 (v4r19 base, single fix)

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder).

Current version: v4r19

## What this prompt fixes

The X button next to the context tag only clears the tag bar (calls setTag(null)) but leaves any pre-filled seed text in the lineInput textarea. After clicking X, the composer should be fully reset: tag cleared, textarea cleared, focus returned to textarea.

## What must not be touched

Everything except the single change below. Do not touch Supabase connection, task logic, conversation thread, portfolio state, hotkeys, CSS, HTML, or any other feature.

---

## Change -- JS only (v2-app.js)

Find this exact line:

```
lineTagClear.addEventListener('click', () => setTag(null));
```

Replace it with:

```
lineTagClear.addEventListener('click', () => { setTag(null); lineInput.value = ''; lineInput.focus(); });
```

That is the entire change. One line replaced.

---

## Deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "deploy: P8 Round1 X button full reset v4r20 $(date +%Y-%m-%d-%H%M)" && git push origin main
```
