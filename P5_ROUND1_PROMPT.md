# P5 Round 1: User Bubble Color Fix
## Building: v4r14 color patch
## Builds on: v4r14 (SHA 07db658)
## File to modify: v2-styles.css only

---

## Project context

This is the Bodhi 360 Command Center -- a personal ops dashboard deployed at aicontentnow.github.io/bodhi-command-center (GitHub repo: aicontentnow/bodhi-command-center, main branch, root folder). It connects to Supabase (project gcbvvausrmbbkfazojpl) for live task data, portfolio state, and Direct Line messaging.

Current version: v4r14 (SHA 07db658)

## What is already built and confirmed working

- P1: Focus mode -- amber pill, task selection, modal, Supabase PATCH, Escape/Exit close
- P2: Drag-to-reorder -- persists sort_order to Supabase
- P3: Add task button -- "+" pinned top, compact modal, validation, toast, Escape closes
- P4: Done tasks collapse -- "show completed (N)" toggle
- P5: Direct Line conversation thread -- two-sided bubble layout, loads from Supabase, realtime appends
- P6: Bridge agent -- scheduled every 30 minutes
- P8: Polish -- sort toggle, hotkey guards, bucket filter state model, All button toggle
- P9: State persistence on refresh -- sort preference, active tab, bucket filter

## What this prompt fixes

QA item 1 passed but a color issue was flagged: the user message bubbles are amber (#F59E0B), which clashes with the existing amber used for Focus mode pills and active buttons throughout the UI. The user bubbles need to be a distinct, softer blue that clearly reads as "your message" without competing with the amber design system.

## The one change required

In v2-styles.css, find the `.dl-bubble.user` rule. Change the background color from `#F59E0B` to `#4A9EFF`.

Also find `.dl-bubble.user .dl-bubble-time` and update its color to `rgba(255,255,255,0.5)` (white-tinted timestamp, appropriate for a blue background instead of black).

Also find `.dl-bubble.user` color property (text color). If it is currently `#000` (black), change it to `#fff` (white) so the text is legible on the blue background.

That is the full scope of this fix. Three property changes inside existing CSS rules. No JS changes. No HTML changes. No other CSS changes.

## What must not be touched

- All JS logic (v2-app.js) -- do not open or modify
- All other CSS rules
- index.html -- do not modify
- Any amber (#F59E0B) used outside `.dl-bubble.user` -- Focus mode, sort buttons, active states all stay amber

---

## Deploy

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add v2-styles.css && git commit -m "fix: P5 user bubble color to blue patch $(date +%Y-%m-%d-%H%M)" && git push origin main
```
