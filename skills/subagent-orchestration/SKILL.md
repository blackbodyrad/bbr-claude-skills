---
name: subagent-orchestration
description: Use when facing tasks that benefit from parallel work, context preservation, background monitoring, or when approaching context limits. Triggers on multi-file research, test suites, server debugging, feature implementation with tests, or pre-implementation context gathering.
---

# Subagent Orchestration

Efficient patterns for deploying subagents to maximize throughput, preserve context, and parallelize independent work in Claude Code.

**Core principle:** Your main conversation is expensive real estate. Delegate verbose, exploratory, or independent work to subagents so the main thread stays focused on decision-making and implementation.

## When to Use Subagents

- Task produces verbose output (test suites, logs, large diffs)
- Multiple independent investigations needed simultaneously
- Context window approaching capacity
- Long-running process needs monitoring
- Feature work and test writing can happen in parallel
- Pre-implementation research across docs, codebase, or web

## When NOT to Use

- Single-file, quick edits (subagent startup overhead not worth it)
- Tasks requiring frequent back-and-forth with the user
- Sequential work where each step depends on the previous

## The 6 Core Patterns

### 1. Context Priming (Pre-Implementation Research)

**When:** About to implement a feature on an existing codebase.

Deploy a background subagent to gather codebase context BEFORE you start coding. The subagent explores the architecture, finds relevant patterns, and returns a focused summary.

```
Use a background Explore subagent to:
1. Find all files related to [feature area]
2. Identify existing patterns and conventions
3. Map dependencies and integration points
4. Return a summary of architecture and patterns found
```

**Key:** Use `Explore` agent type (read-only, Haiku model = fast and cheap). Run in background so you can continue planning.

### 2. Parallel Research

**When:** Need information from multiple independent sources.

Spawn multiple background subagents simultaneously -- each researching a different angle.

```
Launch 3 background agents in parallel:
1. Agent 1: Search codebase for existing auth patterns
2. Agent 2: Fetch library documentation for [package]
3. Agent 3: Find similar implementations on GitHub
```

**Key:** All agents must be independent (no shared dependencies). Use `run_in_background: true`. Synthesize results after all complete.

### 3. Memory Extraction (Context Window Rescue)

**When:** Approaching context limit and need to preserve session knowledge.

Deploy a background subagent that reads your session transcript and extracts key decisions, patterns, and progress into a persistent file.

```
Launch a background general-purpose subagent to:
1. Read the current session transcript
2. Extract: decisions made, files modified, patterns discovered,
   current task state, and next steps
3. Write findings to a working memory file for the next session
```

**Key:** Do this BEFORE you hit the limit, not after. The subagent reads the transcript .jsonl file and writes to your memory directory or a handoff file.

### 4. Server Log Monitoring

**When:** Testing an app with a local dev server.

Launch the dev server as a background Bash task, then check logs as needed during testing.

**Key:** Use `run_in_background: true` on the Bash tool for the server process. Use `TaskOutput` with `block: false` to peek at logs without waiting. Kill with `TaskStop` when done.

### 5. Background Test Writing

**When:** Implementing a feature in the main thread.

While you write the feature code, a background subagent writes tests for it simultaneously.

```
Launch a background general-purpose subagent to:
1. Read the feature specification and interface
2. Write unit tests covering happy path, edge cases, error handling
3. Write integration tests for API/data layer
4. Save tests to the appropriate test directory
```

**Key:** Share the interface/types with the test-writing agent upfront so tests align with your implementation. Review tests after both complete.

### 6. Isolating Verbose Operations

**When:** Running test suites, linters, or build processes that produce large output.

Delegate to a subagent so only the summary returns to your context.

```
Use a subagent to run the full test suite and report:
- Total passed/failed/skipped
- Only failing test names and error messages
- No passing test output
```

**Key:** The subagent's context absorbs the verbose output. You get a clean summary.

## Decision Matrix

| Situation | Pattern | Agent Type | Background? |
|-----------|---------|------------|-------------|
| Need codebase context | Context Priming | Explore | Yes |
| Multiple independent lookups | Parallel Research | Explore | Yes |
| Context window filling up | Memory Extraction | general-purpose | Yes |
| Local server testing | Log Monitoring | Bash (background task) | Yes |
| Feature + tests simultaneously | Test Writing | general-purpose | Yes |
| Running test suite | Isolate Verbose | general-purpose | No |
| Code review after changes | Review | code-reviewer | No |

## Build Verification Rule

**CRITICAL:** Any subagent that modifies code MUST verify the build passes before reporting done.

**Why:** Type changes, import updates, and interface modifications often cause cascading build failures in other files. A subagent that reports "done" without building leaves broken code for the main thread to fix — defeating the purpose of delegation.

**How to enforce:**
1. Always use `mode: "bypassPermissions"` for code-modifying subagents (grants Bash access for builds)
2. Include this instruction in every code-modifying subagent prompt:

```
MANDATORY: After all edits, run the project build command and fix any errors before reporting done.
Build command: cd /path/to/project && rm -rf .next && npm run build
If the build fails, fix the errors and rebuild until green. Do NOT report completion with a failing build.
```

3. If the subagent cannot build (permissions, missing deps), it must explicitly state what was NOT verified

**Common cascading failures to watch for:**
- Changing a shared type/interface breaks all consumers
- Adding imports from paths that don't exist in the installed package version
- Narrowing `any` to a specific type without checking all call sites
- Firestore returns Timestamps, not Dates — `any` → `Date` will break `.seconds` access

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Spawning subagent for a 5-line edit | Do it in main thread -- startup overhead not worth it |
| Running dependent tasks in parallel | Chain them sequentially; parallel only for independent work |
| Forgetting to check background results | Use `TaskOutput` to retrieve results before acting on assumptions |
| Launching too many parallel agents | 2-4 is optimal; more creates context pressure when results return |
| Not specifying agent type | Use `Explore` for read-only, `general-purpose` for modifications |
| Using foreground for long research | Background frees you to continue; foreground blocks |
| Not requiring build verification | Always include build command in code-modifying subagent prompts |

## Agent Type Quick Reference

| Type | Model | Tools | Best For |
|------|-------|-------|----------|
| `Explore` | Haiku (fast) | Read-only | Codebase search, file discovery, research |
| `Plan` | Inherits | Read-only | Architecture analysis, planning |
| `general-purpose` | Inherits | All tools | Complex tasks, code modifications, tests |
| Custom (`.claude/agents/`) | Configurable | Configurable | Domain-specific workflows |
