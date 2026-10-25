import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, initializeDatabase, closeDatabase } from '../lib/db';
import { user, account, listing, order } from '../db/schema';

const id = z.union([z.string().regex(/^\d+$/), z.number().int().positive()]);
const date = z.string().datetime({ offset: true }).nullable();
const dates = { created_at: date, updated_at: date };
const flag = z.union([z.boolean(), z.literal(0), z.literal(1)]).transform(Boolean);
const legacyUser = z.object({ id, name: z.string(), email: z.string().email(), password: z.string().min(1), email_verified_at: date, role: z.enum(['buyer', 'seller', 'admin']), location: z.string(), seller_verified: flag, ...dates });
const legacyListing = z.object({ id: z.number().int().positive(), seller_id: id, title: z.string(), brand: z.string(), model: z.string(), category: z.string(), condition: z.string(), board_class: z.string().optional().default('Grade A (Complete / All ICs)'), storage_gb: z.string().optional().default('128GB'), ram_gb: z.string().optional().default('6GB'), ic_code: z.string().nullable().optional(), description: z.string(), diagnostics: z.string(), price_centavos: z.number().int().min(0), quantity: z.number().int().min(0), minimum_quantity: z.number().int().positive(), art: z.string(), is_active: flag, stock_version: z.number().int().min(0), ...dates });
const legacyOrder = z.object({ id: z.number().int().positive(), buyer_id: id, listing_id: z.number().int().positive(), quantity: z.number().int().positive(), total_centavos: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), status: z.enum(['reserved', 'shipped', 'inspection', 'completed', 'cancelled', 'disputed']), address: z.string(), courier: z.string().nullable(), tracking_number: z.string().nullable(), received_at: date, dispute: z.string().nullable(), listing_snapshot: z.union([z.string(), z.record(z.unknown())]).nullable(), reservation_key: z.string().uuid().nullable(), ...dates });
function timestamps(row: { created_at: string | null; updated_at: string | null }) {
  return { createdAt: row.created_at ? new Date(row.created_at) : new Date(), updatedAt: row.updated_at ? new Date(row.updated_at) : new Date() };
}

async function main() {
  const source = resolve(process.cwd(), '.data/legacy-import.json');
  const data = z.object({ version: z.literal(1), users: z.array(legacyUser), listings: z.array(legacyListing), orders: z.array(legacyOrder) }).parse(JSON.parse(await readFile(source, 'utf8')));
  await initializeDatabase();
  const db = await getDb();
  const imported = await db.transaction(async tx => {
    await tx.execute(sql`CREATE TABLE IF NOT EXISTS legacy_import (id text PRIMARY KEY, completed_at timestamptz NOT NULL DEFAULT now())`);
    await tx.execute(sql`LOCK TABLE legacy_import IN EXCLUSIVE MODE`);
    const marker = await tx.select({ id: sql<string>`id` }).from(sql`legacy_import`).where(sql`id = 'laravel-v1'`);
    if (marker.length) return false;
    await tx.execute(sql`LOCK TABLE "user", account, listing, "order" IN ACCESS EXCLUSIVE MODE`);
    const existing = await tx.select({ count: sql<number>`count(*)::int` }).from(user);
    const accounts = await tx.select({ count: sql<number>`count(*)::int` }).from(account);
    const listings = await tx.select({ count: sql<number>`count(*)::int` }).from(listing);
    const orders = await tx.select({ count: sql<number>`count(*)::int` }).from(order);
    if ([existing, accounts, listings, orders].some(rows => rows[0].count > 0)) throw new Error('Target database is not empty.');
    for (const row of data.users) {
      await tx.insert(user).values({ id: String(row.id), name: row.name, email: row.email, emailVerified: row.email_verified_at !== null, role: row.role, location: row.location, sellerVerified: row.seller_verified, ...timestamps(row) });
      await tx.insert(account).values({ id: randomUUID(), accountId: String(row.id), providerId: 'credential', userId: String(row.id), password: row.password, ...timestamps(row) });
    }
    for (const row of data.listings) await tx.insert(listing).values({ id: row.id, sellerId: String(row.seller_id), title: row.title, brand: row.brand, model: row.model, category: row.category, condition: row.condition, boardClass: row.board_class || 'Grade A (Complete / All ICs)', storageGb: row.storage_gb || '128GB', ramGb: row.ram_gb || '6GB', icCode: row.ic_code || null, description: row.description, diagnostics: row.diagnostics, priceCentavos: row.price_centavos, quantity: row.quantity, minimumQuantity: row.minimum_quantity, art: row.art, isActive: row.is_active, stockVersion: row.stock_version, ...timestamps(row) });
    for (const row of data.orders) {
      const snapshot: unknown = typeof row.listing_snapshot === 'string' ? JSON.parse(row.listing_snapshot) : row.listing_snapshot;
      const listingSnapshot = snapshot === null ? {} : z.record(z.unknown()).parse(snapshot);
      const feeRate = 800;
      const feeCentavos = Math.round((row.total_centavos * feeRate) / 10000);
      const sellerPayout = row.total_centavos - feeCentavos;
      await tx.insert(order).values({ id: row.id, buyerId: String(row.buyer_id), listingId: row.listing_id, quantity: row.quantity, totalCentavos: row.total_centavos, platformFeeRate: feeRate, platformFeeCentavos: feeCentavos, sellerPayoutCentavos: sellerPayout, status: row.status, address: row.address, courier: row.courier, trackingNumber: row.tracking_number, receivedAt: row.received_at ? new Date(row.received_at) : null, dispute: row.dispute, listingSnapshot, reservationKey: row.reservation_key, ...timestamps(row) });
    }
    await tx.execute(sql`SELECT setval(pg_get_serial_sequence('listing', 'id'), COALESCE((SELECT MAX(id) FROM listing), 1), EXISTS(SELECT 1 FROM listing))`);
    await tx.execute(sql`SELECT setval(pg_get_serial_sequence('"order"', 'id'), COALESCE((SELECT MAX(id) FROM "order"), 1), EXISTS(SELECT 1 FROM "order"))`);
    await tx.execute(sql`INSERT INTO legacy_import (id) VALUES ('laravel-v1')`);
    return true;
  });
  console.log(imported ? `Imported ${data.users.length} users, ${data.listings.length} listings, ${data.orders.length} orders.` : 'Import already completed; no changes.');
}
main().catch(() => { console.error('Legacy import failed. Check the private export and ensure the target database is empty.'); process.exitCode = 1; }).finally(() => closeDatabase());
