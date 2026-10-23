# Superpowers 7-Phases Workflow Reference

This reference outlines the detailed protocols and operational checklists for each of the seven engineering phases in the Superpowers framework.

## Phase 1: Intent Brainstorming & Alignment
- **Socratic Inquiry**: What is the core problem being solved? Who uses this?
- **Scope Delimitation**: Explicitly write down out-of-scope items.
- **Architectural Options**: Contrast at least two possible approaches (e.g., standard library vs. existing helper vs. new modular service).
- **Assumptions Audit**: Never make silent assumptions. If a requirement is ambiguous, note the chosen default explicitly.

## Phase 2: Workspace & Branch Isolation
- Ensure the working copy is clean (`git status`).
- When working on large features or speculative refactors, create an isolated branch or worktree:
  ```bash
  git checkout -b feature/your-feature-name
  # Or for worktree:
  git worktree add ../worktrees/your-feature feature/your-feature-name
  ```

## Phase 3: Task Planning
A well-structured task plan follows these guidelines:
- Break complex goals into small steps (estimated under 15-30 minutes each).
- Sequence steps such that tests and foundations precede higher-level components.
- Include explicit verification criteria for every step:
  - Unit test command
  - Lint command
  - Expected stdout or exit code

## Phase 4: Test-Driven Development (TDD)
- **Rule 1**: Do not write production code unless an automated test is failing.
- **Rule 2**: Only write enough test code to cause a failure (compilation failure counts as a failure).
- **Rule 3**: Only write enough production code to pass the currently failing test.
- Keep the red-green-refactor loop tight (under 2 minutes per cycle).

## Phase 5: Execution & Subagent Delegation
- Keep agent focus sharp. Only load the context needed for the active subtask.
- Validate after each subtask completes before proceeding to the next.
- If delegating to parallel subagents, provide explicit input/output boundaries and file ownership constraints to prevent merge collisions.

## Phase 6: Code Review & Quality Gates
Perform an automated and manual audit before submitting:
1. `git diff` review: Are there any stray comments, unused imports, or unexpected formatting adjustments?
2. Security scan: Check for credential exposure, unsafe execution paths.
3. Bloat check: Did we add any unneeded dependencies or redundant utility functions?
4. Test suite: Confirm 100% pass rate.

## Phase 7: Branch Cleanup & Finishing
- Remove temporary test harnesses, scratch files, and debug statements.
- Format git commits with clear, descriptive commit messages adhering to Conventional Commits:
  - `feat(...)`: New features
  - `fix(...)`: Bug fixes
  - `test(...)`: Adding or updating tests
  - `refactor(...)`: Code refactoring without behavior changes
