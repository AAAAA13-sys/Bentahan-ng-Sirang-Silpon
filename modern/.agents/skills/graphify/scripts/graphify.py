#!/usr/bin/env python3
"""
Graphify Codebase Dependency & Call Graph Analyzer (Graphify-Labs/graphify)
Extended multi-format deterministic analyzer that:
- Traces ES/TS imports, CommonJS requires, and Python imports in source files
- Extracts embedded code symbols from Markdown specification documents
- Parses SQL DDL for table/FK entity relationships
- Maps cross-document references (SDD <-> ADD <-> AGENTS.md <-> US)
- Extracts API route contracts and agent persona references
- Identifies defined classes, functions, DB tables, Pydantic models, and enums
- Resolves dependency edges (EXTRACTED) and semantic references (INFERRED)
- Detects circular dependencies
- Generates graph.json and GRAPH_REPORT.md
"""

import os
import sys
import re
import json
import argparse
from datetime import datetime

IGNORE_DIRS = {".git", "node_modules", ".claude", ".next", "venv", ".venv", "dist", "build", "__pycache__"}
IGNORE_FILES = {"GRAPH_REPORT.md", "graph.json", "package-lock.json"}
CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py"}
DOC_EXTENSIONS = {".md"}
CONFIG_EXTENSIONS = {".json"}
ALL_EXTENSIONS = CODE_EXTENSIONS | DOC_EXTENSIONS | CONFIG_EXTENSIONS

# ──────────────────────────────────────────────────────────────────
# 1. File Discovery
# ──────────────────────────────────────────────────────────────────

def find_all_files(root_dir):
    """Walk workspace and return categorized file lists."""
    code_files = []
    doc_files = []
    config_files = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for f in filenames:
            if f in IGNORE_FILES:
                continue
            ext = os.path.splitext(f)[1].lower()
            full = os.path.abspath(os.path.join(dirpath, f))
            if ext in CODE_EXTENSIONS:
                code_files.append(full)
            elif ext in DOC_EXTENSIONS:
                doc_files.append(full)
            elif ext in CONFIG_EXTENSIONS:
                config_files.append(full)

    return code_files, doc_files, config_files

# ──────────────────────────────────────────────────────────────────
# 2. Source Code Analysis (Python / JS / TS)
# ──────────────────────────────────────────────────────────────────

def parse_code_file(filepath, root_dir):
    """Extract symbols and imports from Python / JS / TS source files."""
    rel_path = os.path.relpath(filepath, root_dir).replace("\\", "/")
    symbols = []
    raw_imports = []

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        return rel_path, symbols, raw_imports

    ext = os.path.splitext(filepath)[1].lower()

    if ext in {".ts", ".tsx", ".js", ".jsx"}:
        es_imports = re.findall(r"(?m)^import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['\"]([^'\"]+)['\"]", content)
        require_imports = re.findall(r"require\(['\"]([^'\"]+)['\"]\)", content)
        raw_imports = list(set(es_imports + require_imports))
        funcs = re.findall(r"(?m)(?:export\s+)?(?:default\s+)?function\s+([A-Za-z0-9_$]+)", content)
        arrow_funcs = re.findall(r"(?m)(?:export\s+)?const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>", content)
        classes = re.findall(r"(?m)(?:export\s+)?class\s+([A-Za-z0-9_$]+)", content)
        symbols = [{"name": s, "type": "function"} for s in set(funcs + arrow_funcs)]
        symbols += [{"name": c, "type": "class"} for c in set(classes)]

    elif ext == ".py":
        py_froms = re.findall(r"(?m)^from\s+([a-zA-Z0-9_.]+)\s+import", content)
        py_directs = re.findall(r"(?m)^import\s+([a-zA-Z0-9_.]+)", content)
        raw_imports = list(set(py_froms + py_directs))
        funcs = re.findall(r"(?m)^def\s+([A-Za-z0-9_]+)\s*\(", content)
        classes = re.findall(r"(?m)^class\s+([A-Za-z0-9_]+)(?:\([^)]*\))?:", content)
        symbols = [{"name": s, "type": "function"} for s in set(funcs)]
        symbols += [{"name": c, "type": "class"} for c in set(classes)]

    return rel_path, symbols, raw_imports

