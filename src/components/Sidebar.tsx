import { useState } from 'react';
import { computeModuleProgress } from '../hooks/useTracker';
import type { Module } from '../types';

export type ActiveView = 'tracker' | 'dashboard' | 'quick-tasks' | 'figma-links';

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
  selectedModuleId: string | null;
  selectedCategory: string | null;
  activeView: ActiveView;
  onSelectModule: (id: string | null) => void;
  onSelectCategory: (cat: string | null) => void;
  onViewChange: (v: ActiveView) => void;
}

function parseGroup(name: string): { group: string | null; displayName: string } {
  const idx = name.indexOf(' — ');
  if (idx === -1) return { group: null, displayName: name };
  return { group: name.slice(0, idx), displayName: name.slice(idx + 3) };
}

type Entry =
  | { kind: 'standalone'; mod: Module }
  | { kind: 'group'; name: string; mods: Module[] };

function buildEntries(mods: Module[]): Entry[] {
  const entries: Entry[] = [];
  const groupMap: Record<string, Module[]> = {};
  for (const mod of mods) {
    const { group } = parseGroup(mod.name);
    if (!group) {
      entries.push({ kind: 'standalone', mod });
    } else {
      if (!groupMap[group]) {
        groupMap[group] = [];
        entries.push({ kind: 'group', name: group, mods: groupMap[group] });
      }
      groupMap[group].push(mod);
    }
  }
  return entries;
}

function groupProgress(mods: Module[]) {
  let total = 0;
  let done = 0;
  for (const mod of mods) {
    for (const item of mod.items) {
      total += item.complexity as number;
      if (item.status === 'done') done += item.complexity as number;
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function Sidebar({ modules, selectedModuleId, selectedCategory, activeView, onSelectModule, onSelectCategory, onViewChange }: Props) {
  const [groupStates, setGroupStates] = useState<Record<string, boolean>>({});

  function isGroupOpen(key: string, groupMods: Module[]) {
    if (key in groupStates) return groupStates[key];
    return groupMods.some((m) => m.id === selectedModuleId);
  }

  function toggleGroup(key: string, groupMods: Module[]) {
    const current = isGroupOpen(key, groupMods);
    setGroupStates((prev) => ({ ...prev, [key]: !current }));
  }

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
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full text-left px-4 py-2 flex items-center gap-2 text-xs font-semibold mb-1 transition-colors rounded-lg mx-0 ${
            activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span>📈</span>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onViewChange('quick-tasks')}
          className={`w-full text-left px-4 py-2 flex items-center gap-2 text-xs font-semibold mb-1 transition-colors rounded-lg mx-0 ${
            activeView === 'quick-tasks' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span>📝</span>
          <span>Mini tareas</span>
        </button>

        <button
          onClick={() => onViewChange('figma-links')}
          className={`w-full text-left px-4 py-2 flex items-center gap-2 text-xs font-semibold mb-1 transition-colors rounded-lg mx-0 ${
            activeView === 'figma-links' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span>🎨</span>
          <span>Figmas</span>
        </button>

        <button
          onClick={() => { onSelectModule(null); onSelectCategory(null); onViewChange('tracker'); }}
          className={`w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider mb-1 transition-colors ${
            activeView === 'tracker' && !selectedModuleId && !selectedCategory ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Todos los módulos
        </button>

        {Object.entries(grouped).map(([category, mods]) => {
          const catTotal = mods.reduce((s, m) => s + m.items.reduce((ss, i) => ss + (i.complexity as number), 0), 0);
          const catDone = mods.reduce((s, m) => s + m.items.filter((i) => i.done).reduce((ss, i) => ss + (i.complexity as number), 0), 0);
          const catPct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
          const isCatExpanded = selectedCategory === category || mods.some((m) => m.id === selectedModuleId);
          const entries = buildEntries(mods);

          return (
            <div key={category} className="mb-1">
              <button
                onClick={() => {
                  onSelectModule(null);
                  onSelectCategory(selectedCategory === category ? null : category);
                  onViewChange('tracker');
                }}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors text-xs font-semibold uppercase tracking-wider ${
                  isCatExpanded ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{CATEGORY_ICONS[category] ?? '•'}</span>
                <span className="flex-1">{category}</span>
                <span className={`font-normal normal-case tracking-normal ${catPct === 100 ? 'text-green-400' : 'text-gray-500'}`}>
                  {catPct}%
                </span>
              </button>

              {isCatExpanded && (
                <div className="ml-2">
                  {entries.map((entry) => {
                    if (entry.kind === 'standalone') {
                      const pct = computeModuleProgress(entry.mod);
                      const isSelected = entry.mod.id === selectedModuleId;
                      return (
                        <button
                          key={entry.mod.id}
                          onClick={() => { onSelectModule(entry.mod.id); onSelectCategory(category); onViewChange('tracker'); }}
                          className={`w-full text-left px-4 py-1.5 flex items-center gap-2 rounded-lg mx-1 transition-colors text-xs ${
                            isSelected ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          <span className="flex-1 truncate">{entry.mod.name}</span>
                          <span className={`shrink-0 ${pct === 100 ? 'text-green-400' : isSelected ? 'text-blue-200' : 'text-gray-600'}`}>
                            {pct}%
                          </span>
                        </button>
                      );
                    }

                    const groupKey = `${category}::${entry.name}`;
                    const open = isGroupOpen(groupKey, entry.mods);
                    const pct = groupProgress(entry.mods);

                    return (
                      <div key={entry.name}>
                        <button
                          onClick={() => toggleGroup(groupKey, entry.mods)}
                          className="w-full text-left px-4 py-1.5 flex items-center gap-2 rounded-lg mx-1 transition-colors text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <svg
                            className={`w-2.5 h-2.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
                            viewBox="0 0 6 10" fill="none"
                          >
                            <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="flex-1 truncate font-medium">{entry.name}</span>
                          <span className={`shrink-0 ${pct === 100 ? 'text-green-400' : 'text-gray-600'}`}>{pct}%</span>
                        </button>

                        {open && (
                          <div className="ml-3">
                            {entry.mods.map((mod) => {
                              const modPct = computeModuleProgress(mod);
                              const isSelected = mod.id === selectedModuleId;
                              const { displayName } = parseGroup(mod.name);
                              return (
                                <button
                                  key={mod.id}
                                  onClick={() => { onSelectModule(mod.id); onSelectCategory(category); onViewChange('tracker'); }}
                                  className={`w-full text-left px-4 py-1.5 flex items-center gap-2 rounded-lg mx-1 transition-colors text-xs ${
                                    isSelected ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                  }`}
                                >
                                  <span className="flex-1 truncate">{displayName}</span>
                                  <span className={`shrink-0 ${modPct === 100 ? 'text-green-400' : isSelected ? 'text-blue-200' : 'text-gray-600'}`}>
                                    {modPct}%
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
