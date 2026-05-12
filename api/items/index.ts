import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../db/index';
import { items } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const db = getDb();
    const {
      moduleId,
      name = '',
      complexity = 2,
      status = 'pending',
      owner = '',
      notes = '',
    } = req.body as {
      moduleId: string;
      name?: string;
      complexity?: number;
      status?: string;
      owner?: string;
      notes?: string;
    };

    const id = `${moduleId}-${Date.now()}`;
    const existing = await db.select({ pos: items.position }).from(items).where(eq(items.moduleId, moduleId));
    const position = existing.length;

    const [created] = await db
      .insert(items)
      .values({ id, moduleId, name, complexity, status, owner, notes, position })
      .returning();

    return res.status(201).json({ ...created, done: created.status === 'done' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
