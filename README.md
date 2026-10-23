# Silicon Trading — Local Next.js

Double-click START-SILICON.bat, then open http://127.0.0.1:8090. Test usernames: user1 (buyer), user2 (seller), user3 (admin). Password for all three: 1234. Requires Node.js 22+; the local PostgreSQL store starts automatically. See modern/docs/MIGRATION.md for stack, testing and rollback instructions.

---

# Silicon Trading

Laravel 12 / PHP 8.2+ / MySQL marketplace prototype based on the supplied Silicon Trading business proposal. The existing proposal documents are preserved in the parent folder.

## Run locally (Windows / XAMPP)

1. Start MySQL in XAMPP. PHP 8.2+, Composer, `pdo_mysql`, `mbstring`, `openssl`, `fileinfo` and `curl` are required.
2. Open a terminal in this folder. Run `composer install` if `vendor` is missing.
3. Copy `.env.example` to `.env` if necessary. Set DB credentials for your local MySQL instance. Never commit `.env`.
4. Create a database: `CREATE DATABASE silicon_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
5. Run `php artisan key:generate`, then `php artisan migrate --seed`.
6. Run `php artisan serve --host=127.0.0.1 --port=8090` and visit http://127.0.0.1:8090.

After first-time database setup, double-click `START-SILICON.bat`. It automatically starts local XAMPP MySQL if needed, checks the database schema, starts the web server in the background, and opens the browser. Running it again reuses the existing server. You do not need Apache. Use `STOP-SILICON.bat` to stop only the launcher-owned web server; shared MySQL is left running. The launcher never resets, migrates or seeds data automatically. For a nonstandard XAMPP location run `powershell -File scripts/start.ps1 -XamppPath D:\xampp`. Logs are in `storage/logs/server-8090-error.log`. No Node build is needed: Blade, CSS and native HTML forms power the site. Google Fonts is optional; local system fonts are the fallback.

## Local demo accounts

The local/testing seeder creates sample inventory and these accounts, all with password `SiliconDemo2026`:

| Role | Email |
| --- | --- |
| Buyer | buyer@silicon.test |
| Seller | seller@silicon.test |
| Second seller | parts@silicon.test |
| Admin | admin@silicon.test |

These credentials are for a local demonstration only. Never expose a seeded local instance publicly. Demo seeding is disabled outside local/testing environments. Before deployment create individual accounts, remove demo accounts/data, configure HTTPS, real email, database credentials and backups, and set APP_ENV=production and APP_DEBUG=false.

## Included

- Responsive landing page, category browsing, device/model text search, brand/condition/verified-seller filters, sorting and pagination.
- Buyer/seller registration, session login/logout, CSRF protection, throttled authentication, hashed passwords and server-side validation.
- Standardized seller listings with exact model, condition, diagnostic notes, minimum order and price in integer centavos.
- Buyer reservations with database transactions, row locking, stock decrement, cancellation with stock restoration, and private order details.
- Seller-entered LBC/J&T/Lalamove shipment references, buyer receipt, 72-hour dispute window and completion confirmation.
- Admin seller-verification controls after an offline review. Verification identifies sellers, not component quality.
- Tests for role boundaries, registration privilege escalation, filtering, pricing, stock, cancellation, privacy and state transitions.

## Explicit prototype limits

No real payment or escrow integration exists. Reservations do not collect, hold, release or refund funds. The proposal’s fee schedules, merchant vouchers, paid verification and procurement subscriptions are not billed. Live courier APIs, automatic compatibility matching, identity-document review, diagnostic media uploads and a dispute-resolution/refund service are not connected. Artwork is illustrative; catalog records and seller verification badges from the seeder are sample data. Shipment updates are entered manually by sellers. Disputes are recorded for manual review and never automatically resolve or transfer money. Unpaid reservations remain until explicitly cancelled. Sellers can create and edit listings, change remaining stock, and pause or resume visibility. Paused listings remain visible only to their owner; existing orders continue to work. Reservations preserve the original component specifications and total. Stale stock edits are rejected instead of overwriting newer reservations. Photo uploads are not included.

## Tests

`php artisan test`

Feature tests use an isolated in-memory SQLite database by default; the live application is configured for MySQL. For MySQL checks, create the separate silicon_trading_test database, then run `php vendor/phpunit/phpunit/phpunit -c phpunit.mysql.xml`. This configuration targets silicon_trading_test only; never point RefreshDatabase tests at the live database.



## UI/UX Pro Max

Initialized with `npx --yes --package uipro-cli uipro init --ai codex`. The installed skill is in `.codex/skills/ui-ux-pro-max/SKILL.md`. Its generated design system and project-specific decisions are saved in `design-system/silicon-trading/MASTER.md`. The marketplace has prominent search, category tabs, removable active filters, native mobile filter disclosure, larger readable metadata, visible keyboard focus, and stable hover states. All features still use Laravel Blade and MySQL; no frontend framework or build step was added.


## Startup and flow verification

Run `powershell -NoProfile -ExecutionPolicy Bypass -File tests/startup-smoke.ps1` to check real startup, readiness and repeat-launch behavior. Buyer reservations use unique submission keys so a repeated click or retry does not create another order or deduct stock again. Login from a component returns the buyer to that component.

The requested Superpowers debugging/TDD and verification skills are in `.tools/superpowers`; Impeccable is in `.tools/impeccable`; the Anthropic frontend-design skill is installed in `.codex/skills/frontend-design`. Graphify's local AST map is in `graphify-out/graph.json`, excluding environment files and runtime data via `.graphifyignore`. These tools are development guidance, not website runtime dependencies.
