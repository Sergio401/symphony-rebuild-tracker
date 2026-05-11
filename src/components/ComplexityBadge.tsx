import { useState } from 'react';
import type { Complexity } from '../types';

const OPTIONS: Complexity[] = [1, 2, 3, 5, 8];

const STYLES: Record<number, string> = {
  1: 'bg-green-100 text-green-700 hover:bg-green-200',
  2: 'bg-lime-100 text-lime-700 hover:bg-lime-200',
  3: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  5: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  8: 'bg-red-100 text-red-700 hover:bg-red-200',
};

const LABELS: Record<number, string> = {
  1: 'Trivial',
  2: 'Estándar',
  3: 'Complejo',
  5: 'Especializado',
  8: 'Subsistema',
};

interface Props {
  value: Complexity;
  onChange: (v: Complexity) => void;
}

export function ComplexityBadge({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        title={`Complejidad: ${LABELS[value]}`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${STYLES[value]}`}
      >
        <span>{value}</span>
        <span className="hidden sm:inline opacity-70">×</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[140px]">
            {OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                  opt === value ? STYLES[opt] + ' font-semibold' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className={`inline-block w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${STYLES[opt]}`}>{opt}</span>
                {LABELS[opt]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
