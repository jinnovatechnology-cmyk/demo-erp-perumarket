/**
 * PageHeader.tsx - Componente de header unificado para todas las páginas
 * Diseño profesional, responsive y con soporte completo dark/light mode
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { FiRefreshCw } from 'react-icons/fi';

/* ═══════════════════════════════════════════════════════════════════════════
   TIPOS
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

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  actions?: ActionButton[];
  onRefresh?: () => void;
  refreshing?: boolean;
  children?: React.ReactNode;
  showBorder?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE HEADER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions = [],
  onRefresh,
  refreshing = false,
  children,
  showBorder = true,
}) => {
  const { isDark, heading, textTertiary, borderLight, btnSecondary } = useThemeClasses();

  return (
    <div className={`mb-6 sm:mb-8 ${showBorder ? `pb-6 border-b ${borderLight}` : ''}`}>
      {/* Header Row - Título y Botones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
        {/* Icono y Título */}
        <div className="flex items-center gap-3">
          {/* Icon Badge - Estilo Power BI */}
          <div className="p-2.5 rounded-xl flex-shrink-0 bg-[#E0312A]/10 text-[#E0312A] [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
            {icon}
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${heading}`}>
            {title}
          </h1>
        </div>

        {/* Botones de acción - Alineados con el título */}
        {(actions.length > 0 || onRefresh) && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            {/* Botón Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className={`
                  p-2.5 rounded-xl border text-sm font-medium transition-all
                  ${btnSecondary}
                  ${refreshing ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                `}
                title="Actualizar datos"
              >
                <FiRefreshCw
                  size={18}
                  className={refreshing ? 'animate-spin' : ''}
                />
              </button>
            )}

            {/* Action Buttons */}
            {actions.map((action, index) => (
              <ActionButtonComponent
                key={index}
                action={action}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>

      {/* Subtítulo - Debajo del header */}
      {subtitle && (
        <p className={`${textTertiary} text-sm leading-relaxed max-w-2xl`}>
          {subtitle}
        </p>
      )}

      {/* Contenido adicional (stats, filtros, etc) */}
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ACTION BUTTON COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

interface ActionButtonComponentProps {
  action: ActionButton;
  isDark: boolean;
}

const ActionButtonComponent: React.FC<ActionButtonComponentProps> = ({
  action,
  isDark,
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5
    text-sm font-semibold rounded-xl shadow-sm
    transition-all duration-200 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5
  `;

  const variantClasses = {
    primary: `
      text-white shadow-sm hover:shadow-md bg-[#E0312A] hover:bg-[#A91E16]
      transform hover:scale-[1.02] active:scale-95
    `,
    secondary: `
      border
      ${isDark
        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
      }
    `,
    ghost: `
      ${isDark
        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }
    `,
  };

  const variant = action.variant || 'primary';

  const className = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${action.hideOnMobile ? 'hidden sm:inline-flex' : ''}
    ${action.disabled ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  const content = (
    <>
      {action.loading ? (
        <FiRefreshCw className="animate-spin" />
      ) : action.icon}
      <span className={action.hideOnMobile ? 'hidden sm:inline' : ''}>
        {action.label}
      </span>
    </>
  );

  // Render as Link if href is provided
  if (action.href) {
    return (
      <Link
        to={action.href}
        className={className}
      >
        {content}
      </Link>
    );
  }

  // Render as button
  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      className={className}
    >
      {content}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPACT STATS ROW - Para stats en línea
   ═══════════════════════════════════════════════════════════════════════════ */

interface CompactStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'default' | 'emerald' | 'rose' | 'amber';
}

export const CompactStatsRow: React.FC<{ stats: CompactStatProps[] }> = ({ stats }) => {
  const { isDark, heading } = useThemeClasses();

  const colorStyles: Record<string, { icon: string; text: string; bg: string }> = {
    default: {
      icon: isDark ? 'text-gray-400' : 'text-gray-500',
      text: heading,
      bg: isDark ? 'bg-gray-700' : 'bg-gray-100',
    },
    emerald: {
      icon: isDark ? 'text-emerald-400' : 'text-emerald-600',
      text: isDark ? 'text-emerald-400' : 'text-emerald-700',
      bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
    },
    rose: {
      icon: isDark ? 'text-rose-400' : 'text-rose-600',
      text: isDark ? 'text-rose-400' : 'text-rose-700',
      bg: isDark ? 'bg-rose-900/30' : 'bg-rose-50',
    },
    amber: {
      icon: isDark ? 'text-amber-400' : 'text-amber-600',
      text: isDark ? 'text-amber-400' : 'text-amber-700',
      bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50',
    },
  };

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat, index) => {
        const style = colorStyles[stat.color || 'default'];

        return (
          <div
            key={index}
            className={`
              flex items-center gap-2.5 px-3.5 py-2 rounded-xl border
              ${isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
              }
            `}
          >
            <div className={`p-2 rounded-lg ${style.bg} [&>svg]:w-4 [&>svg]:h-4 ${style.icon}`}>
              {stat.icon}
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {stat.label}
              </p>
              <p className={`text-lg font-black ${style.text}`}>
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PageHeader;
