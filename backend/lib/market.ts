import { and, asc, desc, eq, gte, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from './db';
import { user, listing, order } from '../db/schema';
import { brands, categories, conditions, listingInput, MarketError, parse, priceCentavos, reservationInput } from './validation';
export { MarketError } from './validation';
export type Actor = { id: string; role: string };
function allowed(condition: unknown, message = 'This action is forbidden.'): asserts condition { if (!condition) throw new MarketError(403, message); }
function found<T>(value: T | undefined): T { if (!value) throw new MarketError(404, 'Record not found.'); return value; }
const publicSeller = { id: user.id, name: user.name, location: user.location, sellerVerified: user.sellerVerified };
function listingData(input: unknown, editing = false) {
  const data = parse(listingInput, input);
  if ((!editing && data.quantity === 0) || (data.quantity > 0 && data.minimumQuantity > data.quantity)) throw new MarketError(422, 'Check available stock and minimum quantity.', { quantity: 'Minimum order cannot exceed available stock.' });
  const { price, ...rest } = data;
  return { ...rest, priceCentavos: priceCentavos(price), art: data.category === 'Displays' ? 'display' : data.category === 'Cameras' ? 'camera' : data.category === 'ICs & chips' ? 'chip' : 'board' };
}
export async function catalog(params: URLSearchParams) {
  const filters = parse(z.object({
    q: z.string().max(100).optional(), category: z.enum(categories).optional(), brand: z.enum(brands).optional(),
    condition: z.enum(conditions).optional(), boardClass: z.string().optional(), storageGb: z.string().optional(),
    sort: z.enum(['newest', 'price-low', 'price-high']).optional(), verified: z.literal('1').optional(), page: z.coerce.number().int().min(1).optional()
  }), Object.fromEntries([...params].filter(([, v]) => v !== '')));
  const db = await getDb();
  const where = and(
    eq(listing.isActive, true),
    gte(listing.quantity, listing.minimumQuantity),
    filters.q ? or(
      ilike(listing.title, `%${filters.q}%`),
      ilike(listing.model, `%${filters.q}%`),
      ilike(listing.description, `%${filters.q}%`),
      ilike(listing.storageGb, `%${filters.q}%`),
      ilike(listing.boardClass, `%${filters.q}%`),
      ilike(listing.icCode, `%${filters.q}%`)
    ) : undefined,
    filters.category ? eq(listing.category, filters.category) : undefined,
    filters.brand ? eq(listing.brand, filters.brand) : undefined,
    filters.condition ? eq(listing.condition, filters.condition) : undefined,
    filters.boardClass ? ilike(listing.boardClass, `%${filters.boardClass}%`) : undefined,
    filters.storageGb ? ilike(listing.storageGb, `%${filters.storageGb}%`) : undefined,
    filters.verified ? eq(user.sellerVerified, true) : undefined
  );
  const page = filters.page ?? 1;
  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(listing).innerJoin(user, eq(listing.sellerId, user.id)).where(where);
  const rows = await db.select({ listing, seller: publicSeller }).from(listing).innerJoin(user, eq(listing.sellerId, user.id)).where(where).orderBy(filters.sort === 'price-low' ? asc(listing.priceCentavos) : filters.sort === 'price-high' ? desc(listing.priceCentavos) : desc(listing.createdAt), desc(listing.id)).limit(12).offset((page - 1) * 12);
  return { listings: rows.map(r => ({ ...r.listing, seller: r.seller })), total, page, pages: Math.max(1, Math.ceil(total / 12)) };
}
export async function getListing(id: number, actor?: Actor | null) {
  const db = await getDb();
  const row = found((await db.select({ listing, seller: publicSeller }).from(listing).innerJoin(user, eq(listing.sellerId, user.id)).where(eq(listing.id, id)))[0]);
  if (!row.listing.isActive && actor?.id !== row.listing.sellerId) throw new MarketError(404, 'Record not found.');
  return { ...row.listing, seller: row.seller };
}
export async function createListing(actor: Actor, input: unknown) {
  allowed(actor.role === 'seller'); const db = await getDb();
  return (await db.insert(listing).values({ ...listingData(input), sellerId: actor.id }).returning())[0];
}
export async function updateListing(actor: Actor, id: number, input: unknown) {
  const data = listingData(input, true); const { stockVersion } = parse(z.object({ stockVersion: z.number().int().min(0) }), input);
  const db = await getDb(); return db.transaction(async tx => {
    const current = found((await tx.select().from(listing).where(eq(listing.id, id)).for('update'))[0]);
    allowed(actor.role === 'seller' && current.sellerId === actor.id);
    if (current.stockVersion !== stockVersion) throw new MarketError(409, 'This listing changed. Reload before saving.');
    return (await tx.update(listing).set({ ...data, stockVersion: current.stockVersion + 1, updatedAt: new Date() }).where(eq(listing.id, id)).returning())[0];
  });
}
export async function visibility(actor: Actor, id: number, input: unknown) {
  const data = parse(z.object({ isActive: z.boolean() }), input); const db = await getDb();
  return db.transaction(async tx => {
    const current = found((await tx.select().from(listing).where(eq(listing.id, id)).for('update'))[0]);
    allowed(actor.role === 'seller' && current.sellerId === actor.id);
    return (await tx.update(listing).set({ ...data, stockVersion: current.stockVersion + 1, updatedAt: new Date() }).where(eq(listing.id, id)).returning())[0];
  });
}
export async function adjustStock(actor: Actor, id: number, input: unknown) {
  const data = parse(z.object({ quantity: z.number().int().min(0).max(10000), stockVersion: z.number().int().min(0).optional() }), input);
  const db = await getDb();
  return db.transaction(async tx => {
    const current = found((await tx.select().from(listing).where(eq(listing.id, id)).for('update'))[0]);
    allowed(actor.role === 'seller' && current.sellerId === actor.id);
    if (data.stockVersion !== undefined && current.stockVersion !== data.stockVersion) {
      throw new MarketError(409, 'Stale stock edit: The listing stock was modified in another session. Please reload to see the current inventory.');
    }
    if (current.minimumQuantity > data.quantity && data.quantity > 0) {
      throw new MarketError(422, 'Stock quantity cannot be less than the minimum order requirement.', { quantity: `Minimum order is ${current.minimumQuantity} units.` });
    }
    return (await tx.update(listing).set({ quantity: data.quantity, stockVersion: current.stockVersion + 1, updatedAt: new Date() }).where(eq(listing.id, id)).returning())[0];
  });
}
export const PLATFORM_FEE_RATE_BPS = 800; // 8% Marketplace Escrow Take-Rate from Business Proposal
export async function reserve(actor: Actor, id: number, input: unknown) {
  allowed(actor.role === 'buyer', 'A buyer account is required.'); const data = parse(reservationInput, input); const db = await getDb();
  return db.transaction(async tx => {
    found((await tx.select({ id: user.id }).from(user).where(eq(user.id, actor.id)).for('update'))[0]);
    const existing = (await tx.select().from(order).where(and(eq(order.buyerId, actor.id), eq(order.reservationKey, data.reservationKey))))[0];
    if (existing) {
      if (existing.listingId !== id || existing.quantity !== data.quantity || existing.address !== data.address) throw new MarketError(409, 'This submission key was already used for a different reservation.');
      return existing;
    }
    const stock = found((await tx.select().from(listing).where(eq(listing.id, id)).for('update'))[0]);
    allowed(stock.sellerId !== actor.id, 'You cannot reserve your own listing.');
    if (!stock.isActive) throw new MarketError(409, 'This listing has been paused.');
    if (data.quantity < stock.minimumQuantity || data.quantity > stock.quantity) throw new MarketError(422, 'Choose a quantity within the minimum order and available stock.', { quantity: 'Quantity is outside available stock or minimum order.' });
    const totalCentavos = stock.priceCentavos * data.quantity;
    const platformFeeRate = PLATFORM_FEE_RATE_BPS;
    const platformFeeCentavos = Math.round((totalCentavos * platformFeeRate) / 10000);
    const sellerPayoutCentavos = totalCentavos - platformFeeCentavos;
    const created = (await tx.insert(order).values({ ...data, buyerId: actor.id, listingId: id, totalCentavos, platformFeeRate, platformFeeCentavos, sellerPayoutCentavos, listingSnapshot: { title: stock.title, model: stock.model, condition: stock.condition, boardClass: stock.boardClass, storageGb: stock.storageGb, ramGb: stock.ramGb, icCode: stock.icCode, description: stock.description, diagnostics: stock.diagnostics } }).returning())[0];
    await tx.update(listing).set({ quantity: stock.quantity - data.quantity, stockVersion: stock.stockVersion + 1, updatedAt: new Date() }).where(eq(listing.id, id));
    return created;
  });
}
export async function getOrder(actor: Actor, id: number) {
  const db = await getDb(); const result = found((await db.select().from(order).where(eq(order.id, id)))[0]);
  const part = await getListingForOrder(result.listingId); allowed(actor.role === 'admin' || actor.id === result.buyerId || actor.id === part.sellerId);
  const buyer = found((await db.select(publicSeller).from(user).where(eq(user.id, result.buyerId)))[0]);
  return { ...result, listing: part, buyer };
}
async function getListingForOrder(id: number) {
  const db = await getDb(); const row = found((await db.select({ listing, seller: publicSeller }).from(listing).innerJoin(user, eq(listing.sellerId, user.id)).where(eq(listing.id, id)))[0]);
  return { ...row.listing, seller: row.seller };
}
export async function workspace(actor: Actor) {
  const db = await getDb();
  const related = await db.select({ id: order.id }).from(order).innerJoin(listing, eq(order.listingId, listing.id)).where(or(eq(order.buyerId, actor.id), eq(listing.sellerId, actor.id))).orderBy(desc(order.createdAt));
  const orders = await Promise.all(related.map(r => getOrder(actor, r.id)));
  let allOrders: Awaited<ReturnType<typeof getOrder>>[] = [];
  let platformStats = { totalGmv: 0, totalPlatformRevenue: 0, completedRevenue: 0, pendingRevenue: 0, commissionRate: 8, orderCount: 0 };
  if (actor.role === 'admin') {
    const allOrderIds = await db.select({ id: order.id }).from(order).orderBy(desc(order.createdAt));
    allOrders = await Promise.all(allOrderIds.map(r => getOrder(actor, r.id)));
    const gmv = allOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalCentavos : 0), 0);
    const platformRev = allOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.platformFeeCentavos : 0), 0);
    const completedRev = allOrders.reduce((sum, o) => sum + (o.status === 'completed' ? o.platformFeeCentavos : 0), 0);
    const pendingRev = allOrders.reduce((sum, o) => sum + (!['completed', 'cancelled'].includes(o.status) ? o.platformFeeCentavos : 0), 0);
    platformStats = { totalGmv: gmv, totalPlatformRevenue: platformRev, completedRevenue: completedRev, pendingRevenue: pendingRev, commissionRate: 8, orderCount: allOrders.length };
  }
  let sellerStats = { grossSales: 0, platformFees: 0, netPayout: 0 };
  if (actor.role === 'seller') {
    const sellerOrders = orders.filter(o => o.listing.sellerId === actor.id && o.status !== 'cancelled');
    const gross = sellerOrders.reduce((sum, o) => sum + o.totalCentavos, 0);
    const fees = sellerOrders.reduce((sum, o) => sum + o.platformFeeCentavos, 0);
    sellerStats = { grossSales: gross, platformFees: fees, netPayout: gross - fees };
  }
  return { orders, allOrders, platformStats, sellerStats, listings: await db.select().from(listing).where(eq(listing.sellerId, actor.id)).orderBy(desc(listing.createdAt)), sellers: actor.role === 'admin' ? await db.select(publicSeller).from(user).where(eq(user.role, 'seller')) : [], openOrderCount: orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length };
}
export async function updateOrder(actor: Actor, id: number, input: unknown, now = new Date()) {
  const { action } = parse(z.object({ action: z.enum(['ship', 'receive', 'complete', 'dispute', 'cancel', 'resolve_dispute']) }), input); const db = await getDb();
  return db.transaction(async tx => {
    const current = found((await tx.select().from(order).where(eq(order.id, id)).for('update'))[0]);
    const stock = found((await tx.select().from(listing).where(eq(listing.id, current.listingId)))[0]);
    const buyer = actor.id === current.buyerId; const seller = actor.id === stock.sellerId; const admin = actor.role === 'admin'; allowed(buyer || seller || admin);
    let changes: Partial<typeof order.$inferInsert> = { updatedAt: now };
    if (action === 'ship') { allowed(seller && current.status === 'reserved'); changes = { ...changes, ...parse(z.object({ courier: z.enum(['LBC', 'J&T', 'Lalamove']), trackingNumber: z.string().trim().min(1).max(100) }), input), status: 'shipped' }; }
    if (action === 'receive') { allowed(buyer && current.status === 'shipped'); changes = { ...changes, status: 'inspection', receivedAt: now }; }
    if (action === 'complete') { allowed(buyer && current.status === 'inspection'); changes.status = 'completed'; }
    if (action === 'dispute') { allowed(buyer && current.status === 'inspection' && current.receivedAt && now.getTime() <= current.receivedAt.getTime() + 72 * 3600000, 'The inspection window has closed.'); changes = { ...changes, ...parse(z.object({ dispute: z.string().trim().min(20).max(3000) }), input), status: 'disputed' }; }
    if (action === 'resolve_dispute') { allowed((admin || seller) && current.status === 'disputed'); changes.status = 'completed'; }
    if (action === 'cancel') {
      allowed((buyer || seller || admin) && current.status === 'reserved');
      const locked = found((await tx.select().from(listing).where(eq(listing.id, current.listingId)).for('update'))[0]);
      await tx.update(listing).set({ quantity: locked.quantity + current.quantity, stockVersion: locked.stockVersion + 1, updatedAt: now }).where(eq(listing.id, locked.id));
      changes.status = 'cancelled';
    }
    return (await tx.update(order).set(changes).where(eq(order.id, id)).returning())[0];
  });
}
export async function verifySeller(actor: Actor, id: string, input: unknown) {
  allowed(actor.role === 'admin'); const { verified } = parse(z.object({ verified: z.boolean() }), input); const db = await getDb();
  const seller = found((await db.select().from(user).where(eq(user.id, id)))[0]); allowed(seller.role === 'seller');
  return (await db.update(user).set({ sellerVerified: verified }).where(eq(user.id, id)).returning(publicSeller))[0];
}
