import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../db/index';
import { modules, items } from '../db/schema';
import { asc } from 'drizzle-orm';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb();
    const allModules = await db.select().from(modules).orderBy(asc(modules.position));
    const allItems = await db.select().from(items).limit(1);
    res.json({ ok: true, modules: allModules.length, items: allItems.length });
  } catch (err) {
    res.json({ error: String(err) });
  }
}
