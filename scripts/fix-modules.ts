import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

const cxItemsTable = pgTable('cx_items', {
  id: text('id').primaryKey(),
  module: text('module').notNull().default(''),
  type: text('type').notNull().default('mejora'),
  priority: text('priority').notNull().default(''),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('sin-evaluar'),
  position: integer('position').notNull().default(0),
});

const RENAMES: [string, string][] = [
  ['Relatório', 'Reporte'],
  ['Alarmes', 'Alarmas'],
  ['Inventário & NE Grouping', 'Inventario & NE Grouping'],
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(sql);
  for (const [from, to] of RENAMES) {
    await db.update(cxItemsTable).set({ module: to }).where(eq(cxItemsTable.module, from));
    console.log(`"${from}" → "${to}" ✓`);
  }
  await sql.end();
  console.log('Done!');
}

main().catch((err) => { console.error(err); process.exit(1); });
