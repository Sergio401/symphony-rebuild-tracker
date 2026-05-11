import { computeModuleProgress } from '../hooks/useTracker';
import type { Module, OverrideItem } from '../types';

export type ActiveView = 'tracker' | 'dashboard';

const CATEGORY_ORDER = ['Inventory', 'Workforce', 'Assurance', 'Reports', 'Admin', 'Automation', 'Fulfillment', 'Cross-cutting'];

const CATEGORY_ICONS: Record<string, string> = {
  'Inventory': '📦',
  'Workforce': '🔧',
  'Assurance': '📊',
  'Reports': '📄',
  'Admin': '⚙️',
  'Automation': '🤖',
  'Fulfillment': '🔗',
  'Cross-cutting': '🧩',
};

interface Props {
  modules: Module[];
  overrides: Record<string, OverrideItem>;
  selectedModuleId: string | null;
  selectedCategory: string | null;
  activeView: ActiveView;
  onSelectModule: (id: string | null) => void;
  onSelectCategory: (cat: string | null) => void;
  onViewChange: (v: ActiveView) => void;
}

export function Sidebar({ modules, overrides, selectedModuleId, selectedCategory, activeView, onSelectModule, onSelectCategory, onViewChange }: Props) {
  const grouped = CATEGORY_ORDER.reduce<Record<string, Module[]>>((acc, cat) => {
    const mods = modules.filter((m) => m.category === cat);
    if (mods.length > 0) acc[cat] = mods;
    return acc;
  }, {});

  return (
    <aside className="w-60 shrink-0 bg-gray-900 text-white flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-sm font-bold text-white leading-tight">Symphony</h1>
        <p className="text-xs text-gray-400 mt-0.5">Rebuild Tracker</p>
      </div>

      <nav className="flex-1 py-3">
        {/* Dashboard link */}
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full text-left px-4 py-2 flex items-center gap-2 text-xs font-semibold mb-1 transition-colors rounded-lg mx-0 ${
            activeView === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span>📈</span>
          <span>Dashboard</span>
        </button>

        {/* All modules */}
        <button
          onClick={() => { onSelectModule(null); onSelectCategory(null); onViewChange('tracker'); }}
          className={`w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider mb-1 transition-colors ${
            activeView === 'tracker' && !selectedModuleId && !selectedCategory
              ? 'text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Todos los módulos
        </button>

        {Object.entries(grouped).map(([category, mods]) => {
          const catTotal = mods.reduce((s, m) => s + m.items.reduce((ss, i) => ss + ((overrides[i.id]?.complexity ?? i.complexity) as number), 0), 0);
          const catDone = mods.reduce((s, m) => s + m.items.filter((i) => overrides[i.id]?.done ?? i.done).reduce((ss, i) => ss + ((overrides[i.id]?.complexity ?? i.complexity) as number), 0), 0);
          const catPct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
          const isExpanded = selectedCategory === category || mods.some((m) => m.id === selectedModuleId);

          return (
            <div key={category} className="mb-1">
              <button
                onClick={() => {
                  onSelectModule(null);
                  onSelectCategory(selectedCategory === category ? null : category);
                  onViewChange('tracker');
                }}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors text-xs font-semibold uppercase tracking-wider ${
                  isExpanded ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{CATEGORY_ICONS[category] ?? '•'}</span>
                <span className="flex-1">{category}</span>
                <span className={`font-normal normal-case tracking-normal ${catPct === 100 ? 'text-green-400' : 'text-gray-500'}`}>
                  {catPct}%
                </span>
              </button>

              {isExpanded && (
                <div className="ml-2">
                  {mods.map((mod) => {
                    const pct = computeModuleProgress(mod, overrides);
                    const isSelected = mod.id === selectedModuleId;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => { onSelectModule(mod.id); onSelectCategory(category); onViewChange('tracker'); }}
                        className={`w-full text-left px-4 py-1.5 flex items-center gap-2 rounded-lg mx-1 transition-colors text-xs ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <span className="flex-1 truncate">{mod.name}</span>
                        <span className={`shrink-0 ${pct === 100 ? 'text-green-400' : isSelected ? 'text-blue-200' : 'text-gray-600'}`}>
                          {pct}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
        Para agregar o quitar ítems: editar{' '}
        <code className="text-gray-400 bg-gray-800 px-1 rounded">src/data/modules.json</code>
      </div>
    </aside>
  );
}
