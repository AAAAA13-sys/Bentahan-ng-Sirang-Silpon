# Silicon Trading migration plan

Move the existing marketplace into the DEV MAXING stack: Next.js 15, React 19, TypeScript, Tailwind, Drizzle, PostgreSQL and Better Auth. Preserve email/password accounts, roles, historical IDs, integer-cent pricing and order snapshots. Use embedded PGlite PostgreSQL for local startup; DATABASE_URL supports a separate PostgreSQL server. Retain the Laravel application for rollback.

## Implementation and verification

1. Copy complete `.agents/skills` and `.claude/skills` bundles from DEV MAXING; verify all files by SHA-256.
2. Build schema/db initialization and a one-time transaction-based MySQL export/import. Refuse nonempty unmarked targets. Preserve Laravel bcrypt passwords through Better Auth verification.
3. Implement account/session, catalog/listing, reservation, fulfillment and admin verification endpoints with server authorization and stock locks. Exercise retries, stale edits, cancellation, privacy and dispute expiry using an isolated in-memory database.
4. Port the interface to React. Verify buyer registration/login/reservation and seller listing/edit/shipping followed by buyer receipt/completion, plus cancellation stock restoration.
5. Build a durable local launcher with schema setup, changed-source rebuild, health/readiness, process identity and safe stop. Preserve Laravel launchers and change the default only after production build succeeds.
6. Run type checking, production build, Node runtime tests, isolated integration and browser checks. Record limitations and exact startup instructions in MIGRATION.md.

## Product boundaries

Shipping and payment are arranged directly by participants. No external payment processing, escrow or courier booking is implemented. Imported and new data diverge from the retained Laravel database after cutover; do not alternate active runtimes for normal use.
