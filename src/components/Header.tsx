import { computeProgress } from '../hooks/useTracker';
import type { Module, OverrideItem, SaveStatus } from '../types';

const SAVE_STATUS_TEXT: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Guardando...',
  saved: 'Guardado ✓',
  error: 'Error al guardar',
};

const SAVE_STATUS_COLOR: Record<SaveStatus, string> = {
  idle: 'text-gray-400',
  saving: 'text-blue-400',
  saved: 'text-green-500',
  error: 'text-red-500',
};

interface Props {
  modules: Module[];
  overrides: Record<string, OverrideItem>;
  saveStatus: SaveStatus;
  onBakeState?: () => Promise<void>;
}

export function Header({ modules, overrides, saveStatus, onBakeState }: Props) {
  const progress = computeProgress(modules, overrides);

  const totalItems = modules.reduce((s, m) => s + m.items.length, 0);
  const doneItems = modules.reduce(
    (s, m) => s + m.items.filter((i) => overrides[i.id]?.done ?? i.done).length,
    0,
  );
  const totalWeight = modules.reduce(
    (s, m) => s + m.items.reduce((ss, i) => ss + ((overrides[i.id]?.complexity ?? i.complexity) as number), 0),
    0,
  );

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
      <div className="flex items-end justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-gray-900 tabular-nums">{progress}%</span>
            <span className="text-sm text-gray-500">
              completado · {doneItems}/{totalItems} ítems · {totalWeight} pts de complejidad total
            </span>
          </div>

          {/* Big progress bar */}
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {import.meta.env.DEV && onBakeState && (
            <button
              onClick={async () => {
                if (confirm('Esto aplicará todos los cambios locales al modules.json y limpiará el estado guardado. ¿Continuar?')) {
                  await onBakeState();
                }
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors font-medium"
            >
              Guardar estado al JSON
            </button>
          )}
          <div className={`text-xs transition-colors ${SAVE_STATUS_COLOR[saveStatus]}`}>
            {SAVE_STATUS_TEXT[saveStatus]}
          </div>
        </div>
      </div>
    </header>
  );
}
