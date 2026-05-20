import { useState, useMemo } from 'react';
import type { CXItem, CXItemStatus, CXPrinciple } from '../types';
import { CXStatusBadge, CX_STATUS_OPTIONS } from './CXStatusBadge';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  bug:          { label: 'Bug',          color: 'text-red-600 bg-red-50 border-red-200' },
  feature:      { label: 'Feature',      color: 'text-purple-600 bg-purple-50 border-purple-200' },
  mejora:       { label: 'Mejora',       color: 'text-blue-600 bg-blue-50 border-blue-200' },
  traduccion:   { label: 'Traducción',   color: 'text-orange-600 bg-orange-50 border-orange-200' },
  documentacion:{ label: 'Docs',         color: 'text-teal-600 bg-teal-50 border-teal-200' },
  cancelado:    { label: 'Cancelado',    color: 'text-gray-400 bg-gray-50 border-gray-200' },
};

const PRIORITY_CONFIG: Record<string, string> = {
  alta:  'text-red-600',
  media: 'text-amber-600',
  baja:  'text-gray-500',
  '':    'text-gray-400',
};

interface Props {
  items: CXItem[];
  principles: CXPrinciple[];
  principleFilter: string | null;
  onUpdateStatus: (id: string, status: CXItemStatus) => void;
  onAddItem: (data: Partial<CXItem>) => void;
  onDeleteItem: (id: string) => void;
  onClearPrincipleFilter: () => void;
}

const MODULES = [
  'KPI View & Navigator',
  'Reporte',
  'Alarmas',
  'Catálogo & Métricas',
  'Inventario & NE Grouping',
  'SNMP & Poller',
  'Superset',
  'Transversal',
  'Administración de Usuarios',
];

export function CXItemsList({
  items,
  principles,
  principleFilter,
  onUpdateStatus,
  onAddItem,
  onDeleteItem,
  onClearPrincipleFilter,
}: Props) {
  const [moduleFilter, setModuleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showCancelled, setShowCancelled] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newItem, setNewItem] = useState<{ module: string; type: string; priority: string; description: string }>({ module: '', type: 'mejora', priority: '', description: '' });

  const activePrinciple = principleFilter ? principles.find((p) => p.id === principleFilter) : null;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (!showCancelled && item.type === 'cancelado') return false;
      if (moduleFilter && item.module !== moduleFilter) return false;
      if (typeFilter && item.type !== typeFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (search && !item.description.toLowerCase().includes(search.toLowerCase()) && !item.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (principleFilter && activePrinciple && !activePrinciple.referenceIds.includes(item.id)) return false;
      return true;
    });
  }, [items, moduleFilter, typeFilter, statusFilter, search, showCancelled, principleFilter, activePrinciple]);

  function exportCSV() {
    const rows = [
      ['ID', 'Módulo', 'Tipo', 'Prioridad', 'Descripción', 'Estado'],
      ...filtered.map((i) => [
        i.id,
        i.module,
        i.type,
        i.priority || '-',
        `"${i.description.replace(/"/g, '""')}"`,
        CX_STATUS_OPTIONS.find((o) => o.value === i.status)?.label ?? i.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CX-Export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAddItem() {
    if (!newItem.description.trim()) return;
    onAddItem({
      module: newItem.module,
      type: newItem.type as CXItem['type'],
      priority: newItem.priority as CXItem['priority'],
      description: newItem.description,
    });
    setNewItem({ module: '', type: 'mejora', priority: '', description: '' });
    setShowNewForm(false);
  }

  return (
    <div className="space-y-4">
      {/* Filtro de principio activo */}
      {activePrinciple && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-xs text-blue-700 font-medium">
            Filtrado por principio: {activePrinciple.title}
          </span>
          <button
            onClick={onClearPrincipleFilter}
            className="ml-auto text-xs text-blue-500 hover:text-blue-700"
          >
            × Limpiar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por ID o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-40 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
        >
          <option value="">Todos los módulos</option>
          {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
        >
          <option value="">Todos los estados</option>
          {CX_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showCancelled}
            onChange={(e) => setShowCancelled(e.target.checked)}
            className="rounded"
          />
          Ver cancelados
        </label>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">{filtered.length} ítems</span>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ↓ CSV
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nuevo ítem
          </button>
        </div>
      </div>

      {/* Formulario nuevo ítem */}
      {showNewForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-800">Nuevo ítem de Customer Success</p>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newItem.module}
              onChange={(e) => setNewItem((p) => ({ ...p, module: e.target.value }))}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none"
            >
              <option value="">Módulo...</option>
              {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={newItem.type}
              onChange={(e) => setNewItem((p) => ({ ...p, type: e.target.value }))}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none"
            >
              {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'cancelado').map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={newItem.priority}
              onChange={(e) => setNewItem((p) => ({ ...p, priority: e.target.value }))}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none"
            >
              <option value="">Prioridad...</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <textarea
            value={newItem.description}
            onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
            placeholder="Descripción del ítem..."
            rows={2}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Agregar
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-1.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No hay ítems que coincidan con los filtros aplicados.
          </div>
        ) : (
          filtered.map((item) => {
            const typeCfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.mejora;
            const isCancelled = item.type === 'cancelado';

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl ${
                  isCancelled ? 'opacity-50' : ''
                }`}
              >
                {/* ID */}
                <span className="shrink-0 text-xs font-mono font-semibold text-gray-400 w-16 mt-0.5">
                  {item.id}
                </span>

                {/* Tags */}
                <div className="shrink-0 flex flex-col gap-1 mt-0.5">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs border ${typeCfg.color}`}>
                    {typeCfg.label}
                  </span>
                  {item.priority && (
                    <span className={`text-xs font-semibold ${PRIORITY_CONFIG[item.priority]}`}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </span>
                  )}
                </div>

                {/* Descripción */}
                <p className="flex-1 text-xs text-gray-700 leading-relaxed">
                  {item.description}
                </p>

                {/* Módulo */}
                <span className="shrink-0 text-xs text-gray-400 hidden md:block max-w-24 text-right">
                  {item.module}
                </span>

                {/* Selector de estado */}
                <CXStatusBadge
                  status={item.status}
                  onChange={(s) => onUpdateStatus(item.id, s)}
                  disabled={isCancelled}
                />

                {/* Eliminar */}
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
