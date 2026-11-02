import { PGlite } from '../frontend/node_modules/@electric-sql/pglite/dist/index.js';
import * as fs from 'node:fs';

async function dump() {
  const db = new PGlite('frontend/.data/postgres');
  
  const tables = ['user', 'account', 'session', 'verification', 'listing', 'order'];
  const dumpData = {};

  for (const t of tables) {
    try {
      const res = await db.query(`SELECT * FROM "${t}"`);
      dumpData[t] = res.rows;
      console.log(`Table ${t}: ${res.rows.length} rows`);
    } catch (e) {
      console.log(`Error querying ${t}:`, e.message);
    }
  }

  await db.close();

  fs.writeFileSync('database-seed-export.json', JSON.stringify(dumpData, null, 2), 'utf8');
  console.log('Saved database-seed-export.json successfully!');
}

dump();
