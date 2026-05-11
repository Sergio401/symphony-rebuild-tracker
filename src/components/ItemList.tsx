import { ItemRow } from './ItemRow';
import { getEffectiveItem, computeModuleProgress } from '../hooks/useTracker';
import type { Module, OverrideItem } from '../types';

interface Filters {
  status: 'all' | 'done' | 'pending';
  owner: string;
}

interface Props {
  modules: Module[];
  overrides: Record<string, OverrideItem>;
  selectedModuleId: string | null;
  filters: Filters;
  onUpdate: (itemId: string, changes: Partial<OverrideItem>) => void;
}

export function ItemList({ modules, overrides, selectedModuleId, filters, onUpdate }: Props) {
  const visibleModules = selectedModuleId
    ? modules.filter((m) => m.id === selectedModuleId)
    : modules;

  const filtered = visibleModules
    .map((mod) => ({
      ...mod,
      items: mod.items
        .map((item) => getEffectiveItem(mod, item.id, overrides))
        .filter((item) => {
          if (filters.status === 'done' && !item.done) return false;
          if (filters.status === 'pending' && item.done) return false;
          if (filters.owner && !item.owner.toLowerCase().includes(filters.owner.toLowerCase())) return false;
          return true;
        }),
    }))
    .filter((mod) => mod.items.length > 0);

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
        const progress = computeModuleProgress(mod as Module, overrides);
        const doneCount = mod.items.filter((i) => i.done).length;

        return (
          <div key={mod.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Module header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-4">
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

            {/* Items */}
            <div>
              {mod.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onUpdate={(changes) => onUpdate(item.id, changes)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
