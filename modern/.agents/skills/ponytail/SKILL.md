---
name: ponytail
description: >-
  Minimalist architecture and dependency reduction skill. Enforces the 7-step Ladder of Laziness,
  prioritizes the least-code approach, eliminates redundant npm/pip packages, and prunes dead code.
---

# Ponytail: Minimalist Architecture & Dependency Reduction

Inspired by `DietrichGebert/ponytail`, this skill trains the agent to think like the sharpest, laziest senior engineer in the room. **"The best code is the code you never had to write."**

```text
┌───────────────────────────────────────────────────────────────┐
│                 THE 7-STEP LADDER OF LAZINESS                 │
├───────────────────────────────────────────────────────────────┤
│ 1. Does this feature need to exist at all? (YAGNI)            │
│ 2. Is there already a helper or component in this codebase?   │
│ 3. Does the language standard library already solve it?       │
│ 4. Is there a native platform API (e.g. fetch, crypto, URL)?  │
│ 5. Is there an already-installed dependency we can use?       │
│ 6. Can this be written cleanly in 1-3 lines?                  │
│ 7. ONLY THEN: Write the absolute minimal required code.       │
└───────────────────────────────────────────────────────────────┘
```

---

## Core Rules

### Rule 1: Zero Redundant Dependencies
Never introduce an external package (`npm install` or `pip install`) when a standard library module or native platform capability exists.
- **Node/TS**: Use native `fetch` (no `axios`), native `crypto.randomUUID()` (no `uuid`), native `node:fs`, `node:path`, native `Intl` (no `moment`/`lodash`).
- **Python**: Use standard `urllib`, `dataclasses`, `json`, `pathlib`, `itertools`.
- **React/RN**: Use built-in hooks and native layout primitives before importing bulky component libraries.

### Rule 2: Dead Code & Boilerplate Pruning
- Remove unused imports, abandoned mock files, and commented-out legacy blocks.
- Avoid multi-tiered class hierarchies where a simple pure function suffices.
- Keep file lengths concise; avoid over-modularizing into dozens of single-line utility files.

---

## Bloat & Dependency Audit Utility

Run the bloat auditor to detect redundant dependencies, missing imports, and unused libraries:

```bash
python .agents/skills/ponytail/scripts/audit_bloat.py .
```

See [references/ladder-of-laziness.md](./references/ladder-of-laziness.md) for full library replacement matrix.
