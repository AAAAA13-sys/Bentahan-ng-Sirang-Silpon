# Rule: Anthropic Agent Skills Specification

1. Maintain all agent capabilities under `.agents/skills/<skill-name>/SKILL.md`.
2. Follow progressive disclosure (discovery -> activation -> execution).
3. Validate all skills against the specification:
   `python .agents/skills/anthropic-agent-skills/scripts/validate_skill.py .agents/skills`
