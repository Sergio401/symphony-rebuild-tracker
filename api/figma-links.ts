import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { eq, max } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

const figmaLinksTable = pgTable('figma_links', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default(''),
  module: text('module').notNull().default(''),
  url: text('url').notNull().default(''),
  position: integer('position').notNull().default(0),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(sql);

  try {
    // GET /api/figma-links
    if (req.method === 'GET') {
      const rows = await db.select().from(figmaLinksTable).orderBy(figmaLinksTable.position);
      return res.json({ links: rows });
    }

    // POST /api/figma-links
    if (req.method === 'POST') {
      const { name, module, url } = req.body as { name: string; module: string; url: string };
      if (!name?.trim()) return res.status(400).json({ error: 'name required' });

      const [{ maxPos }] = await db.select({ maxPos: max(figmaLinksTable.position) }).from(figmaLinksTable);
      const position = (maxPos ?? -1) + 1;
      const id = randomUUID();

      await db.insert(figmaLinksTable).values({ id, name: name.trim(), module: module ?? '', url: url ?? '', position });
      return res.status(201).json({ id, name: name.trim(), module: module ?? '', url: url ?? '', position });
    }

    // PATCH /api/figma-links?id=xxx
    if (req.method === 'PATCH') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'id required' });

      const body = req.body as { name?: string; module?: string; url?: string };
      const changes: { name?: string; module?: string; url?: string } = {};
      if (typeof body.name === 'string') changes.name = body.name.trim();
      if (typeof body.module === 'string') changes.module = body.module;
      if (typeof body.url === 'string') changes.url = body.url.trim();

      if (Object.keys(changes).length === 0) return res.status(400).json({ error: 'nothing to update' });

      await db.update(figmaLinksTable).set(changes).where(eq(figmaLinksTable.id, id));
      return res.json({ ok: true });
    }

    // DELETE /api/figma-links?id=xxx
    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'id required' });

      await db.delete(figmaLinksTable).where(eq(figmaLinksTable.id, id));
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
