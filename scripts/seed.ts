import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDb } from '../api/_lib/db';
import { modules as modulesTable, items as itemsTable } from '../api/_lib/schema';

const modulesPath = join(process.cwd(), 'src/data/modules.json');
const data = JSON.parse(readFileSync(modulesPath, 'utf-8')) as {
  modules: Array<{
    id: string;
    name: string;
    category: string;
    items: Array<{
      id: string;
      name: string;
      complexity: number;
      done: boolean;
      status?: string;
      owner: string;
      notes: string;
    }>;
  }>;
};

async function seed() {
  const db = getDb();
  console.log('Clearing existing data...');
  await db.delete(itemsTable);
  await db.delete(modulesTable);

  console.log(`Seeding ${data.modules.length} modules...`);
  for (const [modIdx, mod] of data.modules.entries()) {
    await db.insert(modulesTable).values({
      id: mod.id,
      name: mod.name,
      category: mod.category,
      position: modIdx,
    });

    for (const [itemIdx, item] of mod.items.entries()) {
      const status = item.status ?? (item.done ? 'done' : 'pending');
      await db.insert(itemsTable).values({
        id: item.id,
        moduleId: mod.id,
        name: item.name,
        complexity: item.complexity,
        status,
        owner: item.owner ?? '',
        notes: item.notes ?? '',
        position: itemIdx,
      });
    }
  }

  const itemCount = data.modules.reduce((s, m) => s + m.items.length, 0);
  console.log(`Done — ${data.modules.length} modules, ${itemCount} items`);
}

seed().catch((err) => { console.error(err); process.exit(1); });
