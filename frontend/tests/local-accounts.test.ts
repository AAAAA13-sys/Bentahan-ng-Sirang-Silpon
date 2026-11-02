import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readFile } from 'node:fs/promises';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { existingAccounts, seedLocalAccounts } from '../lib/local-accounts';

test('documented accounts survive an existing seller ID with a different email', async () => {
  const client = new PGlite();
  try {
    await client.exec(await readFile('db/init.sql', 'utf8'));
    const db = drizzle(client, { schema });
    await db.insert(schema.user).values({ id: 'seller-quiapo', name: 'Jhun', email: 'jhun.repair@silicon.ph', role: 'seller' }).onConflictDoNothing();
    await seedLocalAccounts(db);
    for (const email of [...existingAccounts.map(item => item.email), 'kuya.jhun@gmail.com', 'juan.repair@gmail.com']) {
      const [user] = await db.select().from(schema.user).where(eq(schema.user.email, email));
      assert.ok(user, email);
      const [account] = await db.select().from(schema.account).where(eq(schema.account.userId, user.id));
      assert.ok(await compare(email.endsWith('@gmail.com') ? 'password123' : 'Password123!', account.password!), email);
    }
  } finally {
    await client.close();
  }
});
