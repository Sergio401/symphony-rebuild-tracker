import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';

const testTable = pgTable('modules', { id: text('id').primaryKey(), name: text('name').notNull() });

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
    const db = drizzle(sql);
    const rows = await db.select({ id: testTable.id, name: testTable.name }).from(testTable).limit(3);
    await sql.end();
    res.json({ ok: true, rows });
  } catch (err) {
    res.json({ error: String(err) });
  }
}
