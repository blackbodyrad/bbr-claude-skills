# BBR Claude Skills — Progress & Decisions

## Project Vision
Build a collection of battle-tested Claude Code skills that push AI agent orchestration beyond vanilla capabilities. Open source under blackbodyrad.

## Accounts
- **npm:** gerrypaps → `npx bbr-claude-skills`
- **GitHub:** blackbodyrad → github.com/blackbodyrad/bbr-claude-skills
- **Personal GitHub:** dr-snob (Coco Snob + personal projects)

---

## Skills Released

### 1. subagent-orchestration (v1.0.0)
- **Released:** 2026-02-13
- **Purpose:** 6 patterns for efficient subagent deployment
- **Status:** Published

### 2. house-party-protocol (v2.0.0)
- **Released:** 2026-02-14 (v1), 2026-02-16 (v2)
- **Purpose:** Multi-agent team orchestration with study group swarming, model-per-role, consensus, hooks
- **Status:** v2 published — full rewrite with all differentiators implemented

---

## Key Decisions

### D1: npm over curl for installation
- **Date:** 2026-02-13
- **Decision:** Use `npx bbr-claude-skills` instead of long curl command
- **Rationale:** Short, memorable, cross-platform, no permanent install needed

### D2: Interactive scope selection during install
- **Date:** 2026-02-13
- **Decision:** Let users choose global (~/.claude/skills/) vs project (.claude/skills/)
- **Rationale:** Global = personal use across projects. Project = team sharing via git.

### D3: blackbodyrad as open-source brand
- **Date:** 2026-02-14
- **Decision:** Separate GitHub account for all open-source AI/dev tools
- **Rationale:** Keep personal projects (dr-snob) separate from community contributions

### D4: House Party Protocol — differentiation from vanilla agent teams
- **Date:** 2026-02-14
- **Decision:** The skill must ADD value beyond what agent teams do out of the box
- **v1 audit (gaps found):**
  - Model selection strategy: NOT in skill
  - Study group pattern: NOT in skill (only basic task claiming)
  - Quality gates via hooks: NOT in skill
  - Consensus voting: shallow, needs depth
- **v2 must include:**
  - **Study Group Pattern (core differentiator):** When agents finish their task, they don't just claim random work. They JOIN a busy agent's task. The busy agent becomes the "guide" — briefs helpers on progress, splits remaining work into subtasks, coordinates. Like a university group project. NOT limited to 2 helpers — any number of free agents can swarm to help.
  - **Model selection:** Specialists = Opus (best, wealth of experience). Workers = Sonnet (fast). Scouts = Haiku (cheap research).
  - **Structured party compositions** with model assignments per role
  - **Hook-based quality gates** (TeammateIdle, TaskCompleted)
  - **Consensus mechanisms** (adversarial debate, majority, leader decides)
  - **Error recovery** (re-spawn failed agents with context handoff)
- **What vanilla teams DON'T do:**
  - No study group swarming pattern
  - No model-per-role strategy
  - No structured party templates
  - No adversarial validation built in

### D5: Specialist model selection
- **Date:** 2026-02-14
- **Decision:** Specialists always spawn with Opus (best model = wealth of experience)
- **Rationale:** Workers can use Sonnet for speed. Specialists need depth and precision.

### D6: Study Group Pattern (refined "two heads" principle)
- **Date:** 2026-02-14
- **Decision:** NOT hardcoded to 2 agents. Any number of free agents swarm to help busy ones.
- **Example:** Security agent working alone. Frontend cleanup + effects agents both finish. Both join security. Security agent guides them: "Here's what I've done, here's what's left." Splits remaining work. All three work in parallel on security subtasks.
- **Metaphor:** University study group / group project — one person leads the session, others contribute where they can.

---

## Upcoming Ideas
- [x] v2 rewrite of house-party-protocol with study group + model strategy ✅
- [x] Hook-based quality gates (TeammateIdle, TaskCompleted) ✅
- [ ] No hard limit found on team size (Anthropic doesn't document one). Practical: 3-5.
- [ ] Test with real Coco Snob tasks to validate patterns
- [ ] New skill ideas: TDD workflow, debugging protocol, code review orchestration

---

## Session Log

### Session 1 (2026-02-13 → 2026-02-14)
- Created bbr-claude-skills project
- Published subagent-orchestration skill
- Set up npm (gerrypaps) + GitHub (blackbodyrad)
- Built npx installer with interactive scope selection
- Created house-party-protocol v1
- Identified need to differentiate from vanilla agent teams

### Session 2 (2026-02-16)
- Full v2 rewrite of house-party-protocol
- Added: Study Group Swarming (Rule 4), Model Selection (Rule 5), Consensus (Rule 6), Quality Gates (Rule 7)
- Added: 4 Party Compositions with model assignments per role
- Added: Differentiation table vs vanilla agent teams
- Bumped to v1.2.0, updated README
