import { useState, useRef, useEffect } from 'react';
import type { CXItemStatus } from '../types';

export const CX_STATUS_OPTIONS: {
  value: CXItemStatus;
  label: string;
  dot: string;
  text: string;
  bg: string;
}[] = [
  { value: 'sin-evaluar', label: 'Sin evaluar',  dot: 'bg-gray-300',   text: 'text-gray-500',   bg: 'bg-gray-50' },
  { value: 'atendido',    label: 'Atendido',     dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50' },
  { value: 'parcial',     label: 'Parcial',      dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50' },
  { value: 'se-atendera', label: 'Se atenderá',  dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50' },
  { value: 'no-atendido', label: 'No atendido',  dot: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50' },
];

interface Props {
  status: CXItemStatus;
  onChange: (status: CXItemStatus) => void;
  disabled?: boolean;
}

export function CXStatusBadge({ status, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [opensUp, setOpensUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = CX_STATUS_OPTIONS.find((o) => o.value === status) ?? CX_STATUS_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function handleToggle() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // dropdown is ~160px tall (5 options × ~32px)
      setOpensUp(rect.bottom + 160 > window.innerHeight);
    }
    setOpen((v) => !v);
  }

  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-gray-400 italic">
        Cancelado
      </span>
    );
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${cfg.bg} ${cfg.text} border-transparent hover:border-gray-200`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        {cfg.label}
        <svg className="w-3 h-3 opacity-50 ml-0.5" viewBox="0 0 10 10" fill="none">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 ${opensUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
            {CX_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-gray-50 ${
                  opt.value === status ? 'font-semibold' : ''
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                <span className={opt.text}>{opt.label}</span>
                {opt.value === status && (
                  <svg className="w-3 h-3 text-gray-400 ml-auto" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
