import { useRef } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CXItem } from '../types';

const STATUS_COLORS: Record<string, string> = {
  'atendido':    '#22c55e',
  'parcial':     '#f59e0b',
  'se-atendera': '#60a5fa',
  'no-atendido': '#ef4444',
  'sin-evaluar': '#d1d5db',
};

const STATUS_LABELS: Record<string, string> = {
  'atendido':    'Atendido',
  'parcial':     'Parcial',
  'se-atendera': 'Se atenderá',
  'no-atendido': 'No atendido',
  'sin-evaluar': 'Sin evaluar',
};

const MODULES_SHORT: Record<string, string> = {
  'KPI View & Navigator': 'KPI View',
  'Reporte': 'Reporte',
  'Alarmas': 'Alarmas',
  'Catálogo & Métricas': 'Catálogo',
  'Inventario & NE Grouping': 'Inventario',
  'SNMP & Poller': 'SNMP',
  'Superset': 'Superset',
  'Transversal': 'Transversal',
  'Administración de Usuarios': 'Admin',
};

interface Props {
  items: CXItem[];
}

export function CXCharts({ items }: Props) {
  const chartsRef = useRef<HTMLDivElement>(null);

  const activeItems = items.filter((i) => i.type !== 'cancelado');

  const globalCounts = activeItems.reduce<Record<string, number>>(
    (acc, item) => { acc[item.status] = (acc[item.status] ?? 0) + 1; return acc; },
    {},
  );

  const pieData = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: globalCounts[key] ?? 0,
    color: STATUS_COLORS[key],
  })).filter((d) => d.value > 0);

  const atendidos = globalCounts['atendido'] ?? 0;
  const parciales = globalCounts['parcial'] ?? 0;
  const seAtenderan = globalCounts['se-atendera'] ?? 0;
  const total = activeItems.length;
  const coveragePct = total > 0 ? Math.round(((atendidos + seAtenderan + parciales * 0.5) / total) * 100) : 0;

  const moduleNames = Object.keys(MODULES_SHORT).filter((m) =>
    activeItems.some((i) => i.module === m)
  );

  const moduleData = moduleNames.map((mod) => {
    const modItems = activeItems.filter((i) => i.module === mod);
    const counts: Record<string, number> = {};
    for (const item of modItems) counts[item.status] = (counts[item.status] ?? 0) + 1;
    return {
      name: MODULES_SHORT[mod] ?? mod,
      Atendido: counts['atendido'] ?? 0,
      Parcial: counts['parcial'] ?? 0,
      'Se atenderá': counts['se-atendera'] ?? 0,
      'No atendido': counts['no-atendido'] ?? 0,
      'Sin evaluar': counts['sin-evaluar'] ?? 0,
    };
  });

  return (
    <div ref={chartsRef} className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Cobertura general</h3>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart global */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">Distribución global</p>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{coveragePct}%</p>
              <p className="text-xs text-gray-500">cobertura estimada</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  typeof value === 'number'
                    ? `${value} ítems (${Math.round((value / total) * 100)}%)`
                    : String(value),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[key] }} />
                <span className="text-xs text-gray-600">{label}</span>
                <span className="text-xs font-semibold text-gray-800 ml-auto">{globalCounts[key] ?? 0}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">{total} ítems activos (excluye cancelados)</p>
        </div>

        {/* KPIs rápidos por tipo */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-700 mb-4">Por tipo</p>
          {(['bug', 'feature', 'mejora', 'traduccion', 'documentacion'] as const).map((type) => {
            const typeItems = activeItems.filter((i) => i.type === type);
            const total = typeItems.length;
            const typeAtendidos = typeItems.filter((i) => i.status === 'atendido').length;
            const typeSeAtendera = typeItems.filter((i) => i.status === 'se-atendera').length;
            const typeParcial = typeItems.filter((i) => i.status === 'parcial').length;
            const typePct = total > 0
              ? Math.round(((typeAtendidos + typeSeAtendera + typeParcial * 0.5) / total) * 100)
              : 0;
            const typeLabels: Record<string, string> = {
              bug: 'Bugs',
              feature: 'Features',
              mejora: 'Mejoras UX',
              traduccion: 'Traducción',
              documentacion: 'Documentación',
            };
            return (
              <div key={type} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{typeLabels[type]}</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {typeAtendidos + typeSeAtendera + typeParcial}/{total}
                    <span className="text-gray-400 font-normal ml-1">({typePct}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  {total > 0 && (
                    <>
                      <div className="h-full transition-all" style={{ width: `${(typeAtendidos / total) * 100}%`, backgroundColor: '#22c55e' }} />
                      <div className="h-full transition-all" style={{ width: `${(typeSeAtendera / total) * 100}%`, backgroundColor: '#60a5fa' }} />
                      <div className="h-full transition-all" style={{ width: `${(typeParcial * 0.5 / total) * 100}%`, backgroundColor: '#f59e0b' }} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar chart por módulo */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-4">Por módulo</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={moduleData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Atendido" stackId="a" fill="#22c55e" />
            <Bar dataKey="Parcial" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Se atenderá" stackId="a" fill="#60a5fa" />
            <Bar dataKey="No atendido" stackId="a" fill="#ef4444" />
            <Bar dataKey="Sin evaluar" stackId="a" fill="#d1d5db" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
