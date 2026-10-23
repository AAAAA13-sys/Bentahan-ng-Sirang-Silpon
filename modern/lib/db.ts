import { PGlite } from '@electric-sql/pglite';
import { drizzle as pgliteDrizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle as postgresDrizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import * as schema from '../db/schema';

type Database = PgliteDatabase<typeof schema>;
type Connection = { db: Database; close: () => Promise<void> };
let connection: Promise<Connection> | undefined;
async function connect(): Promise<Connection> {
  const initialization = await readFile(path.join(process.cwd(), 'db', 'init.sql'), 'utf8');
  if (process.env.DATABASE_URL) {
    const client = postgres(process.env.DATABASE_URL, { max: 10 });
    try {
      await client.begin(async transaction => { await transaction.unsafe(initialization); });
      // Both drivers expose the PostgreSQL query/transaction API used by this application.
      return { db: postgresDrizzle(client, { schema }) as unknown as Database, close: () => client.end() };
    } catch (error) { await client.end(); throw error; }
  }
  const configured = process.env.SILICON_DATA_DIR || path.join('.data', 'postgres');
  const directory = configured === ':memory:' ? configured : path.resolve(configured);
  if (directory !== ':memory:') await mkdir(directory, { recursive: true });
  const client = new PGlite(directory === ':memory:' ? undefined : directory);
  try {
    await client.waitReady;
    await client.transaction(async transaction => { await transaction.exec(initialization); });
    return { db: pgliteDrizzle(client, { schema }), close: () => client.close() };
  } catch (error) { await client.close(); throw error; }
}
export async function getDb(): Promise<Database> {
  if (!connection) connection = connect().catch(error => { connection = undefined; throw error; });
  return (await connection).db;
}
export async function initializeDatabase(): Promise<void> { await getDb(); }
export async function closeDatabase(): Promise<void> {
  const current = connection;
  if (!current) return;
  try { await (await current).close(); }
  finally { if (connection === current) connection = undefined; }
}