# ──────────────────────────────────────────────────────────────────
# 3. Specification Document Analysis (Markdown)
# ──────────────────────────────────────────────────────────────────

def parse_doc_file(filepath, root_dir):
    """
    Extract rich semantic data from Markdown specification documents:
    - Embedded Python classes/functions (Pydantic models, algorithms)
    - SQL DDL tables, enums, and FK relationships
    - API route contracts
    - Agent persona references (agent:architect, agent:balancer, etc.)
    - Cross-document references
    - Domain entities and enums
    """
    rel_path = os.path.relpath(filepath, root_dir).replace("\\", "/")
    symbols = []
    references = []  # Cross-doc references
    db_tables = []
    api_routes = []
    agent_refs = []

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        return rel_path, symbols, references, db_tables, api_routes, agent_refs

    # ── Embedded Python classes & functions ──
    py_classes = re.findall(r"(?m)^class\s+([A-Za-z0-9_]+)(?:\([^)]*\))?:", content)
    py_funcs = re.findall(r"(?m)^\s*(?:def|async\s+def)\s+([A-Za-z0-9_]+)\s*\(", content)
    for c in set(py_classes):
        symbols.append({"name": c, "type": "class"})
    for f in set(py_funcs):
        symbols.append({"name": f, "type": "function"})

    # ── Pydantic BaseModel subclasses ──
    pydantic_models = re.findall(r"(?m)^class\s+([A-Za-z0-9_]+)\(BaseModel\):", content)
    for m in set(pydantic_models):
        symbols.append({"name": m, "type": "pydantic_model"})

    # ── Python Enum classes ──
    py_enums = re.findall(r"(?m)^class\s+([A-Za-z0-9_]+)\((?:str,\s*)?Enum\):", content)
    for e in set(py_enums):
        symbols.append({"name": e, "type": "enum"})

    # ── SQL CREATE TABLE ──
    sql_tables = re.findall(r"(?mi)CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(", content)
    for t in set(sql_tables):
        symbols.append({"name": t, "type": "db_table"})
        db_tables.append(t)

    # ── SQL CREATE TYPE / ENUM ──
    sql_enums = re.findall(r"(?mi)CREATE\s+TYPE\s+([a-zA-Z0-9_]+)\s+AS\s+ENUM", content)
    for e in set(sql_enums):
        symbols.append({"name": e, "type": "db_enum"})

    # ── SQL REFERENCES (FK relationships) ──
    fk_refs = re.findall(r"(?mi)REFERENCES\s+([a-zA-Z0-9_]+)\s*\(", content)
    for fk in set(fk_refs):
        if fk in sql_tables:
            pass  # Self-referential within same doc
        references.append({"target_symbol": fk, "relation": "FK_REFERENCE"})

    # ── SQL INDEX references ──
    idx_on = re.findall(r"(?mi)CREATE\s+INDEX\s+\S+\s+ON\s+([a-zA-Z0-9_]+)\s*\(", content)
    for idx_table in set(idx_on):
        references.append({"target_symbol": idx_table, "relation": "INDEX_ON"})

    # ── REST API routes ──
    api_patterns = re.findall(r"((?:GET|POST|PUT|PATCH|DELETE)\s+/[a-zA-Z0-9_/{}\-]+)", content)
    for route in set(api_patterns):
        method_path = route.strip()
        api_routes.append(method_path)
        symbols.append({"name": method_path, "type": "api_route"})

    # ── Agent persona references ──
    agent_mentions = re.findall(r"agent:([a-zA-Z0-9_]+)", content)
    for a in set(agent_mentions):
        agent_refs.append(f"agent:{a}")
        symbols.append({"name": f"agent:{a}", "type": "agent_persona"})

    # ── Cross-document references ──
    doc_refs = re.findall(r"(?:AGENTS\.md|CLAUDE\.md|GEMINI\.md|README\.md|ADD\.md|SDD\.md|ARCHITECTURE_DESIGN_DOCUMENT\.md|SKILL\.md|US and Criterias\.md)", content)
    # Alias map for documents referenced by alternative names
    doc_aliases = {
        "ARCHITECTURE_DESIGN_DOCUMENT.md": "ADD.md",
    }
    this_basename = os.path.basename(filepath)
    for d in set(doc_refs):
        resolved_name = doc_aliases.get(d, d)
        # Skip self-references (document mentioning its own filename)
        if resolved_name == this_basename:
            continue
        references.append({"target_symbol": resolved_name, "relation": "REFERENCES_DOC"})

    # ── Pydantic DTO / schema references by name ──
    dto_refs = re.findall(r"(?:StoryExtractionDTO|BacklogDecompositionResponse|BlockerAnalysisDTO|StandupSynthesisResponse|WorkloadAllocator)", content)
    for dto in set(dto_refs):
        references.append({"target_symbol": dto, "relation": "REFERENCES_SCHEMA"})

    # ── Gherkin Feature / Scenario sections (for US docs) ──
    features = re.findall(r"(?m)^Feature\s+[\d.]+:\s*(.+)$", content)
    for feat in set(features):
        symbols.append({"name": feat.strip(), "type": "gherkin_feature"})

    scenarios = re.findall(r"(?m)^Scenario:\s*(.+)$", content)
    for sc in set(scenarios):
        symbols.append({"name": sc.strip(), "type": "gherkin_scenario"})

    # ── SOP references ──
    sops = re.findall(r"(SOP-\d+):\s*(.+)", content)
    for sop_id, sop_name in set(sops):
        symbols.append({"name": f"{sop_id}: {sop_name.strip()}", "type": "sop"})

    # Deduplicate symbols by name+type
    seen = set()
    unique_symbols = []
    for s in symbols:
        key = (s["name"], s["type"])
        if key not in seen:
            seen.add(key)
            unique_symbols.append(s)

    return rel_path, unique_symbols, references, db_tables, api_routes, agent_refs

