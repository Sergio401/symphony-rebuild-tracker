import { useState, useRef, useEffect } from 'react';
import { ComplexityBadge } from './ComplexityBadge';
import type { Item, Complexity, OverrideItem, ItemStatus } from '../types';

interface EffectiveItem extends Item {
  status: ItemStatus;
}

interface Props {
  item: EffectiveItem;
  onUpdate: (changes: Partial<OverrideItem>) => void;
}

const STATUS_OPTIONS: { value: ItemStatus; label: string; dot: string; text: string }[] = [
  { value: 'pending',     label: 'Pendiente',   dot: 'bg-gray-300',  text: 'text-gray-400' },
  { value: 'in-progress', label: 'En progreso', dot: 'bg-amber-400', text: 'text-amber-500' },
  { value: 'done',        label: 'Completado',  dot: 'bg-green-500', text: 'text-green-600' },
];

function StatusButton({ status, onChange }: { status: ItemStatus; onChange: (s: ItemStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUS_OPTIONS.find((o) => o.value === status)!;

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        title={cfg.label}
        className="flex items-center justify-center w-5 h-5 rounded-full hover:ring-2 hover:ring-offset-1 hover:ring-gray-200 transition-all"
      >
        <span className={`w-3.5 h-3.5 rounded-full ${cfg.dot} flex items-center justify-center`}>
          {status === 'done' && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {status === 'in-progress' && (
            <span className="w-1.5 h-0.5 bg-white rounded-full block" />
          )}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                opt.value === status ? 'font-semibold' : ''
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
              <span className={opt.text}>{opt.label}</span>
              {opt.value === status && (
                <svg className="w-3 h-3 text-gray-400 ml-auto" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ItemRow({ item, onUpdate }: Props) {
  const [editingOwner, setEditingOwner] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState(item.owner);
  const [notesDraft, setNotesDraft] = useState(item.notes);

  function commitOwner() {
    setEditingOwner(false);
    if (ownerDraft !== item.owner) onUpdate({ owner: ownerDraft });
  }

  function commitNotes() {
    setEditingNotes(false);
    if (notesDraft !== item.notes) onUpdate({ notes: notesDraft });
  }

  const isDone = item.status === 'done';
  const isInProgress = item.status === 'in-progress';

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${
        isDone ? 'bg-green-50/40' : isInProgress ? 'bg-amber-50/30' : 'hover:bg-gray-50/60'
      }`}
    >
      {/* Status button */}
      <div className="pt-0.5 shrink-0">
        <StatusButton
          status={item.status}
          onChange={(s) => onUpdate({ status: s, done: s === 'done' })}
        />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isDone ? 'line-through text-gray-400' : isInProgress ? 'text-gray-700' : 'text-gray-800'}`}>
          {item.name}
        </p>

        {/* Notes */}
        <div className="mt-1">
          {editingNotes ? (
            <textarea
              autoFocus
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={commitNotes}
              onKeyDown={(e) => e.key === 'Escape' && setEditingNotes(false)}
              rows={2}
              placeholder="Notas..."
              className="w-full text-xs text-gray-600 bg-white border border-blue-300 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          ) : (
            <button
              onClick={() => { setNotesDraft(item.notes); setEditingNotes(true); }}
              className={`text-xs text-left w-full rounded px-0.5 -mx-0.5 transition-colors ${
                item.notes
                  ? 'text-gray-500 hover:text-gray-700'
                  : 'text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100'
              }`}
            >
              {item.notes || '+ Agregar nota'}
            </button>
          )}
        </div>
      </div>

      {/* Complexity badge */}
      <div className="shrink-0 pt-0.5">
        <ComplexityBadge
          value={item.complexity as Complexity}
          onChange={(v) => onUpdate({ complexity: v })}
        />
      </div>

      {/* Owner */}
      <div className="shrink-0 w-28">
        {editingOwner ? (
          <input
            autoFocus
            value={ownerDraft}
            onChange={(e) => setOwnerDraft(e.target.value)}
            onBlur={commitOwner}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') commitOwner(); }}
            placeholder="Responsable..."
            className="w-full text-xs bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <button
            onClick={() => { setOwnerDraft(item.owner); setEditingOwner(true); }}
            className={`text-xs px-2 py-1 rounded w-full text-left transition-colors ${
              item.owner
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100'
            }`}
          >
            {item.owner || '+ Asignar'}
          </button>
        )}
      </div>
    </div>
  );
}
