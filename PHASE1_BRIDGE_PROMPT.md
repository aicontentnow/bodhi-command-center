# Command Center v3: Phase 1 Build Prompt
## For: Claude Code
## Phase: Bridge Agent Skill + Loading State Fix
## Version: v3 (v2 QA passed 2026-04-21 -- this is new build on top of working baseline)

---

## READ THESE FILES FIRST BEFORE WRITING ANYTHING

1. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/DIRECT_LINE_BUILD_SPEC.md` -- full product spec, schema reference, routing logic, task extraction rules
2. `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js` -- existing working file, do not break anything

Do not rewrite v2-app.js from scratch. Make targeted edits only to the specific sections described below.

---

## TASK 1: Create the Bridge Agent Skill

Create this file (create the directory if it does not exist):
`/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/skills/direct-line-bridge/SKILL.md`

The file must contain complete, self-contained instructions for a Cowork session running as a scheduled agent. The agent will use Bash curl commands to interact with Supabase REST API and its own reasoning to extract tasks from brain dump content.

---

### SKILL.md content to write:

```
# Direct Line Bridge Agent
## Version: 1.0
## Role: Scheduled Cowork agent. Polls direct_line_messages, extracts tasks, routes to correct bucket, writes back to Supabase.

---

## SUPABASE CREDENTIALS

URL: https://gcbvvausrmbbkfazojpl.supabase.co
ANON KEY: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P

All Supabase calls use these headers:
  apikey: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P
  Authorization: Bearer sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P
  Content-Type: application/json
  Prefer: return=representation

---

## STEP 1: FETCH UNPROCESSED MESSAGES

Run this curl command to get all unprocessed messages:

```
curl -s "https://gcbvvausrmbbkfazojpl.supabase.co/rest/v1/direct_line_messages?processed=eq.false&order=created_at.asc" \
  -H "apikey: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Authorization: Bearer sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P"
```

If the result is an empty array [], log "No unprocessed messages. Bridge agent run complete." and stop.

---

## STEP 2: PROCESS EACH MESSAGE

For each message in the array, apply the routing and extraction logic below. Process messages in created_at order (oldest first).

---

## ROUTING LOGIC

### Determine BUCKET from tag field (case-insensitive):
- tag contains 'harmonic' → BUCKET = HARMONIC
- tag contains 'mirror' → BUCKET = MIRROR
- tag contains 'ldag' → BUCKET = LDAG
- tag contains 'framezer' → BUCKET = FRAMEZERO (handles FRAMEZERØ)
- tag contains 'family' → BUCKET = FAMILY
- no match, or tag is null → BUCKET = BODHI360

### Determine HORIZON:
- Default: 'week'
- Override to 'today' if content contains any of: today, urgent, ASAP, right now, by end of day, this morning, this afternoon (case-insensitive)

---

## EXTRACTION LOGIC BY KIND

### kind = 'brain_dump'
Extract 3-8 concrete action items from the content. Rules:
- Extract sentences indicating work to be done: deliverables, follow-ups, decisions needed, things to send, things to write, people to contact
- Keep each task title under 80 characters, plain English
- Do NOT extract: conversational filler, status updates with no action, things already described as done, commentary or reflection without a next step
- Each extracted task becomes one row in the tasks table

### kind = 'task' (tag field is a UUID)
This is feedback on a specific existing task. Do NOT create a new task row.
Instead: write one row to task_notes table with task_id = the tag UUID and content = full message content.
Skip the tasks write entirely for this kind.

### kind = 'redphone'
Determine bucket from tag (same routing as brain_dump).
Horizon is always 'today' regardless of content.
Prefix every extracted task title with 'URGENT: '.
Extract 3-8 action items same as brain_dump.

### kind = 'freeform'
Analyze content. Determine most relevant bucket by subject matter (ignore tag, use content to decide bucket).
Extract any concrete action items as tasks. If no concrete action items exist, write zero task rows.

### kind = 'prompt' or 'launch'
Do not extract tasks.
Write one response row acknowledging receipt (see Step 3 for response format).
Mark processed=true.
Move to next message.

---

## STEP 3: WRITE TASKS TO SUPABASE

For each extracted task, run:

```
curl -s -X POST "https://gcbvvausrmbbkfazojpl.supabase.co/rest/v1/tasks" \
  -H "apikey: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Authorization: Bearer sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "user_id": "bodhi",
    "title": "<task title, under 80 chars>",
    "bucket": "<BUCKET from routing>",
    "horizon": "<today or week>",
    "done": false,
    "sort_order": 0
  }'
```

Column names are exact: `title` (not subject), `done` boolean (not status), `sort_order` (not priority).
Do not include any other columns. These are the only valid columns.

---

## STEP 4: WRITE TASK_NOTE (kind = 'task' only)

For messages where kind = 'task' and tag is a UUID:

```
curl -s -X POST "https://gcbvvausrmbbkfazojpl.supabase.co/rest/v1/task_notes" \
  -H "apikey: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Authorization: Bearer sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "task_id": "<tag UUID>",
    "content": "<full message content>"
  }'
```

---

## STEP 5: WRITE RESPONSE TO direct_line_responses

