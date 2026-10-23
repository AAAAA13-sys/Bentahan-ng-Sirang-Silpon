# Context and Memory Optimization Guide

This guide describes techniques used by high-performance agent harnesses to maximize context efficiency and avoid degradation during extended coding sessions.

## 1. The Token Budget Principle
Context windows are limited and attention decays with excessive noise. Keep prompt payloads compact:
- Read only relevant slices of files (use line ranges) instead of reading entire 5,000-line files.
- Favor deterministic AST/ripgrep tools over dumping raw file trees.
- Summarize findings before pivoting tasks.

## 2. Progressive State Persistence
Instead of carrying entire historical conversations in memory:
- Maintain durable project files:
  - `AGENTS.md` / `CLAUDE.md` for team & agent directives.
  - Architecture Decision Records (ADRs) for design rationale.
- Persist ephemeral state to structured JSON files (`.superpowers_state.json`, `.agents/state.json`).

## 3. Context Pruning Rules
- **Rule of Locality**: When working on component A, unload detailed internals of unrelated component B.
- **Rule of Determinism**: Store exact command outputs in log files rather than flooding the active conversation stream.
