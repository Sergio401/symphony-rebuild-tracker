import { useState, useEffect, useCallback } from 'react';
import type { QuickTask } from '../types';

export function useQuickTasks() {
  const [tasks, setTasks] = useState<QuickTask[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/quick-tasks')
      .then((r) => r.json())
      .then((data: { tasks: QuickTask[] }) => {
        setTasks(data.tasks);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const addTask = useCallback(async (text: string) => {
    const res = await fetch('/api/quick-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return;
    const task = (await res.json()) as QuickTask;
    setTasks((prev) => [...prev, task]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    fetch(`/api/quick-tasks?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    });
  }, [tasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/quick-tasks?id=${id}`, { method: 'DELETE' });
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
    fetch(`/api/quick-tasks?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  }, []);

  return { tasks, loaded, addTask, toggleTask, deleteTask, updateText };
}
