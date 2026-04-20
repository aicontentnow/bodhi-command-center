# SKILLS AND BRAIN INVENTORY
## Phase 1 Audit -- 2026-04-20
## Status: COMPLETE -- awaiting Bodhi approval before Phase 2

This document is READ-ONLY output. No files were moved or edited to produce it.
Scanned via Desktop Commander mdfind + list_directory across entire Mac filesystem.

---

## CRITICAL FINDINGS (read first)

Four skills are marked "TODO (does not exist)" in bodhi-chief-of-staff SKILL.md.
All four EXIST on the Mac. The CoS skill is wrong and needs correction in Phase 2.

1. signal-transmission-writer: EXISTS at `.claude/skills/signal-transmission-writer/SKILL.md` (9810 bytes, Apr 15)
2. mirror-core-term-review: EXISTS at `.claude/skills/mirror-core-term-review/SKILL.md` (9176 bytes, Apr 15)
3. harmonic-blog-seo: EXISTS at `harmonic/skills/harmonic-blog-seo/SKILL.md` AND in Cowork session cache
4. seasons-production: EXISTS as an installed Cowork skill -- active in this session right now

Additionally: ldag-chief-of-staff is listed in the CoS as a real skill.
It is a 98-byte redirect stub that says "load ldag-cos instead." It is NOT a skill.

One rogue root-level folder (Hard Hat Healthcare/) duplicates the canonical framezero/clients/hhh/ brain.

---

## SECTION 1.1 -- Canonical skills/ folder
### Path: Claude-Workspace/skills/ (iCloud, natively reachable by Cowork)

| File | Size | Date | Notes |
|------|------|------|-------|
| skills/bodhi-chief-of-staff/SKILL.md | 9257 bytes | Apr 20 | Master portfolio CoS. Contains 4 incorrect TODO entries (see Critical Findings). |
| skills/ldag-chief-of-staff/SKILL.md | 98 bytes | Apr 20 | STUB ONLY. Redirects to ldag-cos. Not a real skill. |
| skills/ldag-cos/SKILL.md | 4153 bytes | Apr 20 | Canonical LDAG Chief of Staff. Real skill. |
| skills/ldag-episode-script/SKILL.md | 4835 bytes | Apr 20 | Episode drafting skill. Real skill. |
| skills/ldag-production-design/SKILL.md | 7289 bytes | Apr 20 | Real skill. |
| skills/ldag-song-writer/SKILL.md | 10954 bytes | Apr 20 | Real skill. |
| skills/plugin-blueprint-builder-SKILL.md | 24148 bytes | Mar 12 | MISNAMED. Flat file at skills/ root. Should be skills/plugin-blueprint-builder/SKILL.md. |

Total canonical skills/: 6 real skills, 1 stub, 1 misnamed flat file.

---

## SECTION 1.2 -- Hidden .claude/skills/ inside iCloud workspace root
### Path: Claude-Workspace/.claude/skills/ (hidden folder, NOT in canonical skills/)

These exist on disk but are invisible to normal Cowork browsing. Not referenced
in the canonical skills/ roster. Not listed as real skills in any brain file.
Bodhi-chief-of-staff SKILL.md says signal-transmission-writer and mirror-core-term-review
"do not exist" -- they are HERE.

| File | Size | Date | Notes |
|------|------|------|-------|
| .claude/skills/signal-transmission-writer/SKILL.md | 9810 bytes | Apr 15 | MIRROR project skill. CoS incorrectly marks as TODO. |
| .claude/skills/mirror-core-term-review/SKILL.md | 9176 bytes | Apr 15 | MIRROR project skill. CoS incorrectly marks as TODO. |
| .claude/skills/client-onboarding/SKILL.md | 10384 bytes | Mar 25 | Framezero/consulting skill. Not referenced anywhere in brains. |

Total hidden .claude/skills/: 3 real skills, none in canonical location, 2 erroneously marked as nonexistent.

---

## SECTION 1.3 -- Project-scoped skills (scattered across project folders)
### Not in canonical skills/, not in hidden .claude/skills/

These are embedded inside project folders with inconsistent naming conventions.

