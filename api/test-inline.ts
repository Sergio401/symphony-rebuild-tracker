import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { asc } from 'drizzle-orm';

const modulesTable = pgTable('modules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  position: integer('position').notNull().default(0),
});

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
    const db = drizzle(sql);
    const rows = await db.select().from(modulesTable).orderBy(asc(modulesTable.position));
    await sql.end();
    res.json({ ok: true, count: rows.length, first: rows[0]?.name });
  } catch (err) {
    res.json({ error: String(err) });
  }
}
