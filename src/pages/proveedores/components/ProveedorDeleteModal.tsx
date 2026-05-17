/**
 * ProveedorDeleteModal.tsx - Modal de confirmación de eliminación
 * Diseño Power BI - Estilo profesional y minimalista
 */

import { useState } from 'react';
import { FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import { useThemeClasses } from '../../../hooks/useThemeClasses';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  nombreProveedor?: string;
}

export default function ProveedorDeleteModal({ isOpen, onClose, onConfirm, nombreProveedor }: Props) {
  const { isDark } = useThemeClasses();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm transition-opacity`}
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`
          relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden
          ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
        `}>
          {/* Header con icono de advertencia */}
          <div className={`
            px-6 pt-6 pb-4 flex flex-col items-center text-center
          `}>
            {/* Icono de advertencia */}
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4
              ${isDark ? 'bg-red-900/30' : 'bg-red-50'}
            `}>
              <FiAlertTriangle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            </div>

            {/* Título */}
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Confirmar Eliminación
            </h2>

            {/* Mensaje */}
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              ¿Está seguro que desea eliminar al proveedor?
            </p>

            {/* Nombre del proveedor */}
            {nombreProveedor && (
              <div className={`
                mt-4 px-4 py-3 rounded-xl w-full
                ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-gray-50 border border-gray-200'}
              `}>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {nombreProveedor}
                </p>
              </div>
            )}

            {/* Advertencia */}
            <p className={`
              mt-4 text-xs
              ${isDark ? 'text-red-400' : 'text-red-600'}
            `}>
              Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Footer con botones */}
          <div className={`
            px-6 py-4 border-t flex items-center gap-3
            ${isDark ? 'bg-[#0a0a0a]/50 border-neutral-800' : 'bg-gray-50/80 border-gray-100'}
          `}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`
                flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isDark
                  ? 'bg-neutral-700 text-white hover:bg-neutral-600 border border-neutral-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`
                flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
                bg-red-600 hover:bg-red-700
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <FiTrash2 size={16} />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
