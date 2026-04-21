# Task List Staging -- 2026-04-20
## Source: Harmonic standup sync (9 transcripts, Apr 9-16)
## Import this into the new Command Center when it goes live.

---

## Current Task Definitions

These replace the DEFAULT_TASKS from the previous dashboard (v2 key).
New key should be `bodhi_mvp_tasks_v3` to force a fresh load.

```json
[
  {
    "id": "t1",
    "title": "Build brain dump buckets into the dashboard",
    "meta": "So dumping into a bucket routes automatically",
    "project": "360",
    "done": true
  },
  {
    "id": "t2",
    "title": "Test the red phone in a Cowork session",
    "meta": "Confirm the CoS skill loads properly",
    "project": "360",
    "done": false
  },
  {
    "id": "t13",
    "title": "Harmonic PIPELINE.md standup (Apr 9-16 transcripts)",
    "meta": "9 transcripts processed. PIPELINE.md updated 2026-04-20. All 13 priorities current.",
    "project": "360",
    "done": true
  },
  {
    "id": "t6",
    "title": "Skills reorg Phase 1: inventory",
    "meta": "Full scan of all SKILL.md files across Mac. Inventory at _command-center/reorg/INVENTORY_2026-04-20.md",
    "project": "360",
    "done": true
  },
  {
    "id": "t7",
    "title": "Skills reorg Phase 2: fix CoS skill errors",
    "meta": "4 skills incorrectly marked TODO. All corrected in bodhi-chief-of-staff SKILL.md",
    "project": "360",
    "done": true
  },
  {
    "id": "t8",
    "title": "Skills reorg Phase 3: canonical structure proposal",
    "meta": "26 skill files across 9 location patterns. Proposal doc needed before migration.",
    "project": "360",
    "done": false
  },
  {
    "id": "t9",
    "title": "Skills reorg Phase 4: migration + archive",
    "meta": "Dedicated session. Archive-before-move. Requires Bodhi present.",
    "project": "360",
    "done": false
  },
  {
    "id": "t10",
    "title": "Archive rogue Hard Hat Healthcare/ folder at workspace root",
    "meta": "Duplicate of framezero/clients/hhh/. 3 rogue CLAUDE.md files inside.",
    "project": "360",
    "done": false
  },
  {
    "id": "t11",
    "title": "SensAI video 1 script -- 30-second rewrite",
    "meta": "Write with Sarah. Target week of May 4 launch. Gabe animates in Weavy after.",
    "project": "Harmonic",
    "done": false
  },
  {
    "id": "t12",
    "title": "Draft ANGA + Fiber Connect event emails",
    "meta": "Fiber Connect first (earlier event). Messaging locked: O&T, distributed PON, C-star.",
    "project": "Harmonic",
    "done": false
  },
  {
    "id": "t5",
    "title": "Chase Sarah: loop Gabe in on the 5 completed video scripts",
    "meta": "Scripts done. Sarah needs to notify Gabe they are ready for animation.",
    "project": "Harmonic",
    "done": false
  },
  {
    "id": "t3",
    "title": "Hardcover proof review -- glitch-effect version",
    "meta": "Proof rejected 2026-04-19. What is wrong, what is next round.",
    "project": "Book",
    "done": false
  },
  {
    "id": "t4",
    "title": "Rocky Mountaineer logistics with Lee",
    "meta": "Early May trip with Dad",
    "project": "Family",
    "done": false
  }
]
```

---

## PIPELINE.md Reference

Updated file is at: `_command-center/PIPELINE.md`
Last updated: 2026-04-20
13 active priorities, all Harmonic-accurate as of Apr 16 transcripts.

---

## Notes for New Dashboard Build

- Old localStorage key was `bodhi_mvp_tasks_v2`
- New key should be `bodhi_mvp_tasks_v3` (forces fresh load, drops stale state)
- Tasks above are the canonical current list as of 2026-04-20
- The PIPELINE.md is the deep-detail record; tasks here are Bodhi's action items only
- Do not merge with old DEFAULT_TASKS -- start fresh from this list
