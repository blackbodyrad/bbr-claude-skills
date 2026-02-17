---
name: context-sentinel
description: Auto-preserves session context (plans, progress, decisions) to persistent memory files. Activates on multi-step tasks, planning mode, or when context pressure builds. Prevents information loss during compaction or session boundaries.
---

# Context Sentinel

Automatic context preservation system that ensures no work, decisions, or progress is lost when context compacts or sessions end.

**Core principle:** The cheapest token is one you never have to spend twice. Persist plans and progress so resumption is instant, not reconstructive.

## Architecture

### Two Roles

| Role | Agent Type | Model | When | Cost |
|------|-----------|-------|------|------|
| **Scribe** | general-purpose | Haiku | After each task or plan change | Low (~5k tokens) |
| **Curator** | general-purpose | Sonnet | Every 3-4 checkpoints or session end | Medium (~15k tokens) |

### File Structure

```
.claude/projects/{project}/memory/
├── MEMORY.md              # Durable learnings (curator-managed)
├── session-live.md        # Active session state (scribe-managed)
└── {topic}.md             # Topic-specific deep notes
```

### session-live.md Format

```markdown
# Active Session
**Started:** 2026-02-17T14:00
**Goal:** [High-level objective]

## Plan
| # | Task | Status | Agent |
|---|------|--------|-------|
| 1 | Fix admin email hardcode | done | main |
| 2 | HTML injection fix | done | main |
| 3 | Split ProductConfigurator | done | subagent |
| 4 | VIP notifications | in-progress | subagent |

## Decisions
- Used escapeHtml() pattern (not DOMPurify) — lighter, sufficient for email templates
- VIP tiers never downgrade — "savings account" philosophy

## Checkpoints

### CP-1 (14:15) — Security Fixes
- Completed: #1, #2
- Files: functions/index.js, api/contact/route.ts

### CP-2 (15:30) — Code Quality
- Completed: #3-#9 (via 3 parallel subagents)
- Files: 20+ files across configurator/, settings/

## Current State
- **Active task:** #4 VIP notifications
- **Blockers:** None
- **Next:** Push skill to GitHub
- **Context pressure:** Low

## Errors & Fixes (This Session)
- SanityImageSource import path doesn't exist → Parameters<typeof urlFor>[0]
- Firestore Timestamps vs Date → created TimestampOrDate union + toDate() helper
```

## When to Activate

### Automatic Triggers (Agent Should Self-Invoke)

1. **Session start with existing session-live.md** → Read it first. Resume from recorded state.
2. **After completing any task** → Spawn Scribe to checkpoint.
3. **After planning mode produces a plan** → Scribe records the plan immediately.
4. **Before spawning 2+ parallel subagents** → Scribe snapshots current state (insurance against rate limits).
5. **When context feels heavy** (many tool calls, large files read) → Checkpoint proactively.
6. **Session end** → Spawn Curator to consolidate durable learnings to MEMORY.md.

### Manual Trigger

User can invoke /checkpoint to force a snapshot at any time.

## The Scribe (Frequent, Lightweight)

### Prompt Template

```
You are the Context Sentinel Scribe. Your job is to update the session state file.

Read the current session-live.md (if it exists) at:
{memory_dir}/session-live.md

Then read the TAIL of the session transcript (last 200 lines):
{transcript_path}

Update session-live.md with:
1. Any newly completed tasks (update Plan table status)
2. New decisions made since last checkpoint
3. New checkpoint entry with: completed items, files modified, key insights
4. Updated "Current State" section
5. Any new errors & fixes

Rules:
- Keep the file under 200 lines (trim oldest checkpoints if needed)
- Never delete the Plan section — only update statuses
- Use append-style for checkpoints (newest at bottom)
- Be concise — this file is for machine consumption, not prose
```

### Spawn Pattern

```
Task({
  description: "Checkpoint session progress",
  subagent_type: "general-purpose",
  model: "haiku",
  run_in_background: true,
  prompt: SCRIBE_PROMPT
})
```

