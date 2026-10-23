---
name: anthropic-agent-skills
description: >-
  Official Anthropic Agent Skills standard specification and reference validator.
  Enforces progressive disclosure (discovery -> activation -> execution) and validates skill structure.
---

# Anthropic Agent Skills Standard Specification

This skill documents and enforces the **Agent Skills open standard** developed by Anthropic (`anthropics/skills` and `agentskills/agentskills`). It defines how portable agent capabilities should be packaged, discovered, and executed.

```text
┌───────────────────────────────────────────────────────────────┐
│               THE 3-TIER PROGRESSIVE DISCLOSURE               │
├─────────────────┬─────────────────────┬───────────────────────┤
│ 1. DISCOVERY    │ 2. ACTIVATION       │ 3. EXECUTION          │
│                 │                     │                       │
│ Injects only    │ Agent loads full    │ Follows instructions, │
│ name & brief    │ SKILL.md when       │ executes scripts, and │
│ description.    │ task is relevant.   │ verifies output.      │
│ (Zero token     │                     │                       │
│ bloat)          │                     │                       │
└─────────────────┴─────────────────────┴───────────────────────┘
```

---

## Skill Directory Structure

Every standard skill must live in a dedicated folder with the following convention:

```text
skills/<skill-name>/
├── SKILL.md               # [REQUIRED] Main instruction file with YAML frontmatter
├── scripts/               # [OPTIONAL] Executable helper scripts (Python, Node, Bash)
├── references/            # [OPTIONAL] Deep documentation loaded on-demand
├── resources/             # [OPTIONAL] Templates, schemas, data files
└── examples/              # [OPTIONAL] Reference implementations
```

---

## Main Instruction File (`SKILL.md`) Rules

1. **YAML Frontmatter**: Must start on line 1 with `---` and close with `---`.
   - `name` (string, required): Lowercase, alphanumeric, hyphen-separated (e.g., `git-cherry-pick`).
   - `description` (string, required): Clear, concise 1-3 sentences stating **what** the skill does and **when** it should be activated.
2. **Clear Directives**: Step-by-step actionable instructions with executable examples.
3. **No Redundancy**: Avoid repeating generic programming advice; focus exclusively on domain-specific procedures.

---

## Validation Utility

Use the built-in validator to inspect any skill against the official specification:

```bash
# Validate all skills in .agents/skills
python .agents/skills/anthropic-agent-skills/scripts/validate_skill.py .agents/skills

# Validate a specific skill
python .agents/skills/anthropic-agent-skills/scripts/validate_skill.py .agents/skills/superpowers
```

See [references/skill-spec.md](./references/skill-spec.md) for complete schema details.
