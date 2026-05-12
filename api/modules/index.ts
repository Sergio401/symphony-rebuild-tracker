import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/index';
import { modules, items } from '../../db/schema';
import { asc, eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb();
  if (req.method === 'GET') {
    const allModules = await db.select().from(modules).orderBy(asc(modules.position));
    const allItems = await db.select().from(items).orderBy(asc(items.position));

    const itemsByModule: Record<string, typeof allItems> = {};
    for (const item of allItems) {
      if (!itemsByModule[item.moduleId]) itemsByModule[item.moduleId] = [];
      itemsByModule[item.moduleId].push(item);
    }

    const result = allModules.map((mod) => ({
      ...mod,
      items: (itemsByModule[mod.id] ?? []).map((i) => ({ ...i, done: i.status === 'done' })),
    }));

    return res.json({ modules: result });
  }

  if (req.method === 'POST') {
    const { name, category } = req.body as { name: string; category: string };
    const id = `${category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const existing = await db.select({ pos: modules.position }).from(modules).orderBy(asc(modules.position));
    const position = existing.length;

    const [created] = await db.insert(modules).values({ id, name, category, position }).returning();
    return res.status(201).json({ ...created, items: [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: String(err), stack: err instanceof Error ? err.stack : undefined });
  }
}
