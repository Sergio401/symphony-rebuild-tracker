export type Complexity = 1 | 2 | 3 | 5 | 8;

export interface Item {
  id: string;
  name: string;
  complexity: Complexity;
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

export interface ModulesData {
  scale: Record<string, ScaleEntry>;
  modules: Module[];
}

export interface OverrideItem {
  done?: boolean;
  owner?: string;
  notes?: string;
  complexity?: Complexity;
}

export interface TrackerState {
  overrides: Record<string, OverrideItem>;
  lastSaved?: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