## The Curator (Infrequent, Thorough)

### Prompt Template

```
You are the Context Sentinel Curator. Your job is to extract DURABLE learnings.

Read session-live.md at:
{memory_dir}/session-live.md

Read current MEMORY.md at:
{memory_dir}/MEMORY.md

Update MEMORY.md with NEW durable learnings ONLY:
- Patterns confirmed across multiple uses (not one-off fixes)
- Architectural decisions that affect future work
- Error patterns and their solutions
- File paths and conventions discovered

Do NOT add:
- Session-specific state (that stays in session-live.md)
- Task lists or progress (ephemeral)
- Anything already in MEMORY.md

Keep MEMORY.md under 200 lines.
Move detailed notes to topic files and link from MEMORY.md.

After updating MEMORY.md, clean session-live.md:
- Keep Plan section (mark session as completed or paused)
- Remove checkpoint details older than the last 2
- Update Current State to reflect final status
```

## Planning Mode Scenarios

### Scenario 1: Plan Created Successfully
1. Agent enters plan mode, explores codebase, writes plan
2. **Scribe immediately records the plan** to session-live.md
3. User approves, agent exits plan mode and begins execution
4. Progress tracked via normal checkpoints

### Scenario 2: Context Compacts DURING Planning
1. Agent is mid-exploration in plan mode
2. Context pressure builds → compaction imminent
3. **Agent checkpoints BEFORE the plan is complete:**
   - Record what has been explored so far
   - Record tentative approach
   - Record what still needs investigation
4. After compaction/resumption, agent reads session-live.md
5. Continues planning from recorded state (no re-exploration)

### Scenario 3: Session Ends Mid-Plan
1. Agent writes partial plan to session-live.md with status "planning-incomplete"
2. Next session reads session-live.md, sees incomplete plan
3. Resumes planning (not implementation) from where it left off

### Scenario 4: Session Ends Mid-Execution
1. Scribe has been checkpointing throughout
2. session-live.md shows: Plan + which tasks done + current task
3. Next session reads file, picks up at the current task

## Resumption Protocol

At the start of EVERY session, check for session-live.md:

```
1. Read {memory_dir}/session-live.md
2. If exists and has active tasks:
   a. Report to user: "Resuming from checkpoint — X of Y tasks complete"
   b. Skip to the first incomplete task
   c. Do NOT re-read files or re-derive the plan
3. If exists but all tasks complete:
   a. Archive: rename to session-{date}.md
   b. Start fresh
4. If does not exist:
   a. Normal session start
```

## Cost Control

| Action | Token Cost | Frequency |
|--------|-----------|-----------|
| Scribe checkpoint | ~3-5k | Per task completion |
| Curator consolidation | ~10-15k | Every 3-4 checkpoints |
| Session resumption read | ~1k | Once per session |
| **Worst case per session** | **~30k** | 5 tasks + 1 curator |

Compare to cost of context loss: Re-reading files (~50k), re-deriving plan (~20k), re-exploring codebase (~100k+). The sentinel pays for itself after 1 recovery.

## Integration with Other Skills

### subagent-orchestration
- Before launching parallel subagents → Scribe checkpoints (rate limit insurance)
- After subagents complete → Scribe records their results

### Plan Mode
- On entering plan mode → Scribe records "planning started" + goal
- On plan approval → Scribe records full plan
- On plan rejection → Scribe records feedback for revision

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Checkpointing too often | Only after meaningful state changes, not every tool call |
| Writing prose to session-live.md | Keep it structured (tables, bullets) — for machines |
| Putting session state in MEMORY.md | session-live.md is ephemeral; MEMORY.md is durable |
| Forgetting to read session-live.md on start | Make it the FIRST action in every session |
| Running Curator too often | Every 3-4 checkpoints or session end — not after every task |
| Not checkpointing before parallel agents | Rate limits can kill agents mid-work — always snapshot first |
