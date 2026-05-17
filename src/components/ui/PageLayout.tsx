/**
 * ============================================================================
 * ESTRUCTURA ESTÁNDAR DE PÁGINA - PERU MARKET ERP
 * ============================================================================
 *
 * Este archivo define los componentes base que TODOS los módulos deben usar
 * para mantener consistencia en el diseño y UX.
 *
 * COMPONENTES INCLUIDOS:
 * - PageHeader: Encabezado de página con título, descripción y acciones
 * - PageContent: Contenedor principal de contenido
 * - FilterBar: Barra de filtros con búsqueda y filtros adicionales
 * - DataCard: Tarjeta para KPIs o estadísticas
 * - DataTable: Tabla de datos con soporte para responsive
 * - EmptyState: Estado vacío cuando no hay datos
 * - TabNavigation: Navegación por tabs
 *
 * USO:
 * import { PageHeader, FilterBar, DataTable } from '@/components/ui/PageLayout';
 */

import React from 'react';
import {
  FiSearch, FiPlus, FiDownload, FiRefreshCw, FiX, FiFilter,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE HEADER - Encabezado estándar para todas las páginas
   ═══════════════════════════════════════════════════════════════════════════ */

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  badge?: { label: string; value: number | string };
}

export function PageHeader({ icon, title, description, actions, badge }: PageHeaderProps) {
  const { colors, card, heading, textTertiary, shadow } = useThemeClasses();

  return (
    <div className={`rounded-2xl ${shadow} border p-5 mb-6 ${card}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${colors[500]}, ${colors[700] || colors[600]})` }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-bold tracking-tight leading-none ${heading}`}>
                {title}
              </h1>
              {badge && (
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: colors[500] }}
                >
                  {badge.value} {badge.label}
                </span>
              )}
            </div>
            <p className={`text-sm mt-1.5 ${textTertiary}`}>{description}</p>
          </div>
        </div>
        {actions && (
          <div className="flex gap-2.5 w-full md:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB NAVIGATION - Navegación por pestañas
   ═══════════════════════════════════════════════════════════════════════════ */

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  const { isDark, colors, card } = useThemeClasses();

  return (
    <div className={`flex gap-2 p-2 rounded-2xl ${card} mb-6`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              isActive
                ? 'text-white shadow-lg'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            style={isActive ? { background: `linear-gradient(135deg, ${colors[500]}, ${colors[600]})` } : {}}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isActive
                  ? 'bg-white/20'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTER BAR - Barra de filtros estándar
   ═══════════════════════════════════════════════════════════════════════════ */

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  onAddNew?: () => void;
  addNewLabel?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  showExport?: boolean;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  onAddNew,
  addNewLabel = 'Nuevo',
  onRefresh,
  refreshing = false,
  onExport,
  showExport = false,
}: FilterBarProps) {
  const { input, btnSecondary, btnGhost, textMuted } = useThemeClasses();

  return (
    <div className="flex flex-col lg:flex-row gap-3 mb-6">
      {/* Search + Filters */}
      <div className="flex-1 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${textMuted}`} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 ${input}`}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${btnGhost}`}
            >
              <FiX size={14} />
            </button>
          )}
        </div>
        {filters && (
          <div className="flex items-center gap-2">
            <FiFilter size={14} className={textMuted} />
            {filters}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${btnSecondary} ${refreshing ? 'opacity-60' : ''}`}
            title="Actualizar datos"
          >
            <FiRefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        )}
        {showExport && onExport && (
          <button
            onClick={onExport}
            className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${btnSecondary}`}
            title="Exportar datos"
          >
            <FiDownload size={18} />
          </button>
        )}
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <FiPlus size={18} />
            <span className="hidden sm:inline">{addNewLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   KPI CARD - Tarjeta para estadísticas
   ═══════════════════════════════════════════════════════════════════════════ */

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
  trend?: { value: number; label: string };
}

