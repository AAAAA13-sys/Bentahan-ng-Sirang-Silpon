---
name: karpathy-guidelines
description: >-
  Behavioral guardrails and heuristics derived from Andrej Karpathy's observations of LLM coding pitfalls:
  Think Before Coding, Simplicity First, Surgical Changes (minimal diffs), and Goal-Driven Execution with strict verification.
---

# Karpathy Guidelines: Agent Heuristic Guardrails

Inspired by Andrej Karpathy's insights into language model coding pitfalls, this skill enforces four behavioral guardrails that transform AI coding agents from chaotic code generators into disciplined, precise software engineers.

```text
┌─────────────────────────────────────────────────────────────────┐
│                    THE 4 KARPATHY TENETS                        │
├────────────────────────────────┬────────────────────────────────┤
│ 1. THINK BEFORE CODING         │ 2. SIMPLICITY FIRST            │
│ State assumptions explicitly.  │ The simplest code that works.  │
│ Voice confusion. No guessing.  │ No speculative engineering.    │
├────────────────────────────────┼────────────────────────────────┤
│ 3. SURGICAL CHANGES            │ 4. GOAL-DRIVEN EXECUTION       │
│ Minimal diffs. Touch only      │ Explicit success criteria.     │
│ what's needed. Zero churn.     │ Loop & verify before finishing.│
└────────────────────────────────┴────────────────────────────────┘
```

---

## Tenet 1: Think Before Coding
- Never start emitting code blindly upon receiving a prompt.
- Explicitly restate your understanding and enumerate any ambiguities or assumptions.
- If two distinct architectural paths exist, outline both and justify the chosen path.

## Tenet 2: Simplicity First (Occam's Razor)
- Write the minimum amount of code required to solve the problem.
- Resist the temptation of speculative architecture, abstract factories, or premature helper modules.
- Choose native language constructs over third-party dependencies whenever feasible.

## Tenet 3: Surgical Changes (Minimal Diffs)
- Touch **only** the lines and files required for the task.
- **Strictly Prohibited**:
  - Reformatting unrelated functions or files.
  - Renaming variables outside the task scope.
  - Adding gratuitous comments or docstrings to existing untouched code.
- Always inspect git diff before declaring a task complete.

## Tenet 4: Goal-Driven Execution & Strict Verification
- Before making changes, define concrete, testable criteria for success.
- Execute automated tests, linters, or manual verification commands.
- Verify both the happy path and critical edge cases.
- Never declare a task "done" without executing and observing the verification output.

---

## Tooling & Verification

Verify your active git changes against surgical diff standards:

```bash
python .agents/skills/karpathy-guidelines/scripts/surgical_verify.py
```

See [references/four-tenets.md](./references/four-tenets.md) for deep dives and anti-pattern breakdowns.