# ──────────────────────────────────────────────────────────────────
# 4. Config File Analysis (JSON)
# ──────────────────────────────────────────────────────────────────

def parse_config_file(filepath, root_dir):
    """Extract skill registrations and schema references from JSON configs."""
    rel_path = os.path.relpath(filepath, root_dir).replace("\\", "/")
    symbols = []
    references = []

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            data = json.load(f)
    except Exception:
        return rel_path, symbols, references

    # skills.json structure
    if isinstance(data, dict) and "skills" in data:
        for skill in data["skills"]:
            name = skill.get("name", "")
            path = skill.get("path", "")
            if name:
                symbols.append({"name": name, "type": "registered_skill"})
            if path:
                references.append({"target_symbol": path, "relation": "SKILL_REGISTRATION"})

    return rel_path, symbols, references

# ──────────────────────────────────────────────────────────────────
# 5. Import Resolution
# ──────────────────────────────────────────────────────────────────

def resolve_import_path(from_file, import_target, all_rel_files, root_dir):
    from_dir = os.path.dirname(from_file)

    if import_target.startswith("."):
        candidate = os.path.normpath(os.path.join(from_dir, import_target)).replace("\\", "/")
        for f in all_rel_files:
            f_no_ext = os.path.splitext(f)[0]
            if f == candidate or f_no_ext == candidate or f == f"{candidate}/index.ts" or f == f"{candidate}/index.js":
                return f

    for f in all_rel_files:
        if f == import_target or os.path.splitext(f)[0] == import_target:
            return f

    return None

# ──────────────────────────────────────────────────────────────────
# 6. Cross-Document Reference Resolution
# ──────────────────────────────────────────────────────────────────

