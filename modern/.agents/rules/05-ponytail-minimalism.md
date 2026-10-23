# Rule: Ponytail Minimalist Architecture & Dependency Reduction

1. Apply the 7-step Ladder of Laziness before writing code:
   - Does this need to exist? (YAGNI)
   - Is it already in this codebase?
   - Does the standard library do it?
   - Is there a native platform API?
   - Can we use an already-installed dependency?
   - Can it be done simply in 1-3 lines?
   - Only then write minimal required code.
2. Zero unnecessary third-party packages.
3. Prune dead code and oversized files.
4. Run bloat audit:
   `python .agents/skills/ponytail/scripts/audit_bloat.py .`
