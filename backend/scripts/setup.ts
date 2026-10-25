import { existsSync } from 'node:fs';
import { seedLocalAccounts } from '../lib/local-accounts';
import { initializeDatabase, closeDatabase } from '../lib/db';
async function main() {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  try {
    await initializeDatabase();
    await seedLocalAccounts();
    console.log('Local database ready. Existing records preserved.');
  } finally { await closeDatabase(); }
}
main().catch(error => {
  console.error('Database setup failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
});