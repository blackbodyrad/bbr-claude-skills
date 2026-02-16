---
name: house-party-protocol
description: Use when a task is complex enough for multiple agents to work in parallel, communicate, assist each other, and converge on best solutions. Triggers on large features, multi-file refactors, competing hypotheses, debugging, or any task where orchestration beats intelligence.
---

# House Party Protocol

Multi-agent team orchestration where agents self-organize, communicate, swarm to help each other, and converge on the best solution — like a university study group, not a military hierarchy.

**Core principle:** Better orchestration beats smarter models. Break work into focused subtasks, let agents solve them in parallel, and when someone finishes — they join whoever needs help most.

## When to Use

- Complex feature spanning 4+ files
- Problem with multiple valid approaches (need consensus)
- Research from multiple angles simultaneously
- Debugging with competing hypotheses
- Large refactors where agents can own separate modules

## When NOT to Use

- Single-file edits or quick fixes
- Sequential tasks with hard dependencies between every step
- Tasks where coordination overhead exceeds the work itself

## Prerequisites

Enable agent teams (experimental):

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
- **Split panes** (tmux/iTerm2): Each agent gets its own pane

---

## The 7 Party Rules

### Rule 1: The Host Sets the Table (Lead in Delegate Mode)

The lead NEVER codes. It decomposes work, spawns teammates, manages tasks, and synthesizes results. Always use **delegate mode** (Shift+Tab after team creation).

```
Create an agent team for [task]. Use delegate mode.
Spawn teammates with single responsibilities:
- [Name]: [focused responsibility] — owns [specific files]
- [Name]: [focused responsibility] — owns [specific files]
```

**Why delegate mode matters:** Without it, the lead starts implementing instead of coordinating. A host who cooks, serves, and DJs does everything poorly.

### Rule 2: Guests Arrive Briefed (Context-Rich Spawning)

Teammates don't inherit conversation history. Give them everything upfront:

```
Spawn teammate "auth-specialist" with prompt:
"You own src/auth/ and tests/auth/.
Task: Implement JWT refresh token rotation using httpOnly cookies.
When done: Message 'api-worker' with the new token interface.
If stuck: Message the lead for help or ask a free teammate."
```

**Must include in every spawn:**
- File ownership (which files they own exclusively)
- Task scope (what to build)
- Communication targets (who to message when done or stuck)
- Permission to ask for help

### Rule 3: Guests Talk Directly (Peer Communication)

Teammates message each other — the lead doesn't relay everything. This is what separates teams from subagents.

**Communication patterns:**
- **Handoff:** "Auth module done. Here's the interface: [contract]"
- **Help request:** "Stuck on rate limiting. Anyone free to assist?"
- **Challenge:** "Your session handler has a race condition. Consider a mutex."
- **Status update:** "Security scan 60% done. Covering auth, API, and input validation. Still need: CSRF, file upload, and secrets scanning."

### Rule 4: The Study Group (Swarming Pattern)

This is the core differentiator. When agents finish their task, they don't just grab random work. They **join a busy agent and become their study group.**

**How it works:**

1. Agent A finishes its task
2. Agent A checks TaskList — no unclaimed tasks
3. Agent A messages the busiest teammate: "I'm free. What can I take off your plate?"
4. Busy agent responds with a briefing: "Here's what I've done so far, here's what's left. Take [subtask X]."
5. If another agent (Agent B) also finishes, it joins too
6. The original agent becomes the **guide** — coordinating the swarm

**Example:**

```
Security agent is working alone on a full security audit.
Frontend-cleanup agent finishes. Messages security agent: "I'm free, need help?"
Effects agent also finishes. Messages security agent: "Also free."

Security agent responds to both:
"Done so far: auth module, API endpoints.
Remaining: CSRF protection, file upload validation, secrets scanning.
Frontend-cleanup: take CSRF — check all forms for tokens.
Effects: take file upload — check size limits and type validation.
I'll finish secrets scanning."

All three work security subtasks in parallel. Security agent guides.
```

**Key:** The guide agent has the domain context. Helpers follow its lead. No limit on how many helpers can join — it scales naturally.

**Spawn prompt addition for all teammates:**
```
When you finish your task:
1. Check TaskList for unclaimed work
2. If none: message the teammate who's still working
3. Ask: "I'm free. What can I take off your plate?"
4. Follow their guidance — they know the domain context
```

### Rule 5: Bring the Best to the Table (Model Selection)

Not all agents need the same brain. Match model to role:

| Role Type | Model | Why |
|-----------|-------|-----|
| **Specialists** (security, architecture, performance) | **Opus** | Deep reasoning, catches subtle issues |
| **Workers** (implementation, tests, refactoring) | **Sonnet** | Fast, capable, cost-effective |
| **Scouts** (research, file discovery, quick checks) | **Haiku** | Cheap, fast, good enough for exploration |
| **Lead** | **Inherits** | Uses whatever the session runs |

