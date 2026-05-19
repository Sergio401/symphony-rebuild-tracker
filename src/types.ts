export type Complexity = 1 | 2 | 3 | 5 | 8;

export type ItemStatus = 'pending' | 'in-progress' | 'done';

export interface Item {
  id: string;
  name: string;
  complexity: Complexity;
  status: ItemStatus;
  done: boolean;
  owner: string;
  notes: string;
  githubUrl: string;
  jiraUrl: string;
}

export interface Module {
  id: string;
  name: string;
  category: string;
  items: Item[];
}

export interface ScaleEntry {
  label: string;
  description: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type ItemUpdate = Partial<Pick<Item, 'name' | 'status' | 'owner' | 'notes' | 'complexity' | 'githubUrl' | 'jiraUrl'>>;

export interface QuickTask {
  id: string;
  text: string;
  done: boolean;
  position: number;
}

export interface DesignSystemLink {
  id: string;
  name: string;
  url: string;
  position: number;
}

export interface FigmaLink {
  id: string;
  name: string;
  module: string;
  url: string;
  position: number;
}
