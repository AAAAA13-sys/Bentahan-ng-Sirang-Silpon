import { getDb } from '../../../lib/db';
import { sql } from 'drizzle-orm';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{await(await getDb()).execute(sql`select 1`);return Response.json({application:'silicon-trading',stack:'nextjs',database:'connected'});}catch{return Response.json({application:'silicon-trading',stack:'nextjs',database:'unavailable'},{status:503});}}