export function KPICard({ label, value, icon, accent = false, trend }: KPICardProps) {
  const { isDark, colors, cardHover, heading, textMuted } = useThemeClasses();

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 ${
        accent
          ? 'text-white border-transparent shadow-lg hover:shadow-xl'
          : cardHover
      }`}
      style={accent ? { background: `linear-gradient(135deg, ${colors[500]}, ${colors[700] || colors[600]})` } : {}}
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${accent ? 'text-white/70' : textMuted}`}>
          {label}
        </p>
        <div className={`p-2 rounded-xl ${accent ? 'bg-white/15' : isDark ? 'bg-gray-700/60' : 'bg-gray-50'}`}>
          <span style={!accent ? { color: colors[500] } : {}}>{icon}</span>
        </div>
      </div>
      <p className={`text-2xl font-extrabold tracking-tight ${accent ? '' : heading}`}>{value}</p>
      {trend && (
        <p className={`text-xs mt-2 ${accent ? 'text-white/60' : textMuted}`}>
          <span className={trend.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          {' '}{trend.label}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   KPI GRID - Grid de KPIs
   ═══════════════════════════════════════════════════════════════════════════ */

interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function KPIGrid({ children, columns = 4 }: KPIGridProps) {
  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colsClass[columns]} gap-4 mb-6`}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATA TABLE WRAPPER - Contenedor de tabla con estilos
   ═══════════════════════════════════════════════════════════════════════════ */

interface DataTableWrapperProps {
  children: React.ReactNode;
  resultsCount?: { showing: number; total: number };
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
  };
}

export function DataTableWrapper({ children, resultsCount, pagination }: DataTableWrapperProps) {
  const { card, shadow, border, borderLight, textMuted, colors, btnGhost } = useThemeClasses();

  return (
    <div className={`rounded-2xl border overflow-hidden ${shadow} ${card}`}>
      {/* Results count bar */}
      {resultsCount && (
        <div className={`px-5 py-2 text-xs font-medium ${textMuted} border-b ${borderLight} flex items-center justify-between`}>
          <span>
            Mostrando <span style={{ color: colors[500] }} className="font-bold">{resultsCount.showing}</span> de {resultsCount.total}
          </span>
          {pagination && pagination.totalPages > 1 && (
            <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
          )}
        </div>
      )}

      {/* Table content */}
      {children}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className={`px-5 py-3 border-t ${border} flex items-center justify-between`}>
          <p className={`text-xs ${textMuted} hidden sm:block`}>
            {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}–
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de {pagination.totalItems}
          </p>
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className={`p-2 rounded-lg text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnGhost}`}
            >
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.currentPage) <= 1)
              .reduce<(number | 'dots')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('dots');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === 'dots' ? (
                  <span key={`d${i}`} className={`px-1 text-xs ${textMuted}`}>...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => pagination.onPageChange(item as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      pagination.currentPage === item ? 'text-white shadow-sm' : btnGhost
                    }`}
                    style={pagination.currentPage === item ? { backgroundColor: colors[500] } : {}}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`p-2 rounded-lg text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${btnGhost}`}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE - Estado vacío
   ═══════════════════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { subtleBg, textSecondary, textMuted, btnSecondary } = useThemeClasses();

  return (
    <div className="px-6 py-16 text-center">
      <div className={`inline-flex p-5 rounded-2xl mb-4 ${subtleBg}`}>
        <span className="opacity-40">{icon}</span>
      </div>
      <p className={`font-semibold text-base mb-1 ${textSecondary}`}>{title}</p>
      <p className={`text-sm mb-4 ${textMuted}`}>{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${btnSecondary}`}
        >
          <FiX size={14} />
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACTION BUTTONS - Botones de acción para tablas
   ═══════════════════════════════════════════════════════════════════════════ */

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function ActionButton({ icon, onClick, title, variant = 'default' }: ActionButtonProps) {
  const { isDark, btnGhost } = useThemeClasses();

  const variantStyles = {
    default: btnGhost,
    primary: isDark ? `text-gray-400 hover:text-white hover:bg-blue-600` : `text-gray-400 hover:text-white hover:bg-blue-500`,
    success: isDark ? `text-gray-400 hover:text-white hover:bg-emerald-600` : `text-gray-400 hover:text-white hover:bg-emerald-500`,
    warning: isDark ? `text-gray-400 hover:text-white hover:bg-amber-600` : `text-gray-400 hover:text-white hover:bg-amber-500`,
    danger: isDark ? `text-gray-400 hover:text-white hover:bg-rose-600` : `text-gray-400 hover:text-white hover:bg-rose-500`,
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${variantStyles[variant]}`}
    >
      {icon}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS BADGE - Badge de estado
   ═══════════════════════════════════════════════════════════════════════════ */

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error';
  label: string;
  icon?: React.ReactNode;
}

