import { useState, useRef, useEffect } from 'react';
import { useQuickTasks } from '../hooks/useQuickTasks';

export function QuickTasks() {
  const { tasks, loaded, addTask, toggleTask, deleteTask, updateText } = useQuickTasks();
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleAdd() {
    const trimmed = newText.trim();
    if (!trimmed) return;
    addTask(trimmed);
    setNewText('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  function startEdit(id: string, text: string) {
    setEditingId(id);
    setEditText(text);
  }

  function commitEdit(id: string) {
    const trimmed = editText.trim();
    if (trimmed) updateText(id, trimmed);
    setEditingId(null);
  }

  function handleEditKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === 'Enter') commitEdit(id);
    if (e.key === 'Escape') setEditingId(null);
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-4">
          Tareas pequeñas y detalles pendientes que no forman parte del avance del proyecto.
        </p>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Agregar mini tarea..."
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No hay mini tareas. Agrega la primera arriba.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Pendientes · {pending.length}
          </h3>
          <ul className="space-y-1">
            {pending.map((task) => (
              <li
                key={task.id}
                className="group flex items-start gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2.5 hover:border-gray-200 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 shrink-0 h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                {editingId === task.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => commitEdit(task.id)}
                    onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                    className="flex-1 text-sm text-gray-800 focus:outline-none border-b border-blue-400"
                  />
                ) : (
                  <span
                    className="flex-1 text-sm text-gray-800 cursor-text"
                    onDoubleClick={() => startEdit(task.id, task.text)}
                  >
                    {task.text}
                  </span>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 shrink-0"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
            Completadas · {done.length}
          </h3>
          <ul className="space-y-1">
            {done.map((task) => (
              <li
                key={task.id}
                className="group flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 shrink-0 h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                <span className="flex-1 text-sm text-gray-400 line-through">{task.text}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 shrink-0"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