| File | Location Pattern | Notes |
|------|-----------------|-------|
| harmonic/skills/harmonic-blog-seo/SKILL.md | harmonic/skills/ | CoS marks as TODO. EXISTS. Also in Cowork session cache. |
| latedxaudhd/skills/ldag-transcript-intake/SKILL.md | latedxaudhd/skills/ | Real skill. |
| latedxaudhd/skills/ldag-transcript-intake.skill | latedxaudhd/skills/ | Wrong extension (.skill not .md). Likely old format. 3946 bytes. |
| mirror/_skills/tiktok-gap-scrape/SKILL.md | mirror/_skills/ | Underscore prefix convention. |
| mirror/_skills/website-publisher/SKILL.md | mirror/_skills/ | Underscore prefix convention. |
| mirror/.claude/skills/core-term-audit/SKILL.md | mirror/.claude/skills/ | Nested hidden .claude inside project folder. Mar 30. |
| mirror/blotato-plugin/skills/blotato-social/SKILL.md | mirror/blotato-plugin/skills/ | Plugin subfolder pattern. |
| _brain/skill-updates/project-handoff_SKILL.md | _brain/skill-updates/ | STRANDED. Skill file in brain satellite folder. 23720 bytes, Apr 8. |

Total project-scoped: 8 skill files across 6 different location patterns. None canonical.

---

## SECTION 1.4 -- Old Cowork session skills (.skills/skills/)
### Path: Claude-Workspace/.skills/skills/ (legacy session cache from March 20, 2026)

These are NOT user-authored skills. They were installed by an early Cowork session
as built-in scaffolding tools. They are not referenced in any brain file or CoS skill.
Candidates for archival.

design-md, enhance-prompt, react-components, remotion, session-handoff,
session-handoff-workspace, shadcn-ui, stitch-design, stitch-loop

Total legacy session skills: 9. None are user-authored. None referenced anywhere.

---

## SECTION 1.5 -- Cowork session cache (active installed skills)
### These are available NOW in this Cowork session via the skills plugin system

The following skills are installed and active in this session (confirmed via session context).
Note: seasons-production is in this list. CoS marks it as "TODO (not built)." It is wrong.

Active Cowork skills include (partial list -- full list visible in session):
- seasons-production (EXISTS and active -- CoS says TODO, INCORRECT)
- harmonic-blog-seo (EXISTS -- CoS says TODO, INCORRECT)
- ldag-transcript-intake
- plugin-blueprint-builder
- algorithmic-art, canvas-design, docx, pdf, pptx, xlsx, frontend-design
- skill-creator, luma-handoff, project-handoff, mcp-builder
- blotato-social (via blotato plugin)
- All brand-voice:, operations:, productivity:, design:, finance:, etc. plugin skills

---

## SECTION 1.6 -- CLAUDE.md Brain Files Inventory

| File | Size | Date | Status |
|------|------|------|--------|
| CLAUDE.md | 50814 bytes | Apr 20 | Master brain. Current. |
| framezero/CLAUDE.md | 8944 bytes | Mar 25 | Framezero project brain. |
| harmonic/CLAUDE.md | 54055 bytes | Apr 16 | Harmonic project brain. |
| harmonic/beacon-ism/CLAUDE.md | 9814 bytes | Apr 13 | Beacon sub-project brain. |
| latedxaudhd/CLAUDE.md | 41048 bytes | Apr 19 | LDAG project brain. |
| mirror/CLAUDE.md | 46506 bytes | Apr 16 | MIRROR project brain. |
| seasons/CLAUDE.md | 8267 bytes | Mar 21 | SEASØNS project brain. |
| Hard Hat Healthcare/CLAUDE.md | 7341 bytes | Apr 3 | ROGUE. Not in master routing table. Canonical is framezero/clients/hhh/CLAUDE.md. |
| Hard Hat Healthcare/framezero/CLAUDE.md | unknown | unknown | ROGUE nested. Duplicate of framezero/CLAUDE.md. |
| Hard Hat Healthcare/framezero/clients/hhh/CLAUDE.md | unknown | unknown | ROGUE nested. Duplicate of framezero/clients/hhh/CLAUDE.md. |

