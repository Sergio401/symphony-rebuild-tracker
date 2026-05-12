import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { computeProgress, computeModuleProgress } from '../hooks/useTracker';
import type { Module, Complexity } from '../types';

const CATEGORY_ORDER = ['Inventory', 'Workforce', 'Assurance', 'Reports', 'Admin', 'Automation', 'Fulfillment', 'Cross-cutting'];
const CATEGORY_COLORS: Record<string, string> = {
  Inventory: '#3b82f6',
  Workforce: '#8b5cf6',
  Assurance: '#06b6d4',
  Reports: '#f59e0b',
  Admin: '#6b7280',
  Automation: '#10b981',
  Fulfillment: '#f97316',
  'Cross-cutting': '#ec4899',
};
const COMPLEXITY_COLORS: Record<number, string> = {
  1: '#86efac',
  2: '#bef264',
  3: '#fde68a',
  5: '#fdba74',
  8: '#fca5a5',
};
const COMPLEXITY_LABELS: Record<number, string> = { 1: 'Trivial', 2: 'Estándar', 3: 'Complejo', 5: 'Especializado', 8: 'Subsistema' };

interface Props {
  modules: Module[];
}

function StatCard({ label, value, sub, color = 'text-gray-900' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-700 mb-3">{children}</h3>;
}

export function Dashboard({ modules }: Props) {
  const totalProgress = computeProgress(modules);

  const totalItems = modules.reduce((s, m) => s + m.items.length, 0);
  const doneItems = modules.reduce((s, m) => s + m.items.filter((i) => i.done).length, 0);
  const pendingItems = totalItems - doneItems;

  const totalWeight = modules.reduce((s, m) =>
    s + m.items.reduce((ss, i) => ss + (i.complexity as number), 0), 0);
  const doneWeight = modules.reduce((s, m) =>
    s + m.items.filter((i) => i.done).reduce((ss, i) => ss + (i.complexity as number), 0), 0);

  const categoryData = CATEGORY_ORDER.map((cat) => {
    const mods = modules.filter((m) => m.category === cat);
    const catTotal = mods.reduce((s, m) => s + m.items.reduce((ss, i) => ss + (i.complexity as number), 0), 0);
    const catDone = mods.reduce((s, m) => s + m.items.filter((i) => i.done).reduce((ss, i) => ss + (i.complexity as number), 0), 0);
    const pct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
    const items = mods.reduce((s, m) => s + m.items.length, 0);
    const done = mods.reduce((s, m) => s + m.items.filter((i) => i.done).length, 0);
    return { name: cat, pct, items, done, color: CATEGORY_COLORS[cat] };
  });

  const moduleData = modules
    .map((mod) => ({
      name: mod.name.length > 28 ? mod.name.slice(0, 26) + '…' : mod.name,
      fullName: mod.name,
      category: mod.category,
      pct: computeModuleProgress(mod),
      color: CATEGORY_COLORS[mod.category] ?? '#94a3b8',
    }))
    .sort((a, b) => b.pct - a.pct);

  const complexityData = ([1, 2, 3, 5, 8] as Complexity[]).map((c) => {
    const all = modules.flatMap((m) => m.items).filter((i) => i.complexity === c);
    const done = all.filter((i) => i.done).length;
    return { name: COMPLEXITY_LABELS[c], value: c, done, pending: all.length - done, total: all.length, color: COMPLEXITY_COLORS[c] };
  });

  const pieData = [
    { name: 'Completado', value: doneWeight, fill: '#3b82f6' },
    { name: 'Pendiente', value: totalWeight - doneWeight, fill: '#e5e7eb' },
  ];

  const radialData = categoryData
    .filter((c) => c.items > 0)
    .map((c) => ({ name: c.name, value: c.pct, fill: c.color }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltipBar = ({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; fill: string; name: string; value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.fill === '#e5e7eb' ? '#9ca3af' : p.fill }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Progreso global (ponderado)" value={`${totalProgress}%`} color="text-blue-600" />
        <StatCard label="Ítems completados" value={`${doneItems}/${totalItems}`} sub={`${pendingItems} pendientes`} />
        <StatCard label="Puntos completados" value={`${doneWeight}`} sub={`de ${totalWeight} pts de complejidad`} />
        <StatCard
          label="Módulos 100% terminados"
          value={modules.filter((m) => computeModuleProgress(m) === 100).length}
          sub={`de ${modules.length} módulos`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <SectionTitle>Distribución global de trabajo</SectionTitle>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-900" fontSize={22} fontWeight={700}>
                  {totalProgress}%
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                <span className="text-sm text-gray-600">Completado</span>
                <span className="ml-auto text-sm font-semibold text-gray-800">{doneWeight} pts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 shrink-0" />
                <span className="text-sm text-gray-600">Pendiente</span>
                <span className="ml-auto text-sm font-semibold text-gray-800">{totalWeight - doneWeight} pts</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-1">
                <p className="text-xs text-gray-400">
                  {doneItems} de {totalItems} ítems · {modules.filter((m) => computeModuleProgress(m) === 100).length} módulos completos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <SectionTitle>Progreso por categoría</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart
              cx="35%"
              cy="50%"
              innerRadius={18}
              outerRadius={85}
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={4}
                background={{ fill: '#f3f4f6' }}
                label={false}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value, entry: { payload?: { fill?: string; value?: number } }) => (
                  <span style={{ color: '#374151', fontSize: 11 }}>
                    {value} <span style={{ color: entry.payload?.fill, fontWeight: 600 }}>{entry.payload?.value}%</span>
                  </span>
                )}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <SectionTitle>Progreso por categoría — detalle</SectionTitle>
        <div className="space-y-3">
          {categoryData.map((cat) => (
            <div key={cat.name} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-28 shrink-0 truncate">{cat.name}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                />
                {cat.pct > 8 && (
                  <span className="absolute inset-y-0 left-2 flex items-center text-white text-xs font-semibold" style={{ fontSize: 10 }}>
                    {cat.pct}%
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-700 w-8 text-right tabular-nums">{cat.pct}%</span>
              <span className="text-xs text-gray-400 w-14 text-right tabular-nums">{cat.done}/{cat.items}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <SectionTitle>Ítems por nivel de complejidad</SectionTitle>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={complexityData} barSize={36} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipBar />} cursor={{ fill: '#f9fafb' }} />
            <Bar dataKey="done" name="Completados" stackId="a" radius={[0, 0, 0, 0]}>
              {complexityData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="pending" name="Pendientes" stackId="a" radius={[4, 4, 0, 0]}>
              {complexityData.map((entry) => (
                <Cell key={entry.name} fill="#e5e7eb" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-sm bg-amber-200" /> Completados (color por complejidad)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-sm bg-gray-200" /> Pendientes
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <SectionTitle>Todos los módulos — ranking de completitud</SectionTitle>
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {moduleData.map((mod) => (
            <div key={mod.fullName} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-52 shrink-0 truncate" title={mod.fullName}>
                {mod.name}
              </span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${mod.pct}%`, backgroundColor: mod.color }}
                />
              </div>
              <span
                className="text-xs font-semibold w-8 text-right tabular-nums"
                style={{ color: mod.pct === 100 ? '#16a34a' : mod.pct > 0 ? '#2563eb' : '#9ca3af' }}
              >
                {mod.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
