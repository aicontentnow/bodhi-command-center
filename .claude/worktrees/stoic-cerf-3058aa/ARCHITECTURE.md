# Bodhi Command Center -- Architecture

## v0.1 (Current): Static Prototype

Single HTML file with hardcoded data. React 18 via CDN, no build step.
Purpose: validate layout, visual design, and information hierarchy before connecting live data.

---

## Supabase Schema (v1.0 Target)

### Table: projects

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| slug | text, unique | e.g. "seasons", "mirror" |
| name | text | Display name with special chars |
| status | text | "active" or "idle" |
| accent_color | text | Hex color for UI accent |
| last_activity_at | timestamptz | Updated by agents or manual |
| brain_path | text | Relative path to project CLAUDE.md |
| created_at | timestamptz | |

### Table: agents

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| name | text | Human-friendly display name |
| task_id | text | Matches scheduled task ID |
| group_label | text | "Mirror Publishing", "Daily Operations", etc. |
| schedule_human | text | "Daily 7am", "MWF 10am" |
| schedule_cron | text | For programmatic reference |
| status | text | "enabled", "disabled", "running" |
| last_run_at | timestamptz | |
| last_run_result | text | "success", "error", "skipped" |
| created_at | timestamptz | |

### Table: activity_feed

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| source | text | Agent name or project slug |
| message | text | Human-readable event description |
| severity | text | "info", "warning", "action_needed" |
| created_at | timestamptz | Ordered by this descending |
| project_id | uuid, FK | Optional link to projects table |
| agent_id | uuid, FK | Optional link to agents table |

### Table: attention_items

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| message | text | What needs Bodhi's input |
| priority | int | 1 = urgent, 3 = can wait |
| source | text | Which agent or process created it |
| resolved | boolean | Default false |
| created_at | timestamptz | |
| resolved_at | timestamptz | Null until resolved |

### Row Level Security

All tables use Supabase RLS with a single authenticated user (Bodhi).
Service role key used by scheduled tasks to write. Anon key used by dashboard to read.

---

## How Scheduled Tasks Write to Supabase

Each scheduled task (Cowork session) gains write access via Supabase REST API.

### Pattern

1. Task starts, marks its `agents` row: `status = "running"`, `last_run_at = now()`
2. Task does its work (Gmail check, KB audit, etc.)
3. Task writes results to `activity_feed` (one or more rows)
4. If something needs Bodhi's input, task writes to `attention_items`
5. Task marks its `agents` row: `status = "enabled"`, `last_run_result = "success"`

### Implementation

A shared Python module or shell function handles the Supabase calls:

```
supabase_post "activity_feed" '{"source":"kb-audit","message":"3 stale refs found","severity":"info"}'
```

Or from a Cowork skill:

```bash
curl -s -X POST "$SUPABASE_URL/rest/v1/activity_feed" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source":"kb-audit","message":"3 stale refs found"}'
```

### Credentials

Stored in `Claude-Workspace/data/brain-dump-keys.env`:
- SUPABASE_URL
- SUPABASE_ANON_KEY (dashboard reads)
- SUPABASE_SERVICE_KEY (agent writes)

---

## How the Dashboard Reads from Supabase

### v1.0 approach: Direct Supabase client

The HTML dashboard uses `@supabase/supabase-js` via CDN to query directly.

```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch projects
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .order('last_activity_at', { ascending: false });

// Fetch recent activity
const { data: feed } = await supabase
  .from('activity_feed')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20);

// Fetch unresolved attention items
const { data: attention } = await supabase
  .from('attention_items')
  .select('*')
  .eq('resolved', false)
  .order('priority', { ascending: true });
```

### v1.5 approach: Supabase Realtime

Subscribe to changes so the dashboard updates live without polling:

```javascript
supabase
  .channel('activity')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_feed' },
    payload => addFeedItem(payload.new))
  .subscribe();
```

---

## Roadmap

### v0.1 -- Static Prototype (current)
- Hardcoded data, single HTML file
- Visual design validation
- Light/dark theme
- Responsive layout

### v0.2 -- Supabase Connection
- Create Supabase project and tables
- Connect dashboard to live reads
- Wire 2-3 agents to write activity + status
- Auto-refresh on 60s interval

### v0.5 -- Live Fleet
- All scheduled tasks writing to Supabase
- Realtime subscriptions (no polling)
- Attention items can be resolved from dashboard
- Agent enable/disable toggle from dashboard

### v0.7 -- Interaction Layer
- Click project card to see recent activity filtered to that project
- Click agent to see run history
- Quick actions: "Approve draft", "Mark reviewed", "Snooze"

### v1.0 -- Production
- Hosted on Netlify or Vercel (static site, Supabase backend)
- Auth gate (Supabase auth, single user)
- Mobile PWA support
- Push notifications for high-priority attention items
- Agent health monitoring (alert if agent misses scheduled run)
- Historical analytics: agent run success rates, project activity trends

### v1.5 -- Intelligence Layer
- Natural language command input: "Run KB audit now", "Pause outreach until Monday"
- Agent dependency graph visualization
- Predictive attention: surface items likely to need action soon
- Weekly digest auto-generated from activity feed

---

## Hosting

v0.1: Local file, opened in browser.
v1.0+: Static HTML deployed to Netlify. Supabase handles all backend.
No server required. The entire system is serverless.

---

## File Structure

```
_command-center/
  index.html          -- The dashboard (single file)
  ARCHITECTURE.md     -- This document
```

Future:
```
_command-center/
  index.html
  ARCHITECTURE.md
  supabase/
    schema.sql        -- Table creation DDL
    seed.sql          -- Initial data for projects and agents
    rls-policies.sql  -- Row level security setup
```
