import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import {
  IoMdAdd, IoIosEye, IoIosSearch,
  IoIosDocument, IoIosCash, IoIosCalendar,
  IoMdCreate, IoMdClose, IoMdCheckmarkCircle
} from "react-icons/io";
import { FiShoppingBag } from 'react-icons/fi';
import { supabase } from '../../services/api';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { PageWrapper, StatsGrid, StatCard, LoadingState } from '../../components/ui/PageWrapper';

// --- INTERFACES ---
interface Compra {
  id: number;
  numeroComprobante: string;
  tipoComprobante: string;
  fechaCompra: string;
  total: number;
  estado: string;
  proveedor: { razonSocial: string; };
  almacen: { nombre: string; };
}

// --- ESTILOS DE ESTADO ---
const getStatusStylesLight = (status: string) => {
  const s = status ? status.toUpperCase() : '';
  switch (s) {
    case 'COMPLETADA':
    case 'COMPLETADO': return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/20';
    case 'PENDIENTE': return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/20';
    case 'ANULADA':
    case 'CANCELADO': return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/20';
    default: return 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-600/20';
  }
};

const getStatusStylesDark = (status: string) => {
  const s = status ? status.toUpperCase() : '';
  switch (s) {
    case 'COMPLETADA':
    case 'COMPLETADO': return 'bg-emerald-900/40 text-emerald-400 border-emerald-700 ring-1 ring-emerald-500/20';
    case 'PENDIENTE': return 'bg-amber-900/40 text-amber-400 border-amber-700 ring-1 ring-amber-500/20';
    case 'ANULADA':
    case 'CANCELADO': return 'bg-rose-900/40 text-rose-400 border-rose-700 ring-1 ring-rose-500/20';
    default: return 'bg-gray-700 text-gray-400 border-gray-600 ring-1 ring-gray-500/20';
  }
};

const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : '??';
};

