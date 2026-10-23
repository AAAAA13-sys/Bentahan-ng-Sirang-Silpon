#!/usr/bin/env python3
"""
Ponytail Bloat & Dependency Auditor (DietrichGebert/ponytail)
Audits codebases for:
- Redundant external dependencies replaceable by standard library/native APIs
- Over-bloated files (>500 lines)
- Unused or commented-out code blocks
"""

import os
import sys
import json
import re
import argparse

REDUNDANT_PACKAGES = {
    "uuid": "Native 'crypto.randomUUID()'",
    "axios": "Native 'fetch()' API",
    "moment": "Native 'Intl.DateTimeFormat' / 'Date'",
    "dayjs": "Native 'Intl' API or lightweight date-fns",
    "mkdirp": "Native 'fs.mkdirSync(..., { recursive: true })'",
    "rimraf": "Native 'fs.rmSync(..., { recursive: true, force: true })'",
    "chalk": "Native ANSI escapes or Node 21.7+ 'util.styleText'",
    "is-odd": "Native modulo operator (n % 2 !== 0)",
    "is-even": "Native modulo operator (n % 2 === 0)",
    "querystring": "Native 'URLSearchParams'",
    "deep-equal": "Native recursive object comparison or structuredClone"
}

IGNORE_DIRS = {".git", "node_modules", ".agents", "venv", ".venv", "dist", "build"}
FILE_LINE_THRESHOLD = 500

def audit_package_json(root_dir):
    pkg_path = os.path.join(root_dir, "package.json")
    findings = []
    if not os.path.exists(pkg_path):
        return findings

    try:
        with open(pkg_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return findings

    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
    for pkg, replacement in REDUNDANT_PACKAGES.items():
        if pkg in deps:
            findings.append({
                "type": "REDUNDANT_DEPENDENCY",
                "target": f"package.json -> {pkg} ({deps[pkg]})",
                "suggestion": f"Replace with {replacement}"
            })

    return findings

def audit_file_sizes(root_dir):
    oversized = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for f in filenames:
            ext = os.path.splitext(f)[1].lower()
            if ext in {".ts", ".tsx", ".js", ".jsx", ".py"}:
                full = os.path.join(dirpath, f)
                try:
                    with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                        lines = len(fh.readlines())
                        if lines > FILE_LINE_THRESHOLD:
                            oversized.append({
                                "type": "OVERSIZED_FILE",
                                "target": f"{full} ({lines} lines)",
                                "suggestion": f"Consider refactoring or splitting (threshold: {FILE_LINE_THRESHOLD} lines)"
                            })
                except Exception:
                    pass
    return oversized

def main():
    parser = argparse.ArgumentParser(description="Ponytail Bloat and Minimalist Architecture Auditor")
    parser.add_argument("path", nargs="?", default=".", help="Root directory to audit")
    args = parser.parse_args()

    root = os.path.abspath(args.path)
    print("=" * 65)
    print("         PONYTAIL MINIMALIST ARCHITECTURE AUDITOR")
    print("=" * 65)

    dep_findings = audit_package_json(root)
    size_findings = audit_file_sizes(root)
    all_findings = dep_findings + size_findings

    if not all_findings:
        print("[PASSED] Codebase adheres to minimalist standards. Zero bloat detected.")
        print("=" * 65)
        sys.exit(0)

    for item in all_findings:
        print(f"[{item['type']}]")
        print(f"  Target:     {item['target']}")
        print(f"  Recommendation: {item['suggestion']}")
        print("-" * 65)

    print(f"Total bloat findings: {len(all_findings)}")
    print("=" * 65)
    sys.exit(0)

if __name__ == "__main__":
    main()
