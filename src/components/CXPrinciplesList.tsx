import type { CXPrinciple, CXItem } from '../types';

const STATUS_COLORS: Record<string, string> = {
  'atendido':    '#22c55e',
  'parcial':     '#f59e0b',
  'se-atendera': '#60a5fa',
  'no-atendido': '#ef4444',
  'sin-evaluar': '#d1d5db',
};

interface Props {
  principles: CXPrinciple[];
  items: CXItem[];
  onSelectPrinciple: (principleId: string) => void;
}

function computePrincipleCoverage(principle: CXPrinciple, items: CXItem[]) {
  const related = items.filter((i) => principle.referenceIds.includes(i.id));
  if (related.length === 0) return { pct: 0, atendido: 0, parcial: 0, total: 0 };
  const atendido = related.filter((i) => i.status === 'atendido').length;
  const parcial = related.filter((i) => i.status === 'parcial').length;
  const pct = Math.round(((atendido + parcial * 0.5) / related.length) * 100);
  return { pct, atendido, parcial, total: related.length };
}

const SECTION_ICONS: Record<number, string> = {
  1: '🔍',
  2: '📋',
  3: '🗂',
  4: '🌐',
  5: '✅',
  6: '⚡',
  7: '🧭',
  8: '📤',
  9: '💬',
  10: '🧹',
};

export function CXPrinciplesList({ principles, items, onSelectPrinciple }: Props) {
  const sections = [...new Set(principles.map((p) => p.section))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {sections.map((sectionNum) => {
        const sectionPrinciples = principles.filter((p) => p.section === sectionNum);
        const sectionTitle = sectionPrinciples[0]?.sectionTitle ?? '';

        return (
          <div key={sectionNum}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{SECTION_ICONS[sectionNum] ?? '•'}</span>
              <h3 className="text-sm font-semibold text-gray-800">
                {sectionNum}. {sectionTitle}
              </h3>
            </div>

            <div className="space-y-2">
              {sectionPrinciples.map((principle) => {
                const { pct, atendido, parcial, total } = computePrincipleCoverage(principle, items);
                const coverageColor = pct === 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : pct > 0 ? '#ef4444' : '#d1d5db';

                return (
                  <button
                    key={principle.id}
                    onClick={() => onSelectPrinciple(principle.id)}
                    className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: coverageColor }}
                        >
                          {pct}%
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                          {principle.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {principle.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: coverageColor }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">
                            {atendido + parcial}/{total} ítems
                          </span>
                          <span className="text-xs text-blue-500 shrink-0 group-hover:underline">
                            Ver →
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {principle.referenceIds.slice(0, 6).map((id) => {
                            const item = items.find((i) => i.id === id);
                            const color = item ? STATUS_COLORS[item.status] : '#d1d5db';
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-50 border border-gray-200 text-gray-600"
                              >
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                {id}
                              </span>
                            );
                          })}
                          {principle.referenceIds.length > 6 && (
                            <span className="text-xs text-gray-400 self-center">
                              +{principle.referenceIds.length - 6} más
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
