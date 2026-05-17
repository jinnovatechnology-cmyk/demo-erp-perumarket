import React, { useEffect, useState } from 'react';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Line, ComposedChart
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiDownload, FiMoreVertical } from 'react-icons/fi';
import { useThemeClasses } from '../hooks/useThemeClasses';
import PageWrapper from '../components/ui/PageWrapper';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../services/dashboardService';

// Colores profesionales estilo Power BI
const COLORS = {
  primary: '#E0312A',
  primaryLight: '#F0726A',
  primaryDark: '#A91E16',
  secondary: '#1e3a5f',
  accent: '#0ea5e9',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  purple: '#8b5cf6',
  gray: '#64748b',
};

const PIE_COLORS = ['#E0312A', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];

function formatMoney(value: number): string {
  if (value >= 1000000) return 'S/ ' + (value / 1000000).toFixed(2) + 'M';
  if (value >= 1000) return 'S/ ' + (value / 1000).toFixed(1) + 'K';
  return 'S/ ' + value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCompact(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
}

function formatFecha(fecha: string): string {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

// Custom Tooltip estilo Power BI
const PowerBITooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171717] text-white p-3 rounded-lg shadow-2xl border border-gray-700 min-w-[150px]">
        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-sm text-gray-300">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {typeof entry.value === 'number' && entry.value > 100 ? formatMoney(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// KPI Card Component
const KPICard = ({
  title,
  value,
  trend,
  trendValue,
  icon,
  sparklineData,
  color = COLORS.primary,
  isDark
}: {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  color?: string;
  isDark: boolean;
}) => (
  <div className={`relative overflow-hidden rounded-xl p-5 ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
    {/* Header */}
    <div className="flex items-start justify-between mb-3">
      <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {title}
      </p>
      {icon && (
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      )}
    </div>

    {/* Value */}
    <div className="flex items-end gap-3">
      <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </h3>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up'
            ? 'bg-green-500/10 text-green-500'
            : trend === 'down'
            ? 'bg-red-500/10 text-red-500'
            : 'bg-gray-500/10 text-gray-500'
        }`}>
          {trend === 'up' ? <FiTrendingUp size={12} /> : trend === 'down' ? <FiTrendingDown size={12} /> : null}
          {trendValue}
        </div>
      )}
    </div>

    {/* Sparkline */}
    {sparklineData && sparklineData.length > 0 && (
      <div className="mt-3 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData.map((v, i) => ({ value: v, index: i }))}>
            <defs>
              <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#spark-${title})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

// Chart Card Wrapper
const ChartCard = ({
  title,
  subtitle,
  children,
  isDark,
  actions
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isDark: boolean;
  actions?: React.ReactNode;
}) => (
  <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
    {/* Header */}
    <div className={`px-5 py-4 flex items-center justify-between border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
      <div>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
          <FiMoreVertical size={16} />
        </button>
      </div>
    </div>
    {/* Content */}
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Data Table Component
const DataTable = ({
  data,
  columns,
  isDark
}: {
  data: any[];
  columns: { key: string; label: string; render?: (value: any, row: any) => React.ReactNode }[];
  isDark: boolean;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className={`border-b ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
          {columns.map((col) => (
            <th key={col.key} className={`text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={`border-b last:border-b-0 ${isDark ? 'border-neutral-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
            {columns.map((col) => (
              <td key={col.key} className={`py-3 px-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ value, max, color, isDark }: { value: number; max: number; color: string; isDark: boolean }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className={`min-h-screen p-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className={`h-8 w-48 rounded-lg animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        <div className={`h-10 w-32 rounded-lg animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
      </div>
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-32 rounded-xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 h-96 rounded-xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        <div className={`h-96 rounded-xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
export default function Dashboard() {
  const { isDark } = useThemeClasses();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('No se pudo cargar los datos del dashboard');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSkeleton isDark={isDark} />;
  }

  if (error || !stats) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>
        <div className={`text-center p-8 rounded-xl ${isDark ? 'bg-[#171717]' : 'bg-white shadow-lg'}`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error de conexión</h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#E0312A] text-white rounded-lg hover:bg-[#A91E16] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Calcular métricas adicionales
  const margenBruto = stats.ingresoVentas - stats.gastoCompras;
  const margenPorcentaje = stats.ingresoVentas > 0 ? ((margenBruto / stats.ingresoVentas) * 100).toFixed(1) : '0';

  // Sparkline data from ventas por dia
  const ventasSparkline = stats.ventasPorDia.map(d => d.ingresos);
  const ventasCountSparkline = stats.ventasPorDia.map(d => d.ventas);

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="Peru Market ERP • Resumen ejecutivo en tiempo real"
      icon={<FiTrendingUp />}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      actions={[
        { label: 'Últimos 30 días', icon: <FiCalendar />, variant: 'secondary' },
        { label: 'Exportar', icon: <FiDownload />, variant: 'secondary', hideOnMobile: true },
      ]}
    >
      <div className="space-y-6">

        {/* Alert: Stock bajo */}
        {stats.productosBajoStock > 0 && (
          <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                Alerta de inventario
              </p>
              <p className={`text-sm ${isDark ? 'text-amber-400/70' : 'text-amber-700'}`}>
                {stats.productosBajoStock} producto(s) con stock bajo. Revisa el inventario para reabastecer.
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Ingresos por Ventas"
            value={formatMoney(stats.ingresoVentas)}
            trend="up"
            trendValue="+12.5%"
            sparklineData={ventasSparkline}
            color={COLORS.primary}
            isDark={isDark}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <KPICard
            title="Gastos en Compras"
            value={formatMoney(stats.gastoCompras)}
            trend="down"
            trendValue="-3.2%"
            color={COLORS.secondary}
            isDark={isDark}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <KPICard
            title="Margen Bruto"
            value={formatMoney(margenBruto)}
            trend={margenBruto > 0 ? 'up' : 'down'}
            trendValue={`${margenPorcentaje}%`}
            color={COLORS.success}
            isDark={isDark}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <KPICard
            title="Transacciones"
            value={stats.ventasRecientes.length.toString()}
            sparklineData={ventasCountSparkline}
            color={COLORS.accent}
            isDark={isDark}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>

        {/* Row 2: Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.productosActivos}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Productos activos</p>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.clientesActivos}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Clientes activos</p>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.productosBajoStock}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Stock bajo</p>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.distribucionCategorias.length}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Categorías</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ventas vs Compras - Bar Chart */}
          <div className="lg:col-span-2">
            <ChartCard title="Ventas vs Compras" subtitle="Comparativa mensual del año actual" isDark={isDark}>
              <div className="h-[320px]">
                {stats.ventasPorMes.some(m => m.ventas > 0 || m.compras > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats.ventasPorMes} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#eee'} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: isDark ? '#888' : '#666' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: isDark ? '#888' : '#666' }}
                        tickFormatter={(v) => formatCompact(v)}
                      />
                      <Tooltip content={<PowerBITooltip />} />
                      <Bar dataKey="ventas" name="Ventas" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="compras" name="Compras" fill={isDark ? '#4a5568' : '#94a3b8'} radius={[4, 4, 0, 0]} barSize={24} />
                      <Line type="monotone" dataKey="ventas" stroke={COLORS.primaryLight} strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Sin datos disponibles</p>
                  </div>
                )}
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.primary }}></span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ventas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${isDark ? 'bg-gray-600' : 'bg-slate-400'}`}></span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Compras</span>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Pie Chart - Categorías */}
          <ChartCard title="Distribución por Categoría" subtitle={`${stats.productosActivos} productos activos`} isDark={isDark}>
            <div className="h-[200px] relative">
              {stats.distribucionCategorias.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.distribucionCategorias}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={2}
                    >
                      {stats.distribucionCategorias.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PowerBITooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Sin datos</p>
                </div>
              )}
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.productosActivos}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Total</p>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2 mt-4">
              {stats.distribucionCategorias.slice(0, 5).map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                    <span className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{cat.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{cat.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Row 4: Area Chart + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencia Semanal */}
          <ChartCard title="Tendencia de Ventas" subtitle="Últimos 7 días" isDark={isDark}>
            <div className="h-[250px]">
              {stats.ventasPorDia.some(d => d.ingresos > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.ventasPorDia}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#eee'} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: isDark ? '#888' : '#666' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: isDark ? '#888' : '#666' }}
                      tickFormatter={(v) => formatCompact(v)}
                    />
                    <Tooltip content={<PowerBITooltip />} />
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      name="Ingresos"
                      stroke={COLORS.primary}
                      fill="url(#colorGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Sin ventas esta semana</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Top Productos */}
          <ChartCard title="Top Productos Vendidos" subtitle="Por ingresos generados" isDark={isDark}>
            <div className="space-y-4">
              {stats.topProductos.length > 0 ? (
                stats.topProductos.map((prod, i) => {
                  const maxIngresos = Math.max(...stats.topProductos.map(p => p.ingresos));
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          >
                            {i + 1}
                          </span>
                          <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{prod.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatMoney(prod.ingresos)}
                          </span>
                          <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            ({prod.cantidad} uds)
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        value={prod.ingresos}
                        max={maxIngresos}
                        color={PIE_COLORS[i % PIE_COLORS.length]}
                        isDark={isDark}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Sin datos de productos</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Row 5: Recent Sales Table */}
        <ChartCard title="Ventas Recientes" subtitle="Últimas transacciones registradas" isDark={isDark}>
          {stats.ventasRecientes.length > 0 ? (
            <DataTable
              isDark={isDark}
              data={stats.ventasRecientes}
              columns={[
                {
                  key: 'cliente',
                  label: 'Cliente',
                  render: (value) => <span className="font-medium">{value}</span>
                },
                {
                  key: 'fecha',
                  label: 'Fecha',
                  render: (value) => formatFecha(value)
                },
                {
                  key: 'total',
                  label: 'Total',
                  render: (value) => <span className="font-semibold">{formatMoney(value)}</span>
                },
                {
                  key: 'estado',
                  label: 'Estado',
                  render: (value) => {
                    const colors: Record<string, string> = {
                      COMPLETADA: 'bg-green-500/10 text-green-500 border-green-500/30',
                      PENDIENTE: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                      ANULADA: 'bg-red-500/10 text-red-500 border-red-500/30',
                    };
                    return (
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${colors[value] || ''}`}>
                        {value}
                      </span>
                    );
                  }
                },
              ]}
            />
          ) : (
            <div className="py-8 text-center">
              <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Sin ventas registradas</p>
            </div>
          )}
        </ChartCard>

      </div>
    </PageWrapper>
  );
}
