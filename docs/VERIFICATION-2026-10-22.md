# Startup and end-to-end verification — 22 October 2026

## Startup
- Main app: http://127.0.0.1:8090.
- Actual START-SILICON.bat entry point tested with -NoBrowser.
- Cold PHP server start, Stop/Start, and repeated launch passed. Existing server was reused.
- Launcher checks configured MySQL, starts standard local XAMPP when its port is offline, waits for readiness, verifies schema, then opens the site. No automatic data reset, migration, or seeding.
- Shared MySQL was kept running; its automatic cold-start branch was inspected but not retested by stopping a database used by other projects.

## Isolated browser walkthrough
Browser used http://127.0.0.1:8091 with database silicon_trading_e2e and a separate session cookie. Real forms, redirects, sessions and CSRF middleware were used.

1. Seller login from Sell a part returned to the listing form.
2. Published Browser test donor board with three pieces, then edited price from PHP123.45 to PHP125.00.
3. Paused and resumed listing from seller workspace; status and live listing counts updated.
4. Guest component login returned buyer to that component.
5. Buyer reserved two pieces; preview and persisted total both PHP250.00.
6. Seller workspace showed the order, two reserved pieces and one remaining piece.
7. Seller recorded J&T shipment with a synthetic tracking reference.
8. Buyer saw shipment, confirmed receipt, and got the 72-hour inspection controls.
9. Buyer confirmed the component; order became completed.
10. Separate reservation was cancelled; its piece returned to stock.
11. Fresh buyer signup from component returned to the component with reservation available.
12. Fresh seller signup selected the seller role and opened an empty seller workspace with listing creation available.
13. No browser console errors observed during these flows.

## Regression failures reproduced and fixed
- Repeated reservation created a second order and stock deduction: fixed by buyer-scoped unique submission keys and transactional retry lookup.
- Buyer login from seller route led to forbidden page: fixed with role-aware redirect/navigation.
- Guest login/signup lost the selected component: fixed by preserving validated component context.
- Malformed quantity could make validation recovery render HTTP500: fixed by keeping server preview calculations independent of rejected input.
- No readiness endpoint: added /health for application identity and DB availability.

## Limits
No money was collected. Payment/escrow providers and live courier APIs remain unconnected. Shipment data is entered by sellers. Dispute submission/state rules are covered by server-side tests; this browser walkthrough exercised the successful inspection and cancellation paths.

Final checks: 20 MySQL tests passed with 138 assertions; PHP formatting, JavaScript syntax and all Blade view compilation passed. Live database retained eight sample listings and zero orders.