def resolve_cross_references(all_nodes, all_rel_files):
    """Resolve INFERRED edges between specification docs based on shared symbols."""
    edges = []

    # Build a global symbol -> source file index
    symbol_index = {}  # symbol_name -> list of file_ids that define it
    for node_id, node in all_nodes.items():
        for sym in node.get("symbols", []):
            name = sym["name"]
            if name not in symbol_index:
                symbol_index[name] = []
            symbol_index[name].append(node_id)

    # Resolve references
    for node_id, node in all_nodes.items():
        for ref in node.get("_references", []):
            target_sym = ref["target_symbol"]
            relation = ref["relation"]

            # Try to find a file that defines this symbol
            if target_sym in symbol_index:
                for target_file in symbol_index[target_sym]:
                    if target_file != node_id:
                        edges.append({
                            "source": node_id,
                            "target": target_file,
                            "relation": relation,
                            "label": target_sym,
                            "type": "INFERRED"
                        })
            else:
                # Try matching as a file reference
                matched = False
                candidates = []
                for f in all_rel_files:
                    basename = os.path.basename(f)
                    if target_sym == basename or target_sym == f:
                        if f != node_id:
                            candidates.append(f)
                
                if candidates:
                    # For generic names like SKILL.md, prefer the closest file by
                    # shared directory path depth with the source node
                    source_parts = node_id.split("/")
                    best = candidates[0]
                    best_overlap = 0
                    for c in candidates:
                        c_parts = c.split("/")
                        overlap = sum(1 for a, b in zip(source_parts, c_parts) if a == b)
                        if overlap > best_overlap:
                            best_overlap = overlap
                            best = c
                    edges.append({
                        "source": node_id,
                        "target": best,
                        "relation": relation,
                        "label": target_sym,
                        "type": "INFERRED"
                    })
                    matched = True
                # If still unresolved, log as external reference
                if not matched and relation not in ("INDEX_ON",):
                    edges.append({
                        "source": node_id,
                        "target": target_sym,
                        "relation": relation,
                        "label": target_sym,
                        "type": "UNRESOLVED"
                    })

    return edges

# ──────────────────────────────────────────────────────────────────
# 7. Cycle Detection
# ──────────────────────────────────────────────────────────────────

def detect_cycles(nodes, edges):
    adj = {n: [] for n in nodes}
    for e in edges:
        u = e["source"]
        v = e["target"]
        if u in adj and v in adj:
            adj[u].append(v)

    visited = {}
    rec_stack = {}
    cycles = []

    def dfs(curr, path):
        visited[curr] = True
        rec_stack[curr] = True
        path.append(curr)
        for neighbor in adj.get(curr, []):
            if neighbor == curr:
                continue  # Skip self-loops
            if not visited.get(neighbor, False):
                dfs(neighbor, path)
            elif rec_stack.get(neighbor, False):
                cycle_start = path.index(neighbor)
                cycle = path[cycle_start:] + [neighbor]
                cycles.append(cycle)
        rec_stack[curr] = False
        path.pop()

    for n in nodes:
        if not visited.get(n, False):
            dfs(n, [])

    return cycles

# ──────────────────────────────────────────────────────────────────
# 8. Master Graph Builder
# ──────────────────────────────────────────────────────────────────