After processing each message, write a summary response:

```
curl -s -X POST "https://gcbvvausrmbbkfazojpl.supabase.co/rest/v1/direct_line_responses" \
  -H "apikey: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Authorization: Bearer sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "message_id": "<source message id>",
    "agent": "direct-line-bridge",
    "content": "<summary -- see format below>"
  }'
```

Response content format:
- For brain_dump / redphone / freeform: "Processed. Extracted [N] tasks to [BUCKET] bucket ([horizon] horizon): [task title 1]; [task title 2]; ..."
- For task feedback (kind=task): "Feedback logged on task [tag UUID truncated to first 8 chars]."
- For prompt/launch: "Received. No task extraction needed for this message type."

Keep responses under 300 characters. No em dashes. Plain sentences.

The Realtime subscription in the dashboard is already wired to direct_line_responses INSERT events. The response will surface in the Direct Line panel automatically once written.

---

## STEP 6: MARK MESSAGE PROCESSED

```
curl -s -X PATCH "https://gcbvvausrmbbkfazojpl.supabase.co/rest/v1/direct_line_messages?id=eq.<message_id>" \
  -H "apikey: sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Authorization: Bearer sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"processed": true}'
```

Do this AFTER writing tasks and response. If either write fails, do not mark processed. Leave it in queue for retry.

---

## STEP 7: RUN REPORT

After all messages are processed, print a summary:

```
Bridge Agent Run: [timestamp]
Messages processed: [N]
Tasks created: [N] (breakdown by bucket if multiple)
Errors: [list any failed writes]
```

---

## ERROR HANDLING

- If a curl call returns a non-200 status or an error JSON body, log the error and skip that step.
- Do not crash the entire run if one message fails. Log the failure and continue to the next message.
- If tasks write fails, still write the response (noting the error) and still mark processed=true.
- If response write fails, still mark processed=true. The agent run report covers it.

---

## WHAT NOT TO DO

- Do not read or write CLAUDE.md files. This agent is read-only on brain files.
- Do not use the Supabase MCP. It reaches MIRROR project only. Use curl for all Command Center database calls.
- Do not hallucinate column names. The exact schema is in this file. Use it.
- Do not create more than 8 tasks per message.
- Do not include em dashes in any task title or response content.
```

---

## TASK 2: Fix Loading State Flash in v2-app.js

Edit this file:
`/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/v2-app.js`

Make exactly two changes. Do not touch anything else.

---

### Change A: Add is-loading class before initFromSupabase() is called

Find this line (near bottom of file, in the BOOT section, around line 1086):

```
  initFromSupabase();
```

Replace it with:

```
  document.body.classList.add('is-loading');
  initFromSupabase();
```

---

### Change B: Remove is-loading class at end of initFromSupabase()

Find the end of the initFromSupabase() function. It has both a try and catch path. The catch block looks like this (around lines 1068-1073):

```
    } catch (err) {
      console.error('initFromSupabase error:', err);
      toastErr('Supabase: ' + (err.message || 'connection failed'));
      setLineStatus(false);
    }
  }
```

Add the class removal inside both paths. The updated structure should be:

Inside the try block, right before the closing brace of try (find the last statement in the try block and add after it):

```
      document.body.classList.remove('is-loading');
```

Inside the catch block, add the same line before the closing brace:

```
    } catch (err) {
      console.error('initFromSupabase error:', err);
      toastErr('Supabase: ' + (err.message || 'connection failed'));
      setLineStatus(false);
      document.body.classList.remove('is-loading');
    }
  }
```

---

### Change C: Add CSS for is-loading state

Find the `<style>` block in index.html:
`/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`

Add these rules inside the style block (near the top of the CSS, after :root variables):

```
/* Loading state -- hides task lists until Supabase resolves */
body.is-loading .task-list-wrap { visibility: hidden; }
body.is-loading .energy-selector { visibility: hidden; }
body.is-loading #loadingSpinner { display: flex; }
#loadingSpinner {
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--fg-2, #888);
  font-size: 14px;
  letter-spacing: 0.05em;
}
```

Also add this HTML element to index.html, inside the `<body>` tag near the top:

```
<div id="loadingSpinner">Loading...</div>
```

---

## DO NOT

- Do not rewrite v2-app.js from scratch
- Do not touch Supabase connection code, table names, or the realtime subscription
- Do not add localStorage
- No em dashes in any string literals or comments
- Do not change v2-app.js file name or move it

---

## AFTER WRITING

Confirm:
1. The SKILL.md file was created at the correct path
2. The two changes to v2-app.js were made (class add before call, class remove in both paths)
3. The CSS and spinner HTML were added to index.html
4. No other files were touched

Do not deploy. Cowork handles QA and deployment after reviewing the changes.

---

## VERSION NOTE

This is Command Center v3. v2 QA was completed 2026-04-21 (see HANDOFF_CommandCenter_2026-04-21.md for full v2 QA record). These Phase 1 changes build on the working v2 baseline. The deployed site at aicontentnow.github.io/bodhi-command-center reflects v2. This session outputs v3 changes for Cowork QA before deploy.
```
