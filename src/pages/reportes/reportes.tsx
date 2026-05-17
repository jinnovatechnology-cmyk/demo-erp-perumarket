/**
 * Reportes.tsx - Módulo de Reportes
 * Diseño Power BI - Estilo profesional (igual que Empleados)
 */

import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  FiBox, FiShoppingCart, FiDollarSign, FiTrendingUp,
  FiAlertTriangle, FiUsers, FiPackage, FiTruck, FiBarChart2,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight,
  FiRefreshCw, FiDownload, FiAlertCircle
} from "react-icons/fi";
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { reportesService } from '../../services/reportesService';
import type { ReporteVentas, ReporteCompras, ReporteInventario } from '../../services/reportesService';
import PageWrapper from '../../components/ui/PageWrapper';

type TabType = 'ventas' | 'compras' | 'inventario';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const ITEMS_PER_PAGE = 10;

/* ═══════════════════════════════════════════════════════════════════════════
   UTILIDADES
   ═══════════════════════════════════════════════════════════════════════════ */
function formatMoney(value: number): string {
  return 'S/ ' + value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatFecha(fecha: string): string {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

/* ═══════════════════════════════════════════════════════════════════════════
   KPI CARD - Tarjeta de estadística estilo Power BI
   ═══════════════════════════════════════════════════════════════════════════ */
interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'rose' | 'neutral';
  isDark: boolean;
}

const KPICard = ({ title, value, subtitle, icon, color = 'neutral', isDark }: KPICardProps) => {
  const colorStyles = {
    green: {
      iconBg: isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10',
      iconColor: 'text-[#E0312A]',
      value: isDark ? 'text-[#F0726A]' : 'text-[#E0312A]'
    },
    blue: {
      iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-50',
      iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
      value: isDark ? 'text-blue-400' : 'text-blue-600'
    },
    amber: {
      iconBg: isDark ? 'bg-amber-500/20' : 'bg-amber-50',
      iconColor: isDark ? 'text-amber-400' : 'text-amber-600',
      value: isDark ? 'text-amber-400' : 'text-amber-600'
    },
    rose: {
      iconBg: isDark ? 'bg-rose-500/20' : 'bg-rose-50',
      iconColor: isDark ? 'text-rose-400' : 'text-rose-600',
      value: isDark ? 'text-rose-400' : 'text-rose-600'
    },
    neutral: {
      iconBg: isDark ? 'bg-neutral-700' : 'bg-gray-100',
      iconColor: isDark ? 'text-neutral-400' : 'text-gray-600',
      value: isDark ? 'text-white' : 'text-gray-900'
    }
  };

  const styles = colorStyles[color];

  return (
    <div className={`
      p-5 rounded-xl border transition-all duration-200
      ${isDark
        ? 'bg-[#171717] border-neutral-800 hover:border-neutral-700'
        : 'bg-white border-gray-200 hover:shadow-md'
      }
    `}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${styles.iconBg}`}>
          <div className={`w-6 h-6 ${styles.iconColor}`}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${styles.value}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION CARD - Contenedor de sección
   ═══════════════════════════════════════════════════════════════════════════ */
interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isDark: boolean;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

const SectionCard = ({ title, subtitle, children, isDark, headerAction, noPadding }: SectionCardProps) => (
  <div className={`
    rounded-xl border overflow-hidden
    ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
  `}>
    <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
      <div>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        {subtitle && (
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
        )}
      </div>
      {headerAction}
    </div>
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   TAB BUTTON
   ═══════════════════════════════════════════════════════════════════════════ */
interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  isDark: boolean;
}

const TabButton = ({ label, icon, isActive, onClick, isDark }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
      ${isActive
        ? 'text-white bg-[#E0312A]'
        : isDark
          ? 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PAGINATION
   ═══════════════════════════════════════════════════════════════════════════ */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isDark: boolean;
}

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange, isDark }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Mostrando <span className="font-semibold text-[#E0312A]">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}</span> - <span className="font-semibold text-[#E0312A]">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> de <span className="font-semibold">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={`p-2 rounded-lg transition-all disabled:opacity-40 ${isDark ? 'text-gray-500 hover:bg-neutral-800' : 'text-gray-400 hover:bg-gray-100'}`}>
          <FiChevronsLeft size={18} />
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-lg transition-all disabled:opacity-40 ${isDark ? 'text-gray-500 hover:bg-neutral-800' : 'text-gray-400 hover:bg-gray-100'}`}>
          <FiChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={`e-${idx}`} className={`px-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-[#E0312A] text-white'
                    : isDark ? 'text-gray-400 hover:bg-neutral-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-lg transition-all disabled:opacity-40 ${isDark ? 'text-gray-500 hover:bg-neutral-800' : 'text-gray-400 hover:bg-gray-100'}`}>
          <FiChevronRight size={18} />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={`p-2 rounded-lg transition-all disabled:opacity-40 ${isDark ? 'text-gray-500 hover:bg-neutral-800' : 'text-gray-400 hover:bg-gray-100'}`}>
          <FiChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SKELETON
   ═══════════════════════════════════════════════════════════════════════════ */
const LoadingSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`h-24 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className={`lg:col-span-2 h-72 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
      <div className={`h-72 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
    </div>
    <div className={`h-96 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP
   ═══════════════════════════════════════════════════════════════════════════ */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] p-3 rounded-lg shadow-xl border border-neutral-700">
        <p className="font-medium text-gray-200 text-sm mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.value > 50 ? formatMoney(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESTADO BADGE
   ═══════════════════════════════════════════════════════════════════════════ */
const getEstadoBadge = (estado: string, isDark: boolean) => {
  const styles: Record<string, string> = {
    COMPLETADA: isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
    PENDIENTE: isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-700',
    ANULADA: isDark ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-700',
  };
  return styles[estado] || (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600');
};

/* ═══════════════════════════════════════════════════════════════════════════
   TAB VENTAS
   ═══════════════════════════════════════════════════════════════════════════ */
function TabVentas({ data, isDark }: { data: ReporteVentas; isDark: boolean }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.detalleVentas.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return data.detalleVentas.slice(start, start + ITEMS_PER_PAGE);
  }, [data.detalleVentas, page]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Ingresos Totales" value={formatMoney(data.ingresoTotal)} subtitle={`${data.ventasCompletadas} completadas`} icon={<FiDollarSign className="w-6 h-6" />} color="blue" isDark={isDark} />
        <KPICard title="Ventas del Día" value={formatMoney(data.ingresoDelDia)} subtitle={`${data.ventasDelDia} ventas hoy`} icon={<FiTrendingUp className="w-6 h-6" />} color="green" isDark={isDark} />
        <KPICard title="Ticket Promedio" value={formatMoney(data.ticketPromedio)} subtitle="Por venta" icon={<FiShoppingCart className="w-6 h-6" />} color="amber" isDark={isDark} />
        <KPICard title="Pendientes" value={`${data.ventasPendientes}`} subtitle={`${data.ventasAnuladas} anuladas`} icon={<FiAlertTriangle className="w-6 h-6" />} color="rose" isDark={isDark} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Ingresos Mensuales" subtitle="Evolución de ventas" isDark={isDark} headerAction={null} noPadding={false}>
          <div className="lg:col-span-2">
            {data.ventasPorMes.some(m => m.ingresos > 0) ? (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ventasPorMes} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#262626' : '#f3f4f6'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={`h-[240px] flex items-center justify-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin datos</div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Top Vendedores" subtitle="Mejores resultados" isDark={isDark}>
          {data.ventasPorVendedor.length > 0 ? (
            <div className="space-y-4">
              {data.ventasPorVendedor.slice(0, 5).map((v, i) => (
                <div key={i} className={`pb-3 border-b last:border-0 ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{v.nombre}</span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{v.porcentaje}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(v.porcentaje, 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{v.ventas} ventas</span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{formatMoney(v.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`py-8 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin datos</div>
          )}
        </SectionCard>
      </div>

      {/* Tabla */}
      <SectionCard title="Detalle de Ventas" subtitle={`${data.detalleVentas.length} registros`} isDark={isDark} noPadding>
        {data.detalleVentas.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}>
                  <tr>
                    {['#', 'Fecha', 'Cliente', 'Vendedor', 'Subtotal', 'IGV', 'Total', 'Estado'].map(h => (
                      <th key={h} className={`py-3 px-4 text-left font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} ${h === 'Subtotal' || h === 'IGV' || h === 'Total' ? 'text-right' : ''} ${h === 'Estado' ? 'text-center' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                  {paginatedData.map(v => (
                    <tr key={v.id} className={`transition-colors ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'}`}>
                      <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{v.id}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatFecha(v.fecha)}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{v.cliente}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{v.vendedor}</td>
                      <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatMoney(v.subtotal)}</td>
                      <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatMoney(v.igv)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{formatMoney(v.total)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getEstadoBadge(v.estado, isDark)}`}>
                          {v.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} totalItems={data.detalleVentas.length} onPageChange={setPage} isDark={isDark} />
          </>
        ) : (
          <div className={`py-16 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin ventas registradas</div>
        )}
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB COMPRAS
   ═══════════════════════════════════════════════════════════════════════════ */
function TabCompras({ data, isDark }: { data: ReporteCompras; isDark: boolean }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.detalleCompras.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return data.detalleCompras.slice(start, start + ITEMS_PER_PAGE);
  }, [data.detalleCompras, page]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Gasto Total" value={formatMoney(data.gastoTotal)} subtitle={`${data.comprasCompletadas} completadas`} icon={<FiTruck className="w-6 h-6" />} color="green" isDark={isDark} />
        <KPICard title="IGV Total" value={formatMoney(data.igvTotal)} subtitle="En compras" icon={<FiDollarSign className="w-6 h-6" />} color="blue" isDark={isDark} />
        <KPICard title="Compra Promedio" value={formatMoney(data.compraPromedio)} subtitle="Por compra" icon={<FiShoppingCart className="w-6 h-6" />} color="amber" isDark={isDark} />
        <KPICard title="Pendientes" value={`${data.comprasPendientes}`} subtitle={`${data.comprasAnuladas} anuladas`} icon={<FiAlertTriangle className="w-6 h-6" />} color="rose" isDark={isDark} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Gastos Mensuales" subtitle="Tendencia de compras" isDark={isDark} headerAction={null} noPadding={false}>
          <div className="lg:col-span-2">
            {data.comprasPorMes.some(m => m.gastos > 0) ? (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.comprasPorMes} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#262626' : '#f3f4f6'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="gastos" name="Gastos" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={`h-[240px] flex items-center justify-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin datos</div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Top Proveedores" subtitle="Mayores compras" isDark={isDark}>
          {data.comprasPorProveedor.length > 0 ? (
            <div className="space-y-4">
              {data.comprasPorProveedor.slice(0, 5).map((p, i) => (
                <div key={i} className={`pb-3 border-b last:border-0 ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{p.nombre}</span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{p.porcentaje}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.min(p.porcentaje, 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{p.compras} compras</span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{formatMoney(p.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`py-8 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin datos</div>
          )}
        </SectionCard>
      </div>

      {/* Tabla */}
      <SectionCard title="Detalle de Compras" subtitle={`${data.detalleCompras.length} registros`} isDark={isDark} noPadding>
        {data.detalleCompras.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}>
                  <tr>
                    {['#', 'Fecha', 'Proveedor', 'Subtotal', 'IGV', 'Total', 'Estado'].map(h => (
                      <th key={h} className={`py-3 px-4 text-left font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} ${h === 'Subtotal' || h === 'IGV' || h === 'Total' ? 'text-right' : ''} ${h === 'Estado' ? 'text-center' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                  {paginatedData.map(c => (
                    <tr key={c.id} className={`transition-colors ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'}`}>
                      <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{c.id}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatFecha(c.fecha)}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{c.proveedor}</td>
                      <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatMoney(c.subtotal)}</td>
                      <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatMoney(c.igv)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{formatMoney(c.total)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getEstadoBadge(c.estado, isDark)}`}>
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} totalItems={data.detalleCompras.length} onPageChange={setPage} isDark={isDark} />
          </>
        ) : (
          <div className={`py-16 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin compras registradas</div>
        )}
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB INVENTARIO
   ═══════════════════════════════════════════════════════════════════════════ */
function TabInventario({ data, isDark }: { data: ReporteInventario; isDark: boolean }) {
  const [pageStock, setPageStock] = useState(1);
  const [pageTop, setPageTop] = useState(1);

  const totalPagesStock = Math.ceil(data.productosStockBajo.length / ITEMS_PER_PAGE);
  const totalPagesTop = Math.ceil(data.productosTopValor.length / ITEMS_PER_PAGE);

  const paginatedStock = useMemo(() => {
    const start = (pageStock - 1) * ITEMS_PER_PAGE;
    return data.productosStockBajo.slice(start, start + ITEMS_PER_PAGE);
  }, [data.productosStockBajo, pageStock]);

  const paginatedTop = useMemo(() => {
    const start = (pageTop - 1) * ITEMS_PER_PAGE;
    return data.productosTopValor.slice(start, start + ITEMS_PER_PAGE);
  }, [data.productosTopValor, pageTop]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Valor Inventario" value={formatMoney(data.valorInventario)} subtitle={`${data.productosActivos} activos`} icon={<FiBox className="w-6 h-6" />} color="amber" isDark={isDark} />
        <KPICard title="Productos Activos" value={data.productosActivos.toString()} subtitle={`${data.productosInactivos} inactivos`} icon={<FiPackage className="w-6 h-6" />} color="blue" isDark={isDark} />
        <KPICard title="Stock Bajo" value={data.productosBajoStock.toString()} subtitle="Bajo mínimo" icon={<FiAlertTriangle className="w-6 h-6" />} color="rose" isDark={isDark} />
        <KPICard title="Total Productos" value={data.totalProductos.toString()} subtitle="En sistema" icon={<FiUsers className="w-6 h-6" />} color="green" isDark={isDark} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Distribución por Categoría" subtitle="Productos por categoría" isDark={isDark}>
          {data.productosPorCategoria.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-[160px] h-[160px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.productosPorCategoria} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="cantidad" stroke="none">
                      {data.productosPorCategoria.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {data.productosPorCategoria.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{cat.name}</span>
                    </div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{cat.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`py-12 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin datos</div>
          )}
        </SectionCard>

        <SectionCard title="Productos por Almacén" subtitle="Distribución de stock" isDark={isDark}>
          {data.productosPorAlmacen.length > 0 ? (
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.productosPorAlmacen} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#262626' : '#f3f4f6'} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }} />
                  <YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cantidad" name="Productos" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`py-12 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin datos</div>
          )}
        </SectionCard>
      </div>

      {/* Stock Bajo */}
      {data.productosStockBajo.length > 0 && (
        <SectionCard
          title="Productos con Stock Bajo"
          subtitle={`${data.productosStockBajo.length} productos bajo mínimo`}
          isDark={isDark}
          noPadding
          headerAction={<FiAlertTriangle className="text-amber-500" size={18} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}>
                <tr>
                  {['Producto', 'Stock', 'Mínimo', 'Almacén', 'Categoría'].map(h => (
                    <th key={h} className={`py-3 px-4 text-left font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} ${h === 'Stock' || h === 'Mínimo' ? 'text-center' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                {paginatedStock.map((p, i) => (
                  <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{p.nombre}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${p.stock === 0 ? 'text-rose-500' : 'text-amber-500'}`}>{p.stock}</span>
                    </td>
                    <td className={`py-3 px-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{p.minimo}</td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{p.almacen}</td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{p.categoria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={pageStock} totalPages={totalPagesStock} totalItems={data.productosStockBajo.length} onPageChange={setPageStock} isDark={isDark} />
        </SectionCard>
      )}

      {/* Top Valor */}
      <SectionCard title="Top Productos por Valor" subtitle={`${data.productosTopValor.length} productos`} isDark={isDark} noPadding>
        {data.productosTopValor.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}>
                  <tr>
                    {['#', 'Producto', 'Precio', 'Stock', 'Valor Total'].map(h => (
                      <th key={h} className={`py-3 px-4 text-left font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} ${h === 'Precio' || h === 'Valor Total' ? 'text-right' : ''} ${h === 'Stock' ? 'text-center' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                  {paginatedTop.map((p, i) => (
                    <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'}`}>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{(pageTop - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{p.nombre}</td>
                      <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatMoney(p.precioVenta)}</td>
                      <td className={`py-3 px-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{p.stock}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{formatMoney(p.valorTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={pageTop} totalPages={totalPagesTop} totalItems={data.productosTopValor.length} onPageChange={setPageTop} isDark={isDark} />
          </>
        ) : (
          <div className={`py-16 text-center text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sin productos</div>
        )}
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Reportes() {
  const { isDark } = useThemeClasses();
  const [tab, setTab] = useState<TabType>('ventas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ventas, setVentas] = useState<ReporteVentas | null>(null);
  const [compras, setCompras] = useState<ReporteCompras | null>(null);
  const [inventario, setInventario] = useState<ReporteInventario | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'ventas') {
        const d = await reportesService.getReporteVentas();
        setVentas(d);
      } else if (tab === 'compras') {
        const d = await reportesService.getReporteCompras();
        setCompras(d);
      } else {
        const d = await reportesService.getReporteInventario();
        setInventario(d);
      }
    } catch (err) {
      console.error('Error cargando reporte:', err);
      setError('No se pudo cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const tabs = [
    { id: 'ventas', label: 'Ventas', icon: <FiShoppingCart size={18} /> },
    { id: 'compras', label: 'Compras', icon: <FiTruck size={18} /> },
    { id: 'inventario', label: 'Inventario', icon: <FiBox size={18} /> },
  ];

  return (
    <PageWrapper
      title="Reportes y Análisis"
      subtitle="Análisis detallado de ventas, compras e inventario — Peru Market"
      icon={<FiBarChart2 />}
      onRefresh={loadData}
      refreshing={loading}
      actions={[
        { label: 'Exportar', icon: <FiDownload />, variant: 'secondary' },
      ]}
    >
      <div className="space-y-6">

        {/* ═══ TABS ═══ */}
        <div className={`
          flex flex-wrap items-center gap-1 p-1.5 rounded-xl border
          ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
        `}>
          {tabs.map(t => (
            <TabButton
              key={t.id}
              label={t.label}
              icon={t.icon}
              isActive={tab === t.id}
              onClick={() => setTab(t.id as TabType)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* ═══ CONTENT ═══ */}
        {loading ? (
          <LoadingSkeleton isDark={isDark} />
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className={`p-8 rounded-xl border text-center max-w-md ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
                <FiAlertCircle className="text-rose-500" size={32} />
              </div>
              <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Error de conexión</h2>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{error}</p>
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all bg-[#E0312A] hover:bg-[#A91E16]"
              >
                <FiRefreshCw size={16} />
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <>
            {tab === 'ventas' && ventas && <TabVentas data={ventas} isDark={isDark} />}
            {tab === 'compras' && compras && <TabCompras data={compras} isDark={isDark} />}
            {tab === 'inventario' && inventario && <TabInventario data={inventario} isDark={isDark} />}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