def build_graph(root_dir):
    code_files, doc_files, config_files = find_all_files(root_dir)
    all_files = code_files + doc_files + config_files
    all_rel_files = [os.path.relpath(f, root_dir).replace("\\", "/") for f in all_files]

    nodes = {}
    edges = []

    # ── Parse source code files ──
    for f in code_files:
        rel_path, symbols, raw_imports = parse_code_file(f, root_dir)
        nodes[rel_path] = {
            "id": rel_path,
            "type": "source",
            "extension": os.path.splitext(rel_path)[1],
            "symbols": symbols,
            "raw_imports": raw_imports,
            "_references": []
        }

    # ── Parse specification documents ──
    for f in doc_files:
        rel_path, symbols, references, db_tables, api_routes, agent_refs = parse_doc_file(f, root_dir)
        nodes[rel_path] = {
            "id": rel_path,
            "type": "specification",
            "extension": ".md",
            "symbols": symbols,
            "raw_imports": [],
            "_references": references,
            "db_tables": db_tables,
            "api_routes": api_routes,
            "agent_refs": agent_refs
        }

    # ── Parse config files ──
    for f in config_files:
        rel_path, symbols, references = parse_config_file(f, root_dir)
        if symbols or references:
            nodes[rel_path] = {
                "id": rel_path,
                "type": "config",
                "extension": ".json",
                "symbols": symbols,
                "raw_imports": [],
                "_references": references
            }

    # ── Resolve code import edges ──
    code_rel_files = [os.path.relpath(f, root_dir).replace("\\", "/") for f in code_files]
    for f_rel, data in nodes.items():
        for imp in data.get("raw_imports", []):
            resolved = resolve_import_path(f_rel, imp, code_rel_files, root_dir)
            if resolved:
                edges.append({
                    "source": f_rel,
                    "target": resolved,
                    "relation": "IMPORTS",
                    "label": imp,
                    "type": "EXTRACTED"
                })
            else:
                edges.append({
                    "source": f_rel,
                    "target": imp,
                    "relation": "IMPORTS_EXTERNAL",
                    "label": imp,
                    "type": "INFERRED"
                })

    # ── Resolve cross-document reference edges ──
    cross_edges = resolve_cross_references(nodes, all_rel_files)
    edges.extend(cross_edges)

    # ── Detect cycles ──
    file_node_ids = list(nodes.keys())
    cycles = detect_cycles(file_node_ids, edges)

    # ── Compute degree metrics ──
    in_degree = {k: 0 for k in nodes}
    out_degree = {k: 0 for k in nodes}
    for e in edges:
        s = e["source"]
        t = e["target"]
        if s in out_degree:
            out_degree[s] += 1
        if t in in_degree:
            in_degree[t] += 1

    for k in nodes:
        nodes[k]["in_degree"] = in_degree[k]
        nodes[k]["out_degree"] = out_degree[k]

    # ── Clean internal metadata from output ──
    for k in nodes:
        nodes[k].pop("_references", None)

    # ── Aggregate statistics ──
    total_symbols = sum(len(n.get("symbols", [])) for n in nodes.values())
    total_db_tables = sum(len(n.get("db_tables", [])) for n in nodes.values())
    total_api_routes = sum(len(n.get("api_routes", [])) for n in nodes.values())
    total_agent_refs = len(set(
        a for n in nodes.values() for a in n.get("agent_refs", [])
    ))

    symbol_breakdown = {}
    for n in nodes.values():
        for s in n.get("symbols", []):
            t = s["type"]
            symbol_breakdown[t] = symbol_breakdown.get(t, 0) + 1

    return {
        "generated_at": datetime.now().isoformat(),
        "nodes": list(nodes.values()),
        "edges": edges,
        "cycles": cycles,
        "statistics": {
            "total_files": len(nodes),
            "total_edges": len(edges),
            "total_symbols": total_symbols,
            "total_db_tables": total_db_tables,
            "total_api_routes": total_api_routes,
            "total_agent_personas": total_agent_refs,
            "symbol_breakdown": symbol_breakdown,
            "edge_types": {
                "EXTRACTED": sum(1 for e in edges if e["type"] == "EXTRACTED"),
                "INFERRED": sum(1 for e in edges if e["type"] == "INFERRED"),
                "UNRESOLVED": sum(1 for e in edges if e["type"] == "UNRESOLVED")
            }
        },
        # Legacy compat
        "total_files": len(nodes),
        "total_edges": len(edges)
    }

# ──────────────────────────────────────────────────────────────────
# 9. Report Generator
# ──────────────────────────────────────────────────────────────────

