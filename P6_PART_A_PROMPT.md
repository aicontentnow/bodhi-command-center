# P6 Part A: Hierarchical Task Extraction in Direct Line Bridge
## Building: direct-line-bridge SKILL.md v3.0
## Baseline: v2.0 (confirmed working as of 2026-04-27 handoff)
## Date: 2026-04-27

---

## Project context

This is the Bodhi 360 Command Center system. The direct-line-bridge is a scheduled Cowork agent that polls Supabase (project gcbvvausrmbbkfazojpl) for unprocessed messages and extracts tasks from them. The skill file at the path below is what the agent reads every time it runs.

Current version: v2.0 (confirmed working)
This prompt builds: v3.0

A new `subtasks` table now exists in Supabase (gcbvvausrmbbkfazojpl). Schema confirmed:
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE
- title text NOT NULL
- done boolean NOT NULL DEFAULT false
- sort_order integer NOT NULL DEFAULT 0
- created_at timestamptz NOT NULL DEFAULT now()

## What this prompt builds

Update `skills/direct-line-bridge/SKILL.md` from v2.0 to v3.0.

The change: when the bridge extracts multiple tasks from a brain_dump or freeform message, it now evaluates whether those tasks form a natural parent/subtask group. If yes: write one parent task to the `tasks` table, capture the UUID from the response, then write each sub-step to the `subtasks` table using that UUID as task_id. If no grouping is detected: write all tasks flat to `tasks` as before. No behavior change for ungrouped content.

## What must not be touched

- STEP 1 (fetch unprocessed messages)
- STEP 2 routing logic (bucket and horizon determination)
- kind = 'redphone' handler and all its sub-steps (R1 through R6)
- kind = 'task' handler
- kind = 'prompt' and 'launch' handlers
- STEP 4 (write task_notes)
- STEP 6 (mark processed)
- All Supabase credentials and curl headers
- The WHAT NOT TO DO section (add one line -- see below)

## The exact changes to make

### Change 1: Version line

Change:
```
## Version: 2.0
```

To:
```
## Version: 3.0
```

### Change 2: Add HIERARCHICAL GROUPING LOGIC section

Insert this entire section immediately before STEP 3 (between the EXTRACTION LOGIC section and STEP 3: WRITE TASKS TO SUPABASE).

```
## HIERARCHICAL GROUPING LOGIC

After extracting the list of candidate tasks from a brain_dump or freeform message, evaluate the list for grouping before writing anything to Supabase.

### Grouping applies when ALL of these are true:
- Three or more tasks were extracted from this message
- Most or all of the extracted tasks clearly serve the same named project, goal, or deliverable
- They read as steps, components, or parallel sub-tasks of that single goal
- A short parent title under 80 characters can accurately name what they collectively accomplish

### Grouping does NOT apply when:
- Fewer than 3 tasks were extracted
- The extracted tasks span multiple unrelated goals or projects
- The tasks are clearly independent one-off items with no shared goal

### If grouping applies:
1. Choose a parent title (under 80 chars) that names the shared goal. Example: "Launch SEASONS Spring website" or "Complete MIRROR outreach batch".
2. Write the parent task to the tasks table using the STEP 3 curl format. Set done=false, sort_order=0. Use the same BUCKET and horizon determined by routing.
3. The curl uses Prefer: return=representation -- capture the full JSON response body.
4. Parse the id field from the response JSON. This is the parent_task_id. If parsing fails or the response is not valid JSON, log the error, skip subtask writes for this message, and write all tasks flat as fallback.
5. Write each of the grouped tasks as subtasks using STEP 3B below. Do NOT write them as independent rows in the tasks table.
6. If any extracted tasks were NOT included in the group (rare edge case), write them as flat tasks to the tasks table normally.

### If grouping does not apply:
Write all extracted tasks flat to the tasks table using STEP 3 as before. Skip STEP 3B entirely.
```

### Change 3: Add STEP 3B after STEP 3

Insert this entire section immediately after STEP 3.

```
## STEP 3B: WRITE SUBTASKS TO SUPABASE (grouped messages only)

Only run this step if grouping was applied in HIERARCHICAL GROUPING LOGIC above.

For each subtask, sort_order starts at 0 and increments by 1 for each subsequent subtask.

```
curl -s -X POST "https://gcbvvausrmbbkfazojpl.supabase.co/rest/v1/subtasks" \
  -H "apikey: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Authorization: Bearer sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "task_id": "<parent_task_id captured in STEP 3>",
    "title": "<subtask title, under 80 chars>",
    "done": false,
    "sort_order": <0 for first, 1 for second, etc.>
  }'
```

If a subtask write returns a non-200 status, log the error and continue to the next subtask. Do not block the run or skip marking processed. The parent task is already written -- partial subtask failures are acceptable.

Column names are exact: task_id (uuid), title (text), done (boolean), sort_order (integer). No other columns.
```

### Change 4: Update STEP 5 response format for grouped messages

Find the response content format block in STEP 5. Add one new line for the grouped case:

Change the brain_dump / freeform line from:
```
- For brain_dump / freeform: "Processed. Extracted [N] tasks to [BUCKET] bucket ([horizon] horizon): [task title 1]; [task title 2]; ..."
```

To:
```
- For brain_dump / freeform (no grouping): "Processed. Extracted [N] tasks to [BUCKET] ([horizon]): [task title 1]; [task title 2]; ..."
- For brain_dump / freeform (grouped): "Processed. Extracted 1 parent task with [N] subtasks to [BUCKET] ([horizon]): [parent title]"
```

### Change 5: Update STEP 7 run report

Find the run report format block. Add subtasks count.

Change from:
```
Bridge Agent Run: [timestamp]
Messages processed: [N]
Tasks created: [N] (breakdown by bucket if multiple)
Errors: [list any failed writes]
```

To:
```
Bridge Agent Run: [timestamp]
Messages processed: [N]
Tasks created: [N flat tasks] + [N parent tasks] + [N subtasks] (breakdown by bucket if multiple)
Errors: [list any failed writes]
```

### Change 6: Add one line to WHAT NOT TO DO

Add this line to the existing WHAT NOT TO DO section:
```
- Do not write grouped subtasks to the tasks table. Subtasks belong in the subtasks table only.
```

## What to deliver

1. Write the updated file to the canonical iCloud location:
   `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/skills/direct-line-bridge/SKILL.md`

2. Copy it to the mirror location for Claude Code CLI compatibility:
```
mkdir -p ~/.claude/skills/direct-line-bridge && cp "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/skills/direct-line-bridge/SKILL.md" ~/.claude/skills/direct-line-bridge/SKILL.md
```

3. Confirm both writes succeeded and state the final line count of the updated file.

No git push required. This skill file is not in the command-center GitHub repo.
