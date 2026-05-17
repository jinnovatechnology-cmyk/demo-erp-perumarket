// src/pages/Unauthorized.tsx
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome, FiArrowLeft } from 'react-icons/fi';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de alerta */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Mensaje */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso No Autorizado
        </h1>
        
        <p className="text-gray-600 mb-2">
          No tienes permisos para acceder a esta sección.
        </p>
        
        <p className="text-gray-500 text-sm mb-8">
          Contacta al administrador del sistema si necesitas acceso a este módulo.
        </p>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiHome className="w-5 h-5" />
            Ir al Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5" />
            Volver Atrás
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Si crees que esto es un error, verifica que tu rol tenga asignados los permisos necesarios.
          </p>
        </div>
      </div>
    </div>
  );
}