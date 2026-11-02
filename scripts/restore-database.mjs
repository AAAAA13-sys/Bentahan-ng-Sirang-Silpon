import { PGlite } from '../frontend/node_modules/@electric-sql/pglite/dist/index.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function restoreDatabase(targetDir = 'frontend/.data/postgres') {
  const candidateSeeds = [
    path.resolve(targetDir, '../../database-seed-export.json'),
    path.resolve('database-seed-export.json'),
    path.resolve('Bentahan-ng-Sirang-Silpon/database-seed-export.json'),
    path.resolve(__dirname, '../database-seed-export.json'),
    path.resolve(__dirname, '../backend/db/database-seed-export.json'),
    path.resolve(__dirname, '../frontend/db/database-seed-export.json')
  ];
  const seedFile = candidateSeeds.find(p => fs.existsSync(p));
  if (!seedFile) {
    console.log('[restore] database-seed-export.json not found, skipping restore.');
    return false;
  }

  const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  const db = new PGlite(targetDir);
  await db.waitReady;

  try {
    // 1. Restore Users
    if (data.user?.length) {
      for (const u of data.user) {
        await db.query(`
          INSERT INTO "user" (id, name, email, email_verified, image, role, location, seller_verified, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            location = EXCLUDED.location,
            seller_verified = EXCLUDED.seller_verified,
            updated_at = EXCLUDED.updated_at
        `, [
          u.id, u.name, u.email, u.email_verified ?? false, u.image ?? null,
          u.role ?? 'buyer', u.location ?? '', u.seller_verified ?? false,
          u.created_at || new Date().toISOString(), u.updated_at || new Date().toISOString()
        ]);
      }
      console.log(`[restore] Restored/updated ${data.user.length} users.`);
    }

    // 2. Restore Accounts
    if (data.account?.length) {
      for (const a of data.account) {
        await db.query(`DELETE FROM "account" WHERE (provider_id = $1 AND account_id = $2) OR id = $3`, [a.provider_id, a.account_id, a.id]);
        await db.query(`
          INSERT INTO "account" (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          a.id, a.account_id, a.provider_id, a.user_id, a.access_token ?? null,
          a.refresh_token ?? null, a.id_token ?? null, a.access_token_expires_at ?? null,
          a.refresh_token_expires_at ?? null, a.scope ?? null, a.password ?? null,
          a.created_at || new Date().toISOString(), a.updated_at || new Date().toISOString()
        ]);
      }
      console.log(`[restore] Restored/updated ${data.account.length} accounts.`);
    }

    // 3. Restore Listings
    if (data.listing?.length) {
      for (const l of data.listing) {
        await db.query(`
          INSERT INTO listing (id, seller_id, title, brand, model, category, condition, description, diagnostics, price_centavos, quantity, minimum_quantity, art, is_active, stock_version, board_class, storage_gb, ram_gb, ic_code, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            brand = EXCLUDED.brand,
            model = EXCLUDED.model,
            category = EXCLUDED.category,
            condition = EXCLUDED.condition,
            description = EXCLUDED.description,
            diagnostics = EXCLUDED.diagnostics,
            price_centavos = EXCLUDED.price_centavos,
            quantity = EXCLUDED.quantity,
            minimum_quantity = EXCLUDED.minimum_quantity,
            art = EXCLUDED.art,
            is_active = EXCLUDED.is_active,
            board_class = EXCLUDED.board_class,
            storage_gb = EXCLUDED.storage_gb,
            ram_gb = EXCLUDED.ram_gb,
            ic_code = EXCLUDED.ic_code,
            updated_at = EXCLUDED.updated_at
        `, [
          l.id, l.seller_id, l.title, l.brand, l.model, l.category, l.condition,
          l.description, l.diagnostics, l.price_centavos, l.quantity, l.minimum_quantity,
          l.art, l.is_active ?? true, l.stock_version ?? 0, l.board_class ?? '',
          l.storage_gb ?? '', l.ram_gb ?? '', l.ic_code ?? null,
          l.created_at || new Date().toISOString(), l.updated_at || new Date().toISOString()
        ]);
      }
      await db.query(`SELECT setval(pg_get_serial_sequence('listing', 'id'), COALESCE((SELECT MAX(id) FROM listing), 1))`);
      console.log(`[restore] Restored/updated ${data.listing.length} listings.`);
    }

    // 4. Restore Orders
    if (data.order?.length) {
      for (const o of data.order) {
        await db.query(`
          INSERT INTO "order" (id, listing_id, buyer_id, quantity, total_centavos, status, address, courier, tracking_number, received_at, dispute, listing_snapshot, reservation_key, platform_fee_rate, platform_fee_centavos, seller_payout_centavos, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            tracking_number = EXCLUDED.tracking_number,
            courier = EXCLUDED.courier,
            dispute = EXCLUDED.dispute,
            updated_at = EXCLUDED.updated_at
        `, [
          o.id, o.listing_id, o.buyer_id, o.quantity, o.total_centavos, o.status,
          o.address ?? '', o.courier ?? null, o.tracking_number ?? null,
          o.received_at ?? null, o.dispute ?? null,
          typeof o.listing_snapshot === 'string' ? o.listing_snapshot : JSON.stringify(o.listing_snapshot || {}),
          o.reservation_key ?? null, o.platform_fee_rate ?? 800,
          o.platform_fee_centavos ?? 0, o.seller_payout_centavos ?? 0,
          o.created_at || new Date().toISOString(), o.updated_at || new Date().toISOString()
        ]);
      }
      await db.query(`SELECT setval(pg_get_serial_sequence('"order"', 'id'), COALESCE((SELECT MAX(id) FROM "order"), 1))`);
      console.log(`[restore] Restored/updated ${data.order.length} orders.`);
    }

    console.log('[restore] All accounts, listings, and orders successfully restored.');
    return true;
  } finally {
    await db.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('restore-database.mjs')) {
  const dir = process.argv[2] || 'frontend/.data/postgres';
  restoreDatabase(dir).catch(err => {
    console.error('[restore] Error:', err);
    process.exit(1);
  });
}
