import { useState } from 'react';
import { useDesignSystemLinks } from '../hooks/useDesignSystemLinks';
import type { DesignSystemLink } from '../types';

function FigmaIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/>
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" fill="#0ACF83"/>
      <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" fill="#FF7262"/>
      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/>
      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/>
    </svg>
  );
}

interface EditingRow { id: string; name: string; url: string }

export function DesignSystemLinks() {
  const { links, loaded, addLink, updateLink, deleteLink } = useDesignSystemLinks();
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editing, setEditing] = useState<EditingRow | null>(null);

  function handleAdd() {
    if (!newName.trim()) return;
    addLink(newName.trim(), newUrl.trim());
    setNewName('');
    setNewUrl('');
  }

  function commitEdit(link: DesignSystemLink) {
    if (!editing) return;
    updateLink(link.id, { name: editing.name, url: editing.url });
    setEditing(null);
  }

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
        Figmas de componentes y tokens del sistema de diseño.
      </p>

      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Agregar componente</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <label className="text-xs text-gray-400">Nombre</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="ej. Button"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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

      {links.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No hay componentes. Agrega el primero arriba.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Componente</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Link</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {links.map((link) => {
                const isEditing = editing?.id === link.id;
                return (
                  <tr key={link.id} className="group hover:bg-gray-50 transition-colors">
                    {/* Name */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          value={editing.name}
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          onBlur={() => commitEdit(link)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit(link);
                            if (e.key === 'Escape') setEditing(null);
                          }}
                          className="w-full text-sm text-gray-800 focus:outline-none border-b border-blue-400 bg-transparent"
                        />
                      ) : (
                        <span
                          className="text-gray-800 cursor-text"
                          onDoubleClick={() => setEditing({ id: link.id, name: link.name, url: link.url })}
                        >
                          {link.name || <span className="text-gray-300 italic">Sin nombre</span>}
                        </span>
                      )}
                    </td>

                    {/* URL */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="url"
                          value={editing.url}
                          onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                          onBlur={() => commitEdit(link)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit(link);
                            if (e.key === 'Escape') setEditing(null);
                          }}
                          placeholder="https://figma.com/file/..."
                          className="w-full text-sm text-gray-500 focus:outline-none border-b border-blue-400 bg-transparent"
                        />
                      ) : link.url ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors group/link"
                          onDoubleClick={(e) => { e.preventDefault(); setEditing({ id: link.id, name: link.name, url: link.url }); }}
                        >
                          <FigmaIcon />
                          <span className="text-xs truncate max-w-xs group-hover/link:underline underline-offset-2">
                            {link.url.replace('https://', '')}
                          </span>
                          <svg className="w-3 h-3 opacity-0 group-hover/link:opacity-60 transition-opacity shrink-0" viewBox="0 0 12 12" fill="none">
                            <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      ) : (
                        <span
                          className="text-gray-300 italic text-xs cursor-text"
                          onDoubleClick={() => setEditing({ id: link.id, name: link.name, url: link.url })}
                        >
                          Sin link — doble click para agregar
                        </span>
                      )}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
