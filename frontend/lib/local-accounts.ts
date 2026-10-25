import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
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
  const passwordHash = await hash('Password123!', 12);

  for (const item of existingAccounts) {
    const [existing] = await db.select().from(user).where(eq(user.email, item.email));
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
          password: passwordHash,
        }).onConflictDoNothing();
      } else {
        await db.update(account).set({
          password: passwordHash,
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

  return true;
}
