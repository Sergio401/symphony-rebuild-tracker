import { useState, useEffect, useCallback } from 'react';
import type { CXItem, CXPrinciple, CXItemStatus, SaveStatus } from '../types';

export function useCXTracker() {
  const [items, setItems] = useState<CXItem[]>([]);
  const [principles, setPrinciples] = useState<CXPrinciple[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    Promise.all([
      fetch('/api/cx-items').then((r) => r.json()),
      fetch('/api/cx-principles').then((r) => r.json()),
    ])
      .then(([itemsData, principlesData]) => {
        setItems(itemsData.items ?? []);
        setPrinciples(principlesData.principles ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const updateStatus = useCallback((id: string, status: CXItemStatus) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    setSaveStatus('saving');
    fetch(`/api/cx-items?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('save failed');
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      })
      .catch(() => setSaveStatus('error'));
  }, []);

  const addItem = useCallback(async (data: Partial<CXItem>): Promise<CXItem | null> => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/cx-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('create failed');
      const { id } = (await res.json()) as { id: string };
      const newItem: CXItem = {
        id,
        module: data.module ?? '',
        type: data.type ?? 'mejora',
        priority: data.priority ?? '',
        description: data.description ?? '',
        status: 'sin-evaluar',
        position: items.length,
      };
      setItems((prev) => [...prev, newItem]);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return newItem;
    } catch {
      setSaveStatus('error');
      return null;
    }
  }, [items.length]);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/cx-items?id=${id}`, { method: 'DELETE' }).catch(() => setSaveStatus('error'));
  }, []);

  return { items, principles, loaded, saveStatus, updateStatus, addItem, deleteItem };
}
