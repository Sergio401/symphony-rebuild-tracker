import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/index';
import { designSystemLinks, figmaLinks } from '../db/schema';

const DS_ITEMS = [
  'Logotype', 'Color', 'Font scale', 'Layouts & spaces', 'Icons',
  'Button', 'Text field', 'Autocomplete', 'Checkbox', 'Browser',
  'Tab', 'Chip', 'Multiselect autocomplete', 'Radio-button', 'Stepper',
];

const FEATURE_ITEMS: Array<{ name: string; module: string }> = [
  { name: 'Home (desktop)', module: '' },
  { name: 'Equipment type — Main screen', module: 'Inventory' },
  { name: 'Equipment type — View and edit', module: 'Inventory' },
  { name: 'KPI View — Migrated screen', module: 'Assurance' },
  { name: 'Home (mobile)', module: '' },
  { name: 'Automation policy', module: 'Admin' },
  { name: 'Locations', module: 'Inventory' },
  { name: 'Filters', module: '' },
  { name: 'Report configuration — Step 1', module: 'Reports' },
];

async function seed() {
  const db = getDb();

  console.log('Seeding Design System links...');
  for (const [i, name] of DS_ITEMS.entries()) {
    await db.insert(designSystemLinks).values({
      id: randomUUID(), name, url: '', position: i,
    }).onConflictDoNothing();
  }
  console.log(`  ${DS_ITEMS.length} items inserted`);

  console.log('Seeding Feature Figma links...');
  for (const [i, item] of FEATURE_ITEMS.entries()) {
    await db.insert(figmaLinks).values({
      id: randomUUID(), name: item.name, module: item.module, url: '', position: i,
    }).onConflictDoNothing();
  }
  console.log(`  ${FEATURE_ITEMS.length} items inserted`);

  console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
