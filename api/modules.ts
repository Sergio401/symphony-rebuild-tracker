import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { asc, eq } from 'drizzle-orm';

const modulesTable = pgTable('modules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  position: integer('position').notNull().default(0),
});

const itemsTable = pgTable('items', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull(),
  name: text('name').notNull().default(''),
  complexity: integer('complexity').notNull().default(2),
  status: text('status').notNull().default('pending'),
  owner: text('owner').notNull().default(''),
  notes: text('notes').notNull().default(''),
  position: integer('position').notNull().default(0),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(sql);

  try {
    if (req.method === 'GET') {
      const mods = await db.select().from(modulesTable).orderBy(asc(modulesTable.position));
      const its = await db.select().from(itemsTable).orderBy(asc(itemsTable.position));

      const itemsByModule = new Map<string, typeof its>();
      for (const item of its) {
        const arr = itemsByModule.get(item.moduleId) ?? [];
        arr.push(item);
        itemsByModule.set(item.moduleId, arr);
      }

      const modules = mods.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        items: (itemsByModule.get(m.id) ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          complexity: i.complexity,
          status: i.status,
          done: i.status === 'done',
          owner: i.owner,
          notes: i.notes,
        })),
      }));

      return res.json({ modules });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  } finally {
    await sql.end();
  }
}
