import type { VercelRequest, VercelResponse } from '@vercel/node';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { asc, eq, max } from 'drizzle-orm';

const modulesTable = pgTable('modules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  position: integer('position').notNull().default(0),
});

const itemsTable = pgTable('items', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull(),
  name: text('name').notNull().default(''),
  complexity: integer('complexity').notNull().default(2),
  status: text('status').notNull().default('pending'),
  owner: text('owner').notNull().default(''),
  notes: text('notes').notNull().default(''),
  githubUrl: text('github_url').notNull().default(''),
  jiraUrl: text('jira_url').notNull().default(''),
  position: integer('position').notNull().default(0),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(sql);

  try {
    if (req.method === 'GET') {
      const mods = await db.select().from(modulesTable).orderBy(asc(modulesTable.position));
      const its = await db.select().from(itemsTable).orderBy(asc(itemsTable.position));

      const itemsByModule = new Map<string, typeof its>();
      for (const item of its) {
        const arr = itemsByModule.get(item.moduleId) ?? [];
        arr.push(item);
        itemsByModule.set(item.moduleId, arr);
      }

      const modules = mods.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        items: (itemsByModule.get(m.id) ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          complexity: i.complexity,
          status: i.status,
          done: i.status === 'done',
          owner: i.owner,
          notes: i.notes,
          githubUrl: i.githubUrl,
          jiraUrl: i.jiraUrl,
        })),
      }));

      return res.json({ modules });
    }

    if (req.method === 'POST') {
      const body = req.body as { id: string; name: string; category: string; position?: number };
      if (!body.id || !body.name || !body.category) {
        return res.status(400).json({ error: 'id, name and category are required' });
      }
      const [{ maxPos }] = await db
        .select({ maxPos: max(modulesTable.position) })
        .from(modulesTable);
      await db.insert(modulesTable).values({
        id: body.id,
        name: body.name,
        category: body.category,
        position: body.position ?? (maxPos ?? -1) + 1,
      });
      return res.status(201).json({ id: body.id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  } finally {
    await sql.end();
  }
}
