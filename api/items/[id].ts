import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { items } from '../_lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };
  const db = getDb();

  if (req.method === 'PATCH') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { done: _done, ...changes } = req.body as {
      name?: string;
      status?: string;
      owner?: string;
      notes?: string;
      complexity?: number;
      done?: boolean;
    };

    const [updated] = await db.update(items).set(changes).where(eq(items.id, id)).returning();
    return res.json({ ...updated, done: updated.status === 'done' });
  }

  if (req.method === 'DELETE') {
    await db.delete(items).where(eq(items.id, id));
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
