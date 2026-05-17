import React from 'react';

import { FaTimes, FaUser, FaInfoCircle, FaBox, FaCheckCircle } from 'react-icons/fa';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ProductoPedido {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  cliente: string;
  fechaPedido: string;
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado';
  total: number;
  productos: ProductoPedido[];
}

interface PedidoDetalleProps {
  pedido: Pedido;
  onClose: () => void;
}

const PedidoDetalle: React.FC<PedidoDetalleProps> = ({ pedido, onClose }) => {
  const { isDark, heading, tableHeader, tableHeaderText } = useThemeClasses();

  const getEstadoColor = (estado: string) => {
    if (isDark) {
      switch (estado) {
        case 'completado': return 'bg-green-900/30 text-green-400';
        case 'procesando': return 'bg-blue-900/30 text-blue-400';
        case 'pendiente': return 'bg-yellow-900/30 text-yellow-400';
        case 'cancelado': return 'bg-red-900/30 text-red-400';
        default: return 'bg-gray-700 text-gray-400';
      }
    }
    switch (estado) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'procesando': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'completado': return 'Completado';
      case 'procesando': return 'Procesando';
      case 'pendiente': return 'Pendiente';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${heading}`}>
              Pedido #{pedido.id.toString().padStart(3, '0')}
            </h2>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-xl`}
            >
              <FaTimes />
            </button>
          </div>

          {/* Informacion general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className={`font-semibold mb-3 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <FaUser className="mr-2" />
                Informacion del Cliente
              </h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-700'}><strong>Cliente:</strong> {pedido.cliente}</p>
              <p className={isDark ? 'text-gray-300' : 'text-gray-700'}><strong>Fecha del Pedido:</strong> {pedido.fechaPedido}</p>
            </div>
            <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className={`font-semibold mb-3 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <FaInfoCircle className="mr-2" />
                Estado del Pedido
              </h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-700'}><strong>Estado:</strong>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                  {getEstadoTexto(pedido.estado)}
                </span>
              </p>
              <p className={isDark ? 'text-gray-300' : 'text-gray-700'}><strong>Total:</strong> S/ {pedido.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Productos del pedido */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              <FaBox className="mr-2" />
              Productos del Pedido
            </h3>
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
              <table className="min-w-full">
                <thead className={tableHeader}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase`}>Producto</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase`}>Precio Unitario</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase`}>Cantidad</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase`}>Subtotal</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {pedido.productos.map((producto, index) => (
                    <tr key={index}>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{producto.nombre}</td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>S/ {producto.precio.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{producto.cantidad}</td>
                      <td className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>S/ {producto.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className={`flex items-center ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-500 text-white hover:bg-gray-600'} px-6 py-2 rounded transition-colors`}
            >
              <FaTimes className="mr-2" />
              Cerrar
            </button>
            {pedido.estado === 'pendiente' && (
              <button
                onClick={() => {
                  console.log('Procesar pedido:', pedido.id);
                  alert('Pedido procesado exitosamente');
                  onClose();
                }}
                className="flex items-center bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
              >
                <FaCheckCircle className="mr-2" />
                Procesar Pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidoDetalle;