export default function PurchaseList() {
  const { isDark, heading, textTertiary, tableHeader, tableHeaderText, emptyState } = useThemeClasses();

  const getStatusStyles = isDark ? getStatusStylesDark : getStatusStylesLight;

  // --- ESTADOS ---
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');

  // Estados del Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [savingState, setSavingState] = useState(false);

  // --- CARGAR DATOS ---
  useEffect(() => {
    const fetchCompras = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('compra')
          .select(`
            id, numero_comprobante, tipo_comprobante, fecha, total, estado,
            proveedor:id_proveedor ( razon_social ),
            almacen:id_almacen ( nombre )
          `)
          .order('id', { ascending: false });
        if (error) throw error;
        type CompraRaw = {
          id: number;
          numero_comprobante: string | null;
          tipo_comprobante: string | null;
          fecha: string | null;
          total: number | null;
          estado: string;
          proveedor: { razon_social: string } | null;
          almacen: { nombre: string } | null;
        };
        const mapped: Compra[] = ((data ?? []) as unknown as CompraRaw[]).map(r => ({
          id: r.id,
          numeroComprobante: r.numero_comprobante ?? '',
          tipoComprobante: r.tipo_comprobante ?? '',
          fechaCompra: r.fecha ?? '',
          total: r.total ?? 0,
          estado: r.estado,
          proveedor: { razonSocial: r.proveedor?.razon_social ?? '' },
          almacen: { nombre: r.almacen?.nombre ?? '' },
        }));
        setCompras(mapped);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompras();
  }, []);

  // --- HANDLERS DEL MODAL ---
  const abrirModalEstado = (compra: Compra) => {
    setSelectedCompra(compra);
    setNuevoEstado(compra.estado);
    setModalOpen(true);
  };

  const guardarEstado = async () => {
    if (!selectedCompra) return;
    setSavingState(true);
    try {
        const { error } = await supabase
          .from('compra')
          .update({ estado: nuevoEstado })
          .eq('id', selectedCompra.id);
        if (error) throw error;

        setCompras(compras.map(c =>
            c.id === selectedCompra.id ? { ...c, estado: nuevoEstado } : c
        ));

        setModalOpen(false);
        alert("Estado actualizado correctamente");
    } catch (error) {
        console.error("Error cambiando estado:", error);
        alert("No se pudo actualizar el estado.");
    } finally {
        setSavingState(false);
    }
  };

  // --- FILTROS Y CALCULOS ---
  const comprasFiltradas = useMemo(() => {
    return compras.filter(compra => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (compra.numeroComprobante || '').toLowerCase().includes(term) ||
        (compra.proveedor?.razonSocial || '').toLowerCase().includes(term);

      const matchEstado = filterEstado === 'all' || compra.estado === filterEstado;

      return matchSearch && matchEstado;
    });
  }, [searchTerm, filterEstado, compras]);

  const totalCompras = compras.reduce((sum, c) => sum + c.total, 0);
  const comprasCompletadas = compras.filter(c => c.estado === 'COMPLETADA' || c.estado === 'COMPLETADO').length;
  const comprasPendientes = compras.filter(c => c.estado === 'PENDIENTE').length;

  const formatearFecha = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (loading) return (
    <PageWrapper
      title="Compras"
      subtitle="Administre el registro de adquisiciones, controle gastos con proveedores y realice seguimiento del estado de órdenes de compra."
      icon={<FiShoppingBag />}
    >
      <LoadingState message="Cargando compras..." />
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Compras"
      subtitle="Administre el registro de adquisiciones, controle gastos con proveedores y realice seguimiento del estado de órdenes de compra."
      icon={<FiShoppingBag />}
      actions={[
        {
          label: "Nueva Compra",
          href: "/compras/nueva",
          icon: <IoMdAdd />,
          variant: "primary"
        }
      ]}
    >
      {/* STATS CARDS */}
      <StatsGrid columns={4}>
        <StatCard label="Operaciones" value={compras.length.toString()} icon={<IoIosDocument />} accent />
        <StatCard label="Total Invertido" value={`S/ ${totalCompras.toLocaleString('es-PE', {minimumFractionDigits: 2})}`} icon={<IoIosCash />} />
        <StatCard label="Completadas" value={comprasCompletadas.toString()} icon={<IoIosCalendar />} />
        <StatCard label="Pendientes" value={comprasPendientes.toString()} icon={<IoIosCalendar />} />
      </StatsGrid>

        {/* TABLA PRINCIPAL */}
        <div className={`${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>

            {/* Filtros */}
            <div className={`p-5 border-b ${isDark ? 'border-neutral-800 bg-[#171717]' : 'border-gray-100 bg-gray-50/50'} flex flex-col md:flex-row justify-between items-center gap-4`}>
                <div className="relative w-full md:w-96">
                    <IoIosSearch className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input type="text" placeholder='Buscar por N comprobante o proveedor...'
                        className={`w-full pl-10 pr-4 py-2.5 ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-200 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-700'} border rounded-lg text-sm focus:outline-none focus:border-[#E0312A] focus:ring-1 focus:ring-[#E0312A] transition-all`}
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className={`text-sm ${textTertiary} hidden sm:block`}>Estado:</span>
                    <select className={`w-full md:w-auto border ${isDark ? 'border-neutral-700 bg-neutral-800 text-gray-200' : 'border-gray-200 bg-white text-gray-700'} rounded-lg px-3 py-2.5 text-sm focus:border-[#E0312A] outline-none cursor-pointer`}
                        value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                        <option value="all">Todos</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="ANULADA">Anulada</option>
                    </select>
                </div>
            </div>

            {/* Listado */}
            <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-200'}`}>
                    <thead className={tableHeader}>
                        <tr>
                            <th className={`px-6 py-4 text-left text-xs font-semibold ${tableHeaderText} uppercase tracking-wider`}>Comprobante</th>
                            <th className={`px-6 py-4 text-left text-xs font-semibold ${tableHeaderText} uppercase tracking-wider`}>Proveedor</th>
                            <th className={`px-6 py-4 text-left text-xs font-semibold ${tableHeaderText} uppercase tracking-wider`}>Almacen</th>
                            <th className={`px-6 py-4 text-left text-xs font-semibold ${tableHeaderText} uppercase tracking-wider`}>Fecha</th>
                            <th className={`px-6 py-4 text-right text-xs font-semibold ${tableHeaderText} uppercase tracking-wider`}>Total</th>
                            <th className={`px-6 py-4 text-center text-xs font-semibold ${tableHeaderText} uppercase tracking-wider`}>Estado</th>
                            <th className={`px-6 py-4 text-center text-xs font-semibold ${tableHeaderText} uppercase tracking-wider`}>Accion</th>
                        </tr>
                    </thead>
                    <tbody className={`${isDark ? 'bg-[#171717]' : 'bg-white'} divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                        {comprasFiltradas.length === 0 ? (
                            <tr><td colSpan={7} className={`px-6 py-12 text-center ${emptyState}`}>No se encontraron registros.</td></tr>
                        ) : (
                            comprasFiltradas.map((compra) => (
                                <tr key={compra.id} className={`${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'} transition-colors duration-150 group`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-[#E0312A]">{compra.numeroComprobante || 'S/N'}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{compra.tipoComprobante}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`h-8 w-8 rounded-full ${isDark ? 'bg-[#E0312A]/20 text-emerald-400' : 'bg-[#E0312A]/10 text-[#E0312A]'} flex items-center justify-center text-xs font-bold mr-3`}>
                                                {getInitials(compra.proveedor?.razonSocial)}
                                            </div>
                                            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {compra.proveedor?.razonSocial || 'Desconocido'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textTertiary}`}>{compra.almacen?.nombre || '-'}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textTertiary}`}>{formatearFecha(compra.fechaCompra)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>S/ {compra.total?.toFixed(2)}</td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                          onClick={() => abrirModalEstado(compra)}
                                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:scale-105 transition-transform ${getStatusStyles(compra.estado)}`}
                                        >
                                            {compra.estado}
                                        </button>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => abrirModalEstado(compra)}
                                                className={`${isDark ? 'text-gray-500 hover:text-[#F0726A] hover:bg-[#E0312A]/20' : 'text-gray-400 hover:text-[#E0312A] hover:bg-[#E0312A]/10'} transition-colors p-2 rounded-full`}
                                                title="Cambiar Estado"
                                            >
                                                <IoMdCreate className="w-5 h-5" />
                                            </button>

                                            <Link to={`/compras/historial/${compra.id}`}
                                                className={`${isDark ? 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-900/30' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'} transition-colors p-2 rounded-full`}
                                                title="Ver Detalle"
                                            >
                                                <IoIosEye className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      {/* --- MODAL FLOTANTE PARA CAMBIAR ESTADO --- */}
      {modalOpen && selectedCompra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm transition-opacity`} onClick={() => setModalOpen(false)}></div>

            <div className={`relative ${isDark ? 'bg-[#171717]' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeInUp`}>
                {/* Modal Header */}
                <div className={`px-6 py-4 border-b ${isDark ? 'border-neutral-800 bg-[#171717]' : 'border-gray-100 bg-gray-50'} flex justify-between items-center`}>
                    <h3 className={`font-bold ${heading} flex items-center gap-2`}>
                        <IoMdCreate className="text-[#E0312A]"/> Actualizar Estado
                    </h3>
                    <button onClick={() => setModalOpen(false)} className={`${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}>
                        <IoMdClose size={22} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className={`mb-5 ${isDark ? 'bg-[#E0312A]/20 border-[#E0312A]/40' : 'bg-[#E0312A]/10 border-[#E0312A]/20'} p-3 rounded-lg border`}>
                        <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-[#E0312A]'} uppercase font-bold mb-1`}>Comprobante Seleccionado</p>
                        <p className={`font-mono font-bold ${heading} text-lg`}>{selectedCompra.numeroComprobante}</p>
                    </div>

                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Selecciona el nuevo estado:</p>

                    <div className="space-y-2">
                        {['PENDIENTE', 'COMPLETADA', 'ANULADA'].map((estado) => (
                            <label key={estado}
                                className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                                    nuevoEstado === estado
                                    ? `border-[#E0312A] ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'} shadow-sm ring-1 ring-[#E0312A]`
                                    : `${isDark ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="estado"
                                    value={estado}
                                    checked={nuevoEstado === estado}
                                    onChange={(e) => setNuevoEstado(e.target.value)}
                                    className="w-4 h-4 text-[#E0312A] focus:ring-[#E0312A] border-gray-300"
                                />
                                <span className={`ml-3 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                                    {estado.toLowerCase()}
                                </span>
                                {nuevoEstado === estado && (
                                    <IoMdCheckmarkCircle className="ml-auto text-[#E0312A] text-xl animate-scaleIn" />
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className={`px-6 py-4 ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-gray-50 border-gray-100'} border-t flex justify-end gap-3`}>
                    <button
                        onClick={() => setModalOpen(false)}
                        className={`px-4 py-2.5 text-sm font-bold ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'} rounded-lg transition-all`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardarEstado}
                        disabled={savingState}
                        className={`px-5 py-2.5 text-sm font-bold text-white bg-[#E0312A] hover:bg-[#A91E16] rounded-lg shadow-lg ${isDark ? 'shadow-[#E0312A]/20' : 'shadow-[#E0312A]/30'} transition-all disabled:opacity-70 disabled:shadow-none flex items-center gap-2`}
                    >
                        {savingState ? (
                            <>Wait...</>
                        ) : (
                            <>Confirmar</>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </PageWrapper>
  );
}
