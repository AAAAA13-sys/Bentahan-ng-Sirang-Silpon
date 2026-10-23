---
name: everything-claude-code
description: >-
  Performance harness, multi-agent orchestration, context-memory management,
  research-first workflows, and automated AgentShield security scanning for AI coding agents.
---

# Everything Claude Code (ECC) Agent Harness

The `everything-claude-code` (ECC) harness equips coding agents with high-performance operational habits, proactive memory management, research-first execution models, and automated security safeguards via **AgentShield**.

## Core Pillars of ECC

```text
┌─────────────────────────────────────────────────────────────┐
│                 ECC AGENT HARNESS SYSTEM                    │
├─────────────────┬───────────────────┬───────────────────────┤
│ 1. RESEARCH     │ 2. CONTEXT-MEMORY │ 3. AGENTSHIELD        │
│    FIRST        │    OPTIMIZER      │    SECURITY SCANNER   │
│                 │                   │                       │
│ Inspect before  │ Compact prompts,  │ Detect secrets,       │
│ modifying. Read │ track decisions,  │ unsafe bash, prompt   │
│ AST & schema.   │ prune tokens.     │ injection, vulnerabilities.
└─────────────────┴───────────────────┴───────────────────────┘
```

---

## 1. Research-First Workflow
Never write code based on assumptions about an existing codebase.
1. **Discover**: Trace symbol definitions, imports, and exports before editing.
2. **Read Active Implementations**: Verify current behavior rather than relying on outdated documentation.
3. **Draft Mental Model**: Confirm component boundaries and side-effects.

---

## 2. Context-Memory Management
Avoid context bloat and token degradation:
- Maintain lightweight project state files (e.g., `AGENTS.md`, `CLAUDE.md`).
- Keep scratchpads in temporary memory or designated scratch areas.
- Summarize findings before pivoting between major tasks.
- For multi-phase operations, refer to [references/memory-and-context.md](./references/memory-and-context.md).

---

## 3. AgentShield Security Scanner
Before running commands or committing code, ensure no security vulnerabilities or dangerous patterns are introduced:
- **Secret Detection**: High-entropy strings, API keys, private keys, JWTs, password literals.
- **Dangerous Command Execution**: Unsanitized `eval`, `rm -rf`, recursive deletions, arbitrary code execution, raw curl-to-bash pipelines.
- **Unpinned Dependencies**: Strict dependency versioning and verification.
- Run the AgentShield security scanner:

```bash
python .agents/skills/everything-claude-code/scripts/agentshield.py .
```

See [references/agentshield-security.md](./references/agentshield-security.md) for full vulnerability classifications.
