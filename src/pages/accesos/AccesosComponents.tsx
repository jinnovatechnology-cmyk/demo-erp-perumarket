/**
 * AccesosComponents.tsx - Componentes compartidos del módulo de accesos
 * Diseño profesional sin líneas divisoras prominentes
 */

import React from 'react';
import { FiSearch, FiDownload, FiPlus, FiX, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';

// Colores del logo
const COLORS = {
  primary: '#E0312A',
  primaryDark: '#A91E16',
};

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH AND FILTERS - Barra de búsqueda y filtros mejorada
   ═══════════════════════════════════════════════════════════════════════════ */

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: React.ReactNode;
  onFilterChange?: (value: string) => void;
  onAddNew: () => void;
  addButtonText: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  showExport?: boolean;
  onExport?: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filterOptions,
  onFilterChange,
  onAddNew,
  addButtonText,
  onRefresh,
  refreshing = false,
  showExport = true,
  onExport,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div className={`
      p-5 rounded-2xl mb-6 transition-all
      ${isDark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-100'}
    `}
    style={{ boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <FiSearch className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`
              w-full pl-11 pr-10 py-3 rounded-xl border text-sm transition-all
              focus:ring-2 focus:ring-offset-0 outline-none
              ${isDark
                ? 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:ring-green-500/20 focus:border-green-500'
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-green-500/20 focus:border-green-500'
              }
            `}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors
                ${isDark ? 'hover:bg-gray-600 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}
              `}
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {filterOptions && (
          <div className="flex items-center gap-2">
            <FiFilter size={14} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            <select
              onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
              className={`
                px-4 py-3 rounded-xl border text-sm cursor-pointer transition-all
                ${isDark
                  ? 'bg-gray-700/50 border-gray-600 text-gray-200'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
                }
              `}
            >
              {filterOptions}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className={`
                p-3 rounded-xl border text-sm font-medium transition-all
                ${isDark
                  ? 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }
                ${refreshing ? 'opacity-60' : ''}
              `}
              title="Actualizar datos"
            >
              <FiRefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          )}
          {showExport && (
            <button
              onClick={onExport}
              className={`
                p-3 rounded-xl border text-sm font-medium transition-all
                ${isDark
                  ? 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }
              `}
              title="Exportar datos"
            >
              <FiDownload size={18} />
            </button>
          )}
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              boxShadow: `0 4px 16px ${COLORS.primary}40`
            }}
          >
            <FiPlus size={18} />
            <span className="hidden sm:inline">{addButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   RESULTS BAR - Barra de resultados mejorada
   ═══════════════════════════════════════════════════════════════════════════ */

interface ResultsBarProps {
  showing: number;
  total: number;
  onClearFilters?: () => void;
  hasFilters?: boolean;
}

export const ResultsBar: React.FC<ResultsBarProps> = ({
  showing,
  total,
  onClearFilters,
  hasFilters = false,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div className={`
      px-5 py-3 text-xs font-medium flex items-center justify-between
      ${isDark ? 'text-gray-400 bg-gray-800/50' : 'text-gray-600 bg-gray-50/80'}
    `}>
      <span>
        {hasFilters ? (
          <>Mostrando <span style={{ color: COLORS.primary }} className="font-bold">{showing}</span> de {total} registros</>
        ) : (
          <>{total} registros en total</>
        )}
      </span>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className={`flex items-center gap-1 text-xs font-medium transition-colors hover:text-rose-500`}
        >
          <FiX size={12} />
          Limpiar filtros
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE CONTAINER - Contenedor de tabla sin líneas divisoras prominentes
   ═══════════════════════════════════════════════════════════════════════════ */

interface TableContainerProps {
  children: React.ReactNode;
}

export const TableContainer: React.FC<TableContainerProps> = ({ children }) => {
  const { isDark } = useThemeClasses();

  return (
    <div className={`
      rounded-2xl overflow-hidden transition-all
      ${isDark ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-100'}
    `}
    style={{ boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ACTION BUTTONS GROUP - Grupo de botones de acción mejorado
   ═══════════════════════════════════════════════════════════════════════════ */

interface ActionButton {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface ActionButtonsGroupProps {
  actions: ActionButton[];
  showOnHover?: boolean;
}

export const ActionButtonsGroup: React.FC<ActionButtonsGroupProps> = ({
  actions,
  showOnHover = false,
}) => {
  const { isDark } = useThemeClasses();

  const variantStyles: Record<string, { bg: string; hover: string }> = {
    primary: {
      bg: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600',
      hover: 'hover:bg-blue-500 hover:text-white'
    },
    success: {
      bg: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      hover: 'hover:bg-emerald-500 hover:text-white'
    },
    warning: {
      bg: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
      hover: 'hover:bg-amber-500 hover:text-white'
    },
    danger: {
      bg: isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600',
      hover: 'hover:bg-rose-500 hover:text-white'
    },
    info: {
      bg: isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600',
      hover: 'hover:bg-purple-500 hover:text-white'
    },
  };

  return (
    <div className={`flex justify-end gap-2 ${showOnHover ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
      {actions.map(({ icon, onClick, title, variant = 'primary' }) => {
        const styles = variantStyles[variant];
        return (
          <button
            key={title}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClick();
            }}
            title={title}
            className={`
              p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg
              ${styles.bg} ${styles.hover}
            `}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR BADGE - Avatar con iniciales
   ═══════════════════════════════════════════════════════════════════════════ */

interface AvatarBadgeProps {
  name: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({ name, icon, size = 'md' }) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`${sizeStyles[size]} rounded-2xl flex items-center justify-center text-white font-bold shadow-md`}
      style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}
    >
      {icon || (name ? name[0].toUpperCase() : '?')}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS PILL - Pill de estado mejorado
   ═══════════════════════════════════════════════════════════════════════════ */

interface StatusPillProps {
  status: 'ACTIVO' | 'INACTIVO' | string;
  customColors?: { light: string; dark: string };
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, customColors }) => {
  const { isDark } = useThemeClasses();

  const defaultColors: Record<string, { light: string; dark: string }> = {
    ACTIVO: {
      light: 'bg-emerald-100 text-emerald-700',
      dark: 'bg-emerald-500/20 text-emerald-400',
    },
    INACTIVO: {
      light: 'bg-rose-100 text-rose-700',
      dark: 'bg-rose-500/20 text-rose-400',
    },
  };

  const colors = customColors || defaultColors[status] || defaultColors.ACTIVO;
  const colorClass = isDark ? colors.dark : colors.light;

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {status}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE BADGE - Badge de rol mejorado
   ═══════════════════════════════════════════════════════════════════════════ */

interface RoleBadgeProps {
  roleName: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ roleName }) => {
  const roleColors: Record<string, string> = {
    'Administrador': 'from-blue-500 to-blue-600',
    'Vendedor': 'from-emerald-500 to-emerald-600',
    'Almacenero': 'from-amber-500 to-amber-600',
    'Almacén': 'from-orange-500 to-orange-600',
  };

  const gradient = roleColors[roleName] || 'from-gray-500 to-gray-600';

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r ${gradient}`}>
      {roleName}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   STAT BADGE - Badge con estadística
   ═══════════════════════════════════════════════════════════════════════════ */

interface StatBadgeProps {
  icon: React.ReactNode;
  value: number | string;
  label?: string;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple';
}

export const StatBadge: React.FC<StatBadgeProps> = ({ icon, value, label, variant = 'blue' }) => {
  const { isDark } = useThemeClasses();

  const variants: Record<string, { light: string; dark: string }> = {
    blue: {
      light: 'bg-blue-50 text-blue-600',
      dark: 'bg-blue-500/15 text-blue-400',
    },
    emerald: {
      light: 'bg-emerald-50 text-emerald-600',
      dark: 'bg-emerald-500/15 text-emerald-400',
    },
    amber: {
      light: 'bg-amber-50 text-amber-600',
      dark: 'bg-amber-500/15 text-amber-400',
    },
    purple: {
      light: 'bg-purple-50 text-purple-600',
      dark: 'bg-purple-500/15 text-purple-400',
    },
  };

  const v = variants[variant];
  const colorClass = isDark ? v.dark : v.light;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colorClass}`}>
      <span>{icon}</span>
      <span className="font-bold text-sm">
        {value}{label && ` ${label}`}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY TABLE STATE - Estado vacío para tablas
   ═══════════════════════════════════════════════════════════════════════════ */

interface EmptyTableStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const EmptyTableState: React.FC<EmptyTableStateProps> = ({ icon, title, description }) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="text-center py-16 px-4">
      <div className={`
        w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4
        ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}
      `}>
        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{icon}</span>
      </div>
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        {title}
      </h3>
      <p className={`max-w-sm mx-auto text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        {description}
      </p>
    </div>
  );
};
