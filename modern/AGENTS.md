# Silicon Trading agent guide

Read docs/MIGRATION-PLAN.md for scope and docs/MIGRATION.md for runtime and rollback.

Keep marketplace authorization, prices, stock changes and order state transitions in lib/market.ts; account handling belongs in lib/auth.ts. Browser fields never authorize roles or set prices for orders. Use integer centavos, transaction locks, unique reservation keys and immutable order snapshots. Preserve private buyer details and never return password hashes or tokens in API JSON.

Use the copied .agents/skills and .claude/skills when relevant. Their product examples are guidance, not requirements to introduce unrelated features. Run npm run typecheck, npm test and node --test tests/runtime.test.cjs. Database tests must clear DATABASE_URL and set SILICON_DATA_DIR=:memory: or use a dedicated test directory. Never run tests against .data/postgres. Run npm run build for cross-layer changes. Do not overwrite the retained Laravel source or import into a nonempty database.
