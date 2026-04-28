# P7 Round 3 -- Auto-close panel on send
## Version: v4r19 (v4r18 base, single fix)

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder).

Current version: v4r18

## What this prompt fixes

The walkie-talkie notification model requires the Direct Line panel to be closed after sending so the bell can fire when the bridge responds. Currently the panel stays open after send, which means responses arrive while the panel is open, the bell never fires, and the notification model breaks.

Fix: call `closeLine()` immediately after the send toast in the `send()` function. The flow becomes:
1. User types message, sends
2. User bubble appends to thread, toast fires ("Sent"), panel closes
3. Bridge picks up message within 3 minutes, writes response
4. Bell fires (panel is closed), browser notification fires
5. User clicks bell, panel opens, bell clears, user reads response

## What must not be touched

Everything except the single change below. Do not touch Supabase connection, task logic, conversation thread, portfolio state, hotkeys, CSS, HTML, or any other feature.

---

## Change -- JS only (v2-app.js)

Find the `send()` function. Locate this exact line inside it:

```
toastOk('Sent · Chief of Staff picks this up on next run.');
```

Add `closeLine();` on the very next line, so it reads:

```
toastOk('Sent · Chief of Staff picks this up on next run.');
closeLine();
```

That is the entire change. One line added. Do not change any other part of `send()`.

---

## Deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html v2-app.js v2-styles.css && git commit -m "deploy: P7 Round3 auto-close on send v4r19 $(date +%Y-%m-%d-%H%M)" && git push origin main
```
