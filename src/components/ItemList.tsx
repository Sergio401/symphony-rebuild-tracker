import { ItemRow } from './ItemRow';
import { computeModuleProgress } from '../hooks/useTracker';
import type { Module, ItemUpdate } from '../types';

interface Filters {
  status: 'all' | 'done' | 'pending' | 'in-progress';
  owner: string;
}

interface Props {
  modules: Module[];
  selectedModuleId: string | null;
  filters: Filters;
  onUpdate: (itemId: string, changes: ItemUpdate & { done?: boolean }) => void;
  onUpdateName?: (itemId: string, name: string) => void;
  onAddItem?: (moduleId: string) => void;
  onDeleteItem?: (itemId: string) => void;
}

export function ItemList({ modules, selectedModuleId, filters, onUpdate, onUpdateName, onAddItem, onDeleteItem }: Props) {
  const visibleModules = selectedModuleId
    ? modules.filter((m) => m.id === selectedModuleId)
    : modules;

  const filtered = visibleModules
    .map((mod) => ({
      ...mod,
      items: mod.items.filter((item) => {
        if (filters.status !== 'all' && item.status !== filters.status) return false;
        if (filters.owner && !item.owner.toLowerCase().includes(filters.owner.toLowerCase())) return false;
        return true;
      }),
    }))
    .filter((mod) => mod.items.length > 0 || (filters.status === 'all' && !filters.owner));

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="text-4xl mb-2">🔍</span>
        <p className="text-sm">Sin resultados con los filtros actuales</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((mod) => {
        const progress = computeModuleProgress(mod);
        const doneCount = mod.items.filter((i) => i.done).length;

        return (
          <div key={mod.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 rounded-t-xl flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-800 truncate">{mod.name}</h3>
                <p className="text-xs text-gray-400">{mod.category}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-500">
                  {doneCount}/{mod.items.length}
                </span>
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-blue-600 w-8 text-right">{progress}%</span>
              </div>
            </div>

            <div>
              {mod.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onUpdate={(changes) => onUpdate(item.id, changes)}
                  onUpdateName={onUpdateName ? (name) => onUpdateName(item.id, name) : undefined}
                  onDelete={onDeleteItem ? () => onDeleteItem(item.id) : undefined}
                />
              ))}
              {onAddItem && (
                <button
                  onClick={() => onAddItem(mod.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors rounded-b-xl"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Añadir item
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
