# Rule: Superpowers 7-Phase Engineering Lifecycle

1. Always follow the 7-phase development lifecycle:
   - Phase 1: Intent Brainstorming & Alignment
   - Phase 2: Git Worktree & Branch Isolation
   - Phase 3: Task Planning & Breakdown
   - Phase 4: Test-Driven Development (RED-GREEN-REFACTOR)
   - Phase 5: Subagent & Task Execution
   - Phase 6: Code Review & Quality Gates
   - Phase 7: Branch Cleanup & Finish

2. TDD is mandatory for algorithmic and business logic code.
3. Write failing automated tests before writing production code.
4. Track phase transitions using:
   `python .agents/skills/superpowers/scripts/phase_tracker.py status`
