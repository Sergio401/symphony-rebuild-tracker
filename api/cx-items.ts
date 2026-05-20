import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { eq, asc, max } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

const cxItemsTable = pgTable('cx_items', {
  id: text('id').primaryKey(),
  module: text('module').notNull().default(''),
  type: text('type').notNull().default('mejora'),
  priority: text('priority').notNull().default(''),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('sin-evaluar'),
  position: integer('position').notNull().default(0),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(sql);

  try {
    if (req.method === 'GET') {
      const rows = await db.select().from(cxItemsTable).orderBy(asc(cxItemsTable.position));
      return res.json({ items: rows });
    }

    if (req.method === 'POST') {
      const body = req.body as Partial<{
        id: string;
        module: string;
        type: string;
        priority: string;
        description: string;
        status: string;
      }>;

      const [{ maxPos }] = await db
        .select({ maxPos: max(cxItemsTable.position) })
        .from(cxItemsTable);

      const id = body.id ?? randomUUID();
      await db.insert(cxItemsTable).values({
        id,
        module: body.module ?? '',
        type: body.type ?? 'mejora',
        priority: body.priority ?? '',
        description: body.description ?? '',
        status: body.status ?? 'sin-evaluar',
        position: (maxPos ?? -1) + 1,
      });

      return res.status(201).json({ id });
    }

    if (req.method === 'PATCH') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'id query param required' });

      const allowed = ['module', 'type', 'priority', 'description', 'status'] as const;
      type AllowedKey = (typeof allowed)[number];
      const body = req.body as Record<string, unknown>;
      const changes: Partial<Record<AllowedKey, string>> = {};
      for (const key of allowed) {
        if (key in body) changes[key] = body[key] as string;
      }

      if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      await db.update(cxItemsTable).set(changes).where(eq(cxItemsTable.id, id));
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'id query param required' });

      await db.delete(cxItemsTable).where(eq(cxItemsTable.id, id));
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
