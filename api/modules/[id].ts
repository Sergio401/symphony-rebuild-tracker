import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db/index';
import { modules } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'PATCH') {
    const changes = req.body as { name?: string; category?: string };
    const [updated] = await db.update(modules).set(changes).where(eq(modules.id, id)).returning();
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await db.delete(modules).where(eq(modules.id, id));
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
