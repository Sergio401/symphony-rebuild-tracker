import { useState, useEffect, useCallback, useRef } from 'react';
import type { Module, TrackerState, OverrideItem, SaveStatus, Complexity } from '../types';
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

export function getEffectiveItem(module: Module, itemId: string, overrides: Record<string, OverrideItem>) {
  const base = module.items.find((i) => i.id === itemId)!;
  const override = overrides[itemId] ?? {};
  return {
    ...base,
    done: override.done ?? base.done,
    owner: override.owner ?? base.owner,
    notes: override.notes ?? base.notes,
    complexity: (override.complexity ?? base.complexity) as Complexity,
  };
}

export function computeProgress(modules: Module[], overrides: Record<string, OverrideItem>) {
  let total = 0;
  let done = 0;
  for (const mod of modules) {
    for (const item of mod.items) {
      const override = overrides[item.id] ?? {};
      const complexity = (override.complexity ?? item.complexity) as number;
      const isDone = override.done ?? item.done;
      total += complexity;
      if (isDone) done += complexity;
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
    const isDone = override.done ?? item.done;
    total += complexity;
    if (isDone) done += complexity;
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

  return { modules, overrides, saveStatus, loaded, updateItem };
}
