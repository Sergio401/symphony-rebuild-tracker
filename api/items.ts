import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { eq, max } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

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
    // POST /api/items — create new item
    if (req.method === 'POST') {
      const { moduleId } = req.body as { moduleId: string };
      if (!moduleId) return res.status(400).json({ error: 'moduleId required' });

      const [{ maxPos }] = await db
        .select({ maxPos: max(itemsTable.position) })
        .from(itemsTable)
        .where(eq(itemsTable.moduleId, moduleId));

      const position = (maxPos ?? -1) + 1;
      const id = randomUUID();

      await db.insert(itemsTable).values({
        id,
        moduleId,
        name: 'New item',
        complexity: 2,
        status: 'pending',
        owner: '',
        notes: '',
        position,
      });

      return res.status(201).json({
        id,
        moduleId,
        name: 'New item',
        complexity: 2,
        status: 'pending',
        done: false,
        owner: '',
        notes: '',
      });
    }

    // PATCH /api/items?id=xxx — update item fields
    if (req.method === 'PATCH') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'id query param required' });

      const allowed = ['name', 'status', 'owner', 'notes', 'complexity'] as const;
      type AllowedKey = (typeof allowed)[number];
      const body = req.body as Record<string, unknown>;
      const changes: Partial<Record<AllowedKey, string | number>> = {};
      for (const key of allowed) {
        if (key in body) (changes as Record<string, unknown>)[key] = body[key];
      }

      if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      await db.update(itemsTable).set(changes).where(eq(itemsTable.id, id));
      return res.json({ ok: true });
    }

    // DELETE /api/items?id=xxx — delete item
    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'id query param required' });

      await db.delete(itemsTable).where(eq(itemsTable.id, id));
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  } finally {
    await sql.end();
  }
}
