import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const STATE_KEY = 'symphony_tracker_v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const state = await kv.get(STATE_KEY);
    return res.json(state ?? { overrides: {} });
  }

  if (req.method === 'POST') {
    const body = req.body;
    const stateToSave = { ...body, lastSaved: new Date().toISOString() };
    await kv.set(STATE_KEY, stateToSave);
    return res.json({ ok: true, lastSaved: stateToSave.lastSaved });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
