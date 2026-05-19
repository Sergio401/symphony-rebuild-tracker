import { pgTable, text, integer, boolean } from 'drizzle-orm/pg-core';

export const modules = pgTable('modules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  position: integer('position').notNull().default(0),
});

export const items = pgTable('items', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default(''),
  complexity: integer('complexity').notNull().default(2),
  status: text('status').notNull().default('pending'),
  owner: text('owner').notNull().default(''),
  notes: text('notes').notNull().default(''),
  githubUrl: text('github_url').notNull().default(''),
  jiraUrl: text('jira_url').notNull().default(''),
  position: integer('position').notNull().default(0),
});

export const quickTasks = pgTable('quick_tasks', {
  id: text('id').primaryKey(),
  text: text('text').notNull().default(''),
  done: boolean('done').notNull().default(false),
  position: integer('position').notNull().default(0),
});
