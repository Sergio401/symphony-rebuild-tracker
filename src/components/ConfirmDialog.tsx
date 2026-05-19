import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message = '¿Eliminar este elemento?', onConfirm, onCancel }: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-5 w-80 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 16 16" fill="none">
              <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6.8 2.4a1.4 1.4 0 0 1 2.4 0l4.8 8.4A1.4 1.4 0 0 1 12.8 13H3.2a1.4 1.4 0 0 1-1.2-2.2l4.8-8.4z" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Confirmar eliminación</p>
            <p className="text-xs text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
