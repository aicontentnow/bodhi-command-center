# P5 Round 2: CoS Label Fix
## Building: v4r14 label patch
## Builds on: v4r14 color patch (SHA 9a6ab20)
## File to modify: v2-app.js only

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder). It connects to Supabase (project gcbvvausrmbbkfazojpl) for live task data, portfolio state, and Direct Line messaging.

Current version: v4r14

## What is already built and confirmed working

- P1: Focus mode -- amber pill, task selection, modal, Supabase PATCH, Escape/Exit close
- P2: Drag-to-reorder -- persists sort_order to Supabase
- P3: Add task button -- "+" pinned top, compact modal, validation, toast, Escape closes
- P4: Done tasks collapse -- "show completed (N)" toggle
- P5: Direct Line conversation thread -- two-sided bubble layout, loads from Supabase, realtime appends, user bubbles right/blue, CoS bubbles left/dark
- P6: Bridge agent -- scheduled every 30 minutes
- P8: Polish -- sort toggle, hotkey guards, bucket filter state model, All button toggle
- P9: State persistence on refresh -- sort preference, active tab, bucket filter

## What this prompt fixes

QA item 4 failed: the label displayed above CoS response bubbles reads "Direct Line Bridge" instead of "CoS". This is the raw agent field value from the database being rendered directly. It needs to display a human-readable name instead.

## The one change required

In v2-app.js, find the function that builds CoS response bubbles (likely named `buildCosBubble`, `renderConversationThread`, or similar). Find the line that sets the label text above the bubble -- it is currently rendering the `agent` field value directly (resulting in "direct-line-bridge" or "Direct Line Bridge").

Change that line so it always displays "CoS" as the label, regardless of what the agent field contains.

This is a one-line change. Do not modify any other logic.

## What must not be touched

- All CSS (v2-styles.css) -- do not open or modify
- index.html -- do not modify
- Any JS logic outside the CoS bubble label line
- All existing thread load, realtime, and send logic

---

## Deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add v2-app.js && git commit -m "fix: P5 CoS bubble label display $(date +%Y-%m-%d-%H%M)" && git push origin main
```
