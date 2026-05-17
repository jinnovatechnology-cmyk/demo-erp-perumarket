/**
 * AppClients.tsx - Módulo de gestión de clientes estilo Power BI
 * Diseño consistente con Dashboard, soporta dark/light mode
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import ClientsSearchBar from "./ClientSearchBar";
import ClienteDeleteModal from "./ClientDeleteModal";
import ClienteCard from "./ClientCards";
import ClienteForm from "./ClientFrom";
import { useClienteManagement } from "../../hooks/clientes/useClienteManagement";
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { FiMoreVertical, FiUsers, FiDownload } from 'react-icons/fi';
import PageWrapper from '../../components/ui/PageWrapper';

// Iconos
import {
  LuUsers,
  LuUserPlus,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuUserCheck,
  LuFilter,
  LuPlus,
  LuSearch
} from "react-icons/lu";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

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
};

// Configuración de paginación
const ITEMS_PER_PAGE = 12;

// KPI Card Component - Igual que Dashboard
const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  color = COLORS.primary,
  isDark
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
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
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      {subtitle && (
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

// Card Wrapper - Similar a ChartCard del Dashboard
const SectionCard = ({
  title,
  subtitle,
  children,
  isDark,
  actions,
  noPadding
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  isDark: boolean;
  actions?: React.ReactNode;
  noPadding?: boolean;
}) => (
  <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
    {/* Header */}
    {title && (
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
    )}
    {/* Content */}
    <div className={noPadding ? '' : 'p-5'}>
      {children}
    </div>
  </div>
);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-28 rounded-xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        ))}
      </div>
      {/* Filter bar skeleton */}
      <div className={`h-24 rounded-xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-48 rounded-xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        ))}
      </div>
    </div>
  </div>
);

export default function AppClients() {
  const {
    // Estados
    loading,
    error: hookError,
    filters,
    stats,
    filteredClientes,
    isFormVisible,
    formCliente,
    deletingCliente,

    // Handlers
    handleFilterChange,
    clearFilters,
    handleSaveCliente,
    handleDeleteCliente,
    openForm,
    closeForm,
    setDeletingCliente,
    setFormField,
    closeDeleteModal,
    refreshData,
    clearError: clearHookError
  } = useClienteManagement();

  const { isDark } = useThemeClasses();

  // Estados para UI locales
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Combinar errores del hook y locales para mostrar en la alerta roja
  const error = hookError || localError;

  // Calcular paginación
  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);

  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClientes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClientes, currentPage]);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const clearErrors = useCallback(() => {
    clearHookError();
    setLocalError(null);
  }, [clearHookError]);

  // Auto-cerrar mensaje de éxito
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // --- Lógica de Guardado ---
  const handleSaveClienteAndClose = async (cli: any): Promise<void> => {
    setSaving(true);
    clearErrors();
    setSuccessMessage(null);

    try {
      const success = await handleSaveCliente(cli);
      if (success) {
        const message = cli.id
          ? `Cliente actualizado correctamente.`
          : `Cliente registrado exitosamente.`;
        setSuccessMessage(message);
        closeForm();
      }
    } catch (err: any) {
      console.error('Error en save:', err);
      if (!hookError) setLocalError('Ocurrió un error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  };

  // --- Lógica de Eliminación ---
  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingCliente?.id) return;

    setDeleting(true);
    clearErrors();

    try {
      const success = await handleDeleteCliente(deletingCliente.id);

      if (success) {
        setSuccessMessage("Operación realizada correctamente.");
        closeDeleteModal();
      }
    } catch (err: any) {
      setLocalError('Error crítico al procesar la eliminación.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseForm = () => {
    clearErrors();
    closeForm();
  };

  const generateClientKey = (cli: any, index: number): string => {
    if (cli.id) return `cliente-${cli.id}`;
    const dniKey = cli.persona?.numeroDocumento
      ? cli.persona.numeroDocumento.replace(/\s+/g, '-')
      : `no-dni-${index}`;
    return `cliente-new-${dniKey}-${index}`;
  };

  // Funciones de navegación de paginación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleRefresh = async () => {
    setRefreshing(true);
    clearErrors();
    await refreshData();
    setRefreshing(false);
  };

  // --- Skeleton Loading ---
  if (loading && stats.total === 0) {
    return <LoadingSkeleton isDark={isDark} />;
  }

  return (
    <PageWrapper
      title="Directorio de Clientes"
      subtitle="Peru Market ERP • Gestión de cartera de clientes"
      icon={<FiUsers />}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      actions={[
        { label: 'Exportar', icon: <FiDownload />, variant: 'secondary', hideOnMobile: true },
        { label: 'Nuevo Cliente', icon: <LuUserPlus />, variant: 'primary', onClick: () => { clearErrors(); openForm(); } },
      ]}
    >
      <div className="space-y-6">

        {/* --- ALERTAS Y MENSAJES --- */}
        {successMessage && (
          <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                Operación Exitosa
              </p>
              <p className={`text-sm ${isDark ? 'text-green-400/70' : 'text-green-700'}`}>
                {successMessage}
              </p>
            </div>
            <button onClick={() => setSuccessMessage(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
              <LuX className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <FiAlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                Atención
              </p>
              <p className={`text-sm whitespace-pre-line ${isDark ? 'text-red-400/70' : 'text-red-700'}`}>
                {error}
              </p>
            </div>
            <button onClick={clearErrors} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
              <LuX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* --- KPIs (STAT CARDS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Total Clientes"
            value={stats.total}
            subtitle="en base de datos"
            icon={<LuUsers className="w-5 h-5" />}
            color={COLORS.primary}
            isDark={isDark}
          />
          <KPICard
            title="Clientes Activos"
            value={stats.activos}
            subtitle={stats.total > 0 ? `${((stats.activos / stats.total) * 100).toFixed(0)}% del total` : undefined}
            icon={<LuUserCheck className="w-5 h-5" />}
            color={COLORS.success}
            isDark={isDark}
          />
          <KPICard
            title="Resultados del Filtro"
            value={stats.filtrados}
            subtitle={filters.texto || filters.tipo ? 'coincidencias' : 'sin filtros'}
            icon={<LuFilter className="w-5 h-5" />}
            color={COLORS.accent}
            isDark={isDark}
          />
        </div>

        {/* --- BARRA DE FILTROS --- */}
        <SectionCard
          title="Búsqueda y Filtros"
          subtitle="Encuentra clientes por nombre, documento o tipo"
          isDark={isDark}
          actions={
            <button
              onClick={() => { clearErrors(); clearFilters(); }}
              disabled={!filters.texto && !filters.tipo}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                !filters.texto && !filters.tipo
                  ? isDark ? 'text-gray-600 bg-gray-800 cursor-not-allowed' : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-[#E0312A] bg-[#E0312A]/10 hover:bg-[#E0312A]/20 cursor-pointer'
              }`}
            >
              Limpiar filtros
            </button>
          }
        >
          <ClientsSearchBar
            filters={filters}
            onChange={handleFilterChange}
          />
        </SectionCard>

        {/* --- GRID DE RESULTADOS --- */}
        {filteredClientes.length === 0 ? (
          <EmptyState
            isInitial={stats.total === 0}
            onAction={() => { clearErrors(); openForm(); }}
            onClear={() => { clearErrors(); clearFilters(); }}
            isDark={isDark}
          />
        ) : (
          <>
            {/* Información de paginación superior */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Mostrando{' '}
                <span className="font-semibold text-[#E0312A]">
                  {((currentPage - 1) * ITEMS_PER_PAGE) + 1}
                </span>
                {' '}-{' '}
                <span className="font-semibold text-[#E0312A]">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredClientes.length)}
                </span>
                {' '}de{' '}
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{filteredClientes.length}</span>
                {' '}clientes
              </p>

              {totalPages > 1 && (
                <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Página {currentPage} de {totalPages}
                </div>
              )}
            </div>

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedClientes.map((cli, index) => (
                <ClienteCard
                  key={generateClientKey(cli, index)}
                  data={cli}
                  onEdit={() => { clearErrors(); openForm(cli); }}
                  onDelete={() => { clearErrors(); setDeletingCliente(cli); }}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onFirstPage={goToFirstPage}
                onPreviousPage={goToPreviousPage}
                onNextPage={goToNextPage}
                onLastPage={goToLastPage}
                onPageSelect={goToPage}
                isDark={isDark}
              />
            )}
          </>
        )}

        {/* --- MODALES --- */}

        {/* Modal Formulario */}
        {isFormVisible && formCliente && (
          <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleCloseForm}
              ></div>

              {/* Panel */}
              <div className={`relative transform overflow-hidden rounded-2xl text-left shadow-2xl transition-all w-full max-w-4xl max-h-[92dvh] flex flex-col ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200'}`}>
                <div className="absolute top-4 right-4 z-10">
                   <button
                    onClick={handleCloseForm}
                    className={`p-2 rounded-full transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                  >
                    <LuX className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <ClienteForm
                    state={formCliente}
                    setField={setFormField}
                    onCancel={handleCloseForm}
                    onSave={handleSaveClienteAndClose}
                    loading={saving}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminación */}
        {deletingCliente && (
          <ClienteDeleteModal
            visible={!!deletingCliente}
            message={`¿Está seguro que desea eliminar a ${deletingCliente.persona.nombres}?`}
            onCancel={closeDeleteModal}
            onConfirm={handleConfirmDelete}
            loading={deleting}
          />
        )}
      </div>
    </PageWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTES AUXILIARES
   ═══════════════════════════════════════════════════════════════════════════ */

const EmptyState = ({ isInitial, onAction, onClear, isDark }: {
  isInitial: boolean;
  onAction: () => void;
  onClear: () => void;
  isDark: boolean;
}) => (
  <div className={`text-center py-24 rounded-xl ${isDark ? 'bg-[#171717] border border-neutral-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
    <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
      {isInitial ? (
        <LuUserPlus className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      ) : (
        <LuSearch className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      )}
    </div>
    <h3 className={`mt-2 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {isInitial ? 'Base de datos vacía' : 'Sin resultados'}
    </h3>
    <p className={`mt-1 text-sm max-w-sm mx-auto mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      {isInitial
        ? 'No hay clientes registrados en el sistema. Comience agregando su primer contacto comercial.'
        : 'No se encontraron clientes que coincidan con los filtros aplicados.'}
    </p>
    {isInitial ? (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#E0312A] text-white hover:bg-[#A91E16] transition-colors"
      >
        <LuPlus className="w-5 h-5" />
        Registrar Primer Cliente
      </button>
    ) : (
      <button
        onClick={onClear}
        className="font-semibold text-sm text-[#E0312A] hover:underline transition-colors"
      >
        Limpiar todos los filtros
      </button>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PAGINATION COMPONENT - Componente de paginación profesional
   ═══════════════════════════════════════════════════════════════════════════ */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onPageSelect: (page: number) => void;
  isDark: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onPageSelect,
  isDark,
}) => {
  // Calcular qué páginas mostrar
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Siempre mostrar última página
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const buttonBase = `
    flex items-center justify-center transition-all duration-200
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  const navButton = `
    ${buttonBase}
    w-10 h-10 rounded-xl border
    ${isDark
      ? 'border-neutral-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-neutral-700'
      : 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300'
    }
  `;

  const pageButton = (isActive: boolean) => `
    ${buttonBase}
    w-10 h-10 rounded-xl font-semibold text-sm
    ${isActive
      ? 'text-white shadow-md'
      : isDark
        ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }
  `;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
      <div className="flex items-center gap-2">
        {/* Primera página */}
        <button
          onClick={onFirstPage}
          disabled={currentPage === 1}
          className={navButton}
          title="Primera página"
        >
          <LuChevronsLeft size={18} />
        </button>

        {/* Página anterior */}
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className={navButton}
          title="Página anterior"
        >
          <LuChevronLeft size={18} />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className={`w-10 h-10 flex items-center justify-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
              >
                •••
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageSelect(page as number)}
                className={pageButton(currentPage === page)}
                style={currentPage === page ? { background: `linear-gradient(135deg, #E0312A, #A91E16)` } : {}}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Página siguiente */}
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={navButton}
          title="Página siguiente"
        >
          <LuChevronRight size={18} />
        </button>

        {/* Última página */}
        <button
          onClick={onLastPage}
          disabled={currentPage === totalPages}
          className={navButton}
          title="Última página"
        >
          <LuChevronsRight size={18} />
        </button>
      </div>

      {/* Selector de página directo (opcional para móvil) */}
      <div className="sm:hidden flex items-center gap-2">
        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Ir a:</span>
        <select
          value={currentPage}
          onChange={(e) => onPageSelect(Number(e.target.value))}
          className={`
            px-3 py-2 rounded-lg border text-sm font-medium
            ${isDark
              ? 'bg-gray-800 border-neutral-800 text-gray-200'
              : 'bg-white border-gray-200 text-gray-700'
            }
          `}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <option key={page} value={page}>
              Página {page}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
