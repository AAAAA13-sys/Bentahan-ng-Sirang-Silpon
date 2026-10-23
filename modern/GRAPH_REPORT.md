# Graphify Codebase Architecture & Dependency Report

_Generated: 2026-10-23T09:22:08.839106_

## Summary Statistics

| Metric | Count |
|:---|---:|
| Total Files Analyzed | 55 |
| Total Dependency Edges | 103 |
| Total Symbols Extracted | 120 |
| Database Tables (DDL) | 0 |
| REST API Routes | 0 |
| Agent Personas | 0 |
| Circular Cycles | 0 |

### Symbol Breakdown

| Symbol Type | Count |
|:---|---:|
| `function` | 110 |
| `registered_skill` | 7 |
| `class` | 3 |

### Edge Type Distribution

| Edge Type | Count |
|:---|---:|
| `INFERRED` | 76 |
| `EXTRACTED` | 18 |
| `UNRESOLVED` | 9 |

## File Dependency Matrix

| File | Type | In-Degree | Out-Degree | Symbols | Key Symbols |
|:---|:---:|:---:|:---:|:---:|:---|
| `lib/auth.ts` | source | 2 | 12 | 7 | currentUser, secret, handleAccount, createAuth, throttle (+2 more) |
| `lib/db.ts` | source | 6 | 7 | 4 | connect, closeDatabase, initializeDatabase, getDb |
| `db/schema.ts` | source | 5 | 2 | 1 | dates |
| `scripts/import-legacy.ts` | source | 0 | 7 | 2 | timestamps, main |
| `.agents/skills.json` | config | 0 | 7 | 7 | superpowers, everything-claude-code, karpathy-guidelines, anthropic-agent-skills, ponytail (+2 more) |
| `.agents/skills/graphify/scripts/graphify.py` | source | 0 | 6 | 10 | parse_code_file, detect_cycles, main, resolve_cross_references, resolve_import_path (+5 more) |
| `lib/local-accounts.ts` | source | 2 | 4 | 2 | seedLocalAccounts, localUsernameEmail |
| `.agents/skills/ponytail/scripts/audit_bloat.py` | source | 0 | 5 | 3 | audit_file_sizes, main, audit_package_json |
| `.agents/skills/superpowers/scripts/phase_tracker.py` | source | 0 | 5 | 7 | reset, save_state, main, load_state, set_phase (+2 more) |
| `lib/market.ts` | source | 0 | 5 | 14 | visibility, allowed, catalog, createListing, getListingForOrder (+9 more) |
| `.agents/skills/anthropic-agent-skills/scripts/validate_skill.py` | source | 0 | 4 | 4 | parse_frontmatter, main, validate_skill_dir, validate_all |
| `.agents/skills/everything-claude-code/scripts/agentshield.py` | source | 0 | 4 | 4 | print_report, scan_directory, scan_file, main |
| `components/market-app.tsx` | source | 1 | 3 | 33 | OrderPage, Remote, Card, date, api (+28 more) |
| `.agents/skills/karpathy-guidelines/scripts/surgical_verify.py` | source | 0 | 3 | 5 | main, get_diff_stats, run_git, get_modified_files, get_diff_numstat |
| `.agents/skills/ui-ux-pro-max/scripts/check_contrast.py` | source | 0 | 3 | 5 | relative_luminance, main, srgb_channel_to_linear, contrast_ratio, hex_to_rgb |
| `app/api/market/[...path]/route.ts` | source | 0 | 3 | 1 | handle |
| `lib/validation.ts` | source | 2 | 1 | 4 | parse, sameOrigin, priceCentavos, MarketError |
| `scripts/setup.ts` | source | 0 | 3 | 1 | main |
| `app/layout.tsx` | source | 0 | 2 | 1 | RootLayout |
| `app/api/health/route.ts` | source | 0 | 2 | 1 | GET |
| `app/[[...path]]/page.tsx` | source | 0 | 2 | 1 | Page |
| `tests/auth.test.ts` | source | 0 | 2 | 1 | req |
| `tests/market.test.ts` | source | 0 | 2 | 0 | — |
| `AGENTS.md` | specification | 2 | 0 | 0 | — |
| `.agents/skills/anthropic-agent-skills/SKILL.md` | specification | 2 | 0 | 0 | — |
| `.agents/skills/everything-claude-code/SKILL.md` | specification | 0 | 2 | 0 | — |
| `.agents/skills/everything-claude-code/references/memory-and-context.md` | specification | 0 | 2 | 0 | — |
| `drizzle.config.ts` | source | 0 | 1 | 0 | — |
| `app/api/account/[action]/route.ts` | source | 0 | 1 | 1 | POST |
| `app/api/session/route.ts` | source | 0 | 1 | 1 | GET |
| `.agents/rules/04-anthropic-standards.md` | specification | 0 | 1 | 0 | — |
| `.agents/skills/anthropic-agent-skills/references/skill-spec.md` | specification | 0 | 1 | 0 | — |
| `next-env.d.ts` | source | 0 | 0 | 0 | — |
| `.agents/rules/01-superpowers-workflow.md` | specification | 0 | 0 | 0 | — |
| `.agents/rules/02-ecc-security.md` | specification | 0 | 0 | 0 | — |
| `.agents/rules/03-karpathy-heuristics.md` | specification | 0 | 0 | 0 | — |
| `.agents/rules/05-ponytail-minimalism.md` | specification | 0 | 0 | 0 | — |
| `.agents/rules/06-ui-ux-pro-max.md` | specification | 0 | 0 | 0 | — |
| `.agents/rules/07-graphify-architecture.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/everything-claude-code/references/agentshield-security.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/frontend-design/SKILL.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/graphify/SKILL.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/graphify/references/graph-querying.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/karpathy-guidelines/SKILL.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/karpathy-guidelines/references/four-tenets.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/ponytail/SKILL.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/ponytail/references/ladder-of-laziness.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/superpowers/SKILL.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/superpowers/references/7-phases-workflow.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/superpowers/references/tdd-red-green-refactor.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/ui-ux-pro-max/SKILL.md` | specification | 0 | 0 | 0 | — |
| `.agents/skills/ui-ux-pro-max/references/taste-heuristics.md` | specification | 0 | 0 | 0 | — |
| `docs/LOCAL-CHROME-VERIFICATION.md` | specification | 0 | 0 | 0 | — |
| `docs/MIGRATION-PLAN.md` | specification | 0 | 0 | 0 | — |
| `docs/MIGRATION.md` | specification | 0 | 0 | 0 | — |

