import { useState, useMemo } from 'react';
import { useTracker, getEffectiveItem } from './hooks/useTracker';
import { Sidebar, type ActiveView } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ItemList } from './components/ItemList';
import { Dashboard } from './components/Dashboard';

interface Filters {
  status: 'all' | 'done' | 'pending' | 'in-progress';
  owner: string;
}

export default function App() {
  const { modules, overrides, saveStatus, loaded, updateItem } = useTracker();
  const [activeView, setActiveView] = useState<ActiveView>('tracker');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ status: 'all', owner: '' });

  const visibleModules = useMemo(() => {
    if (selectedModuleId) return modules.filter((m) => m.id === selectedModuleId);
    if (selectedCategory) return modules.filter((m) => m.category === selectedCategory);
    return modules;
  }, [modules, selectedModuleId, selectedCategory]);

  const resultCount = useMemo(() => {
    return visibleModules.reduce((s, mod) => {
      return s + mod.items.filter((item) => {
        const effective = getEffectiveItem(mod, item.id, overrides);
        if (filters.status !== 'all' && effective.status !== filters.status) return false;
        if (filters.owner && !effective.owner.toLowerCase().includes(filters.owner.toLowerCase())) return false;
        return true;
      }).length;
    }, 0);
  }, [visibleModules, overrides, filters]);

  const pageTitle = useMemo(() => {
    if (activeView === 'dashboard') return 'Dashboard';
    if (selectedModuleId) {
      const mod = modules.find((m) => m.id === selectedModuleId);
      return mod ? `${mod.category} — ${mod.name}` : 'Módulo';
    }
    if (selectedCategory) return selectedCategory;
    return 'Todos los módulos';
  }, [modules, selectedModuleId, selectedCategory, activeView]);

  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando estado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar
        modules={modules}
        overrides={overrides}
        selectedModuleId={selectedModuleId}
        selectedCategory={selectedCategory}
        activeView={activeView}
        onSelectModule={setSelectedModuleId}
        onSelectCategory={setSelectedCategory}
        onViewChange={setActiveView}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header modules={modules} overrides={overrides} saveStatus={saveStatus} />

        <div className="shrink-0 px-6 py-3 border-b border-gray-200 bg-white">
          <h2 className="text-base font-semibold text-gray-800">{pageTitle}</h2>
        </div>

        {activeView === 'dashboard' ? (
          <Dashboard modules={modules} overrides={overrides} />
        ) : (
          <>
            <FilterBar filters={filters} onFiltersChange={setFilters} resultCount={resultCount} />
            <main className="flex-1 overflow-y-auto px-6 py-4">
              <ItemList
                modules={visibleModules}
                overrides={overrides}
                selectedModuleId={selectedModuleId}
                filters={filters}
                onUpdate={updateItem}
              />
            </main>
          </>
        )}
      </div>
    </div>
  );
}
