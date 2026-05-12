import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  const client = postgres(url, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}
