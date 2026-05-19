import { useState } from 'react';
import { useFigmaLinks } from '../hooks/useFigmaLinks';
import type { FigmaLink } from '../types';

const CATEGORIES = [
  'Design System',
  'Inventory',
  'Workforce',
  'Assurance',
  'Reports',
  'Admin',
  'Automation',
  'Fulfillment',
  'Cross-cutting',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Design System': 'bg-violet-100 text-violet-700',
  Inventory: 'bg-blue-100 text-blue-700',
  Workforce: 'bg-orange-100 text-orange-700',
  Assurance: 'bg-green-100 text-green-700',
  Reports: 'bg-purple-100 text-purple-700',
  Admin: 'bg-gray-100 text-gray-600',
  Automation: 'bg-cyan-100 text-cyan-700',
  Fulfillment: 'bg-pink-100 text-pink-700',
  'Cross-cutting': 'bg-yellow-100 text-yellow-700',
};

function ModuleChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const color = value ? CATEGORY_COLORS[value] ?? 'bg-gray-100 text-gray-600' : '';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
          value ? color : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
      >
        {value || 'Sin módulo'}
        <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px]">
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50"
            >
              Sin módulo
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { onChange(cat); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
              >
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat]}`}>
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FigmaIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/>
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" fill="#0ACF83"/>
      <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" fill="#FF7262"/>
      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/>
      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/>
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5a1.5 1.5 0 0 1 2 2L4 10 1 11l1-3 6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FigmaLinkButton({ url, onSave }: { url: string; onSave: (u: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(url);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== url) onSave(trimmed);
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="url"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setEditing(false); setDraft(url); }
        }}
        placeholder="https://figma.com/file/..."
        className="w-56 text-xs border border-blue-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
    );
  }

  if (url) {
    return (
      <div className="group/link flex items-center gap-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={url}
          className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 rounded px-1.5 py-0.5 transition-colors"
        >
          <FigmaIcon />
          <span>Figma</span>
        </a>
        <button
          onClick={() => { setDraft(url); setEditing(true); }}
          title="Editar link"
          className="opacity-0 group-hover/link:opacity-100 transition-opacity text-gray-300 hover:text-gray-500"
        >
          <PencilIcon />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(''); setEditing(true); }}
      title="Agregar link"
      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-300 hover:text-gray-400"
    >
      + Link
    </button>
  );
}

export function FigmaLinks() {
  const { links, loaded, addLink, updateLink, deleteLink } = useFigmaLinks();

  const [newName, setNewName] = useState('');
  const [newModule, setNewModule] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [filterModule, setFilterModule] = useState('');

  function handleAdd() {
    if (!newName.trim()) return;
    addLink(newName.trim(), newModule, newUrl.trim());
    setNewName('');
    setNewModule('');
    setNewUrl('');
  }

  function startNameEdit(link: FigmaLink) {
    setEditingNameId(link.id);
    setNameDraft(link.name);
  }

  function commitName(link: FigmaLink) {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== link.name) updateLink(link.id, { name: trimmed });
    setEditingNameId(null);
  }

  const visible = filterModule ? links.filter((l) => l.module === filterModule) : links;

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6">
      <p className="text-sm text-gray-500 mb-5">
        Links de Figma organizados por módulo.
      </p>

      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Agregar Figma</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <label className="text-xs text-gray-400">Nombre</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="ej. Flujo de checkout"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Módulo</label>
            <select
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Sin módulo</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
            <label className="text-xs text-gray-400">URL de Figma</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="https://figma.com/file/..."
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Filter chips */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterModule('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !filterModule ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Todos ({links.length})
          </button>
          {CATEGORIES.filter((c) => links.some((l) => l.module === c)).map((cat) => {
            const count = links.filter((l) => l.module === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilterModule(filterModule === cat ? '' : cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterModule === cat
                    ? CATEGORY_COLORS[cat] + ' ring-2 ring-offset-1 ring-current'
                    : CATEGORY_COLORS[cat] + ' opacity-60 hover:opacity-100'
                }`}
              >
                {cat} · {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      {visible.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">{links.length === 0 ? 'No hay Figmas guardados. Agrega el primero arriba.' : 'No hay Figmas para este módulo.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-44">Módulo</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Link</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map((link) => (
                <tr key={link.id} className="group hover:bg-gray-50 transition-colors">
                  {/* Name */}
                  <td className="px-4 py-3">
                    {editingNameId === link.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        onBlur={() => commitName(link)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitName(link);
                          if (e.key === 'Escape') setEditingNameId(null);
                        }}
                        className="w-full text-sm text-gray-800 focus:outline-none border-b border-blue-400 bg-transparent"
                      />
                    ) : (
                      <span
                        className="text-gray-800 cursor-text"
                        onDoubleClick={() => startNameEdit(link)}
                      >
                        {link.name || <span className="text-gray-300 italic">Sin nombre</span>}
                      </span>
                    )}
                  </td>

                  {/* Module chip */}
                  <td className="px-4 py-3">
                    <ModuleChip
                      value={link.module}
                      onChange={(v) => updateLink(link.id, { module: v })}
                    />
                  </td>

                  {/* Figma link chip */}
                  <td className="px-4 py-3">
                    <FigmaLinkButton
                      url={link.url}
                      onSave={(u) => updateLink(link.id, { url: u })}
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-2 py-3">
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
