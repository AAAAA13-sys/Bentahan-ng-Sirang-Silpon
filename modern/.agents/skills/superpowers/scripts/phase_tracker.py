#!/usr/bin/env python3
"""
Superpowers Phase Tracker
Tracks and advances through the 7-phase software engineering lifecycle:
1. Brainstorming
2. Git Isolation
3. Task Planning
4. TDD (Red-Green-Refactor)
5. Subagent Execution
6. Code Review
7. Branch Cleanup & Finish
"""

import sys
import os
import json
import argparse
from datetime import datetime

STATE_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".superpowers_state.json")

PHASES = [
    {"id": 1, "name": "Intent Brainstorming & Exploration", "key": "brainstorming"},
    {"id": 2, "name": "Git Worktree & Branch Isolation", "key": "isolation"},
    {"id": 3, "name": "Task Planning & Breakdown", "key": "planning"},
    {"id": 4, "name": "Test-Driven Development (Red-Green-Refactor)", "key": "tdd"},
    {"id": 5, "name": "Subagent & Task Execution", "key": "execution"},
    {"id": 6, "name": "Code Review & Quality Gates", "key": "review"},
    {"id": 7, "name": "Branch Cleanup & Finish", "key": "finish"}
]

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "current_phase": 1,
        "history": [],
        "last_updated": datetime.now().isoformat()
    }

def save_state(state):
    state["last_updated"] = datetime.now().isoformat()
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def status():
    state = load_state()
    curr_id = state.get("current_phase", 1)
    print("=" * 65)
    print("      SUPERPOWERS 7-PHASE LIFECYCLE TRACKER")
    print("=" * 65)
    for p in PHASES:
        marker = "==> [ACTIVE] " if p["id"] == curr_id else "    [COMPLETED]" if p["id"] < curr_id else "    [PENDING]  "
        print(f"{marker} Phase {p['id']}: {p['name']}")
    print("-" * 65)
    print(f"Current Phase: {curr_id} - {PHASES[curr_id-1]['name']}")
    if state.get("notes"):
        print(f"Notes: {state['notes']}")
    print("=" * 65)

def set_phase(phase_id, notes=""):
    if phase_id < 1 or phase_id > 7:
        print(f"Error: Phase ID must be between 1 and 7 (got {phase_id}).")
        sys.exit(1)
    state = load_state()
    state["current_phase"] = phase_id
    if notes:
        state["notes"] = notes
    state["history"].append({
        "phase": phase_id,
        "timestamp": datetime.now().isoformat(),
        "notes": notes
    })
    save_state(state)
    print(f"Updated: Moved to Phase {phase_id} ({PHASES[phase_id-1]['name']}).")

def next_phase(notes=""):
    state = load_state()
    curr_id = state.get("current_phase", 1)
    if curr_id >= 7:
        print("Already at Phase 7 (Branch Cleanup & Finish). Ready to complete task.")
        return
    set_phase(curr_id + 1, notes)

def reset():
    state = {
        "current_phase": 1,
        "notes": "Reset to initial phase.",
        "history": [],
        "last_updated": datetime.now().isoformat()
    }
    save_state(state)
    print("Superpowers tracker reset to Phase 1 (Intent Brainstorming).")

def main():
    parser = argparse.ArgumentParser(description="Superpowers 7-Phase Engineering Lifecycle Tracker")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("status", help="Show current phase and workflow status")
    
    set_p = subparsers.add_parser("set", help="Set active phase")
    set_p.add_argument("--phase", type=int, required=True, help="Phase number (1-7)")
    set_p.add_argument("--notes", type=str, default="", help="Optional notes on current progress")

    next_p = subparsers.add_parser("next", help="Advance to next phase")
    next_p.add_argument("--notes", type=str, default="", help="Optional progress notes")

    subparsers.add_parser("reset", help="Reset tracker to Phase 1")

    args = parser.parse_args()
    if args.command == "status" or not args.command:
        status()
    elif args.command == "set":
        set_phase(args.phase, args.notes)
    elif args.command == "next":
        next_phase(args.notes)
    elif args.command == "reset":
        reset()

if __name__ == "__main__":
    main()
