# Local Chrome verification — 23 October 2026

Application: http://127.0.0.1:8090. Browser: Google Chrome through the user's connected extension. Database: local embedded PostgreSQL (PGlite). Accounts: user1 buyer and user2 seller.

## Verified through the UI

- user2 signed in, published listing 10 with five units at PHP 125.00, edited its title, paused and resumed it.
- user1 signed in, found the listing in the catalog, reserved two units and saw order 1 total PHP 250.00.
- user2 saw the buyer order and stock reduced to three, and marked it shipped with local test tracking.
- user1 saw tracking, confirmed receipt, entered inspection and completed order 1. The completed state removed further fulfillment actions.
- user1 reserved one more unit in order 34 and cancelled it. Catalog stock returned to three. The workspace showed completed and cancelled orders with zero open orders.
- user1 could not access seller publishing: the page displayed that a seller account is required.
- Chrome's initial tab intermittently stopped applying clicks and keyboard input. A fresh tab restored interaction. Standard page navigation is used in the final UI; catalog and workspace links were verified afterwards.

## Automated checks

- npm test: five tests pass, including authentication/local accounts, stock conflicts/idempotency, money parsing and origin checks. Tests explicitly clear DATABASE_URL and use in-memory PostgreSQL.
- npm run typecheck: passed.
- npm run build: passed.
- node --test tests/runtime.test.cjs: four tests pass.
- Runtime stop/start and healthy-server reuse checked; database records and account sessions checked after restart.

The local practice listing and test order history are retained for review. Original Laravel/MySQL records were not modified by these tests. No real payments or courier bookings were made; these remain participant-arranged workflows.
