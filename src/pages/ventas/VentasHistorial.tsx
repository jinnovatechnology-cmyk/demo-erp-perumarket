import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiPlus, FiDollarSign, FiCheckCircle, FiRefreshCw,
  FiClock, FiEye, FiTruck, FiCalendar, FiUser,
  FiMapPin, FiAlertTriangle, FiXCircle, FiChevronLeft, FiChevronRight,
  FiChevronsLeft, FiChevronsRight, FiX, FiFilter, FiShoppingBag, FiShoppingCart
} from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { ventaService } from '../../services/ventas/ventaService';
import ModalTicket from './ModalTicket';
import { PageWrapper, StatsGrid, StatCard, LoadingState, TYPOGRAPHY } from '../../components/ui/PageWrapper';

/* ── Helpers ─────────────────────────────────────────── */

const STATUS_MAP: Record<string, { light: string; dark: string; icon: React.ReactNode }> = {
  COMPLETADA: {
    light: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dark: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50',
    icon: <FiCheckCircle size={12} />,
  },
  PENDIENTE: {
    light: 'bg-amber-50 text-amber-700 border border-amber-200',
    dark: 'bg-amber-900/30 text-amber-400 border border-amber-800/50',
    icon: <FiClock size={12} />,
  },
  ANULADA: {
    light: 'bg-rose-50 text-rose-700 border border-rose-200',
    dark: 'bg-rose-900/30 text-rose-400 border border-rose-800/50',
    icon: <FiXCircle size={12} />,
  },
};

const getStatusStyles = (status: string, isDark: boolean) => {
  const entry = STATUS_MAP[(status || '').toUpperCase()];
  if (!entry) return isDark ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-200';
  return isDark ? entry.dark : entry.light;
};

const getStatusIcon = (status: string) => STATUS_MAP[(status || '').toUpperCase()]?.icon ?? null;

