# BBR Claude Skills

> Community-driven skill collection for [Claude Code](https://code.claude.com/) — Anthropic's CLI for Claude.

Skills teach Claude Code how to handle specific tasks better. They load on-demand, preserve context, and work across all your projects.

## What's Inside

| Skill | Description |
|-------|-------------|
| **[subagent-orchestration](skills/subagent-orchestration/)** | Patterns for deploying subagents efficiently — parallel research, context priming, background test writing, log monitoring, memory extraction, and isolating verbose operations. |

*More skills coming soon. [Contribute yours!](CONTRIBUTING.md)*

## Install

```bash
npx bbr-claude-skills
```

That's it. You'll be asked to choose a scope:

```
  Where should skills be installed?

  1  Global (~/.claude/skills/)
     Available in all your projects

  2  Project (.claude/skills/)
     Only this project, can commit to git for team sharing

  Choose [1/2]:
```

### Update

```bash
npx bbr-claude-skills update
```

### Other Commands

| Command | What it does |
|---------|--------------|
| `npx bbr-claude-skills` | Interactive install with scope selection |
| `npx bbr-claude-skills update` | Pull latest from GitHub |
| `npx bbr-claude-skills list` | Show installed skills |
| `npx bbr-claude-skills version` | Show version info |
| `npx bbr-claude-skills uninstall` | Remove all managed skills |

## Usage in Claude Code

### Automatic

Claude Code automatically discovers installed skills and uses them when relevant. Just work normally — Claude will apply the right skill when a task matches.

### Manual Invocation

Invoke any skill directly with its slash command:

```
/subagent-orchestration
```

## How It Works

Skills follow the [Agent Skills](https://agentskills.io) open standard adopted by Anthropic.

```
GitHub Repo                        Your Machine
────────────                       ────────────
skills/                            ~/.bbr-claude-skills/repo/  (cloned)
  subagent-orchestration/              ↓ symlinked
    SKILL.md              ───→     ~/.claude/skills/subagent-orchestration/
                                   (or .claude/skills/ for project scope)
```

The installer clones the repo once, then creates symlinks. Updates pull latest and re-link — no files copied, always up to date.

Each skill has a `SKILL.md` with:
- **YAML frontmatter** — `name` and `description` for discovery
- **Markdown body** — Instructions Claude follows when the skill activates

## Included Skills

### Subagent Orchestration

Teaches Claude Code efficient patterns for deploying subagents:

| Pattern | When to Use | Agent Type |
|---------|-------------|------------|
| **Context Priming** | Before implementing a feature | Explore (background) |
| **Parallel Research** | Multiple independent lookups | Explore (background) |
| **Memory Extraction** | Context window filling up | general-purpose (background) |
| **Server Log Monitoring** | Testing with local server | Bash background task |
| **Background Test Writing** | Feature + tests simultaneously | general-purpose (background) |
| **Isolating Verbose Ops** | Running test suites/builds | general-purpose (foreground) |

**Core principle:** Your main conversation is expensive real estate. Delegate verbose, exploratory, or independent work to subagents.

## Project Structure

```
bbr-claude-skills/
├── README.md
├── LICENSE                 # MIT
├── CONTRIBUTING.md         # How to add skills
├── package.json            # npm package (enables npx)
├── bin/
│   └── cli.js              # CLI entrypoint
├── skills/
│   └── subagent-orchestration/
│       └── SKILL.md
└── docs/
    └── skill-authoring.md  # Guide for creating new skills
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**To add a skill:**
1. Fork this repo
2. Create `skills/your-skill-name/SKILL.md`
3. Test locally with `ln -s $(pwd)/skills/your-skill-name ~/.claude/skills/your-skill-name`
4. Open a Pull Request

## Resources

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Agent Skills Open Standard](https://agentskills.io)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)

## License

MIT — see [LICENSE](LICENSE)

---

Built by [BlackBodyRad](https://github.com/blackbodyrad) with Claude Code.