def generate_markdown_report(graph_data, output_path):
    stats = graph_data["statistics"]
    lines = [
        "# Graphify Codebase Architecture & Dependency Report",
        "",
        f"_Generated: {graph_data.get('generated_at', 'N/A')}_",
        "",
        "## Summary Statistics",
        "",
        f"| Metric | Count |",
        f"|:---|---:|",
        f"| Total Files Analyzed | {stats['total_files']} |",
        f"| Total Dependency Edges | {stats['total_edges']} |",
        f"| Total Symbols Extracted | {stats['total_symbols']} |",
        f"| Database Tables (DDL) | {stats['total_db_tables']} |",
        f"| REST API Routes | {stats['total_api_routes']} |",
        f"| Agent Personas | {stats['total_agent_personas']} |",
        f"| Circular Cycles | {len(graph_data['cycles'])} |",
        "",
        "### Symbol Breakdown",
        "",
        "| Symbol Type | Count |",
        "|:---|---:|"
    ]
    for stype, count in sorted(stats.get("symbol_breakdown", {}).items(), key=lambda x: -x[1]):
        lines.append(f"| `{stype}` | {count} |")

    lines.append("")
    lines.append("### Edge Type Distribution")
    lines.append("")
    lines.append("| Edge Type | Count |")
    lines.append("|:---|---:|")
    for etype, count in sorted(stats.get("edge_types", {}).items(), key=lambda x: -x[1]):
        lines.append(f"| `{etype}` | {count} |")

    # ── File Nodes Table ──
    lines.append("")
    lines.append("## File Dependency Matrix")
    lines.append("")
    lines.append("| File | Type | In-Degree | Out-Degree | Symbols | Key Symbols |")
    lines.append("|:---|:---:|:---:|:---:|:---:|:---|")

    sorted_nodes = sorted(graph_data["nodes"], key=lambda x: x.get("in_degree", 0) + x.get("out_degree", 0), reverse=True)
    for n in sorted_nodes:
        sym_count = len(n.get("symbols", []))
        key_syms = ", ".join([
            s["name"] for s in n.get("symbols", [])[:5]
        ]) or "—"
        if len(n.get("symbols", [])) > 5:
            key_syms += f" (+{len(n['symbols']) - 5} more)"
        lines.append(f"| `{n['id']}` | {n['type']} | {n['in_degree']} | {n['out_degree']} | {sym_count} | {key_syms} |")

    # ── Database Entity Relationships ──
    db_tables_all = []
    for n in graph_data["nodes"]:
        for t in n.get("db_tables", []):
            db_tables_all.append((n["id"], t))

    if db_tables_all:
        lines.append("")
        lines.append("## Database Entity Relationship Map")
        lines.append("")
        fk_edges = [e for e in graph_data["edges"] if e.get("relation") == "FK_REFERENCE"]
        if fk_edges:
            lines.append("```mermaid")
            lines.append("erDiagram")
            seen_rels = set()
            for e in fk_edges:
                label = e.get("label", "")
                source_file = e["source"]
                # Find tables in source that reference this target symbol
                source_tables = [t for fid, t in db_tables_all if fid == source_file]
                if label in source_tables:
                    continue
                for st in source_tables:
                    rel_key = f"{label}--{st}"
                    if rel_key not in seen_rels:
                        seen_rels.add(rel_key)
                        lines.append(f"    {label} ||--o{{ {st} : references")
            lines.append("```")
        else:
            for fid, t in db_tables_all:
                lines.append(f"- `{t}` (defined in `{fid}`)")

    # ── API Routes ──
    api_routes_all = []
    for n in graph_data["nodes"]:
        for r in n.get("api_routes", []):
            api_routes_all.append((n["id"], r))

    if api_routes_all:
        lines.append("")
        lines.append("## REST API Route Registry")
        lines.append("")
        lines.append("| Route | Defined In |")
        lines.append("|:---|:---|")
        for fid, route in api_routes_all:
            lines.append(f"| `{route}` | `{fid}` |")

    # ── Agent Personas ──
    agent_refs_all = set()
    for n in graph_data["nodes"]:
        for a in n.get("agent_refs", []):
            agent_refs_all.add(a)

    if agent_refs_all:
        lines.append("")
        lines.append("## Agent Persona Registry")
        lines.append("")
        lines.append("| Agent ID | Referenced In |")
        lines.append("|:---|:---|")
        for agent in sorted(agent_refs_all):
            files_ref = [n["id"] for n in graph_data["nodes"] if agent in n.get("agent_refs", [])]
            lines.append(f"| `{agent}` | {', '.join([f'`{f}`' for f in files_ref])} |")

    # ── Circular Dependencies ──
    lines.append("")
    lines.append("## Circular Dependency Analysis")
    if not graph_data["cycles"]:
        lines.append("")
        lines.append("> [PASS] No circular dependencies detected in the parsed modules.")
    else:
        lines.append("")
        for idx, c in enumerate(graph_data["cycles"], 1):
            cycle_str = " → ".join([f"`{item}`" for item in c])
            lines.append(f"{idx}. {cycle_str}")

    # ── Cross-Document Reference Edges ──
    inferred_edges = [e for e in graph_data["edges"] if e["type"] == "INFERRED"]
    if inferred_edges:
        lines.append("")
        lines.append("## Cross-Document & Semantic Reference Edges")
        lines.append("")
        lines.append("| Source | → Target | Relation | Label |")
        lines.append("|:---|:---|:---|:---|")
        seen = set()
        for e in sorted(inferred_edges, key=lambda x: (x["source"], x["target"])):
            key = (e["source"], e["target"], e.get("label", ""))
            if key not in seen:
                seen.add(key)
                lines.append(f"| `{e['source']}` | `{e['target']}` | {e['relation']} | {e.get('label', '—')} |")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

