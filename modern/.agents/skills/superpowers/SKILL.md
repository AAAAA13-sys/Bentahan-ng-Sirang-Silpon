---
name: superpowers
description: >-
  A structured agentic engineering methodology enforcing a 7-phase software development lifecycle:
  intent brainstorming, git worktree isolation, task planning, test-driven development (RED-GREEN-REFACTOR),
  subagent execution, code review checkpoints, and development branch cleanup.
---

# Superpowers Engineering Methodology

The Superpowers framework (inspired by `obra/superpowers`) enforces disciplined software engineering habits on coding agents. Instead of immediately writing speculative code, agents proceed through a rigorous, repeatable 7-phase pipeline.

## The Superpowers Golden Rule

> **The Rule**: Before writing non-trivial production code or proposing architectural changes, verify and activate the appropriate workflow phase. Never guess or leap directly from user request to unvalidated implementation.

---

## The 7-Phase Software Engineering Process

```mermaid
flowchart LR
    P1[1. Brainstorming] --> P2[2. Git Isolation]
    P2 --> P3[3. Task Planning]
    P3 --> P4[4. TDD Red-Green-Refactor]
    P4 --> P5[5. Subagent Execution]
    P5 --> P6[6. Code Review]
    P6 --> P7[7. Branch Cleanup & Finish]
```

### Phase 1: Intent Brainstorming & Exploration
- Clarify requirements, constraints, and edge cases.
- Identify what should **not** be built (YAGNI).
- Evaluate trade-offs before writing specifications.
- Check [references/7-phases-workflow.md](./references/7-phases-workflow.md) for brainstorming protocols.

### Phase 2: Git Worktree & Branch Isolation
- Avoid dirtying the main working tree for speculative or multi-stage changes.
- Ensure isolated environment using git branches or git worktrees.
- Verify base branch is clean and passing all tests.

### Phase 3: Task Planning & Breakdown
- Translate the brainstormed design into an ordered, bite-sized implementation plan.
- Each task must have:
  - An exact file list to touch
  - A concrete objective
  - A clear verification command / acceptance test
- Tasks should be executable in small, verifiable increments.

### Phase 4: Test-Driven Development (RED-GREEN-REFACTOR)
- **RED**: Write an automated test covering the expected behavior *before* writing code. Run it and confirm that it fails for the expected reason.
- **GREEN**: Write the minimal code required to make the test pass. Do not write premature optimizations.
- **REFACTOR**: Clean up code, remove duplication, and ensure adherence to codebase style without breaking the test.
- See detailed rules in [references/tdd-red-green-refactor.md](./references/tdd-red-green-refactor.md).

### Phase 5: Subagent & Task Execution
- Focus on executing one planned task at a time.
- For independent tasks, parallelize or delegate to specialized subagents.
- Ensure each step maintains spec compliance.

### Phase 6: Code Review & Quality Gates
- Self-review all diffs against:
  - Surgical precision (no unrelated formatting/files touched)
  - Security standards (AgentShield checks)
  - Minimalist standards (Ponytail bloat checks)
- Verify tests pass locally.

### Phase 7: Branch Cleanup & Finishing
- Squash or organize commits cleanly.
- Remove temporary scratch files, debug logs, or isolated worktrees.
- Generate concise summary of changes with verified test evidence.

---

## Automation Utility

Use the phase tracker to monitor and advance through your development phases:

```bash
python .agents/skills/superpowers/scripts/phase_tracker.py status
python .agents/skills/superpowers/scripts/phase_tracker.py set --phase 1 --notes "Brainstorming requirements"
python .agents/skills/superpowers/scripts/phase_tracker.py next
```