export function StatusBadge({ status, label, icon }: StatusBadgeProps) {
  const { isDark } = useThemeClasses();

  const styles = {
    active: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: isDark ? 'bg-rose-900/30 text-rose-400 border-rose-800/50' : 'bg-rose-50 text-rose-700 border-rose-200',
    pending: isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' : 'bg-amber-50 text-amber-700 border-amber-200',
    success: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' : 'bg-amber-50 text-amber-700 border-amber-200',
    error: isDark ? 'bg-rose-900/30 text-rose-400 border-rose-800/50' : 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[status]}`}>
      {icon}
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR - Avatar de usuario/entidad
   ═══════════════════════════════════════════════════════════════════════════ */

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Avatar({ name, size = 'md', icon }: AvatarProps) {
  const { colors } = useThemeClasses();

  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  return (
    <div
      className={`${sizeStyles[size]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${colors[500]}, ${colors[600]})` }}
    >
      {icon || (name ? name[0].toUpperCase() : '?')}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SKELETON - Esqueleto de carga
   ═══════════════════════════════════════════════════════════════════════════ */

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'table' | 'cards' | 'page';
}

export function LoadingSkeleton({ rows = 5, type = 'table' }: LoadingSkeletonProps) {
  const { isDark, pageBg, card, border } = useThemeClasses();
  const pulseClass = isDark ? 'bg-gray-700' : 'bg-gray-200';

  if (type === 'page') {
    return (
      <div className={`min-h-screen ${pageBg} p-4 md:p-8 font-sans`}>
        {/* Header skeleton */}
        <div className={`rounded-2xl border p-5 mb-6 ${card}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl animate-pulse ${pulseClass}`} />
              <div>
                <div className={`h-7 w-52 rounded-lg animate-pulse mb-2 ${pulseClass}`} />
                <div className={`h-3 w-72 rounded animate-pulse ${isDark ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className={`h-10 w-10 rounded-xl animate-pulse ${pulseClass}`} />
              <div className={`h-10 w-36 rounded-xl animate-pulse ${pulseClass}`} />
            </div>
          </div>
        </div>
        {/* KPI skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`p-5 rounded-2xl border ${card}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`h-3 w-20 rounded animate-pulse ${pulseClass}`} />
                <div className={`h-9 w-9 rounded-xl animate-pulse ${pulseClass}`} />
              </div>
              <div className={`h-8 w-28 rounded-lg animate-pulse ${pulseClass}`} />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className={`rounded-2xl border ${card} overflow-hidden`}>
          <div className={`p-5 border-b ${border} flex gap-3`}>
            <div className={`h-10 flex-1 md:max-w-sm rounded-xl animate-pulse ${isDark ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
            <div className={`h-10 w-36 rounded-xl animate-pulse ${isDark ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
          </div>
          <div className="p-5 space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className={`h-12 rounded-xl animate-pulse ${pulseClass}`} style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`h-12 rounded-xl animate-pulse ${pulseClass}`} style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR STATE - Estado de error
   ═══════════════════════════════════════════════════════════════════════════ */

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Error', message, onRetry }: ErrorStateProps) {
  const { isDark, pageBg, card, heading, textTertiary } = useThemeClasses();

  return (
    <div className={`min-h-screen ${pageBg} p-4 md:p-8 font-sans flex items-center justify-center`}>
      <div className={`rounded-2xl border p-8 max-w-md w-full text-center ${card}`}>
        <div className={`inline-flex p-4 rounded-2xl mb-5 ${isDark ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
          <FiX size={36} className={isDark ? 'text-rose-400' : 'text-rose-500'} />
        </div>
        <h2 className={`text-xl font-bold mb-2 ${heading}`}>{title}</h2>
        <p className={`text-sm mb-6 ${textTertiary}`}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl"
          >
            <FiRefreshCw size={16} />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
