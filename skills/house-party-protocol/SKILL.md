---
name: house-party-protocol
description: Use when a task is complex enough for multiple agents to work in parallel, communicate, assist each other, and vote on best solutions. Triggers on large features, multi-file refactors, competing hypotheses, research with multiple angles, or any task where orchestration beats intelligence.
---

# House Party Protocol

Multi-agent team orchestration where agents self-organize, communicate, assist each other, and converge on the best solution — like guests at a house party, not soldiers in a chain of command.

**Core principle:** You don't need smarter models, you need better orchestration. Break work into independent subtasks, let multiple agents solve them in parallel, and use consensus to pick the best results.

## When to Use

- Complex feature spanning 4+ files
- Problem with multiple valid approaches (need consensus)
- Research from multiple angles simultaneously
- Debugging with competing hypotheses
- Large refactors where agents can own separate modules
- Any task where a single agent would take 30+ minutes

## When NOT to Use

- Single-file edits or quick fixes
- Sequential tasks with hard dependencies between every step
- Simple CRUD or boilerplate generation
- Tasks where coordination overhead exceeds the work itself

## The Party Rules

### 1. The Host Sets Up (Team Lead)

The lead decomposes the task, creates the shared task list, and spawns focused teammates. The lead should use **delegate mode** (Shift+Tab) to avoid doing implementation work itself.

```
Create an agent team for [task]. Spawn teammates:
- [Name]: [focused responsibility]
- [Name]: [focused responsibility]
- [Name]: [focused responsibility]
Use delegate mode. Each teammate owns their files.
```

**Key:** Each teammate gets a **single responsibility** — lean and focused, not overloaded.

### 2. Guests Arrive with Context (Spawning)

Teammates don't inherit the lead's conversation history. Give them everything they need upfront in the spawn prompt:

```
Spawn a teammate named "auth-worker" with prompt:
"You own src/auth/. Implement JWT refresh token rotation.
The app uses httpOnly cookies. Tests go in tests/auth/.
When done, message 'api-worker' about the new token format."
```

**Key:** Include file ownership, task scope, and WHO to communicate with.

### 3. Guests Talk to Each Other (Direct Messaging)

Unlike subagents, teammates can message each other directly. This is the superpower.

**Patterns:**
- **Handoff:** "I finished the auth module. Here's the interface you need: [details]"
- **Help request:** "I'm stuck on rate limiting. Can someone with networking experience assist?"
- **Challenge:** "Your approach has a race condition in the session handler. Consider using a mutex."

The lead doesn't need to relay every message. Agents self-organize.

### 4. Finished Guests Help Others (Dynamic Reallocation)

When an agent finishes its task, it checks the shared task list and **claims the next unblocked task** — or messages a struggling teammate to assist.

```
Tell teammates: "When you finish your task, check TaskList for
unclaimed work. If none available, message a teammate who's still
working and offer to help with their subtasks."
```

**Key:** No idle agents. Everyone contributes until the party's over.

### 5. The Vote (Consensus Mechanism)

For decisions with multiple valid approaches, spawn competing agents and have them challenge each other:

```
Spawn 3 teammates to each independently design the caching layer.
Have them present their approach, then critique each other's designs.
The lead picks the approach that survives the most challenges.
```

**Voting patterns:**
- **Majority wins:** 3 agents implement, pick the solution 2+ agree on
- **Adversarial debate:** Agents actively try to disprove each other's approach
- **Lead decides:** Agents present options, lead (or user) picks

### 6. Specialists on Call

Some teammates are generalists, others are specialists. Generalists can **request specialist help:**

```
Create tasks with skill tags. When a teammate encounters work
outside their expertise, they message the lead: "Need a security
specialist to review my auth implementation." The lead spawns
or reassigns accordingly.
```

## Team Compositions

### The Research Party (3-5 agents)
| Role | Responsibility |
|------|---------------|
| Lead | Decomposes question, synthesizes findings |
| Researcher A | Codebase analysis |
| Researcher B | Documentation and external sources |
| Researcher C | Similar implementations / prior art |
| Devil's Advocate | Challenges all findings |

### The Build Party (3-4 agents)
| Role | Responsibility |
|------|---------------|
| Lead (delegate mode) | Task management, no coding |
| Frontend Worker | UI components and pages |
| Backend Worker | API endpoints and data layer |
| Test Writer | Tests for both, runs suite |

### The Debug Party (3-5 agents)
| Role | Responsibility |
|------|---------------|
| Lead | Coordinates hypotheses, picks winner |
| Hypothesis A | Investigates theory 1 |
| Hypothesis B | Investigates theory 2 |
| Hypothesis C | Investigates theory 3 |
| Reproducer | Creates minimal reproduction case |

### The Review Party (3 agents)
| Role | Responsibility |
|------|---------------|
| Security Reviewer | Vulnerabilities, auth, input validation |
| Performance Reviewer | Bottlenecks, memory, query optimization |
| Quality Reviewer | Tests, readability, maintainability |

## Task Sizing Guide

| Size | Example | Agents | Duration |
|------|---------|--------|----------|
| Too small | Fix a typo | 1 (don't use teams) | < 1 min |
| Just right | Implement auth module | 3-4 | 5-15 min |
| Just right | Full-stack feature | 4-5 | 10-20 min |
| Too large | Rewrite entire app | Split into phases first | - |

**Sweet spot:** 5-6 tasks per teammate. Enough to stay productive, small enough for check-ins.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Lead starts coding instead of delegating | Use delegate mode (Shift+Tab) |
| Teammates editing the same file | Assign clear file ownership per agent |
| No context in spawn prompt | Include files, scope, and communication targets |
| Running team for trivial tasks | Use a single session or subagent instead |
| Letting team run unattended too long | Check in, redirect, synthesize as findings arrive |
| Too many teammates (6+) | Token cost scales linearly; 3-5 is the sweet spot |
| Not using direct messaging | Remind agents to message each other, not just the lead |

## Setup Requirements

Agent teams are experimental. Enable first:

```json
// ~/.claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**Display modes:**
- **In-process** (default): Shift+Up/Down to navigate teammates
- **Split panes** (tmux/iTerm2): Each agent gets its own terminal pane
