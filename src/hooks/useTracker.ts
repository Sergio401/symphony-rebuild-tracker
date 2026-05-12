import { useState, useEffect, useCallback, useRef } from 'react';
import type { Module, Item, SaveStatus, ItemUpdate } from '../types';

export function computeProgress(modules: Module[]) {
  let total = 0;
  let done = 0;
  for (const mod of modules) {
    for (const item of mod.items) {
      total += item.complexity as number;
      if (item.status === 'done') done += item.complexity as number;
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function computeModuleProgress(mod: Module) {
  let total = 0;
  let done = 0;
  for (const item of mod.items) {
    total += item.complexity as number;
    if (item.status === 'done') done += item.complexity as number;
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function useTracker() {
  const [modules, setModules] = useState<Module[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/modules')
      .then((r) => r.json())
      .then((data: { modules: Module[] }) => {
        setModules(data.modules);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function markSaving() {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }

  function markSaved() {
    setSaveStatus('saved');
    saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
  }

  function markError() {
    setSaveStatus('error');
  }

  const updateItem = useCallback((itemId: string, changes: ItemUpdate & { done?: boolean }) => {
    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        items: mod.items.map((item) => {
          if (item.id !== itemId) return item;
          const next = { ...item, ...changes };
          next.done = next.status === 'done';
          return next;
        }),
      })),
    );

    markSaving();
    const { done: _done, ...apiChanges } = changes;
    fetch(`/api/items?id=${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiChanges),
    })
      .then((r) => { if (!r.ok) throw new Error('save failed'); markSaved(); })
      .catch(markError);
  }, []);

  const updateItemName = useCallback(
    (itemId: string, name: string) => updateItem(itemId, { name }),
    [updateItem],
  );

  const addItem = useCallback(async (moduleId: string) => {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId }),
    });
    if (!res.ok) return;
    const newItem = (await res.json()) as Item;
    setModules((prev) =>
      prev.map((mod) =>
        mod.id === moduleId ? { ...mod, items: [...mod.items, newItem] } : mod,
      ),
    );
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        items: mod.items.filter((i) => i.id !== itemId),
      })),
    );
    fetch(`/api/items?id=${itemId}`, { method: 'DELETE' }).catch(markError);
  }, []);

  return { modules, saveStatus, loaded, updateItem, updateItemName, addItem, deleteItem };
}
