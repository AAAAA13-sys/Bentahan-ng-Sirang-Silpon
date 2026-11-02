import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { user, account, listing } from '../db/schema';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type * as schema from '../db/schema';

export interface ExistingAccountMeta {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  location: string;
  sellerVerified: boolean;
  tagline: string;
}

export const existingAccounts: ExistingAccountMeta[] = [
  {
    id: 'usr-buyer-juan',
    username: 'buyer',
    name: 'Juan Dela Cruz (Reclaim Tech)',
    email: 'buyer@silicon.ph',
    role: 'buyer',
    location: 'Quiapo, Manila',
    sellerVerified: false,
    tagline: 'Active Buyer & Smartphone Repair Bench',
  },
  {
    id: 'seller-quiapo',
    username: 'seller',
    name: 'Kuya Jhun Micro-Soldering',
    email: 'seller@silicon.ph',
    role: 'seller',
    location: 'Raon, Quiapo, Manila',
    sellerVerified: true,
    tagline: 'Verified Master Soldering Technician',
  },
  {
    id: 'usr-admin-silicon',
    username: 'admin',
    name: 'Silicon Trading Administrator',
    email: 'admin@silicon.ph',
    role: 'admin',
    location: 'Pasig City, Metro Manila',
    sellerVerified: false,
    tagline: 'Platform Escrow & Dispute Resolution Officer',
  },
  {
    id: 'seller-greenhills',
    username: 'greenhills',
    name: 'Greenhills Scrap Board Supplier',
    email: 'greenhills.scrap@silicon.ph',
    role: 'seller',
    location: 'Greenhills, San Juan',
    sellerVerified: true,
    tagline: 'Wholesale Donor Boards & IC Chips Hub',
  },
  {
    id: 'seller-cavite',
    username: 'cavite',
    name: 'Mark Tech Circuit & Board Recovery',
    email: 'marktech.cavite@silicon.ph',
    role: 'seller',
    location: 'Bacoor, Cavite',
    sellerVerified: true,
    tagline: 'OLED Panels & Reclaimed IC Modules',
  },
];

export const localAccounts = [
  { username: 'user1', role: 'buyer' as const, name: 'Local Buyer' },
  { username: 'user2', role: 'seller' as const, name: 'Local Seller' },
  { username: 'user3', role: 'admin' as const, name: 'Local Admin' },
] as const;

export function localUsernameEmail(value: string, _request?: Request): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'buyer') return 'buyer@silicon.ph';
  if (normalized === 'seller') return 'seller@silicon.ph';
  if (normalized === 'admin') return 'admin@silicon.ph';
  if (normalized === 'greenhills') return 'greenhills.scrap@silicon.ph';
  if (normalized === 'cavite') return 'marktech.cavite@silicon.ph';
  if (normalized === 'user1') return 'user1@local.silicon.test';
  if (normalized === 'user2') return 'user2@local.silicon.test';
  if (normalized === 'user3') return 'user3@local.silicon.test';
  return value;
}