```
Spawn teammate "security-specialist" with model opus and prompt:
"You are a senior security engineer with deep expertise..."

Spawn teammate "frontend-worker" with model sonnet and prompt:
"Implement the dashboard components in src/components/..."

Spawn teammate "codebase-scout" with model haiku and prompt:
"Find all files that handle user authentication..."
```

**Specialists always get Opus.** When you need expertise, send the best. A security review by Haiku is worse than no review — it creates false confidence.

### Rule 6: The Vote (Consensus Mechanisms)

For decisions with multiple valid approaches, don't let one agent decide. Use consensus.

**Pattern A — Adversarial Debate (strongest):**
```
Spawn 3 teammates to each independently design the caching layer.
Each must critique the other two designs.
The design that survives the most challenges wins.
```

**Pattern B — Parallel Implementation + Judge:**
```
Spawn 2 teammates to each implement the same feature independently.
Spawn a third "judge" agent (Opus) to compare both implementations
on: correctness, readability, performance, edge cases.
Lead picks the winner based on judge report.
```

**Pattern C — Majority Agreement:**
```
Spawn 3 agents to each review the same code independently.
Issues flagged by 2+ agents are real. Issues flagged by only 1 need discussion.
```

### Rule 7: Quality Gates (Hook Enforcement)

Use hooks to prevent premature completion and enforce standards:

**TeammateIdle hook** — catch agents trying to stop too early:
```json
{
  "hooks": {
    "TeammateIdle": [{
      "hooks": [{
        "type": "command",
        "command": "./scripts/check-teammate-done.sh"
      }]
    }]
  }
}
```

**TaskCompleted hook** — validate work before marking done:
```json
{
  "hooks": {
    "TaskCompleted": [{
      "hooks": [{
        "type": "command",
        "command": "./scripts/validate-task.sh"
      }]
    }]
  }
}
```

Exit code 2 from the hook script blocks completion and sends feedback to the agent.

---

## Party Compositions

### The Research Party
| Role | Model | Responsibility |
|------|-------|---------------|
| Lead | inherit | Decomposes question, synthesizes findings |
| Researcher A | haiku | Codebase analysis |
| Researcher B | haiku | Documentation and external sources |
| Researcher C | haiku | Similar implementations / prior art |
| Devil's Advocate | opus | Challenges all findings, finds holes |

### The Build Party
| Role | Model | Responsibility |
|------|-------|---------------|
| Lead (delegate) | inherit | Task management only |
| Frontend Worker | sonnet | UI components and pages |
| Backend Worker | sonnet | API endpoints and data layer |
| Test Writer | sonnet | Tests for both, runs suite |
| Architect | opus | Reviews integration points, catches design issues |

### The Debug Party
| Role | Model | Responsibility |
|------|-------|---------------|
| Lead | inherit | Coordinates hypotheses, picks winner |
| Hypothesis A | sonnet | Investigates theory 1 |
| Hypothesis B | sonnet | Investigates theory 2 |
| Hypothesis C | sonnet | Investigates theory 3 |
| Reproducer | haiku | Creates minimal reproduction case |

### The Review Party
| Role | Model | Responsibility |
|------|-------|---------------|
| Security Reviewer | opus | Vulnerabilities, auth, injection, secrets |
| Performance Reviewer | opus | Bottlenecks, memory, query optimization |
| Quality Reviewer | sonnet | Tests, readability, maintainability |

---

## Task Sizing Guide

| Size | Example | Agents |
|------|---------|--------|
| Too small | Fix a typo | 1 (don't use teams) |
| Just right | Implement auth module | 3-4 |
| Just right | Full-stack feature | 4-5 |
| Too large | Rewrite entire app | Split into phases first |

**Sweet spot:** 5-6 tasks per teammate.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Lead starts coding | Use delegate mode (Shift+Tab) |
| Same file owned by 2 agents | Assign exclusive file ownership |
| No context in spawn prompt | Include files, scope, communication targets |
| All agents use same model | Match model to role (Rule 5) |
| Agent finishes and goes idle | Study group pattern — join a busy agent (Rule 4) |
| Single agent makes critical decision | Use consensus voting (Rule 6) |
| No quality checks | Add TeammateIdle/TaskCompleted hooks (Rule 7) |

## What This Adds Beyond Vanilla Agent Teams

| Vanilla Agent Teams | House Party Protocol |
|---|---|
| Spawn teammates with tasks | **Study group swarming** — free agents join busy ones with guided subtask splitting |
| Self-claim next task | **Context-aware helping** — guide agent briefs helpers on domain state |
| All agents same model | **Model-per-role strategy** — Opus specialists, Sonnet workers, Haiku scouts |
| No built-in consensus | **3 consensus patterns** — adversarial debate, parallel+judge, majority |
| Manual quality checks | **Hook-based gates** — TeammateIdle and TaskCompleted enforcement |
| Generic team structure | **Pre-built party compositions** with model assignments per role |
