import { FiAlertTriangle, FiX } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

interface ModalConfirmarLogoutProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModalConfirmarLogout({
  isOpen,
  onConfirm,
  onCancel
}: ModalConfirmarLogoutProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`rounded-2xl shadow-xl max-w-md w-full ${isDark ? "bg-gray-800" : "bg-white"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-red-900/30" : "bg-red-100"}`}>
              <FiAlertTriangle className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"}`} />
            </div>
            <h3 className={`text-lg font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
              Cerrar Sesión
            </h3>
          </div>
          <button onClick={onCancel} className={`transition-colors ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            ¿Estás seguro de que deseas cerrar sesión?
          </p>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Serás redirigido a la página de inicio de sesión.
          </p>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 p-6 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <button
            onClick={onCancel}
            className={`flex-1 py-2.5 px-4 border rounded-xl font-medium transition-colors ${
              isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Sí, Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