export async function seedLocalAccounts(dbInstance?: PgliteDatabase<typeof schema> | any): Promise<boolean> {
  let db = dbInstance;
  if (!db) {
    const { getDb } = await import('./db');
    db = await getDb();
  }
  const passwordHash = '$2b$10$wzqAZdj4IcOKJY8z/81PTu29MCZDE1l8vdNpc/WL9VyMCkYgi5BJO';

  const legacyAccounts = [
    { id: 'legacy-jhun', name: 'Kuya Jhun Pasig Harvester', email: 'kuya.jhun@gmail.com', role: 'seller', location: 'Pasig City', sellerVerified: true },
    { id: 'legacy-juan', name: 'Juan Manila Tech', email: 'juan.repair@gmail.com', role: 'buyer', location: 'Manila', sellerVerified: false },
  ];
  const legacyPasswordHash = '$2b$10$it28APvBEAmz3Ihw0LlIWe9Li3cAZzuyMN3t/sY/5iQoorYKM/Id.';
  for (const item of [...existingAccounts, ...legacyAccounts]) {
    const [byEmail] = await db.select().from(user).where(eq(user.email, item.email));
    const [byId] = byEmail ? [] : await db.select().from(user).where(eq(user.id, item.id));
    const existing = byEmail || byId;
    const accountPassword = legacyAccounts.includes(item as typeof legacyAccounts[number]) ? legacyPasswordHash : passwordHash;
    let userId = existing?.id;
    if (!existing) {
      const [created] = await db.insert(user).values({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        location: item.location,
        sellerVerified: item.sellerVerified,
      }).onConflictDoNothing().returning();
      userId = created?.id || item.id;
    } else {
      await db.update(user).set({
        email: item.email,
        name: item.name,
        role: item.role,
        location: item.location,
        sellerVerified: item.sellerVerified,
        updatedAt: new Date(),
      }).where(eq(user.id, existing.id));
    }

    if (userId) {
      const credId = `${userId}-cred`;
      const [cred] = await db.select().from(account).where(eq(account.userId, userId));
      if (!cred) {
        await db.insert(account).values({
          id: credId,
          accountId: userId,
          providerId: 'credential',
          userId: userId,
          password: accountPassword,
        }).onConflictDoNothing();
      } else {
        await db.update(account).set({
          password: accountPassword,
          updatedAt: new Date(),
        }).where(eq(account.id, cred.id));
      }
    }
  }

  // Also maintain local test legacy accounts (user1, user2, user3)
  for (const item of localAccounts) {
    const id = 'local-' + item.username;
    const email = item.username + '@local.silicon.test';
    const [existing] = await db.select().from(user).where(eq(user.id, id));
    if (!existing) {
      await db.insert(user).values({
        id,
        name: item.name,
        email,
        role: item.role,
        location: 'Pasig City',
        sellerVerified: item.role === 'seller',
      }).onConflictDoNothing();
    }
    const [cred] = await db.select().from(account).where(eq(account.userId, id));
    if (!cred) {
      await db.insert(account).values({
        id: id + '-credential',
        accountId: id,
        providerId: 'credential',
        userId: id,
        password: passwordHash,
      }).onConflictDoNothing();
    } else {
      await db.update(account).set({
        password: passwordHash,
        updatedAt: new Date(),
      }).where(eq(account.id, cred.id));
    }
  }

  // Ensure listings ("the stuffs to be sold") are present for fresh migration
  try {
    const [sampleListing] = await db.select({ id: listing.id }).from(listing).limit(1);
    if (!sampleListing) {
      const localDir = path.dirname(fileURLToPath(import.meta.url));
      const candidates = [
        path.join(process.cwd(), 'database-seed-export.json'),
        path.join(process.cwd(), 'frontend', 'db', 'database-seed-export.json'),
        path.resolve(localDir, '../db/database-seed-export.json')
      ];
      const found = candidates.find(p => existsSync(p));
      if (found) {
        const seedPayload = JSON.parse(readFileSync(found, 'utf8'));
        if (seedPayload.listing?.length) {
          for (const l of seedPayload.listing) {
            await db.insert(listing).values({
              id: l.id,
              sellerId: l.seller_id,
              title: l.title,
              brand: l.brand,
              model: l.model,
              category: l.category,
              condition: l.condition,
              description: l.description,
              diagnostics: l.diagnostics,
              priceCentavos: l.price_centavos,
              quantity: l.quantity,
              minimumQuantity: l.minimum_quantity,
              art: l.art,
              isActive: l.is_active ?? true,
              stockVersion: l.stock_version ?? 0,
              boardClass: l.board_class ?? '',
              storageGb: l.storage_gb ?? '',
              ramGb: l.ram_gb ?? '',
              icCode: l.ic_code ?? null,
            }).onConflictDoNothing();
          }
        }
      }
    }
  } catch (err) {
    console.warn('Listing migration seed notice:', err);
  }

  return true;
}
