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

export type ItemUpdate = Partial<Pick<Item, 'name' | 'status' | 'owner' | 'notes' | 'complexity'>>;
