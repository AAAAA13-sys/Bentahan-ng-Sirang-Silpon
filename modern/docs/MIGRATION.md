# Silicon Trading migration

The modern application lives in `modern/` and uses Next.js 15, React 19, TypeScript, Tailwind CSS, Drizzle and Better Auth. The original Laravel application remains in the parent folder as a retained migration source. Apache, PHP and XAMPP are not required to run the modern application.

## Start and stop

Install Node.js 22 or later. In `modern/`, run `npm install` once. Double-click `START-SILICON.bat` to prepare the database, build changed application sources and open http://127.0.0.1:8090. The first build can take several minutes. Later launches reuse a healthy running application. `node scripts/runtime.cjs start --no-browser` starts without opening a browser.

Double-click `STOP-SILICON.bat` to stop the recorded Next.js server. The runtime checks the recorded process command before stopping it. An occupied port belonging to another application produces an error; the launcher never kills an unrelated application. Stop the original Laravel server before cutting over to port 8090. The modern launcher does not stop legacy services automatically.

Runtime state and the build fingerprint are saved in `.data/`; logs are in `output/.runtime/`. Keep `.data/` and `.env.local` private and back up database data before changing installations. Do not delete `.data/` to fix startup issues: it contains the default database. The launcher serves only the local computer at 127.0.0.1.

## Database and accounts

The default database is embedded PostgreSQL through PGlite at `.data/postgres`. An optional `DATABASE_URL` selects a PostgreSQL server instead. Environment settings and the authentication secret belong in `.env.local`. `npm run db:setup` prepares the schema; startup runs this command before launching a stopped application. It must preserve existing records and must not reset or reseed an existing database.

Legacy import is separate from startup. The migration importer brings across original users, listings and orders, preserving supported original password hashes. Re-running import must be idempotent. Keep the Laravel source and its database backup until imported counts and representative records have been checked. Starting the modern application is not evidence that every legacy record imported correctly.

Authentication uses Better Auth with email and password. OAuth providers are not configured by this migration. The copied development skills in `.agents/` and `.claude/` are development instructions; they do not configure runtime integrations. Payment processing and courier APIs require separate integration work and credentials.

## Checks

Run `node --test tests/runtime.test.cjs` for launcher fingerprint and process-identity guards. Run the application test and type-check commands from `package.json`, then `npm run build`. A deployment smoke test should start with the launcher, confirm `/api/health` reports application `silicon-trading`, stack `nextjs` and database `connected`, visit the home page, launch again to verify reuse, and stop with `STOP-SILICON.bat`.
## Local test accounts

Use `http://127.0.0.1:8090/login` with these usernames and password `1234`:

| Username | Role |
| --- | --- |
| user1 | Buyer |
| user2 | Seller |
| user3 | Administrator |

The local launcher creates these accounts once in embedded PostgreSQL and preserves them on subsequent starts. User2 has a local practice listing. Username aliases work only on localhost with the embedded database. External DATABASE_URL installations do not seed these accounts. Normal account registration retains password validation.

Double-click the root START-SILICON.bat for the new app, or STOP-SILICON.bat to stop it. The retained START-LARAVEL.bat / STOP-LARAVEL.bat launch the old PHP app for rollback; stop the new app first because both use port 8090. After migration, the two database stores are independent.
