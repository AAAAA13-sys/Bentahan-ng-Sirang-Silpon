import test from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';

process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
process.env.SILICON_DATA_DIR = ':memory:';
process.env.BETTER_AUTH_SECRET = 'isolated-test-secret-for-express-integration-test';

test('Express application mounts all required endpoints and enforces constraints', async () => {
  const { initializeDatabase, closeDatabase } = await import('../lib/db');
  const { seedLocalAccounts } = await import('../lib/local-accounts');
  const { default: app } = await import('../src/server');

  await initializeDatabase();
  await seedLocalAccounts();

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. GET /api/health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = (await healthRes.json()) as any;
    assert.equal(healthJson.application, 'silicon-trading');
    assert.equal(healthJson.database, 'connected');

    // 2. GET /api/session (unauthenticated)
    const sessionRes = await fetch(`${baseUrl}/api/session`);
    assert.equal(sessionRes.status, 200);
    const sessionJson = (await sessionRes.json()) as any;
    assert.equal(sessionJson.user, null);

    // 3. POST /api/account/login (seller: user2)
    const loginRes = await fetch(`${baseUrl}/api/account/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`
      },
      body: JSON.stringify({ email: 'user2', password: '1234' })
    });
    assert.equal(loginRes.status, 200);
    const sellerCookie = loginRes.headers.get('set-cookie') || '';
    assert.ok(sellerCookie.includes('session_token'));

    // 4. GET /api/session (authenticated seller)
    const authSessionRes = await fetch(`${baseUrl}/api/session`, {
      headers: { cookie: sellerCookie }
    });
    assert.equal(authSessionRes.status, 200);
    const authSessionJson = (await authSessionRes.json()) as any;
    assert.equal(authSessionJson.user.role, 'seller');

    // 5. GET /api/market/catalog
    const catalogRes = await fetch(`${baseUrl}/api/market/catalog`);
    assert.equal(catalogRes.status, 200);
    const catalogJson = (await catalogRes.json()) as any;
    assert.ok(Array.isArray(catalogJson.listings));

    // 6. POST /api/market/listings (create new listing)
    const newListing = {
      title: 'iPhone 13 Pro Motherboard Donor Unit',
      brand: 'Apple',
      model: 'iPhone 13 Pro',
      category: 'Donor boards',
      condition: 'For harvesting',
      boardClass: 'Grade A (Complete / All ICs)',
      storageGb: '256GB',
      ramGb: '6GB',
      icCode: 'A15-BIONIC-POWER',
      description: 'Reclaimed board with intact CPU/NAND shielding and pristine power management ICs.',
      diagnostics: 'Inspected under microscope. No trace cracking or water damage indicators tripped.',
      price: '3450.00',
      quantity: 3,
      minimumQuantity: 1
    };
    const createListingRes = await fetch(`${baseUrl}/api/market/listings`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: sellerCookie
      },
      body: JSON.stringify(newListing)
    });
    assert.equal(createListingRes.status, 201);
    const createdListingJson = (await createListingRes.json()) as any;
    const listingId = createdListingJson.listing.id;
    assert.equal(createdListingJson.listing.priceCentavos, 345000);

    // 7. GET /api/market/parts/:id
    const partDetailRes = await fetch(`${baseUrl}/api/market/parts/${listingId}`);
    assert.equal(partDetailRes.status, 200);
    const partDetailJson = (await partDetailRes.json()) as any;
    assert.equal(partDetailJson.listing.id, listingId);
    assert.equal(partDetailJson.listing.storageGb, '256GB');

    // 8. PUT /api/market/listings/:id (stale version edit conflict check)
    const staleUpdateRes = await fetch(`${baseUrl}/api/market/listings/${listingId}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: sellerCookie
      },
      body: JSON.stringify({
        ...newListing,
        title: 'Updated title',
        stockVersion: 999 // Intentionally stale version
      })
    });
    assert.equal(staleUpdateRes.status, 409);

    // 8b. PATCH /api/market/listings/:id/stock (Adjust stock quantity)
    const adjustStockRes = await fetch(`${baseUrl}/api/market/listings/${listingId}/stock`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: sellerCookie
      },
      body: JSON.stringify({
        quantity: 10
      })
    });
    assert.equal(adjustStockRes.status, 200);
    const adjustedJson = (await adjustStockRes.json()) as any;
    assert.equal(adjustedJson.listing.quantity, 10);

    // 9. Login as Buyer (user1)
    const buyerLoginRes = await fetch(`${baseUrl}/api/account/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`
      },
      body: JSON.stringify({ email: 'user1', password: '1234' })
    });
    assert.equal(buyerLoginRes.status, 200);
    const buyerCookie = buyerLoginRes.headers.get('set-cookie') || '';

    // 10. POST /api/market/parts/:id/reserve (Atomic Reservation & 8% Take-Rate)
    const reservationKey = '85fb5876-18b4-45c6-8267-10b046b1ed81';
    const reserveRes = await fetch(`${baseUrl}/api/market/parts/${listingId}/reserve`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: buyerCookie
      },
      body: JSON.stringify({
        reservationKey,
        quantity: 1,
        address: 'Blk 12 Lot 3 Silicon Hub, Cyberzone, Taguig City'
      })
    });
    assert.equal(reserveRes.status, 200);
    const orderJson = (await reserveRes.json()) as any;
    const orderId = orderJson.order.id;
    assert.equal(orderJson.order.totalCentavos, 345000);
    assert.equal(orderJson.order.platformFeeRate, 800);
    assert.equal(orderJson.order.platformFeeCentavos, 27600); // 8% of 345000 = 27600
    assert.equal(orderJson.order.sellerPayoutCentavos, 317400); // 345000 - 27600 = 317400

    // 11. GET /api/market/orders/:id
    const orderDetailRes = await fetch(`${baseUrl}/api/market/orders/${orderId}`, {
      headers: { cookie: buyerCookie }
    });
    assert.equal(orderDetailRes.status, 200);

    // 12. GET /api/market/workspace (Buyer)
    const buyerWsRes = await fetch(`${baseUrl}/api/market/workspace`, {
      headers: { cookie: buyerCookie }
    });
    assert.equal(buyerWsRes.status, 200);
    const buyerWs = (await buyerWsRes.json()) as any;
    assert.ok(buyerWs.orders.length >= 1);

    // 13. POST /api/market/orders/:id (Seller ships order)
    const shipRes = await fetch(`${baseUrl}/api/market/orders/${orderId}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: sellerCookie
      },
      body: JSON.stringify({
        action: 'ship',
        courier: 'LBC',
        trackingNumber: 'LBC-123456789'
      })
    });
    assert.equal(shipRes.status, 200);
    const shippedOrder = (await shipRes.json()) as any;
    assert.equal(shippedOrder.order.status, 'shipped');

    // 13b. Buyer receives and files dispute
    const receiveRes = await fetch(`${baseUrl}/api/market/orders/${orderId}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: buyerCookie
      },
      body: JSON.stringify({ action: 'receive' })
    });
    assert.equal(receiveRes.status, 200);

    const disputeRes = await fetch(`${baseUrl}/api/market/orders/${orderId}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: buyerCookie
      },
      body: JSON.stringify({ action: 'dispute', dispute: 'Display cable connector is corroded and missing solder pads.' })
    });
    assert.equal(disputeRes.status, 200);
    const disputedOrder = (await disputeRes.json()) as any;
    assert.equal(disputedOrder.order.status, 'disputed');

    // 13c. Seller resolves dispute
    const resolveRes = await fetch(`${baseUrl}/api/market/orders/${orderId}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: sellerCookie
      },
      body: JSON.stringify({ action: 'resolve_dispute' })
    });
    assert.equal(resolveRes.status, 200);
    const resolvedOrder = (await resolveRes.json()) as any;
    assert.equal(resolvedOrder.order.status, 'completed');

    // 14. Admin seller verification toggle
    const adminLoginRes = await fetch(`${baseUrl}/api/account/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`
      },
      body: JSON.stringify({ email: 'user3', password: '1234' })
    });
    assert.equal(adminLoginRes.status, 200);
    const adminCookie = adminLoginRes.headers.get('set-cookie') || '';

    const verifyRes = await fetch(`${baseUrl}/api/market/sellers/${createdListingJson.listing.sellerId}/verify`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': `http://127.0.0.1:${port}`,
        cookie: adminCookie
      },
      body: JSON.stringify({ verified: true })
    });
    assert.equal(verifyRes.status, 200);
    const verifiedUser = (await verifyRes.json()) as any;
    assert.equal(verifiedUser.user.sellerVerified, true);

  } finally {
    await new Promise((resolve) => server.close(resolve));
    await closeDatabase();
  }
});
