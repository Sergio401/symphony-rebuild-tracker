import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
    const result = await sql`SELECT 1 as test`;
    await sql.end();
    res.json({ ok: true, result });
  } catch (err) {
    res.json({ error: String(err) });
  }
}
