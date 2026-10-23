#!/usr/bin/env python3
"""
Surgical Diff Verifier (Karpathy Guidelines)
Inspects git diff and working tree changes to ensure changes are surgical,
contained, and do not introduce unexpected file modifications or format churn.
"""

import subprocess
import sys
import re

MAX_RECOMMENDED_CHURN = 300  # Lines of code added+deleted in a single surgical unit

def run_git(args):
    try:
        res = subprocess.run(["git"] + args, capture_output=True, text=True, check=True)
        return res.stdout.strip()
    except subprocess.CalledProcessError as e:
        return ""
    except FileNotFoundError:
        print("Error: git executable not found.")
        sys.exit(1)

def get_modified_files():
    status = run_git(["status", "--porcelain"])
    if not status:
        return []
    files = []
    for line in status.split("\n"):
        if line.strip():
            state = line[:2].strip()
            filepath = line[3:].strip()
            files.append((state, filepath))
    return files

def get_diff_stats():
    diff_stat = run_git(["diff", "--stat"])
    return diff_stat

def get_diff_numstat():
    numstat = run_git(["diff", "--numstat"])
    total_added = 0
    total_deleted = 0
    file_stats = []
    for line in numstat.split("\n"):
        if line.strip():
            parts = line.split("\t")
            if len(parts) >= 3:
                added = int(parts[0]) if parts[0] != "-" else 0
                deleted = int(parts[1]) if parts[1] != "-" else 0
                path = parts[2]
                total_added += added
                total_deleted += deleted
                file_stats.append((path, added, deleted))
    return total_added, total_deleted, file_stats

def main():
    print("=" * 65)
    print("       KARPATHY SURGICAL DIFF & PRECISION AUDITOR")
    print("=" * 65)

    files = get_modified_files()
    if not files:
        print("[CLEAN] Working directory is clean. No active diffs detected.")
        print("=" * 65)
        sys.exit(0)

    print(f"Detected {len(files)} modified/untracked files in working copy:")
    for state, path in files:
        print(f"  [{state:<2}] {path}")
    print("-" * 65)

    total_added, total_deleted, file_stats = get_diff_numstat()
    total_churn = total_added + total_deleted

    print(f"Diff Summary:")
    print(f"  Lines Added:   +{total_added}")
    print(f"  Lines Deleted: -{total_deleted}")
    print(f"  Total Churn:    {total_churn} lines")

    print("-" * 65)
    if total_churn > MAX_RECOMMENDED_CHURN:
        print(f"[WARNING] Total churn ({total_churn} lines) exceeds surgical threshold ({MAX_RECOMMENDED_CHURN} lines).")
        print("  Review diff to ensure changes are strictly necessary and free of extraneous rewrites.")
    else:
        print("[PASSED] Changes are within surgical tolerance.")
    print("=" * 65)

if __name__ == "__main__":
    main()