# ──────────────────────────────────────────────────────────────────
# 10. CLI Entry Point
# ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Graphify Codebase Dependency & Call Graph Analyzer")
    parser.add_argument("path", nargs="?", default=".", help="Root directory to analyze")
    parser.add_argument("--output-json", default="graph.json", help="Path for JSON graph output")
    parser.add_argument("--output-report", default="GRAPH_REPORT.md", help="Path for Markdown report")
    args = parser.parse_args()

    root = os.path.abspath(args.path)
    print("=" * 70)
    print("       GRAPHIFY CODEBASE DEPENDENCY & ARCHITECTURE ANALYZER")
    print("=" * 70)

    graph_data = build_graph(root)
    stats = graph_data["statistics"]

    json_path = os.path.join(root, args.output_json)
    report_path = os.path.join(root, args.output_report)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(graph_data, f, indent=2)

    generate_markdown_report(graph_data, report_path)

    print(f"")
    print(f"  Files Analyzed:       {stats['total_files']}")
    print(f"  Dependency Edges:     {stats['total_edges']}")
    print(f"  Symbols Extracted:    {stats['total_symbols']}")
    print(f"  Database Tables:      {stats['total_db_tables']}")
    print(f"  API Routes:           {stats['total_api_routes']}")
    print(f"  Agent Personas:       {stats['total_agent_personas']}")
    print(f"  Circular Cycles:      {len(graph_data['cycles'])}")
    print(f"")
    print(f"  Symbol Breakdown:")
    for stype, count in sorted(stats.get("symbol_breakdown", {}).items(), key=lambda x: -x[1]):
        print(f"    {stype:<20} {count}")
    print(f"")
    print(f"  Edge Types:")
    for etype, count in sorted(stats.get("edge_types", {}).items(), key=lambda x: -x[1]):
        print(f"    {etype:<20} {count}")
    print(f"")
    print(f"  Generated:")
    print(f"    - {os.path.relpath(json_path, root)}")
    print(f"    - {os.path.relpath(report_path, root)}")
    print("=" * 70)

if __name__ == "__main__":
    main()
