process.env.SILICON_DATA_DIR ??= ':memory:';
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLATFORM_FEE_RATE_BPS, catalog, adjustStock, reserve, updateOrder } from '../lib/market';
import { initializeDatabase, closeDatabase, getDb } from '../lib/db';
import { listing, order, user } from '../db/schema';
import { eq } from 'drizzle-orm';
import { MarketError } from '../lib/validation';

test('Silicon Trading Market Core Suite', async t => {
  await initializeDatabase();
  const db = await getDb();

  // Clean or ensure test users exist
  const buyerId = 'test-buyer-' + Date.now();
  const sellerId = 'test-seller-' + Date.now();

  await db.insert(user).values([
    { id: buyerId, name: 'Automated Test Buyer', email: `${buyerId}@test.ph`, role: 'buyer', location: 'Quiapo, Manila', sellerVerified: false },
    { id: sellerId, name: 'Automated Test Seller', email: `${sellerId}@test.ph`, role: 'seller', location: 'Greenhills, San Juan', sellerVerified: true },
  ]);

  // Create test listing
  const [createdListing] = await db.insert(listing).values({
    sellerId,
    title: 'iPhone 13 Logic Board Clean Bench Pull',
    brand: 'Apple',
    model: 'iPhone 13 / A2633',
    category: 'Donor boards',
    condition: 'Tested working',
    boardClass: 'Grade A (Complete / All ICs)',
    storageGb: '128GB',
    ramGb: '4GB',
    icCode: 'A15-APL1W07',
    description: 'Fresh bench pull logic board with 100% intact solder pads and normal 0.75A boot current.',
    diagnostics: 'Tested on DC bench power supply. No shorts on VBAT or VDD_MAIN. Pads intact.',
    priceCentavos: 185000, // ₱1,850.00
    quantity: 10,
    minimumQuantity: 1,
    art: '/images/listings/listing_iphone_board_clean.jpg',
  }).returning();

  await t.test('1. Financial Transparency: 8% fee calculation matches integer centavos', () => {
    const qty = 2;
    const unitPrice = createdListing.priceCentavos; // 185000
    const totalCentavos = qty * unitPrice; // 370000 (₱3,700.00)
    assert.equal(PLATFORM_FEE_RATE_BPS, 800, 'Platform fee rate must be 800 basis points (8%)');

    const platformFeeCentavos = Math.round((totalCentavos * PLATFORM_FEE_RATE_BPS) / 10000);
    assert.equal(platformFeeCentavos, 29600, 'Platform fee for ₱3,700 must be ₱296.00');

    const sellerPayout = totalCentavos - platformFeeCentavos;
    assert.equal(sellerPayout, 340400, 'Seller net payout must be ₱3,404.00');
  });

  await t.test('2. Catalog faceted search retrieves listing by brand, storage, and scrap grade', async () => {
    const params = new URLSearchParams({
      brand: 'Apple',
      category: 'Donor boards',
      storageGb: '128GB',
      boardClass: 'Grade A',
    });
    const result = await catalog(params);
    assert.ok(result.total >= 1, 'Should find at least 1 matching listing');
    const match = result.listings.find(l => l.id === createdListing.id);
    assert.ok(match, 'Created test listing must be present in filtered catalog');
    assert.equal(match.brand, 'Apple');
    assert.equal(match.storageGb, '128GB');
  });

  await t.test('3. Stock Adjuster: optimistic update and 409 conflict resilience', async () => {
    const actor = { id: sellerId, role: 'seller' };

    // Valid stock adjustment
    const updated = await adjustStock(actor, createdListing.id, {
      quantity: 15,
      stockVersion: createdListing.stockVersion,
    });
    assert.equal(updated.quantity, 15);
    assert.equal(updated.stockVersion, createdListing.stockVersion + 1);

    // Stale stock version (409 Conflict)
    await assert.rejects(
      async () => {
        await adjustStock(actor, createdListing.id, {
          quantity: 20,
          stockVersion: createdListing.stockVersion, // Stale version!
        });
      },
      (err: Error) => {
        return err instanceof MarketError && err.status === 409;
      },
      'Must reject stale stock edit with 409 Conflict'
    );
  });

  await t.test('4. Reservation: Stock ceiling check and order creation', async () => {
    const buyerActor = { id: buyerId, role: 'buyer' };
    const reservationKey = crypto.randomUUID();

    const orderRow = await reserve(buyerActor, createdListing.id, {
      reservationKey,
      quantity: 3,
      address: 'Raon Electronic Center, Gonzalo Puyat St, Quiapo, Manila, 1001 Metro Manila',
    });

    assert.equal(orderRow.buyerId, buyerId);
    assert.equal(orderRow.quantity, 3);
    assert.equal(orderRow.status, 'reserved');
    assert.equal(orderRow.totalCentavos, 3 * 185000);
    assert.equal(orderRow.platformFeeCentavos, Math.round((3 * 185000 * 800) / 10000));

    // Verify stock was decremented from 15 to 12
    const [freshStock] = await db.select().from(listing).where(eq(listing.id, createdListing.id));
    assert.equal(freshStock.quantity, 12, 'Available stock should be decremented after reservation');

    // Test idempotency with duplicate key
    const duplicate = await reserve(buyerActor, createdListing.id, {
      reservationKey,
      quantity: 3,
      address: 'Raon Electronic Center, Gonzalo Puyat St, Quiapo, Manila, 1001 Metro Manila',
    });
    assert.equal(duplicate.id, orderRow.id, 'Duplicate reservation key must return existing order idempotently');
  });

  await t.test('5. Order Lifecycle: Dispatch -> Receive -> 72h Dispute enforcement', async () => {
    const buyerActor = { id: buyerId, role: 'buyer' };
    const sellerActor = { id: sellerId, role: 'seller' };

    const reservationKey = crypto.randomUUID();
    const orderRow = await reserve(buyerActor, createdListing.id, {
      reservationKey,
      quantity: 1,
      address: 'SM North EDSA Annex, Cyberzone, Quezon City, 1105 Metro Manila',
    });

    // 1. Seller dispatches via LBC
    const shippedOrder = await updateOrder(sellerActor, orderRow.id, {
      action: 'ship',
      courier: 'LBC',
      trackingNumber: 'LBC-PH-778899',
    });
    assert.equal(shippedOrder.status, 'shipped');
    assert.equal(shippedOrder.courier, 'LBC');

    // 2. Buyer receives component -> inspection window begins
    const receiveTime = new Date();
    const inspectingOrder = await updateOrder(buyerActor, orderRow.id, { action: 'receive' }, receiveTime);
    assert.equal(inspectingOrder.status, 'inspection');
    assert.ok(inspectingOrder.receivedAt, 'receivedAt timestamp must be recorded');

    // 3. Dispute after 72 hours should be rejected
    const after72h = new Date(receiveTime.getTime() + 73 * 3600 * 1000); // 73 hours later
    await assert.rejects(
      async () => {
        await updateOrder(buyerActor, orderRow.id, {
          action: 'dispute',
          dispute: 'Microscope inspection revealed lifted CPU pads and solder bridge under PMIC.',
        }, after72h);
      },
      (err: Error) => {
        return err instanceof MarketError && err.status === 403;
      },
      'Must reject dispute raised after 72-hour inspection window closed'
    );

    // 4. Dispute within 72 hours is accepted
    const within48h = new Date(receiveTime.getTime() + 48 * 3600 * 1000); // 48 hours later
    const disputedOrder = await updateOrder(buyerActor, orderRow.id, {
      action: 'dispute',
      dispute: 'Microscope inspection revealed lifted CPU pads and solder bridge under PMIC.',
    }, within48h);
    assert.equal(disputedOrder.status, 'disputed');

    // 5. Admin or Seller resolves dispute and settles order
    const adminActor = { id: 'admin-1', role: 'admin' };
    const settledOrder = await updateOrder(adminActor, orderRow.id, { action: 'resolve_dispute' });
    assert.equal(settledOrder.status, 'completed');
  });

  t.after(async () => {
    // Cleanup test records
    await db.delete(order).where(eq(order.buyerId, buyerId));
    await db.delete(listing).where(eq(listing.sellerId, sellerId));
    await db.delete(user).where(eq(user.id, buyerId));
    await db.delete(user).where(eq(user.id, sellerId));
    await closeDatabase();
  });
});
