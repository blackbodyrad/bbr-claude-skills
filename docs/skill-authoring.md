# Skill Authoring Guide

How to create effective Claude Code skills that actually get used.

## The SKILL.md Format

Every skill needs a `SKILL.md` file with YAML frontmatter and markdown instructions.

```yaml
---
name: my-skill-name
description: Use when [specific conditions]. Triggers on [symptoms/situations].
---

# Skill Name

Your instructions here...
```

### Frontmatter Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | No (uses directory name) | Lowercase letters, numbers, hyphens only |
| `description` | Recommended | Tells Claude WHEN to use this skill |
| `disable-model-invocation` | No | `true` = only user can invoke via `/name` |
| `user-invocable` | No | `false` = hidden from `/` menu, Claude-only |
| `allowed-tools` | No | Restrict which tools Claude can use |
| `context` | No | `fork` = run in isolated subagent |
| `agent` | No | Which agent type when `context: fork` |
| `model` | No | Model override for this skill |

### Writing the Description

The description is the most important field. Claude uses it to decide whether to load your skill.

**Rules:**
- Start with "Use when..."
- Describe triggering CONDITIONS, not the skill's workflow
- Include specific symptoms, situations, keywords
- Keep under 500 characters

```yaml
# BAD: Describes what the skill does
description: Runs parallel subagents for research and testing

# GOOD: Describes when to use it
description: Use when facing tasks that benefit from parallel work, context preservation, or background monitoring. Triggers on multi-file research, test suites, or pre-implementation context gathering.
```

## Skill Structure Recommendations

### For Simple Skills (< 200 lines)

Keep everything in `SKILL.md`:

```
my-skill/
  SKILL.md    # Everything inline
```

### For Skills with Reference Material

Split heavy docs into supporting files:

```
my-skill/
  SKILL.md         # Overview + navigation
  reference.md     # Detailed API docs
  examples.md      # Usage examples
```

Reference them from SKILL.md:
```markdown
For detailed API reference, see [reference.md](reference.md)
```

### For Skills with Scripts

```
my-skill/
  SKILL.md
  scripts/
    helper.py      # Script Claude can execute
```

## Content Patterns

### Decision Tables

Help Claude make quick decisions:

```markdown
| Situation | Action | Why |
|-----------|--------|-----|
| Single file edit | Skip this skill | Overhead not worth it |
| Multi-file research | Use Pattern 1 | Preserves context |
```

### Common Mistakes Tables

Prevent known failure modes:

```markdown
| Mistake | Fix |
|---------|-----|
| Running dependent tasks in parallel | Chain sequentially |
```

### When/When-Not Sections

Always include both:

```markdown
## When to Use
- [specific triggers]

## When NOT to Use
- [counter-indicators]
```

## Testing Your Skill

1. Symlink into your skills directory:
   ```bash
   ln -s $(pwd)/skills/my-skill ~/.claude/skills/my-skill
   ```

2. Start a new Claude Code session

3. Test automatic triggering:
   - Describe a situation that matches your description
   - Check if Claude loads the skill

4. Test manual invocation:
   ```
   /my-skill
   ```

5. Verify Claude follows the instructions correctly

## Quality Checklist

- [ ] Description starts with "Use when..."
- [ ] Description under 500 characters
- [ ] Includes "When to Use" section
- [ ] Includes "When NOT to Use" section
- [ ] SKILL.md under 500 lines
- [ ] No narrative storytelling (techniques, not stories)
- [ ] Tested with automatic and manual invocation
