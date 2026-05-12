import { useState, useRef, useEffect } from 'react';
import { ComplexityBadge } from './ComplexityBadge';
import type { Item, Complexity, ItemUpdate, ItemStatus } from '../types';

interface Props {
  item: Item;
  onUpdate: (changes: ItemUpdate & { done?: boolean }) => void;
  onUpdateName?: (name: string) => void;
  onDelete?: () => void;
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

function NotesDisplay({ text, onEdit }: { text: string; onEdit: () => void }) {
  if (!text) {
    return (
      <button
        onClick={onEdit}
        className="text-xs text-left w-full rounded px-0.5 -mx-0.5 text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-colors"
      >
        + Agregar nota
      </button>
    );
  }

  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <div
      onClick={onEdit}
      className="text-xs text-left w-full rounded px-0.5 -mx-0.5 text-gray-500 hover:text-gray-700 cursor-text transition-colors break-words"
    >
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </div>
  );
}

export function ItemRow({ item, onUpdate, onUpdateName, onDelete }: Props) {
  const [editingName, setEditingName] = useState(item.name === '' && !!onUpdateName);
  const [editingOwner, setEditingOwner] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [nameDraft, setNameDraft] = useState(item.name);
  const [ownerDraft, setOwnerDraft] = useState(item.owner);
  const [notesDraft, setNotesDraft] = useState(item.notes);

  function commitName() {
    const trimmed = nameDraft.trim();
    setEditingName(false);
    if (trimmed && trimmed !== item.name) onUpdateName?.(trimmed);
    else setNameDraft(item.name);
  }

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
      className={`group flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0 last:rounded-b-xl transition-colors ${
        isDone ? 'bg-green-50/40' : isInProgress ? 'bg-amber-50/30' : 'hover:bg-gray-50/60'
      }`}
    >
      <div className="pt-0.5 shrink-0">
        <StatusButton
          status={item.status}
          onChange={(s) => onUpdate({ status: s, done: s === 'done' })}
        />
      </div>

      <div className="flex-1 min-w-0">
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') { setEditingName(false); setNameDraft(item.name); }
            }}
            placeholder="Nombre del item..."
            className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <p
            onClick={() => onUpdateName && (setNameDraft(item.name), setEditingName(true))}
            className={`text-sm leading-snug ${isDone ? 'line-through text-gray-400' : isInProgress ? 'text-gray-700' : 'text-gray-800'} ${onUpdateName ? 'cursor-text' : ''}`}
          >
            {item.name || <span className="text-gray-300 italic">Sin nombre</span>}
          </p>
        )}

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
            <NotesDisplay
              text={item.notes}
              onEdit={() => { setNotesDraft(item.notes); setEditingNotes(true); }}
            />
          )}
        </div>
      </div>

      <div className="shrink-0 pt-0.5">
        <ComplexityBadge
          value={item.complexity as Complexity}
          onChange={(v) => onUpdate({ complexity: v })}
        />
      </div>

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

      {onDelete && (
        <button
          onClick={onDelete}
          title="Eliminar item"
          className="shrink-0 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l.8 8.5a.5.5 0 0 0 .5.5h7.4a.5.5 0 0 0 .5-.5L13 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}
