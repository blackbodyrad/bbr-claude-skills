# Contributing to Claude Skills

Thanks for your interest in contributing! Here is how to add new skills or improve existing ones.

## Adding a New Skill

1. Fork the repository
2. Create a new directory under `skills/` with your skill name (lowercase, hyphens):
   ```
   skills/your-skill-name/SKILL.md
   ```
3. Follow the SKILL.md format (see existing skills for reference)
4. Test your skill locally by symlinking it:
   ```bash
   ln -s $(pwd)/skills/your-skill-name ~/.claude/skills/your-skill-name
   ```
5. Open a Pull Request with:
   - What the skill does
   - When it triggers
   - Example usage

## Skill Requirements

- `SKILL.md` is required in every skill directory
- YAML frontmatter must include `name` and `description`
- Description must start with "Use when..."
- Keep `SKILL.md` under 500 lines
- Use supporting files for heavy reference material

## Improving Existing Skills

1. Read the current skill thoroughly
2. Test the current behavior
3. Make your changes
4. Test the new behavior
5. Open a PR describing what changed and why

## Code Style

- Use lowercase-with-hyphens for skill directory names
- Use clear, actionable language in instructions
- Include "When to Use" and "When NOT to Use" sections
- Add a "Common Mistakes" table when applicable
