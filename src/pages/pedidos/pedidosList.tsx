import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PedidoDetalle from './PedidoDetalle';
import { FaEye, FaFilter, FaCalendarAlt, FaShoppingCart, FaClock, FaCheckCircle, FaTimesCircle, FaEdit } from 'react-icons/fa';
import { FiClipboard } from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import PageWrapper from '../../components/ui/PageWrapper';

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

const PedidosList: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, heading, textTertiary, tableHeader, tableHeaderText, emptyState } = useThemeClasses();

  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: 1,
      cliente: "Juan Perez",
      fechaPedido: "2024-01-15",
      estado: "procesando",
      total: 250.00,
      productos: [
        { id: 1, nombre: "Aceite de Oliva Extra Virgen - 5L", precio: 85.00, cantidad: 2, subtotal: 170.00 },
        { id: 2, nombre: "Arroz Extra - Saco 50kg", precio: 120.00, cantidad: 1, subtotal: 120.00 }
      ]
    },
    {
      id: 2,
      cliente: "Maria Lopez",
      fechaPedido: "2024-01-14",
      estado: "pendiente",
      total: 480.00,
      productos: [
        { id: 4, nombre: "Coca-Cola - Caja x 24 botellas", precio: 65.00, cantidad: 4, subtotal: 260.00 },
        { id: 5, nombre: "Fideos Spaghetti - Caja x 50 paq", precio: 95.00, cantidad: 2, subtotal: 190.00 }
      ]
    },
    {
      id: 3,
      cliente: "Carlos Rodriguez",
      fechaPedido: "2024-01-16",
      estado: "completado",
      total: 350.00,
      productos: [
        { id: 6, nombre: "Leche Evaporada - Caja x 24 latas", precio: 110.00, cantidad: 2, subtotal: 220.00 },
        { id: 9, nombre: "Agua Mineral - Caja x 12 botellas", precio: 45.00, cantidad: 2, subtotal: 90.00 }
      ]
    },
    {
      id: 4,
      cliente: "Ana Garcia",
      fechaPedido: "2024-01-13",
      estado: "cancelado",
      total: 180.00,
      productos: [
        { id: 3, nombre: "Atun en Lata - Caja x 48 und", precio: 180.00, cantidad: 1, subtotal: 180.00 }
      ]
    }
  ]);

  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');

  const totalPedidos = pedidos.length;
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const pedidosProcesando = pedidos.filter(p => p.estado === 'procesando').length;
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado').length;

  const pedidosFiltrados = pedidos.filter(pedido =>
    filtroEstado === 'todos' || pedido.estado === filtroEstado
  );

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

  const irAVentas = () => { navigate('/ventas'); };

  const abrirEditarEstado = (pedido: Pedido) => {
    setPedidoEditando(pedido);
    setNuevoEstado(pedido.estado);
  };

  const actualizarEstadoPedido = () => {
    if (pedidoEditando && nuevoEstado) {
      setPedidos(pedidos.map(pedido =>
        pedido.id === pedidoEditando.id
          ? { ...pedido, estado: nuevoEstado as Pedido['estado'] }
          : pedido
      ));
      const pedidosGuardados = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const nuevosPedidos = pedidosGuardados.map((pedido: Pedido) =>
        pedido.id === pedidoEditando.id
          ? { ...pedido, estado: nuevoEstado as Pedido['estado'] }
          : pedido
      );
      localStorage.setItem('pedidos', JSON.stringify(nuevosPedidos));
      setPedidoEditando(null);
      setNuevoEstado('');
      alert(`Estado del pedido #${pedidoEditando.id} actualizado a: ${getEstadoTexto(nuevoEstado)}`);
    }
  };

  const cerrarEditarEstado = () => {
    setPedidoEditando(null);
    setNuevoEstado('');
  };

  return (
    <PageWrapper
      title="Mis Pedidos"
      subtitle="Gestiona y monitorea todos tus pedidos — Peru Market"
      icon={<FiClipboard />}
      actions={[
        { label: 'Nuevo Pedido', onClick: irAVentas, icon: <FaShoppingCart />, variant: 'primary' },
      ]}
    >
      <div className="space-y-6">

        {/* Cards de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow p-4 border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${textTertiary}`}>Total Pedidos</p>
                <p className={`text-2xl font-bold ${heading}`}>{totalPedidos}</p>
              </div>
              <div className={`${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} p-3 rounded-full`}>
                <FaShoppingCart className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-xl`} />
              </div>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Todos los pedidos registrados</p>
          </div>

          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow p-4 border-l-4 border-yellow-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${textTertiary}`}>Pendientes</p>
                <p className={`text-2xl font-bold ${heading}`}>{pedidosPendientes}</p>
              </div>
              <div className={`${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'} p-3 rounded-full`}>
                <FaClock className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'} text-xl`} />
              </div>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Esperando procesamiento</p>
          </div>

          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow p-4 border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${textTertiary}`}>En Proceso</p>
                <p className={`text-2xl font-bold ${heading}`}>{pedidosProcesando}</p>
              </div>
              <div className={`${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} p-3 rounded-full`}>
                <FaClock className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-xl`} />
              </div>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>En preparacion y envio</p>
          </div>

          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow p-4 border-l-4 border-green-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${textTertiary}`}>Completados</p>
                <p className={`text-2xl font-bold ${heading}`}>{pedidosCompletados}</p>
              </div>
              <div className={`${isDark ? 'bg-green-900/30' : 'bg-green-100'} p-3 rounded-full`}>
                <FaCheckCircle className={`${isDark ? 'text-green-400' : 'text-green-600'} text-xl`} />
              </div>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Entregados satisfactoriamente</p>
          </div>
        </div>

        {/* Filtros */}
        <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} p-4 rounded-lg shadow mb-6`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center">
              <FaFilter className={isDark ? 'text-gray-500 mr-2' : 'text-gray-400 mr-2'} />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="procesando">Procesando</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>

            <div className="flex items-center">
              <FaCalendarAlt className={isDark ? 'text-gray-500 mr-2' : 'text-gray-400 mr-2'} />
              <input
                type="date"
                className={`border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Fecha desde"
              />
            </div>

            <div className="flex items-center">
              <FaCalendarAlt className={isDark ? 'text-gray-500 mr-2' : 'text-gray-400 mr-2'} />
              <input
                type="date"
                className={`border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Fecha hasta"
              />
            </div>
          </div>
        </div>

        {/* Resumen de Filtrado */}
        <div className="mb-4">
          <p className={`text-sm ${textTertiary}`}>
            Mostrando <span className="font-semibold">{pedidosFiltrados.length}</span> de <span className="font-semibold">{totalPedidos}</span> pedidos
            {filtroEstado !== 'todos' && (
              <span> - Filtrado por: <span className="font-semibold capitalize">{filtroEstado}</span></span>
            )}
          </p>
        </div>

        {/* Tabla de pedidos */}
        <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <FaTimesCircle className={`mx-auto ${emptyState} text-4xl mb-3`} />
              <p className={`${emptyState} text-lg`}>No se encontraron pedidos</p>
              <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm mt-1`}>Intenta cambiar los filtros de busqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={tableHeader}>
                  <tr>
                    <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider`}>ID</th>
                    <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider`}>Cliente</th>
                    <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider`}>Fecha Pedido</th>
                    <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider`}>Estado</th>
                    <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider`}>Total</th>
                    <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${tableHeaderText} uppercase tracking-wider`}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${heading}`}>
                        #{pedido.id.toString().padStart(3, '0')}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${heading}`}>
                        <div>
                          <p className="font-medium">{pedido.cliente}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{pedido.productos.length} productos</p>
                        </div>
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {new Date(pedido.fechaPedido).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                          {getEstadoTexto(pedido.estado)}
                        </span>
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold ${heading}`}>
                        S/ {pedido.total.toFixed(2)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPedidoSeleccionado(pedido)}
                            className={`flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} transition-colors`}
                            title="Ver detalles"
                          >
                            <FaEye className="mr-1" />
                            <span className="hidden sm:inline">Ver</span>
                          </button>
                          <button
                            onClick={() => abrirEditarEstado(pedido)}
                            className={`flex items-center ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'} transition-colors`}
                            title="Editar estado"
                          >
                            <FaEdit className="mr-1" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para editar estado del pedido */}
        {pedidoEditando && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
              <div className="p-6">
                <h3 className={`text-lg font-bold ${heading} mb-4 flex items-center`}>
                  <FaEdit className="mr-2 text-green-600" />
                  Editar Estado del Pedido
                </h3>

                <div className="mb-4">
                  <p className={`text-sm ${textTertiary} mb-2`}>
                    Pedido: <span className="font-semibold">#{pedidoEditando.id.toString().padStart(3, '0')}</span>
                  </p>
                  <p className={`text-sm ${textTertiary}`}>
                    Cliente: <span className="font-semibold">{pedidoEditando.cliente}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Nuevo Estado
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className={`w-full border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-800'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="procesando">Procesando</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cerrarEditarEstado}
                    className={`flex-1 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-500 text-white hover:bg-gray-600'} py-2 rounded transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={actualizarEstadoPedido}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Actualizar Estado
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {pedidoSeleccionado && (
          <PedidoDetalle
            pedido={pedidoSeleccionado}
            onClose={() => setPedidoSeleccionado(null)}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default PedidosList;
