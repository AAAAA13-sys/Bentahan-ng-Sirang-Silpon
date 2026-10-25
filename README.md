# Silicon Trading (Bentahan ng Sirang Silpon) — PERN Stack

Circular economy marketplace for reclaimed smartphone motherboards, ICs, donor boards, displays, and camera modules based on authentic Philippine repair shop inventory.

Built with the **PERN Stack**:
- **P**ostgreSQL: Drizzle ORM + embedded zero-config PGlite (`.data/postgres`) and cloud PostgreSQL via `DATABASE_URL`.
- **E**xpress.js: REST API routing (`/api/auth`, `/api/catalog`, `/api/parts`, `/api/orders`, `/api/workspace`), atomic row-level locks, and 8% marketplace fee calculation.
- **R**eact 19: High-tech responsive circular tech UI, faceted filtering, diagnostics transparency, and 72-hour dispute timeline.
- **N**ode.js: TypeScript ESM runtime, fast test runner (`tsx --test`), and npm workspaces.

---

## Quick Start (Windows)

1. Ensure **Node.js 22+** is installed.
2. Double-click `START-SILICON.bat` or run:
   ```bash
   npm run dev
   ```
3. Open http://127.0.0.1:8090 in your browser.
4. To stop the running services, double-click `STOP-SILICON.bat`.

---

## Test Accounts

The local database is automatically initialized and seeded with demo accounts:

| Role | Username / Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Buyer** | `user1` or `buyer@silicon.test` | `1234` | Browse catalog, reserve listings, confirm delivery, file disputes |
| **Seller** | `user2` or `seller@silicon.test` | `1234` | Create listings, manage stock, toggle visibility, submit courier tracking |
| **Admin** | `user3` or `admin@silicon.test` | `1234` | Verify sellers, view platform GMV escrow analytics & order ledger |

---

## Workspace Structure

```
silicon-trading/
├── backend/                  # Express.js REST API & PostgreSQL Engine
│   ├── src/server.ts         # Express server entrypoint & REST routes
│   ├── lib/                  # Business domain logic (market, auth, validation)
│   ├── db/                   # Drizzle ORM schema & init.sql
│   ├── scripts/setup.ts      # Standalone database migration & seeder
│   └── tests/                # Automated concurrency & auth tests
├── frontend/                 # React 19 Client Application
│   ├── components/           # MarketApp component & UI elements
│   ├── app/                  # Next.js App Router (layout, globals.css, pages)
│   └── public/               # Public image assets (24 listing photos, SVGs)
├── START-SILICON.bat         # One-click launcher
├── STOP-SILICON.bat          # Clean port terminator
└── package.json              # Monorepo workspaces orchestrator
```

---

## Development Commands

```bash
# Run both Backend & Frontend concurrently
npm run dev

# Run Backend Express API standalone (port 5000)
npm run dev:backend

# Run Frontend React UI standalone (port 8090)
npm run dev:frontend

# Run database setup & seeding
npm run db:setup

# Run test suite
npm test

# Build production bundle
npm run build
```

---

## Git Worktree Setup (Optional)

If you prefer separate working directories for frontend and backend development:
```bash
# Create and checkout frontend worktree
git worktree add ../silicon-trading-frontend frontend

# Create and checkout backend worktree
git worktree add ../silicon-trading-backend backend
```
