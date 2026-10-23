#!/usr/bin/env python3
"""
AgentShield Security Scanner (affaan-m/everything-claude-code)
Scans codebase for:
- Exposed secrets, tokens, private keys
- Dangerous shell execution & injection vulnerabilities
- Insecure deserialization & dynamic eval
- Dangerous network pipelines (curl | bash)
"""

import os
import re
import sys
import argparse

SECRET_PATTERNS = [
    (r"(?i)AKIA[0-9A-Z]{16}", "AWS Access Key ID", "CRITICAL"),
    (r"(?i)ghp_[0-9a-zA-Z]{36}", "GitHub Personal Access Token", "CRITICAL"),
    (r"(?i)gho_[0-9a-zA-Z]{36}", "GitHub OAuth Token", "CRITICAL"),
    (r"xox[baprs]-[0-9a-zA-Z]{10,48}", "Slack Token", "CRITICAL"),
    (r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----", "Private Key Header", "CRITICAL"),
    (r"(?i)(?:password|passwd|pwd|secret|api_key|apikey)\s*[:=]\s*['\"][A-Za-z0-9_!@#$%^&*()\-+]{8,}['\"]", "Hardcoded Credential Literal", "HIGH"),
    (r"ey[A-Za-z0-9-_=]+\.ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+", "Potential JWT Token", "HIGH")
]

CODE_SAFETY_PATTERNS = [
    (r"(?:curl|wget)\s+[^\n|]+\|\s*(?:bash|sh|zsh)", "Piped Network-to-Shell Execution", "CRITICAL"),
    (r"(?i)\beval\s*\([^\)]+\)", "Dynamic eval() invocation", "HIGH"),
    (r"(?i)\bexec\s*\([^\)]+\)", "Dynamic Python exec() invocation", "HIGH"),
    (r"(?i)subprocess\.(?:Popen|call|run)\([^)]*shell\s*=\s*True[^)]*\)", "Subprocess with shell=True", "HIGH"),
    (r"(?i)child_process\.(?:exec|execSync)\(", "Node child_process.exec without validation", "HIGH"),
    (r"(?i)pickle\.(?:loads|load)\(", "Insecure Python pickle deserialization", "HIGH"),
    (r"(?i)rm\s+-rf\s+[/~]", "Dangerous wildcard or root deletion", "CRITICAL")
]

IGNORE_DIRS = {".git", "node_modules", ".agents", ".claude", "venv", ".venv", "dist", "build"}
IGNORE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".zip", ".tar", ".gz", ".pyc", ".md", ".txt"}

def scan_file(filepath):
    findings = []
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    except Exception as e:
        return findings

    for line_num, line in enumerate(lines, 1):
        # Skip comment lines in scripts that describe the patterns
        if "AgentShield" in line or "SECRET_PATTERNS" in line or "CODE_SAFETY_PATTERNS" in line:
            continue

        for pattern, desc, severity in SECRET_PATTERNS:
            if re.search(pattern, line):
                findings.append({
                    "file": filepath,
                    "line": line_num,
                    "desc": desc,
                    "severity": severity,
                    "snippet": line.strip()[:100]
                })

        for pattern, desc, severity in CODE_SAFETY_PATTERNS:
            if re.search(pattern, line):
                findings.append({
                    "file": filepath,
                    "line": line_num,
                    "desc": desc,
                    "severity": severity,
                    "snippet": line.strip()[:100]
                })

    return findings

def scan_directory(root_dir):
    all_findings = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter directories in-place
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext in IGNORE_EXTS:
                continue
            full_path = os.path.join(dirpath, filename)
            # Don't scan this script itself to avoid false positives
            if os.path.basename(full_path) == "agentshield.py":
                continue
            findings = scan_file(full_path)
            all_findings.extend(findings)
    return all_findings

def print_report(findings):
    print("=" * 70)
    print("           AGENTSHIELD SECURITY AUDIT REPORT (ECC)")
    print("=" * 70)
    if not findings:
        print("[PASSED] No critical security risks or exposed secrets found.")
        print("=" * 70)
        return 0

    critical_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
    high_count = sum(1 for f in findings if f["severity"] == "HIGH")
    medium_count = sum(1 for f in findings if f["severity"] == "MEDIUM")

    for f in findings:
        sev = f"[{f['severity']}]"
        print(f"{sev:<10} {f['file']}:{f['line']}")
        print(f"           Issue:   {f['desc']}")
        print(f"           Snippet: {f['snippet']}")
        print("-" * 70)

    print(f"Summary: {len(findings)} findings ({critical_count} CRITICAL, {high_count} HIGH, {medium_count} MEDIUM)")
    print("=" * 70)
    return 1 if critical_count > 0 else 0

def main():
    parser = argparse.ArgumentParser(description="AgentShield Security Scanner")
    parser.add_argument("path", nargs="?", default=".", help="Path to scan (file or directory)")
    args = parser.parse_args()

    target = os.path.abspath(args.path)
    if os.path.isfile(target):
        findings = scan_file(target)
    else:
        findings = scan_directory(target)

    sys.exit(print_report(findings))

if __name__ == "__main__":
    main()
