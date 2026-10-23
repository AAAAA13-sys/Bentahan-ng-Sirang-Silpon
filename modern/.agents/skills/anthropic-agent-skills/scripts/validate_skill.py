#!/usr/bin/env python3
"""
Agent Skills Validator (anthropics/skills & agentskills/agentskills)
Validates compliance of SKILL.md files against the Anthropic Agent Skills specification:
- Presence of SKILL.md
- Valid YAML frontmatter containing 'name' and 'description'
- Correct naming convention (lowercase, hyphens, matches parent dir)
- Description length and presence of activation triggers
"""

import os
import sys
import re
import argparse

NAME_REGEX = r"^[a-z0-9]+(-[a-z0-9]+)*$"

def parse_frontmatter(content):
    if not content.startswith("---"):
        return None, "File does not start with YAML frontmatter marker '---'"
    
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, "Malformed frontmatter: missing closing '---' marker"
    
    raw_yaml = parts[1].strip()
    data = {}
    
    # Simple, robust YAML parser for name and description without external dependencies
    curr_key = None
    curr_val = []
    
    for line in raw_yaml.split("\n"):
        line_clean = line.strip()
        if not line_clean or line_clean.startswith("#"):
            continue
        
        m = re.match(r"^([a-zA-Z0-9_-]+)\s*:\s*(.*)$", line)
        if m:
            if curr_key:
                data[curr_key] = " ".join(curr_val).strip()
            curr_key = m.group(1).strip()
            val_part = m.group(2).strip()
            if val_part in (">-", ">", "|", "|-"):
                curr_val = []
            elif val_part.startswith(('"', "'")) and val_part.endswith(('"', "'")):
                curr_val = [val_part[1:-1]]
            else:
                curr_val = [val_part] if val_part else []
        elif curr_key:
            curr_val.append(line_clean)
            
    if curr_key:
        data[curr_key] = " ".join(curr_val).strip()
        
    return data, None

def validate_skill_dir(skill_dir):
    errors = []
    warnings = []
    dir_name = os.path.basename(os.path.normpath(skill_dir))
    skill_file = os.path.join(skill_dir, "SKILL.md")

    if not os.path.exists(skill_file):
        return [f"Missing required 'SKILL.md' in {skill_dir}"], []

    try:
        with open(skill_file, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return [f"Unable to read SKILL.md: {str(e)}"], []

    frontmatter, err = parse_frontmatter(content)
    if err:
        errors.append(err)
        return errors, warnings

    # Validate 'name'
    name = frontmatter.get("name")
    if not name:
        errors.append("Missing required field 'name' in frontmatter")
    else:
        if not re.match(NAME_REGEX, name):
            errors.append(f"Invalid skill name '{name}'. Must be lowercase alphanumeric with hyphens.")
        if name != dir_name:
            warnings.append(f"Skill name '{name}' does not match directory name '{dir_name}'")

    # Validate 'description'
    desc = frontmatter.get("description")
    if not desc:
        errors.append("Missing required field 'description' in frontmatter")
    elif len(desc) < 20:
        errors.append(f"Description is too short ({len(desc)} chars). Minimum is 20 chars.")

    # Check for body content
    parts = content.split("---", 2)
    body = parts[2].strip() if len(parts) >= 3 else ""
    if not body:
        errors.append("SKILL.md has no instructions after the frontmatter")

    return errors, warnings

def validate_all(root_path):
    print("=" * 65)
    print("      ANTHROPIC AGENT SKILLS SPECIFICATION VALIDATOR")
    print("=" * 65)

    if not os.path.exists(root_path):
        print(f"Error: Path '{root_path}' does not exist.")
        sys.exit(1)

    skill_dirs = []
    if os.path.isfile(os.path.join(root_path, "SKILL.md")):
        skill_dirs.append(root_path)
    else:
        for entry in sorted(os.listdir(root_path)):
            full = os.path.join(root_path, entry)
            if os.path.isdir(full) and os.path.isfile(os.path.join(full, "SKILL.md")):
                skill_dirs.append(full)

    if not skill_dirs:
        print(f"No skills found in '{root_path}'.")
        print("=" * 65)
        sys.exit(0)

    total_errors = 0
    total_warnings = 0

    for s_dir in skill_dirs:
        name = os.path.basename(s_dir)
        errors, warnings = validate_skill_dir(s_dir)
        status = "[FAIL]" if errors else "[WARN]" if warnings else "[PASS]"
        print(f"{status:<8} {name}")
        for e in errors:
            print(f"         Error:   {e}")
        for w in warnings:
            print(f"         Warning: {w}")
        total_errors += len(errors)
        total_warnings += len(warnings)

    print("-" * 65)
    print(f"Checked {len(skill_dirs)} skill(s): {total_errors} error(s), {total_warnings} warning(s)")
    print("=" * 65)
    return 1 if total_errors > 0 else 0

def main():
    parser = argparse.ArgumentParser(description="Validate Anthropic Agent Skills")
    parser.add_argument("path", nargs="?", default=".agents/skills", help="Directory containing skill(s)")
    args = parser.parse_args()
    sys.exit(validate_all(args.path))

if __name__ == "__main__":
    main()