function formatMoney(v: number) {
  return 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatFecha(fecha: string) {
  if (!fecha) return '-';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function formatFechaCorta(fecha: string) {
  if (!fecha) return '-';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

// Genera código de venta visual: VTA-0001, VTA-0042, etc.
const generarCodigoVenta = (id: number) => `VTA-${String(id).padStart(4, '0')}`;

const ITEMS_PER_PAGE = 15;

/* ── Component ───────────────────────────────────────── */

export default function VentasHistorial() {
  const {
    isDark, card, heading, textPrimary,
    textSecondary, textTertiary, textMuted, border, borderLight, input,
    select, emptyState, tableHeader, tableHeaderText, tableRow, tableCell,
    btnSecondary, btnGhost, subtleBg, listItemHover, shadow, divider
  } = useThemeClasses();
  const navigate = useNavigate();

  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const cargarVentas = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await ventaService.fetchVentas();
      const sorted = data.sort((a: any, b: any) =>
        new Date(b.fecha || b.fechaCreacion).getTime() - new Date(a.fecha || a.fechaCreacion).getTime()
      );
      setVentas(sorted);
    } catch (err: any) {
      console.error('Error al cargar ventas:', err);
      setError(err?.message || 'No se pudieron cargar las ventas. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado]);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      const term = searchTerm.toLowerCase().trim();
      const codigoVenta = generarCodigoVenta(v.id).toLowerCase(); // VTA-0063
      const matchSearch =
        (v.nombreCliente || '').toLowerCase().includes(term) ||
        (v.nombreUsuario || '').toLowerCase().includes(term) ||
        String(v.id || '').includes(term) ||
        codigoVenta.includes(term); // Búsqueda por código VTA-XXXX
      const matchEstado = filterEstado === 'all' || v.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [searchTerm, filterEstado, ventas]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(ventasFiltradas.length / ITEMS_PER_PAGE));
  const paginatedVentas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return ventasFiltradas.slice(start, start + ITEMS_PER_PAGE);
  }, [ventasFiltradas, currentPage]);

  const totalVentas = ventas.length;
  const montoTotal = ventas.reduce((s, v) => s + (v.total || 0), 0);
  const completadas = ventas.filter(v => v.estado === 'COMPLETADA').length;
  const pendientes = ventas.filter(v => v.estado === 'PENDIENTE').length;

  const hasActiveFilters = searchTerm !== '' || filterEstado !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setFilterEstado('all');
  };

  const handleVerTicket = (venta: any) => {
    setVentaSeleccionada(venta);
    setMostrarTicket(true);
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <PageWrapper
        title="Ventas"
        subtitle="Gestione el historial de transacciones, consulte detalles de operaciones y realice seguimiento de ventas completadas y pendientes."
        icon={<FiShoppingCart />}
      >
        <LoadingState message="Cargando ventas..." />
      </PageWrapper>
    );
  }

  // ── Error state ──
  if (error && ventas.length === 0) {
    return (
      <PageWrapper
        title="Ventas"
        subtitle="Gestione el historial de transacciones, consulte detalles de operaciones y realice seguimiento de ventas completadas y pendientes."
        icon={<FiShoppingCart />}
      >
        <div className={`rounded-2xl border p-8 max-w-md mx-auto text-center ${card}`}>
          <div className={`inline-flex p-4 rounded-2xl mb-5 ${isDark ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
            <FiAlertTriangle size={36} className={isDark ? 'text-rose-400' : 'text-rose-500'} />
          </div>
          <h2 className={`${TYPOGRAPHY.sectionTitle} mb-2 ${heading}`}>Error al cargar ventas</h2>
          <p className={`${TYPOGRAPHY.body} mb-6 ${textTertiary}`}>{error}</p>
          <button
            onClick={() => cargarVentas()}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl"
          >
            <FiRefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Ventas"
      subtitle="Gestione el historial de transacciones, consulte detalles de operaciones y realice seguimiento de ventas completadas y pendientes."
      icon={<FiShoppingCart />}
      onRefresh={() => cargarVentas(true)}
      refreshing={refreshing}
      actions={[
        {
          label: "Nueva Venta",
          onClick: () => navigate('/ventas/nueva'),
          icon: <FiPlus />,
          variant: "primary"
        }
      ]}
    >
      {/* ── Inline error banner ── */}
      {error && ventas.length > 0 && (
        <div className={`rounded-xl border px-4 py-3 mb-4 flex items-center gap-3 ${isDark ? 'bg-rose-900/20 border-rose-800/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          <FiAlertTriangle size={16} className="flex-shrink-0" />
          <span className="text-sm flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 rounded-lg hover:bg-black/10 transition-colors">
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <StatsGrid columns={4}>
        <StatCard label="Total Ventas" value={totalVentas.toString()} icon={<FiShoppingBag />} accent />
        <StatCard label="Monto Total" value={formatMoney(montoTotal)} icon={<FiDollarSign />} />
        <StatCard label="Completadas" value={completadas.toString()} icon={<FiCheckCircle />} />
        <StatCard label="Pendientes" value={pendientes.toString()} icon={<FiClock />} />
      </StatsGrid>

      {/* ── Table Card ── */}
      <div className={`rounded-2xl border overflow-hidden ${shadow} ${card}`}>

        {/* Filters bar */}
        <div className={`p-4 md:p-5 border-b ${border}`}>
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="relative flex-1 md:max-w-sm">
              <FiSearch className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${textMuted}`} />
              <input
                type="text"
                placeholder="Buscar por código (VTA-0001), cliente o vendedor..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 ${input}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${btnGhost}`}
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <FiFilter size={14} className={textMuted} />
                <select
                  className={`border rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-all ${select}`}
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="COMPLETADA">Completada</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ANULADA">Anulada</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${btnGhost}`}
                  title="Limpiar filtros"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results summary bar */}
        <div className={`px-5 py-2 text-xs font-medium ${textMuted} border-b ${borderLight} flex items-center justify-between`}>
          <span>
            {hasActiveFilters ? (
              <>Mostrando <span className="font-bold text-[#E0312A]">{ventasFiltradas.length}</span> de {ventas.length} ventas</>
            ) : (
              <>{ventas.length} ventas en total</>
            )}
          </span>
          {ventasFiltradas.length > ITEMS_PER_PAGE && (
            <span>Página {currentPage} de {totalPages}</span>
          )}
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={tableHeader}>
                {['Código', 'Fecha', 'Cliente', 'Vendedor', 'Almacén', 'Total', 'Estado', 'Tipo', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider ${tableHeaderText} ${
                    h === 'Total' ? 'text-right' : h === 'Estado' || h === 'Tipo' || h === '' ? 'text-center' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {paginatedVentas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className={`inline-flex flex-col items-center ${emptyState}`}>
                      <div className={`p-5 rounded-2xl mb-4 ${subtleBg}`}>
                        <FiSearch size={28} className="opacity-40" />
                      </div>
                      <p className={`font-semibold text-base mb-1 ${textSecondary}`}>No se encontraron ventas</p>
                      <p className={`text-sm mb-4 ${textMuted}`}>Intenta con otros filtros de búsqueda</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${btnSecondary}`}
                        >
                          <FiX size={14} />
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedVentas.map(venta => (
                  <tr key={venta.id} className={`${tableRow} transition-colors cursor-pointer group`} onClick={() => handleVerTicket(venta)}>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-[#E0312A]">{generarCodigoVenta(venta.id)}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={13} className={textMuted} />
                        <span className={`text-sm ${tableCell}`}>{formatFecha(venta.fecha || venta.fechaCreacion)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm bg-[#E0312A]">
                          {(venta.nombreCliente || 'S')[0].toUpperCase()}
                        </div>
                        <span className={`text-sm font-medium ${textPrimary}`}>{venta.nombreCliente || 'Sin cliente'}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-3 whitespace-nowrap text-sm ${tableCell}`}>
                      {venta.nombreUsuario || '-'}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FiMapPin size={12} className={textMuted} />
                        <span className={`text-sm ${tableCell}`}>{venta.nombreAlmacen || '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${heading}`}>{formatMoney(venta.total || 0)}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusStyles(venta.estado, isDark)}`}>
                        {getStatusIcon(venta.estado)}
                        {venta.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center">
                      {venta.estado === 'PENDIENTE' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#E0312A]">
                          <FiTruck size={13} />
                          Delivery
                        </span>
                      ) : (
                        <span className={`text-xs ${textMuted}`}>Directa</span>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleVerTicket(venta); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all opacity-0 group-hover:opacity-100 ${btnGhost}`}
                      >
                        <FiEye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="block lg:hidden">
          {paginatedVentas.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className={`inline-flex flex-col items-center ${emptyState}`}>
                <div className={`p-5 rounded-2xl mb-4 ${subtleBg}`}>
                  <FiSearch size={28} className="opacity-40" />
                </div>
                <p className={`font-semibold mb-1 ${textSecondary}`}>No se encontraron ventas</p>
                <p className={`text-sm mb-4 ${textMuted}`}>Intenta con otros filtros</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${btnSecondary}`}>
                    <FiX size={14} /> Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`divide-y ${divider}`}>
              {paginatedVentas.map(venta => (
                <div
                  key={venta.id}
                  className={`p-4 ${listItemHover} transition-colors`}
                  onClick={() => handleVerTicket(venta)}
                >
                  {/* Top row: avatar + ID + status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm bg-[#E0312A]">
                        {(venta.nombreCliente || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#E0312A]">{generarCodigoVenta(venta.id)}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${getStatusStyles(venta.estado, isDark)}`}>
                            {getStatusIcon(venta.estado)}
                            {venta.estado}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${textMuted}`}>
                          <FiCalendar size={10} className="inline mr-1" />
                          {formatFechaCorta(venta.fecha || venta.fechaCreacion)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${heading}`}>{formatMoney(venta.total || 0)}</span>
                  </div>

                  {/* Detail row */}
                  <div className={`ml-[46px] flex items-center gap-4 text-xs ${textMuted}`}>
                    <span className="flex items-center gap-1">
                      <FiUser size={11} />
                      {venta.nombreCliente || 'Sin cliente'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMapPin size={11} />
                      {venta.nombreAlmacen || '-'}
                    </span>
                    {venta.estado === 'PENDIENTE' && (
                      <span className="flex items-center gap-1 text-[#E0312A]">
                        <FiTruck size={11} />
                        Delivery
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className={`px-5 py-4 border-t ${border}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info de paginación */}
              <p className={`text-sm ${textMuted}`}>
                Mostrando <span className="font-semibold text-[#E0312A]">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-semibold text-[#E0312A]">{Math.min(currentPage * ITEMS_PER_PAGE, ventasFiltradas.length)}</span> de <span className="font-semibold">{ventasFiltradas.length}</span> ventas
              </p>

              {/* Controles de paginación */}
              <div className="flex items-center gap-1">
                {/* Primera página */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                      : isDark ? 'text-gray-400 hover:bg-neutral-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title="Primera página"
                >
                  <FiChevronsLeft size={18} />
                </button>

                {/* Anterior */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                      : isDark ? 'text-gray-400 hover:bg-neutral-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title="Página anterior"
                >
                  <FiChevronLeft size={18} />
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 5) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className={`px-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-[#E0312A] text-white shadow-md'
                              : isDark
                                ? 'text-gray-400 hover:bg-neutral-700 hover:text-white'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                {/* Siguiente */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                      : isDark ? 'text-gray-400 hover:bg-neutral-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title="Página siguiente"
                >
                  <FiChevronRight size={18} />
                </button>

                {/* Última página */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                      : isDark ? 'text-gray-400 hover:bg-neutral-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title="Última página"
                >
                  <FiChevronsRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ticket */}
      <ModalTicket
        isOpen={mostrarTicket}
        onClose={() => setMostrarTicket(false)}
        venta={ventaSeleccionada}
      />
    </PageWrapper>
  );
}
