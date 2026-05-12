import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const url = process.env.DATABASE_URL;
  res.json({
    ok: true,
    hasDb: !!url,
    dbPrefix: url ? url.slice(0, 30) + '...' : null,
  });
}
