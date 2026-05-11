import { useState } from 'react';
import { ComplexityBadge } from './ComplexityBadge';
import type { Item, Complexity, OverrideItem } from '../types';

interface Props {
  item: Item;
  onUpdate: (changes: Partial<OverrideItem>) => void;
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

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${
        item.done ? 'bg-green-50/40' : 'hover:bg-gray-50/60'
      }`}
    >
      {/* Checkbox */}
      <div className="pt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => onUpdate({ done: e.target.checked })}
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
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
