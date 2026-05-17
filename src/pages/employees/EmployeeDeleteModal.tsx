// EmployeeDeleteModal.tsx
import { FiAlertTriangle } from "react-icons/fi";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface Props {
  visible: boolean;
  message: string;
  subMessage: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteModal({
  visible,
  message,
  subMessage,
  onCancel,
  onConfirm,
  loading = false
}: Props) {
  const theme = useThemeClasses();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">

        {/* Backdrop */}
        <div
          className={`fixed inset-0 backdrop-blur-sm transition-opacity ${theme.isDark ? 'bg-black/60' : 'bg-slate-900/60'}`}
          onClick={onCancel}
        ></div>

        {/* Modal Content */}
        <div className={`relative transform overflow-hidden rounded-xl ${theme.modalContent} border text-left shadow-2xl transition-all sm:w-full sm:max-w-lg`}>

          {/* Header */}
          <div className={`px-6 pt-6 pb-4 ${theme.isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full mx-auto sm:mx-0 ${
                theme.isDark ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <FiAlertTriangle className={`h-6 w-6 ${theme.isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className="mt-0 ml-4 text-left flex-1">
                <h3 className={`text-lg font-semibold leading-6 ${theme.heading}`}>
                  {message}
                </h3>
                <div className="mt-2">
                  <p className={`text-sm ${theme.textTertiary}`}>
                    {subMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 rounded-b-xl ${
            theme.isDark ? 'bg-gray-800/50 border-t border-gray-700' : 'bg-slate-50'
          }`}>
            <button
              type="button"
              disabled={loading}
              className={`inline-flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                ${loading
                  ? 'bg-red-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                }`}
              onClick={onConfirm}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                </>
              ) : 'Eliminar'}
            </button>

            <button
              type="button"
              disabled={loading}
              className={`inline-flex w-full justify-center rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.btnSecondary}`}
              onClick={onCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
