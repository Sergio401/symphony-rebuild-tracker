import { useState, useEffect, useCallback, useRef } from 'react';
import type { Module, Item, TrackerState, OverrideItem, SaveStatus, Complexity, ItemStatus } from '../types';
import modulesData from '../data/modules.json';

const LOCALSTORAGE_KEY = 'symphony_tracker_state';
const SAVE_DEBOUNCE_MS = 1500;

async function fetchState(): Promise<TrackerState> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('API unavailable');
    return await res.json();
  } catch {
    const local = localStorage.getItem(LOCALSTORAGE_KEY);
    return local ? (JSON.parse(local) as TrackerState) : { overrides: {} };
  }
}

async function persistState(state: TrackerState): Promise<void> {
  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (!res.ok) throw new Error('Save failed');
  } catch {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  }
}

async function writeModulesJson(updated: typeof modulesData): Promise<void> {
  await fetch('/api/dev/modules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
}

export function getEffectiveItem(module: Module, itemId: string, overrides: Record<string, OverrideItem>) {
  const base = module.items.find((i) => i.id === itemId)!;
  const override = overrides[itemId] ?? {};
  const baseDone = override.done ?? base.done;
  const baseStatus: ItemStatus = base.status ?? (baseDone ? 'done' : 'pending');
  const status: ItemStatus = override.status ?? baseStatus;
  return {
    ...base,
    status,
    done: status === 'done',
    owner: override.owner ?? base.owner,
    notes: override.notes ?? base.notes,
    complexity: (override.complexity ?? base.complexity) as Complexity,
  };
}

function effectiveDone(override: OverrideItem, baseDone: boolean): boolean {
  if (override.status != null) return override.status === 'done';
  return override.done ?? baseDone;
}

export function computeProgress(modules: Module[], overrides: Record<string, OverrideItem>) {
  let total = 0;
  let done = 0;
  for (const mod of modules) {
    for (const item of mod.items) {
      const override = overrides[item.id] ?? {};
      const complexity = (override.complexity ?? item.complexity) as number;
      total += complexity;
      if (effectiveDone(override, item.done)) done += complexity;
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function computeModuleProgress(mod: Module, overrides: Record<string, OverrideItem>) {
  let total = 0;
  let done = 0;
  for (const item of mod.items) {
    const override = overrides[item.id] ?? {};
    const complexity = (override.complexity ?? item.complexity) as number;
    total += complexity;
    if (effectiveDone(override, item.done)) done += complexity;
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function useTracker() {
  const modules = modulesData.modules as Module[];
  const [overrides, setOverrides] = useState<Record<string, OverrideItem>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingState = useRef<TrackerState>({ overrides: {} });

  useEffect(() => {
    fetchState().then((state) => {
      setOverrides(state.overrides ?? {});
      pendingState.current = state;
      setLoaded(true);
    });
  }, []);

  const scheduleSave = useCallback((nextState: TrackerState) => {
    pendingState.current = nextState;
    setSaveStatus('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await persistState(nextState);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const updateItem = useCallback(
    (itemId: string, changes: Partial<OverrideItem>) => {
      setOverrides((prev) => {
        const next = { ...prev, [itemId]: { ...prev[itemId], ...changes } };
        scheduleSave({ overrides: next });
        return next;
      });
    },
    [scheduleSave],
  );

  // Dev-only: writes directly to modules.json (Vite HMR picks up the change)
  const updateItemName = useCallback(async (itemId: string, name: string) => {
    const updated = {
      ...modulesData,
      modules: modulesData.modules.map((mod) => ({
        ...mod,
        items: mod.items.map((item) =>
          item.id === itemId ? { ...item, name } : item,
        ),
      })),
    };
    await writeModulesJson(updated as typeof modulesData);
  }, []);

  // Dev-only: adds a new item to a module in modules.json
  const addItem = useCallback(async (moduleId: string) => {
    const newItem: Item = {
      id: `${moduleId}-${Date.now()}`,
      name: '',
      complexity: 2,
      done: false,
      owner: '',
      notes: '',
    };
    const updated = {
      ...modulesData,
      modules: modulesData.modules.map((mod) =>
        mod.id === moduleId
          ? { ...mod, items: [...mod.items, newItem] }
          : mod,
      ),
    };
    await writeModulesJson(updated as typeof modulesData);
  }, []);

  // Dev-only: bakes all overrides into modules.json and clears local state
  const bakeState = useCallback(async () => {
    const updated = {
      ...modulesData,
      modules: modules.map((mod) => ({
        ...mod,
        items: mod.items.map((item) => {
          const effective = getEffectiveItem(mod, item.id, overrides);
          const baked: Record<string, unknown> = {
            id: item.id,
            name: item.name,
            complexity: effective.complexity,
            done: effective.done,
            owner: effective.owner,
            notes: effective.notes,
          };
          if (effective.status === 'in-progress') baked.status = 'in-progress';
          return baked;
        }),
      })),
    };
    await writeModulesJson(updated as typeof modulesData);
    localStorage.removeItem(LOCALSTORAGE_KEY);
    setOverrides({});
  }, [modules, overrides]);

  return { modules, overrides, saveStatus, loaded, updateItem, updateItemName, addItem, bakeState };
}
