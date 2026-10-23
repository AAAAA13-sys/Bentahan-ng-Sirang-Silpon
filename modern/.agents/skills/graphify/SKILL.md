---
name: graphify
description: >-
  Deterministic codebase graph analysis and navigation. Builds dependency and call graphs,
  maps caller/callee hierarchies, traces module imports, and generates graph.json and GRAPH_REPORT.md.
---

# Graphify: Codebase Graph Analysis & Navigation

Inspired by `Graphify-Labs/graphify`, this skill turns any codebase into a queryable dependency graph. Before proposing refactors or touching cross-cutting systems, agents analyze imports, callers, and structural relationships deterministically.

```text
┌───────────────────────────────────────────────────────────────┐
│                    GRAPHIFY ENGINE PIPELINE                   │
├───────────────────┬───────────────────┬───────────────────────┤
│ 1. AST SCAN       │ 2. EDGE RESOLUTION│ 3. GRAPH EMISSION     │
│                   │                   │                       │
│ Extract symbols,  │ Resolve relative  │ Generate graph.json   │
│ functions, classes│ imports, calls,   │ and GRAPH_REPORT.md   │
│ & declarations.   │ caller/callee.    │ for agent navigation. │
└───────────────────┴───────────────────┴───────────────────────┘
```

---

## Why Graph Navigation Matters
Vector search and naive `grep` often fail on structural dependencies (e.g., "what functions break if I change this schema?"). Graphify provides:
1. **Deterministic Edge Auditing**: Explicitly marks edges as `EXTRACTED` (literal import/call in AST) or `INFERRED` (naming/interface heuristics).
2. **Circular Dependency Detection**: Flags circular import cycles before they cause runtime undefined export bugs.
3. **Blast Radius Analysis**: Identifies high in-degree modules (core hubs) where changes carry elevated risk.

---

## Running Graphify

Generate the dependency graph and analysis report for the workspace:

```bash
# Analyze workspace and generate graph.json + GRAPH_REPORT.md
python .agents/skills/graphify/scripts/graphify.py .
```

See [references/graph-querying.md](./references/graph-querying.md) for GraphRAG and traversal patterns.
