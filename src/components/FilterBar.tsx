interface Filters {
  status: 'all' | 'done' | 'pending';
  owner: string;
}

interface Props {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  resultCount: number;
}

export function FilterBar({ filters, onFiltersChange, resultCount }: Props) {
  const statusOptions: { value: Filters['status']; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'done', label: 'Completados' },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
      {/* Status toggle */}
      <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFiltersChange({ ...filters, status: opt.value })}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              filters.status === opt.value
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Owner filter */}
      <input
        type="text"
        value={filters.owner}
        onChange={(e) => onFiltersChange({ ...filters, owner: e.target.value })}
        placeholder="Filtrar por responsable..."
        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 w-44 bg-gray-50"
      />

      {/* Count */}
      {(filters.status !== 'all' || filters.owner) && (
        <span className="text-xs text-gray-400">{resultCount} resultado{resultCount !== 1 ? 's' : ''}</span>
      )}

      {/* Clear */}
      {(filters.status !== 'all' || filters.owner) && (
        <button
          onClick={() => onFiltersChange({ status: 'all', owner: '' })}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
