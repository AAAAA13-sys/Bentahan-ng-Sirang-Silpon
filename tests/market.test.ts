import test, { after } from 'node:test';
import assert from 'node:assert/strict';
delete process.env.DATABASE_URL;
process.env.SILICON_DATA_DIR = ':memory:';
after(async () => { const { closeDatabase } = await import('../lib/db'); await closeDatabase(); });

test('reservation retries, stale edits, actor rules and cancellation preserve money and stock', async () => {
  const { initializeDatabase, getDb } = await import('../lib/db');
  const { user, listing, order } = await import('../db/schema');
  const market = await import('../lib/market');
  const { eq } = await import('drizzle-orm');
  await initializeDatabase();
  const db = await getDb();
  const seller = { id: 'test-seller', name: 'Seller', email: 'seller@test.invalid', role: 'seller', location: 'Pasig', sellerVerified: false };
  const buyer = { ...seller, id: 'test-buyer', email: 'buyer@test.invalid', role: 'buyer' };
  await db.insert(user).values([seller, buyer]);
  const input = { title: 'Test donor board', brand: 'Apple', model: 'A1', category: 'Donor boards', condition: 'For harvesting', boardClass: 'Grade A (Complete / All ICs)', storageGb: '256GB', ramGb: '8GB', icCode: 'KMQE60013M-B318', description: 'Board inspected with a complete and honest description.', diagnostics: 'Power rails inspected.', price: '123.45', quantity: 5, minimumQuantity: 1 };
  const part = await market.createListing(seller, input);
  assert.equal(part.boardClass, 'Grade A (Complete / All ICs)');
  assert.equal(part.storageGb, '256GB');
  assert.equal(part.ramGb, '8GB');
  assert.equal(part.icCode, 'KMQE60013M-B318');
  const cat256 = await market.catalog(new URLSearchParams({ storageGb: '256GB' }));
  assert.equal(cat256.listings.length, 1);
  assert.equal(cat256.listings[0].storageGb, '256GB');
  const payload = { reservationKey: '15fb5876-18b4-45c6-8267-10b046b1ed81', quantity: 2, address: '123 Test Street, Pasig City' };
  const first = await market.reserve(buyer, part.id, payload);
  assert.equal(first.totalCentavos, 24690);
  assert.equal(first.platformFeeRate, 800);
  assert.equal(first.platformFeeCentavos, 1975); // 8% of 24690 = 1975.2 -> 1975
  assert.equal(first.sellerPayoutCentavos, 22715); // 24690 - 1975 = 22715
  assert.equal((first.listingSnapshot as any).storageGb, '256GB');
  assert.equal((await market.reserve(buyer, part.id, payload)).id, first.id);
  await assert.rejects(market.reserve(buyer, part.id, { ...payload, quantity: 3 }), (e: any) => e.status === 409);
  await assert.rejects(market.updateListing(seller, part.id, { ...input, stockVersion: 0 }), (e: any) => e.status === 409);
  await assert.rejects(market.updateOrder(buyer, first.id, { action: 'ship', courier: 'LBC', trackingNumber: 'T1' }), (e: any) => e.status === 403);
  await market.updateOrder(buyer, first.id, { action: 'cancel' });
  await assert.rejects(market.updateOrder(buyer, first.id, { action: 'cancel' }), (e: any) => e.status === 403);
  assert.equal((await db.select().from(listing).where(eq(listing.id, part.id)))[0].quantity, 5);
  assert.equal((await db.select().from(order)).length, 1);
  assert.equal(first.listingSnapshot.title, input.title);
  const second = await market.reserve(buyer, part.id, { ...payload, reservationKey: '25fb5876-18b4-45c6-8267-10b046b1ed81' });
  assert.equal(second.platformFeeRate, 800);
  assert.equal(second.platformFeeCentavos, 1975);
  assert.equal(second.sellerPayoutCentavos, 22715);
  await market.updateOrder(seller, second.id, { action: 'ship', courier: 'LBC', trackingNumber: 'TEST123' });
  const receivedAt = new Date('2026-01-01T00:00:00Z');
  await market.updateOrder(buyer, second.id, { action: 'receive' }, receivedAt);
  await assert.rejects(market.updateOrder(buyer, second.id, { action: 'dispute', dispute: 'Component has damaged pads and does not match.' }, new Date(receivedAt.getTime() + 73 * 3600000)), (e: any) => e.status === 403);
  await market.updateOrder(buyer, second.id, { action: 'complete' });
  await assert.rejects(market.getOrder({ id: 'stranger', role: 'buyer' }, second.id), (e: any) => e.status === 403);
  const current = (await db.select().from(listing).where(eq(listing.id, part.id)))[0];
  await market.updateListing(seller, part.id, { ...input, title: 'Changed title', stockVersion: current.stockVersion });
  assert.equal((await market.getOrder(buyer, second.id)).listingSnapshot.title, input.title);
  const competing = await Promise.allSettled([
    market.reserve(buyer, part.id, { ...payload, quantity: 4, reservationKey: '35fb5876-18b4-45c6-8267-10b046b1ed81' }),
    market.reserve(buyer, part.id, { ...payload, quantity: 4, reservationKey: '45fb5876-18b4-45c6-8267-10b046b1ed81' }),
  ]);
  assert.equal(competing.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await db.select().from(listing).where(eq(listing.id, part.id)))[0].quantity, 1);

  // Platform Owner and Seller Workspace Commission Analytics
  const adminActor = { id: 'admin-user', name: 'Admin', email: 'admin@test.invalid', role: 'admin', location: 'HQ', sellerVerified: false };
  await db.insert(user).values(adminActor);
  const adminWs = await market.workspace(adminActor);
  assert.equal(adminWs.platformStats.commissionRate, 8);
  assert.ok(adminWs.platformStats.totalPlatformRevenue > 0);
  assert.ok(adminWs.platformStats.completedRevenue > 0);
  assert.ok(adminWs.allOrders.length >= 2);

  const sellerWs = await market.workspace(seller);
  assert.ok(sellerWs.sellerStats.grossSales > 0);
  assert.ok(sellerWs.sellerStats.platformFees > 0);
  assert.equal(sellerWs.sellerStats.netPayout, sellerWs.sellerStats.grossSales - sellerWs.sellerStats.platformFees);
});

test('decimal prices reject exponents, excess precision, and sub-peso values', async () => {
  const { listingInput, priceCentavos } = await import('../lib/validation');
  assert.equal(priceCentavos('999999.99'), 99999999);
  const price = listingInput.shape.price;
  for (const invalid of ['1e3', '1.001', '0.99', '-1', '1000000']) assert.equal(price.safeParse(invalid).success, false);
});

test('present cross-origin mutation requests are forbidden', async () => {
  const { sameOrigin } = await import('../lib/validation');
  assert.throws(() => sameOrigin(new Request('https://silicon.test/api/market/listings', { headers: { origin: 'https://attacker.test' } })), (e: any) => e.status === 403);
  sameOrigin(new Request('https://silicon.test/api/market/listings', { headers: { origin: 'https://silicon.test' } }));
});

test('same-origin guard uses browser Host when Next normalizes loopback URL', async()=>{
 const {sameOrigin}=await import('../lib/validation');
 assert.doesNotThrow(()=>sameOrigin(new Request('http://localhost:8090/api/account/login',{headers:{host:'127.0.0.1:8090',origin:'http://127.0.0.1:8090'}})));
 assert.throws(()=>sameOrigin(new Request('http://localhost:8090/api/account/login',{headers:{host:'127.0.0.1:8090',origin:'https://untrusted.invalid'}})));
});
