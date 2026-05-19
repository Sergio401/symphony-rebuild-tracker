import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer, boolean } from 'drizzle-orm/pg-core';
import { eq, max } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

const quickTasksTable = pgTable('quick_tasks', {
  id: text('id').primaryKey(),
  text: text('text').notNull().default(''),
  done: boolean('done').notNull().default(false),
  position: integer('position').notNull().default(0),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(sql);

  try {
    // GET /api/quick-tasks
    if (req.method === 'GET') {
      const rows = await db.select().from(quickTasksTable).orderBy(quickTasksTable.position);
      return res.json({ tasks: rows });
    }

    // POST /api/quick-tasks — create task
    if (req.method === 'POST') {
      const { text } = req.body as { text: string };
      if (!text?.trim()) return res.status(400).json({ error: 'text required' });

      const [{ maxPos }] = await db.select({ maxPos: max(quickTasksTable.position) }).from(quickTasksTable);
      const position = (maxPos ?? -1) + 1;
      const id = randomUUID();

      await db.insert(quickTasksTable).values({ id, text: text.trim(), done: false, position });
      return res.status(201).json({ id, text: text.trim(), done: false, position });
    }

    // PATCH /api/quick-tasks?id=xxx — toggle done or update text
    if (req.method === 'PATCH') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'id required' });

      const body = req.body as { done?: boolean; text?: string };
      const changes: { done?: boolean; text?: string } = {};
      if (typeof body.done === 'boolean') changes.done = body.done;
      if (typeof body.text === 'string' && body.text.trim()) changes.text = body.text.trim();

      if (Object.keys(changes).length === 0) return res.status(400).json({ error: 'nothing to update' });

      await db.update(quickTasksTable).set(changes).where(eq(quickTasksTable.id, id));
      return res.json({ ok: true });
    }

    // DELETE /api/quick-tasks?id=xxx
    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'id required' });

      await db.delete(quickTasksTable).where(eq(quickTasksTable.id, id));
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
