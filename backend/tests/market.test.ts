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

test('cart checkout, verified pass listings, vouchers, and B2B buyer tier fee rates', async () => {
  const { initializeDatabase, getDb } = await import('../lib/db');
  const { user, listing, order } = await import('../db/schema');
  const market = await import('../lib/market');
  const { eq } = await import('drizzle-orm');
  await initializeDatabase();
  const db = await getDb();

  const seller = { id: 'seller-vp', name: 'VP Seller', email: 'seller-vp@test.invalid', role: 'seller', location: 'Greenhills', sellerVerified: true, tier: 'starter', phone: '09171234567' };
  const proBuyer = { id: 'buyer-pro', name: 'Pro Buyer', email: 'buyer-pro@test.invalid', role: 'buyer', location: 'Quiapo', sellerVerified: false, tier: 'pro', phone: '09181234567' };
  const enterpriseBuyer = { id: 'buyer-ent', name: 'Enterprise Buyer', email: 'buyer-ent@test.invalid', role: 'buyer', location: 'Pasig', sellerVerified: false, tier: 'enterprise', phone: '09191234567' };
  await db.insert(user).values([seller, proBuyer, enterpriseBuyer]);

  // Create Verified Pass Listing
  const vpListing = await market.createListing(seller, {
    title: 'iPhone 12 Pro Logic Board Verified Pass',
    brand: 'Apple',
    model: 'iPhone 12 Pro',
    category: 'Donor boards',
    condition: 'Tested working',
    boardClass: 'Grade A (Complete / All ICs)',
    storageGb: '256GB',
    ramGb: '6GB',
    icCode: 'APL1099',
    verifiedPass: true,
    icStatus: 'PMIC, Audio IC & Baseband pads verified unheated / intact',
    chassisModel: 'A2402, A2403',
    description: 'Fully inspected donor board with Verified Pass diagnostic badge.',
    diagnostics: 'Microscope impedance test passed on all key power rails.',
    price: '2500.00',
    quantity: 10,
    minimumQuantity: 1
  });

  assert.equal(vpListing.verifiedPass, true);
  assert.equal(vpListing.chassisModel, 'A2402, A2403');

  // Verify catalog search by chassis model and verified pass filter
  const vpCatalog = await market.catalog(new URLSearchParams({ verifiedPass: '1' }));
  assert.ok(vpCatalog.listings.some(l => l.id === vpListing.id));
  const chassisCatalog = await market.catalog(new URLSearchParams({ q: 'A2402' }));
  assert.ok(chassisCatalog.listings.some(l => l.id === vpListing.id));

  // Cart Checkout with Pro Buyer (5% fee rate) and 10% Partner Voucher
  const cartResult = await market.checkoutCart(proBuyer, {
    items: [
      { listingId: vpListing.id, quantity: 2, reservationKey: 'e81a34bb-b5c6-433a-9e12-32b04f32c111' }
    ],
    address: '456 Repair Street, Greenhills Shopping Center, San Juan',
    courier: 'Lalamove',
    voucherCode: 'REPAIRPH10'
  });

  assert.equal(cartResult.orders.length, 1);
  const cartOrder = cartResult.orders[0];
  // 2 * 2500.00 = 5000.00 = 500000 centavos
  // 10% voucher discount = 50000 centavos -> payable 450000 centavos
  assert.equal(cartOrder.discountCentavos, 50000);
  assert.equal(cartOrder.totalCentavos, 450000);
  // Pro tier = 5% platform fee (500 bps)
  assert.equal(cartOrder.platformFeeRate, 500);
  assert.equal(cartOrder.platformFeeCentavos, Math.round((450000 * 500) / 10000)); // 22500 centavos
  assert.equal(cartOrder.sellerPayoutCentavos, 450000 - 22500); // 427500 centavos
  assert.equal(cartOrder.courier, 'Lalamove');
  assert.equal(cartOrder.voucherCode, 'REPAIRPH10');

  // Check remaining stock
  const updatedListing = (await db.select().from(listing).where(eq(listing.id, vpListing.id)))[0];
  assert.equal(updatedListing.quantity, 8);

  // Cart Checkout with Enterprise Buyer (0% fee rate)
  const entResult = await market.checkoutCart(enterpriseBuyer, {
    items: [
      { listingId: vpListing.id, quantity: 1, reservationKey: 'e81a34bb-b5c6-433a-9e12-32b04f32c222' }
    ],
    address: '789 Enterprise Blvd, Ortigas Center, Pasig City',
    courier: 'J&T'
  });
  assert.equal(entResult.orders.length, 1);
  const entOrder = entResult.orders[0];
  assert.equal(entOrder.platformFeeRate, 0);
  assert.equal(entOrder.platformFeeCentavos, 0);
  assert.equal(entOrder.sellerPayoutCentavos, entOrder.totalCentavos);

  // getUserOrders retrieves all user orders
  const proOrders = await market.getUserOrders(proBuyer);
  assert.ok(proOrders.some(o => o.id === cartOrder.id));
});
