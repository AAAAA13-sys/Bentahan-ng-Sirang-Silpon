# Rule: Graphify Codebase Dependency & Architecture Navigation

1. Before modifying core schemas or cross-module interfaces, inspect the codebase dependency graph.
2. Ensure no circular dependencies are introduced.
3. Update and verify dependency graph:
   `python .agents/skills/graphify/scripts/graphify.py .`
4. Inspect `graph.json` and `GRAPH_REPORT.md` to trace blast radius on dependent modules.