Total brain files: 7 canonical, 3 rogue (all inside Hard Hat Healthcare/ folder at workspace root).

---

## SECTION 1.7 -- Agent and Managed-Agent Files
### Path: mirror/managed-agent/ (autonomous MIRROR CoS, runs 5am daily)

| File | Size | Date | Notes |
|------|------|------|-------|
| chief_of_staff_prompt.md | 10192 bytes | Apr 15 | Autonomous MIRROR CoS prompt. READ-ONLY for all agents. |
| mirror_reflection_agent_prompt.md | 7143 bytes | unknown | Reflection agent prompt. |
| run_session.py | 29770 bytes | unknown | Agent runner script. |
| system_prompt.txt | 8981 bytes | unknown | System prompt for agent. |
| website_publisher_prompt.md | 6778 bytes | unknown | Website publisher agent prompt. |
| agent_config.json | 194 bytes | unknown | Agent configuration. |
| setup_agent.py | 2624 bytes | unknown | Setup script. |

No other managed-agent or agent folders found outside mirror/managed-agent/.

---

## SECTION 1.8 -- Rogue and Misplaced Items at Workspace Root

Items found at Claude-Workspace root that do not belong there:

| Item | Type | Issue | Resolution (Phase 4) |
|------|------|-------|---------------------|
| Hard Hat Healthcare/ | Folder | Duplicate of framezero/clients/hhh/. Contains 3 rogue CLAUDE.md files. | Archive to _archive/rogue-duplicates/Hard-Hat-Healthcare-root-copy/ |
| Bodhi 360/ | Folder | Old workspace name. Contents unknown. | Audit contents, archive or merge. |
| FRAMEZERØ CREATIVE/ | Folder | Old folder name. Canonical is framezero/. Contents unknown. | Audit contents, archive or merge. |
| Blog_Post_*.docx (multiple) | Files | Loose .docx drafts at root. Likely harmonic/ or framezero/ content. | Route to appropriate project folder. |
| Email_to_Sarah.docx | File | Harmonic stakeholder email. | Route to harmonic/ drafts. |
| cOS_SensAI*.docx | File | Harmonic SensAI brief. | Route to harmonic/. |
| cos_context/ | Folder | Unclear origin. Possibly CoS build artifacts. | Audit and route or archive. |
| cos_system_state.md | File | CoS system state. Possibly from a prior CoS build session. | Audit and route or archive. |
| data/ | Folder | Unknown. | Audit contents. |
| reports/ | Folder | Unknown. | Audit contents. |
| scripts/ | Folder | Unknown. | Audit contents. |
| session-handoff-eval-viewer.html | File | Session handoff evaluator. Dev artifact. | Archive. |

---

## SUMMARY TABLE -- Skills Location Patterns Found

| Pattern | Count | Canonical? | Cowork-Reachable? |
|---------|-------|-----------|-------------------|
| skills/<name>/SKILL.md | 6 real + 1 stub | YES | YES |
| skills/<name>-SKILL.md (flat, misnamed) | 1 | NO | YES (but wrong path) |
| .claude/skills/<name>/SKILL.md (hidden in workspace root) | 3 | NO | NO without Desktop Commander |
| <project>/skills/<name>/SKILL.md | 2 | NO | YES (if project mounted) |
| <project>/_skills/<name>/SKILL.md | 2 | NO | YES (if project mounted) |
| <project>/.claude/skills/<name>/SKILL.md | 1 | NO | NO without Desktop Commander |
| <project>/blotato-plugin/skills/<name>/SKILL.md | 1 | NO | Via plugin system |
| _brain/skill-updates/<name>_SKILL.md | 1 | NO | YES (but wrong folder) |
| .skills/skills/<name>/ (old session cache) | 9 | NO | N/A (legacy) |

Total unique skill files found across all locations: approximately 26.
Total in canonical location (skills/): 6 real skills.

---

## PHASE 1 COMPLETE

All scanning done. No files were moved, edited, or deleted.

Awaiting Bodhi approval to proceed to Phase 2:
Correct the 4 incorrect "TODO" entries in bodhi-chief-of-staff SKILL.md
and document the ldag-chief-of-staff stub accurately.
