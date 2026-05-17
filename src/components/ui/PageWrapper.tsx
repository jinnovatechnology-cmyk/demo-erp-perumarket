/**
 * PageWrapper.tsx - Contenedor unificado para todas las vistas del ERP
 * Garantiza consistencia en tamaño, tipografía, padding y estructura
 */

import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { PageHeader } from './PageHeader';

/* ═══════════════════════════════════════════════════════════════════════════
   TIPOS Y CONFIGURACIÓN
   ═══════════════════════════════════════════════════════════════════════════ */

// Configuración estándar de tipografía
export const TYPOGRAPHY = {
  // Títulos de página
  pageTitle: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
  // Subtítulos de página
  pageSubtitle: 'text-sm leading-relaxed',
  // Títulos de sección/cards
  sectionTitle: 'text-lg font-bold',
  // Títulos de cards pequeños
  cardTitle: 'text-base font-semibold',
  // Texto normal
  body: 'text-sm',
  // Texto pequeño
  small: 'text-xs',
  // Labels
  label: 'text-xs font-semibold uppercase tracking-wider',
} as const;

// Configuración estándar de espaciado
export const SPACING = {
  // Padding del contenedor principal
  pagePadding: 'p-4 sm:p-6 lg:p-8',
  // Max width del contenido
  maxWidth: 'max-w-[1400px]',
  // Gaps estándar
  gapSm: 'gap-2 sm:gap-3',
  gapMd: 'gap-3 sm:gap-4',
  gapLg: 'gap-4 sm:gap-6',
  // Margin bottom para secciones
  sectionMargin: 'mb-6 sm:mb-8',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   ACTION BUTTON TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface ActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  hideOnMobile?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE WRAPPER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

interface PageWrapperProps {
  children: React.ReactNode;
  // Header props
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  actions?: ActionButton[];
  onRefresh?: () => void;
  refreshing?: boolean;
  showHeaderBorder?: boolean;
  // Layout options
  fullWidth?: boolean;
  noPadding?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions = [],
  onRefresh,
  refreshing = false,
  showHeaderBorder = true,
  fullWidth = false,
  noPadding = false,
}) => {
  const { pageBg } = useThemeClasses();

  return (
    <div className={`min-h-screen ${pageBg} font-sans`}>
      <div className={`
        ${fullWidth ? '' : `${SPACING.maxWidth} mx-auto`}
        ${noPadding ? '' : SPACING.pagePadding}
      `}>
        {/* Header unificado */}
        <PageHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          actions={actions}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showBorder={showHeaderBorder}
        />

        {/* Contenido de la página */}
        {children}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE SECTION - Sección con título opcional
   ═══════════════════════════════════════════════════════════════════════════ */

interface PageSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
}) => {
  const { heading, textTertiary } = useThemeClasses();

  return (
    <section className={`${SPACING.sectionMargin} ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          {title && (
            <div>
              <h2 className={`${TYPOGRAPHY.sectionTitle} ${heading}`}>{title}</h2>
              {subtitle && (
                <p className={`${TYPOGRAPHY.small} ${textTertiary} mt-1`}>{subtitle}</p>
              )}
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   STATS GRID - Grid de estadísticas/KPIs
   ═══════════════════════════════════════════════════════════════════════════ */

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ children, columns = 4 }) => {
  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colsClass[columns]} ${SPACING.gapMd} ${SPACING.sectionMargin}`}>
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD - Card de estadística individual
   ═══════════════════════════════════════════════════════════════════════════ */

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
  trend?: { value: number; label: string };
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accent = false,
  trend,
  loading = false,
}) => {
  const { cardHover, heading, textMuted } = useThemeClasses();

  return (
    <div
      className={`group p-5 rounded-2xl border transition-all duration-200 ${
        accent
          ? 'bg-gradient-to-br from-[#E0312A] to-[#7F1512] text-white border-transparent shadow-lg hover:shadow-xl'
          : `${cardHover} hover:-translate-y-0.5`
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`${TYPOGRAPHY.label} ${accent ? 'text-white/70' : textMuted}`}>
          {label}
        </p>
        <div className={`p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-105 [&>svg]:w-5 [&>svg]:h-5 ${
          accent ? 'bg-white/15 text-white' : 'bg-[#E0312A]/10 text-[#E0312A]'
        }`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${accent ? 'text-white' : heading}`}>
        {loading ? '—' : value}
      </p>
      {trend && (
        <p className={`${TYPOGRAPHY.small} mt-2 ${accent ? 'text-white/60' : textMuted}`}>
          <span className={trend.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          {' '}{trend.label}
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENT CARD - Card para contenido general
   ═══════════════════════════════════════════════════════════════════════════ */

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  noPadding = false,
  className = '',
}) => {
  const { card, shadow, heading, textTertiary, borderLight } = useThemeClasses();

  return (
    <div className={`rounded-2xl border overflow-hidden ${shadow} ${card} ${className}`}>
      {(title || actions) && (
        <div className={`px-4 sm:px-6 py-4 border-b ${borderLight} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg text-white bg-gradient-to-br from-[#E0312A] to-[#A91E16] [&>svg]:w-4 [&>svg]:h-4">
                {icon}
              </div>
            )}
            <div>
              <h3 className={`${TYPOGRAPHY.cardTitle} ${heading}`}>{title}</h3>
              {subtitle && (
                <p className={`${TYPOGRAPHY.small} ${textTertiary}`}>{subtitle}</p>
              )}
            </div>
          </div>
          {actions}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 sm:p-6'}>
        {children}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TAB NAVIGATION - Navegación por pestañas unificada
   ═══════════════════════════════════════════════════════════════════════════ */

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onChange }) => {
  const { isDark, card } = useThemeClasses();

  return (
    <div className={`flex gap-1 p-1.5 rounded-xl ${card} border ${SPACING.sectionMargin} overflow-x-auto`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${TYPOGRAPHY.body} font-semibold transition-all duration-200 whitespace-nowrap [&>svg]:w-4 [&>svg]:h-4 ${
              isActive
                ? 'bg-gradient-to-r from-[#E0312A] to-[#A91E16] text-white shadow-md'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full ${TYPOGRAPHY.small} font-medium ${
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
};

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH BAR - Barra de búsqueda unificada
   ═══════════════════════════════════════════════════════════════════════════ */

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  filters,
  actions,
}) => {
  const { input, textMuted, btnGhost } = useThemeClasses();

  return (
    <div className={`flex flex-col lg:flex-row ${SPACING.gapMd} ${SPACING.sectionMargin}`}>
      <div className="flex-1 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${textMuted}`} />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pl-10 pr-10 py-2.5 border rounded-xl ${TYPOGRAPHY.body} transition-all focus:ring-2 ${input}`}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${btnGhost}`}
            >
              <FiX size={14} />
            </button>
          )}
        </div>
        {filters}
      </div>
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE - Estado vacío unificado
   ═══════════════════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const { isDark, heading, textTertiary } = useThemeClasses();

  return (
    <div className="text-center py-12 sm:py-16">
      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} [&>svg]:w-8 [&>svg]:h-8`}>
        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{icon}</span>
      </div>
      <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2 ${heading}`}>{title}</h3>
      {description && (
        <p className={`${TYPOGRAPHY.body} max-w-sm mx-auto mb-4 ${textTertiary}`}>{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg bg-gradient-to-br from-[#E0312A] to-[#A91E16] transition-all hover:scale-[1.02] active:scale-95"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING STATE - Estado de carga unificado
   ═══════════════════════════════════════════════════════════════════════════ */

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message, rows = 5 }) => {
  const { isDark, textTertiary } = useThemeClasses();
  const pulseClass = isDark ? 'bg-gray-700' : 'bg-gray-200';

  if (message) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#E0312A] rounded-full animate-spin mx-auto mb-3" />
          <p className={`${TYPOGRAPHY.body} ${textTertiary}`}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-12 rounded-xl animate-pulse ${pulseClass}`}
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  );
};

export default PageWrapper;