## Circular Dependency Analysis

> [PASS] No circular dependencies detected in the parsed modules.

## Cross-Document & Semantic Reference Edges

| Source | → Target | Relation | Label |
|:---|:---|:---|:---|
| `.agents/rules/04-anthropic-standards.md` | `.agents/skills/anthropic-agent-skills/SKILL.md` | REFERENCES_DOC | SKILL.md |
| `.agents/skills/anthropic-agent-skills/references/skill-spec.md` | `.agents/skills/anthropic-agent-skills/SKILL.md` | REFERENCES_DOC | SKILL.md |
| `.agents/skills/anthropic-agent-skills/scripts/validate_skill.py` | `argparse` | IMPORTS_EXTERNAL | argparse |
| `.agents/skills/anthropic-agent-skills/scripts/validate_skill.py` | `os` | IMPORTS_EXTERNAL | os |
| `.agents/skills/anthropic-agent-skills/scripts/validate_skill.py` | `re` | IMPORTS_EXTERNAL | re |
| `.agents/skills/anthropic-agent-skills/scripts/validate_skill.py` | `sys` | IMPORTS_EXTERNAL | sys |
| `.agents/skills/everything-claude-code/SKILL.md` | `AGENTS.md` | REFERENCES_DOC | AGENTS.md |
| `.agents/skills/everything-claude-code/references/memory-and-context.md` | `AGENTS.md` | REFERENCES_DOC | AGENTS.md |
| `.agents/skills/everything-claude-code/scripts/agentshield.py` | `argparse` | IMPORTS_EXTERNAL | argparse |
| `.agents/skills/everything-claude-code/scripts/agentshield.py` | `os` | IMPORTS_EXTERNAL | os |
| `.agents/skills/everything-claude-code/scripts/agentshield.py` | `re` | IMPORTS_EXTERNAL | re |
| `.agents/skills/everything-claude-code/scripts/agentshield.py` | `sys` | IMPORTS_EXTERNAL | sys |
| `.agents/skills/graphify/scripts/graphify.py` | `argparse` | IMPORTS_EXTERNAL | argparse |
| `.agents/skills/graphify/scripts/graphify.py` | `datetime` | IMPORTS_EXTERNAL | datetime |
| `.agents/skills/graphify/scripts/graphify.py` | `json` | IMPORTS_EXTERNAL | json |
| `.agents/skills/graphify/scripts/graphify.py` | `os` | IMPORTS_EXTERNAL | os |
| `.agents/skills/graphify/scripts/graphify.py` | `re` | IMPORTS_EXTERNAL | re |
| `.agents/skills/graphify/scripts/graphify.py` | `sys` | IMPORTS_EXTERNAL | sys |
| `.agents/skills/karpathy-guidelines/scripts/surgical_verify.py` | `re` | IMPORTS_EXTERNAL | re |
| `.agents/skills/karpathy-guidelines/scripts/surgical_verify.py` | `subprocess` | IMPORTS_EXTERNAL | subprocess |
| `.agents/skills/karpathy-guidelines/scripts/surgical_verify.py` | `sys` | IMPORTS_EXTERNAL | sys |
| `.agents/skills/ponytail/scripts/audit_bloat.py` | `argparse` | IMPORTS_EXTERNAL | argparse |
| `.agents/skills/ponytail/scripts/audit_bloat.py` | `json` | IMPORTS_EXTERNAL | json |
| `.agents/skills/ponytail/scripts/audit_bloat.py` | `os` | IMPORTS_EXTERNAL | os |
| `.agents/skills/ponytail/scripts/audit_bloat.py` | `re` | IMPORTS_EXTERNAL | re |
| `.agents/skills/ponytail/scripts/audit_bloat.py` | `sys` | IMPORTS_EXTERNAL | sys |
| `.agents/skills/superpowers/scripts/phase_tracker.py` | `argparse` | IMPORTS_EXTERNAL | argparse |
| `.agents/skills/superpowers/scripts/phase_tracker.py` | `datetime` | IMPORTS_EXTERNAL | datetime |
| `.agents/skills/superpowers/scripts/phase_tracker.py` | `json` | IMPORTS_EXTERNAL | json |
| `.agents/skills/superpowers/scripts/phase_tracker.py` | `os` | IMPORTS_EXTERNAL | os |
| `.agents/skills/superpowers/scripts/phase_tracker.py` | `sys` | IMPORTS_EXTERNAL | sys |
| `.agents/skills/ui-ux-pro-max/scripts/check_contrast.py` | `argparse` | IMPORTS_EXTERNAL | argparse |
| `.agents/skills/ui-ux-pro-max/scripts/check_contrast.py` | `re` | IMPORTS_EXTERNAL | re |
| `.agents/skills/ui-ux-pro-max/scripts/check_contrast.py` | `sys` | IMPORTS_EXTERNAL | sys |
| `app/[[...path]]/page.tsx` | `react` | IMPORTS_EXTERNAL | react |
| `app/api/health/route.ts` | `drizzle-orm` | IMPORTS_EXTERNAL | drizzle-orm |
| `app/api/market/[...path]/route.ts` | `@/lib/auth` | IMPORTS_EXTERNAL | @/lib/auth |
| `app/api/market/[...path]/route.ts` | `@/lib/market` | IMPORTS_EXTERNAL | @/lib/market |
| `app/api/market/[...path]/route.ts` | `@/lib/validation` | IMPORTS_EXTERNAL | @/lib/validation |
| `app/layout.tsx` | `./globals.css` | IMPORTS_EXTERNAL | ./globals.css |
| `app/layout.tsx` | `next` | IMPORTS_EXTERNAL | next |
| `components/market-app.tsx` | `lucide-react` | IMPORTS_EXTERNAL | lucide-react |
| `components/market-app.tsx` | `next/navigation` | IMPORTS_EXTERNAL | next/navigation |
| `components/market-app.tsx` | `react` | IMPORTS_EXTERNAL | react |
| `db/schema.ts` | `drizzle-orm` | IMPORTS_EXTERNAL | drizzle-orm |
| `db/schema.ts` | `drizzle-orm/pg-core` | IMPORTS_EXTERNAL | drizzle-orm/pg-core |
| `drizzle.config.ts` | `drizzle-kit` | IMPORTS_EXTERNAL | drizzle-kit |
| `lib/auth.ts` | `bcryptjs` | IMPORTS_EXTERNAL | bcryptjs |
| `lib/auth.ts` | `better-auth` | IMPORTS_EXTERNAL | better-auth |
| `lib/auth.ts` | `better-auth/adapters/drizzle` | IMPORTS_EXTERNAL | better-auth/adapters/drizzle |
| `lib/auth.ts` | `drizzle-orm` | IMPORTS_EXTERNAL | drizzle-orm |
| `lib/auth.ts` | `node:crypto` | IMPORTS_EXTERNAL | node:crypto |
| `lib/auth.ts` | `node:fs` | IMPORTS_EXTERNAL | node:fs |
| `lib/auth.ts` | `node:path` | IMPORTS_EXTERNAL | node:path |
| `lib/auth.ts` | `zod` | IMPORTS_EXTERNAL | zod |
| `lib/db.ts` | `@electric-sql/pglite` | IMPORTS_EXTERNAL | @electric-sql/pglite |
| `lib/db.ts` | `drizzle-orm/pglite` | IMPORTS_EXTERNAL | drizzle-orm/pglite |
| `lib/db.ts` | `drizzle-orm/postgres-js` | IMPORTS_EXTERNAL | drizzle-orm/postgres-js |
| `lib/db.ts` | `node:fs/promises` | IMPORTS_EXTERNAL | node:fs/promises |
| `lib/db.ts` | `node:path` | IMPORTS_EXTERNAL | node:path |
| `lib/db.ts` | `postgres` | IMPORTS_EXTERNAL | postgres |
| `lib/local-accounts.ts` | `bcryptjs` | IMPORTS_EXTERNAL | bcryptjs |
| `lib/local-accounts.ts` | `drizzle-orm` | IMPORTS_EXTERNAL | drizzle-orm |
| `lib/market.ts` | `drizzle-orm` | IMPORTS_EXTERNAL | drizzle-orm |
| `lib/market.ts` | `zod` | IMPORTS_EXTERNAL | zod |
| `lib/validation.ts` | `zod` | IMPORTS_EXTERNAL | zod |
| `scripts/import-legacy.ts` | `drizzle-orm` | IMPORTS_EXTERNAL | drizzle-orm |
| `scripts/import-legacy.ts` | `node:crypto` | IMPORTS_EXTERNAL | node:crypto |
| `scripts/import-legacy.ts` | `node:fs/promises` | IMPORTS_EXTERNAL | node:fs/promises |
| `scripts/import-legacy.ts` | `node:path` | IMPORTS_EXTERNAL | node:path |
| `scripts/import-legacy.ts` | `zod` | IMPORTS_EXTERNAL | zod |
| `scripts/setup.ts` | `node:fs` | IMPORTS_EXTERNAL | node:fs |
| `tests/auth.test.ts` | `node:assert/strict` | IMPORTS_EXTERNAL | node:assert/strict |
| `tests/auth.test.ts` | `node:test` | IMPORTS_EXTERNAL | node:test |
| `tests/market.test.ts` | `node:assert/strict` | IMPORTS_EXTERNAL | node:assert/strict |
| `tests/market.test.ts` | `node:test` | IMPORTS_EXTERNAL | node:test |
