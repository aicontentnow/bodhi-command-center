# Command Center: Add CoS Prompt Card
## For: Claude Code
## Version: v3 patch (adds one prompt card to Key Prompts section)
## Builds on: v3 round 4 (QA confirmed 2026-04-21)

---

## READ THIS FILE FIRST

`/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center/index.html`

Targeted edit only. Do not touch anything else.

---

## THE CHANGE

Find the Key Prompts section in index.html. It contains a list of prompt cards. Each card has a title, a description, and a copy button.

Add one new card at the TOP of the prompt card list (before all existing cards):

Title: `Command Center CoS`
Description: `Spin up a new Chief of Staff session to continue Phase 2 development.`
Prompt text (this is what gets copied when the user clicks the copy button):

```
Load this skill and follow its instructions:
skills/command-center-cos/SKILL.md

Read the most recent handoff doc in _command-center/ for current state.
Supabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl).
Check in with Bodhi before starting any build work.
```

Match the exact card style and copy-button pattern of the existing prompt cards. Do not change any existing cards.

---

## DEPLOY WHEN DONE

```
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/_command-center" && git add index.html && git commit -m "deploy: add CoS prompt card to key prompts 2026-04-21" && git push origin main
```

Confirm deployed. No QA needed for this change -- it is a single card addition with no logic.
