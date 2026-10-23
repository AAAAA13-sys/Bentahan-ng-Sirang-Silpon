# Codebase Graph Querying & Navigation Reference

## 1. Graph Representation

Graphify produces a directed graph $G = (V, E)$:
- **Vertices ($V$)**: Modules (files), classes, functions, and interfaces.
- **Edges ($E$)**:
  - `IMPORTS`: Module A imports from Module B.
  - `CALLS`: Function A invokes Function B.
  - `EXTENDS`: Class A inherits from Class B.
  - `DEFINES`: Module A defines Symbol B.

## 2. Blast Radius Determination
When modifying a function or schema in file `X`:
1. Find all vertices with directed edges leading into `X` (in-degree).
2. Trace transitive callers up to top-level entrypoints or UI components.
3. Every module in this set must be included in regression test plans.

## 3. Circular Dependency Remediation
If Graphify detects a cycle (e.g., $A \rightarrow B \rightarrow C \rightarrow A$):
- Extract the shared types or pure interfaces into a common `types/` or `common/` leaf module.
- Invert the dependency using dependency injection or callback interfaces.
