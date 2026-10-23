# TDD Red-Green-Refactor Protocol

The Superpowers framework requires Test-Driven Development (TDD) for all algorithmic, business logic, and API code.

## The Cycle

### 1. RED: Write a Failing Test
- Identify the smallest increment of behavior required.
- Write a single unit test expressing this behavior.
- Run the test suite:
  ```bash
  npm test
  # or python -m unittest / pytest
  ```
- **Crucial Validation**: Verify that the test actually fails, and fails for the expected reason (e.g., function not defined, assertion failed), not due to syntax errors in the test file itself.

### 2. GREEN: Write Minimal Implementation
- Write the simplest code possible that satisfies the test assertion.
- Do not add speculative parameters, extra helper methods, or prematurely optimize performance.
- Run the test suite again: verify it passes.

### 3. REFACTOR: Eliminate Debt Cleanly
- Improve code readability, rename variables for clarity, and extract duplicate logic.
- Ensure type annotations are complete and strict.
- Re-run test suite: verify it remains green without modifications to test assertions.

## Common Anti-Patterns to Avoid
- Writing code first and adding tests retroactively as an afterthought.
- Asserting on implementation details rather than observable behavior and outputs.
- Flaky tests with external network/database dependencies instead of deterministic mocks.
