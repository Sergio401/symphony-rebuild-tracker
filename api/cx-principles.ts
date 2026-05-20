import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { asc } from 'drizzle-orm';

const cxPrinciplesTable = pgTable('cx_principles', {
  id: text('id').primaryKey(),
  section: integer('section').notNull().default(0),
  sectionTitle: text('section_title').notNull().default(''),
  title: text('title').notNull().default(''),
  description: text('description').notNull().default(''),
  referenceIds: text('reference_ids').notNull().default('[]'),
  position: integer('position').notNull().default(0),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(sql);

  try {
    if (req.method === 'GET') {
      const rows = await db.select().from(cxPrinciplesTable).orderBy(asc(cxPrinciplesTable.position));
      const principles = rows.map((r) => ({
        ...r,
        referenceIds: JSON.parse(r.referenceIds) as string[],
      }));
      return res.json({ principles });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  } finally {
    await sql.end();
  }
}
