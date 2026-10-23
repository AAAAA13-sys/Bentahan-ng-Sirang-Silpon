# Anthropic Agent Skills Specification & Schema

## Specification Version
- Standard: `agentskills.io` / `anthropics/skills`
- Compatibility: Claude Code, Cursor, Codex, Gemini CLI, Antigravity, OpenCode

## 1. Metadata Schema

```yaml
---
name: skill-name-here
description: >-
  Third-person concise description of the skill capability and activation triggers.
---
```

### Constraints:
- `name`: Must match pattern `^[a-z0-9]+(-[a-z0-9]+)*$` (e.g., `react-native-architect`). Must match the parent directory name.
- `description`: 20 to 500 characters. Must clearly state triggers (e.g., "Use this skill when...").

## 2. Directory Layout
- `scripts/`: Scripts should be executable and run non-interactively.
- `references/`: Detailed reference documentation. Keep `SKILL.md` under 200 lines by delegating deep background information to `references/`.
- `resources/`: Read-only templates, JSON schemas, seed datasets.
- `examples/`: Golden code samples and before-and-after patterns.

## 3. Progressive Disclosure Architecture
Progressive disclosure solves the context window exhaustion problem:
1. **Tier 1 (Index / Discovery)**: At session start, the agent receives only the list of skills (`name` + `description`). Token cost is negligible (~50 tokens per skill).
2. **Tier 2 (Activation)**: When a prompt matches a skill's triggers, the agent reads `SKILL.md` into active context.
3. **Tier 3 (Execution / Sub-Resources)**: If the skill refers to scripts or files in `references/`, the agent reads or executes them on-demand.
