# BBR Claude Skills

## Project Overview
Community-driven skill collection for Claude Code, distributed via npm (`npx bbr-claude-skills`).

## Stack
- **Runtime:** Node.js (zero dependencies)
- **Distribution:** npm + GitHub symlink installer
- **Standard:** Agent Skills open standard (agentskills.io)

## Repository Structure
```
bbr-claude-skills/
├── bin/cli.js              # npx entrypoint (install/update/list/version/uninstall)
├── package.json            # npm package config
├── skills/                 # All skills live here
│   └── <skill-name>/
│       └── SKILL.md        # Required entrypoint per skill
├── docs/
│   └── skill-authoring.md  # Guide for contributors
├── CONTRIBUTING.md
└── LICENSE                 # MIT
```

## Adding a New Skill
1. Create `skills/<skill-name>/SKILL.md`
2. YAML frontmatter: `name` and `description` (description starts with "Use when...")
3. Symlink locally to test: `ln -s $(pwd)/skills/<name> ~/.claude/skills/<name>`
4. Commit, push, and bump version in package.json

## Publishing Updates
```bash
# Bump version
npm version patch

# Publish to npm
npm publish --access public

# Push to GitHub
git push --follow-tags
```

## Key Conventions
- Skill names: lowercase, hyphens only
- SKILL.md under 500 lines; use supporting files for heavy reference
- Description field: triggering conditions only, never workflow summary
- No dependencies in bin/cli.js — pure Node.js stdlib

## Accounts
- **npm:** gerrypaps
- **GitHub:** blackbodyrad
