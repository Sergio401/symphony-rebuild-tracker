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

export const designSystemLinks = pgTable('design_system_links', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default(''),
  url: text('url').notNull().default(''),
  position: integer('position').notNull().default(0),
});

export const figmaLinks = pgTable('figma_links', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default(''),
  module: text('module').notNull().default(''),
  url: text('url').notNull().default(''),
  position: integer('position').notNull().default(0),
});

export const cxItems = pgTable('cx_items', {
  id: text('id').primaryKey(),
  module: text('module').notNull().default(''),
  type: text('type').notNull().default('mejora'),
  priority: text('priority').notNull().default(''),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('sin-evaluar'),
  position: integer('position').notNull().default(0),
});

export const cxPrinciples = pgTable('cx_principles', {
  id: text('id').primaryKey(),
  section: integer('section').notNull().default(0),
  sectionTitle: text('section_title').notNull().default(''),
  title: text('title').notNull().default(''),
  description: text('description').notNull().default(''),
  referenceIds: text('reference_ids').notNull().default('[]'),
  position: integer('position').notNull().default(0),
});
