import { useState, useEffect, useCallback } from 'react';
import type { DesignSystemLink } from '../types';

export function useDesignSystemLinks() {
  const [links, setLinks] = useState<DesignSystemLink[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/design-system-links')
      .then((r) => r.json())
      .then((data: { links: DesignSystemLink[] }) => {
        setLinks(data.links);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const addLink = useCallback(async (name: string, url: string) => {
    const res = await fetch('/api/design-system-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }),
    });
    if (!res.ok) return;
    const link = (await res.json()) as DesignSystemLink;
    setLinks((prev) => [...prev, link]);
  }, []);

  const updateLink = useCallback((id: string, changes: Partial<Pick<DesignSystemLink, 'name' | 'url'>>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)));
    fetch(`/api/design-system-links?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
  }, []);

  const deleteLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    fetch(`/api/design-system-links?id=${id}`, { method: 'DELETE' });
  }, []);

  return { links, loaded, addLink, updateLink, deleteLink };
}
