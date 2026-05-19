import { useState, useEffect, useCallback } from 'react';
import type { FigmaLink } from '../types';

export function useFigmaLinks() {
  const [links, setLinks] = useState<FigmaLink[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/figma-links')
      .then((r) => r.json())
      .then((data: { links: FigmaLink[] }) => {
        setLinks(data.links);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const addLink = useCallback(async (name: string, module: string, url: string) => {
    const res = await fetch('/api/figma-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, module, url }),
    });
    if (!res.ok) return;
    const link = (await res.json()) as FigmaLink;
    setLinks((prev) => [...prev, link]);
  }, []);

  const updateLink = useCallback((id: string, changes: Partial<Pick<FigmaLink, 'name' | 'module' | 'url'>>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)));
    fetch(`/api/figma-links?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
  }, []);

  const deleteLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    fetch(`/api/figma-links?id=${id}`, { method: 'DELETE' });
  }, []);

  return { links, loaded, addLink, updateLink, deleteLink };
}
