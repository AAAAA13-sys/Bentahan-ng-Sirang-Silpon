# Rule: ECC Performance Harness & AgentShield Security

1. Follow a Research-First workflow: inspect symbols, imports, and existing patterns before modifying code.
2. Never hardcode credentials, tokens, or private keys into source files.
3. Avoid arbitrary shell execution or unsafe `eval`/`exec` calls.
4. Run AgentShield security audits before code reviews:
   `python .agents/skills/everything-claude-code/scripts/agentshield.py .`
