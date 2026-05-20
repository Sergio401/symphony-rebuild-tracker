import { useState } from 'react';
import { useCXTracker } from '../hooks/useCXTracker';
import { CXCharts } from './CXCharts';
import { CXPrinciplesList } from './CXPrinciplesList';
import { CXItemsList } from './CXItemsList';
import type { CXItemStatus } from '../types';

type CXTab = 'resumen' | 'principios' | 'items';

export function CustomerSuccess() {
  const { items, principles, loaded, updateStatus, addItem, deleteItem } = useCXTracker();
  const [activeTab, setActiveTab] = useState<CXTab>('resumen');
  const [principleFilter, setPrincipleFilter] = useState<string | null>(null);

  function handleSelectPrinciple(principleId: string) {
    setPrincipleFilter(principleId);
    setActiveTab('items');
  }

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Cargando Customer Success...</p>
        </div>
      </div>
    );
  }

  const activeItems = items.filter((i) => i.type !== 'cancelado');
  const atendidos = activeItems.filter((i) => i.status === 'atendido').length;
  const parciales = activeItems.filter((i) => i.status === 'parcial').length;
  const seAtendera = activeItems.filter((i) => i.status === 'se-atendera').length;
  const sinEvaluar = activeItems.filter((i) => i.status === 'sin-evaluar').length;

  const tabs: { id: CXTab; label: string; count?: number }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'principios', label: 'Principios', count: principles.length },
    { id: 'items', label: 'Todos los ítems', count: items.length },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Stats bar */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 bg-white flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">{atendidos} atendidos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-gray-600">{parciales} parciales</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <span className="text-xs text-gray-600">{seAtendera} se atenderá</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span className="text-xs text-gray-600">{sinEvaluar} sin evaluar</span>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{activeItems.length} ítems activos · {items.length} total</span>
      </div>

      {/* Tabs */}
      <div className="shrink-0 px-6 border-b border-gray-200 bg-white flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'resumen' && <CXCharts items={items} />}

        {activeTab === 'principios' && (
          <CXPrinciplesList
            principles={principles}
            items={items}
            onSelectPrinciple={handleSelectPrinciple}
          />
        )}

        {activeTab === 'items' && (
          <CXItemsList
            items={items}
            principles={principles}
            principleFilter={principleFilter}
            onUpdateStatus={(id, status: CXItemStatus) => updateStatus(id, status)}
            onAddItem={addItem}
            onDeleteItem={deleteItem}
            onClearPrincipleFilter={() => setPrincipleFilter(null)}
          />
        )}
      </main>
    </div>
  );
}
