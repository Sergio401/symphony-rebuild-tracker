import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/index';
import { figmaLinks, designSystemLinks } from '../db/schema';

const ALL_ITEMS: Array<{ name: string; module: string; url: string }> = [
  // Design System
  { name: 'Logotype', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Redesign-Design-System-Syntphony?node-id=199-11547' },
  { name: 'Color', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Redesign-Design-System-Syntphony?node-id=181-5923' },
  { name: 'Font scale', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Redesign-Design-System-Syntphony?node-id=198-7457' },
  { name: 'Layouts & spaces', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Redesign-Design-System-Syntphony?node-id=199-8255' },
  { name: 'Icons', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Redesign-Design-System-Syntphony?node-id=1275-7992' },
  { name: 'Button', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Redesign-Design-System-Syntphony?node-id=206-542' },
  { name: 'Text field', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Redesign-Design-System-Syntphony?node-id=517-36985' },
  { name: 'Autocomplete', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Redesign-Design-System-Syntphony?node-id=517-36987' },
  { name: 'Checkbox', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Syntphony-Design-System?node-id=1581-9947&t=et6dMtTEUwDHSBXe-4' },
  { name: 'Browser', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Syntphony-Design-System?node-id=1705-14' },
  { name: 'Tab', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Syntphony-Design-System?node-id=1815-353&t=5ioLB38L1J9LuC82-4' },
  { name: 'Chip', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Syntphony-Design-System?node-id=1933-3431' },
  { name: 'Multiselect autocomplete', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Syntphony-Design-System?node-id=1933-6039' },
  { name: 'Radio-button', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Syntphony-Design-System?node-id=1930-3090' },
  { name: 'Stepper', module: 'Design System', url: 'https://www.figma.com/design/1kM9BO9svsonynivdUs86M/Syntphony-Design-System?node-id=1933-7058' },
  // Features
  { name: 'Home (desktop)', module: '', url: 'https://www.figma.com/design/juuTcOD9OXesvjwry0ZviM/Redesign-Symphony-Home?node-id=8-950&t=yvUfuapcXr1WbeRK-4' },
  { name: 'Equipment type — Main screen', module: 'Inventory', url: 'https://www.figma.com/design/yIL8pIU9so9jE0wKHgLgdD/Inventory-Catalog-R?node-id=1-3084&t=LCeaR0EAk4zsunTx-4' },
  { name: 'Equipment type — View and edit', module: 'Inventory', url: 'https://www.figma.com/design/yIL8pIU9so9jE0wKHgLgdD/Inventory-Catalog-R?node-id=1-2522&t=LCeaR0EAk4zsunTx-4' },
  { name: 'KPI View — Migrated screen', module: 'Assurance', url: 'https://www.figma.com/design/e459YpbkISsBMDSBIJkJZJ/KPI-View-R?node-id=1-2' },
  { name: 'Home (mobile)', module: '', url: 'https://www.figma.com/design/juuTcOD9OXesvjwry0ZviM/Redesign-Symphony-Home?node-id=387-4821&t=UaotrJ3wC7PbZqRx-1' },
  { name: 'Automation policy', module: 'Admin', url: 'https://www.figma.com/design/y4wK9PCCTIt2ZIJEhBlQUh/Automation-policy?node-id=2029-19640&t=qDlIAkyzKcJ27tr4-1' },
  { name: 'Locations', module: 'Inventory', url: 'https://www.figma.com/design/UDfzSyKRtNw2QczUQ4Uq4i/Locations-R?node-id=1-12&t=0vyDzNUFLrgp9beH-1' },
  { name: 'Filters', module: '', url: 'https://www.figma.com/design/xnlEC18piRGoufPaAWWBfv/Investigaci%C3%B3n-global?node-id=2552-74806&t=94piJazuwrPRYYXD-1' },
  { name: 'Report configuration — Step 1', module: 'Reports', url: 'https://www.figma.com/design/qTt3OssbtTCak2YJ8stoY4/Report-configuration?node-id=1-12' },
];

async function migrate() {
  const db = getDb();

  console.log('Clearing figma_links...');
  await db.delete(figmaLinks);

  console.log('Clearing design_system_links...');
  await db.delete(designSystemLinks);

  console.log('Inserting', ALL_ITEMS.length, 'items into figma_links...');
  for (const [i, item] of ALL_ITEMS.entries()) {
    await db.insert(figmaLinks).values({ id: randomUUID(), ...item, position: i });
  }

  console.log('Done.');
}

migrate().catch((err) => { console.error(err); process.exit(1); });
