import { FiAlertTriangle } from "react-icons/fi";
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface Props {
  visible: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ClienteDeleteModal({
  visible,
  message,
  onCancel,
  onConfirm,
  loading = false
}: Props) {
  const { isDark, heading, textTertiary } = useThemeClasses();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">

        {/* Backdrop */}
        <div
          className={`fixed inset-0 backdrop-blur-sm transition-opacity ${isDark ? 'bg-black/60' : 'bg-slate-900/40'}`}
          onClick={!loading ? onCancel : undefined}
          aria-hidden="true"
        ></div>

        {/* Modal Panel */}
        <div className={`relative transform overflow-hidden rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>

          {/* Contenido Principal */}
          <div className={`px-6 pt-6 pb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="sm:flex sm:items-start">

              {/* Icono de Alerta */}
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ring-8 ${
                isDark ? 'bg-red-900/30 ring-red-900/20' : 'bg-red-50 ring-red-50/50'
              }`}>
                <FiAlertTriangle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} aria-hidden="true" />
              </div>

              {/* Textos */}
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className={`text-lg font-bold leading-6 ${heading}`} id="modal-title">
                  Confirmar Eliminación
                </h3>
                <div className="mt-2">
                  <p className={`text-sm leading-relaxed ${textTertiary}`}>
                    {message}
                  </p>
                </div>

                {/* Nota de advertencia */}
                <div className={`mt-4 rounded-md p-3 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <div className="flex">
                    <div className={`text-xs ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                      <span className="font-bold">Atención:</span> Esta acción eliminará los datos permanentemente y no se podrá deshacer.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className={`px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 border-t ${
            isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-slate-50 border-slate-100'
          }`}>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`
                inline-flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all sm:w-auto sm:min-w-[120px]
                ${loading
                  ? 'bg-red-400 cursor-not-allowed opacity-70'
                  : 'bg-red-600 hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : 'Sí, eliminar'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className={`inline-flex w-full justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all sm:mt-0 sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDark
                  ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-gray-100 focus:ring-gray-500'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-500'
              }`}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
