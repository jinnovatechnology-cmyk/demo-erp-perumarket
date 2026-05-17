/**
 * Proveedores.tsx - Módulo de Gestión de Proveedores
 * Diseño Power BI - Estilo profesional y minimalista
 */

import { useState } from 'react';
import {
  FiTruck,
  FiPlus,
  FiSearch,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiAlertCircle,
  FiFilter,
  FiUsers,
  FiEdit3,
  FiTrash2,
  FiPackage,
  FiPhone,
  FiMail
} from 'react-icons/fi';

import { useProveedores } from '../../hooks/Proveedores/useProveedores';
import type { ProveedorData } from '../../types/proveedor/proveedorType';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import PageWrapper from '../../components/ui/PageWrapper';

// Componentes Hijos
import ProveedorCard from './components/ProveedorCard';
import ProveedorFormModal from './components/ProveedorFormModal';
import ProveedorDeleteModal from './components/ProveedorDeleteModal';
import ProveedorProductosModal from './components/ProveedorProductosModal';

/* ═══════════════════════════════════════════════════════════════════════════
   KPI CARD - Tarjeta de estadística estilo Power BI
   ═══════════════════════════════════════════════════════════════════════════ */
interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'red' | 'neutral';
  isDark: boolean;
}

const KPICard = ({ title, value, icon, color = 'neutral', isDark }: KPICardProps) => {
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
    red: {
      iconBg: isDark ? 'bg-red-500/20' : 'bg-red-50',
      iconColor: isDark ? 'text-red-400' : 'text-red-600',
      value: isDark ? 'text-red-400' : 'text-red-600'
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
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${styles.value}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
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
}

const SectionCard = ({ title, subtitle, children, isDark, headerAction }: SectionCardProps) => (
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
    <div className="p-6">
      {children}
    </div>
  </div>
);

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
    <div className={`h-96 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════════════ */
interface EmptyStateProps {
  isInitial: boolean;
  onAction: () => void;
  onClear: () => void;
  isDark: boolean;
}

const EmptyState = ({ isInitial, onAction, onClear, isDark }: EmptyStateProps) => (
  <div className={`
    text-center py-16 rounded-xl border-2 border-dashed
    ${isDark ? 'border-neutral-700 bg-neutral-800/30' : 'border-gray-200 bg-gray-50/50'}
  `}>
    <div className={`
      mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4
      ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}
    `}>
      {isInitial ? (
        <FiTruck className={`w-8 h-8 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
      ) : (
        <FiSearch className={`w-8 h-8 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
      )}
    </div>
    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {isInitial ? 'Sin proveedores registrados' : 'Sin resultados'}
    </h3>
    <p className={`mt-2 text-sm max-w-sm mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      {isInitial
        ? 'Comience agregando su primer proveedor al sistema.'
        : 'No se encontraron proveedores con los filtros actuales.'}
    </p>
    <div className="mt-6">
      {isInitial ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all bg-[#E0312A] hover:bg-[#A91E16]"
        >
          <FiPlus size={18} />
          Registrar Proveedor
        </button>
      ) : (
        <button
          onClick={onClear}
          className="text-sm font-medium text-[#E0312A] hover:text-[#A91E16]"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH BAR
   ═══════════════════════════════════════════════════════════════════════════ */
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  filterStatus: 'ALL' | 'ACTIVO' | 'INACTIVO';
  onFilterChange: (status: 'ALL' | 'ACTIVO' | 'INACTIVO') => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  isDark: boolean;
}

const SearchBar = ({
  value,
  onChange,
  onSearch,
  filterStatus,
  onFilterChange,
  viewMode,
  onViewModeChange,
  isDark
}: SearchBarProps) => (
  <div className="flex flex-col lg:flex-row gap-3">
    {/* Search Input */}
    <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="flex-1">
      <div className="relative">
        <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
        <input
          type="text"
          placeholder="Buscar por RUC o Razón Social..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors
            ${isDark
              ? 'bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-[#E0312A]'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#E0312A]'
            }
            focus:outline-none focus:ring-1 focus:ring-[#E0312A]/20
          `}
        />
      </div>
    </form>

    {/* Filter Buttons */}
    <div className={`
      flex p-1 rounded-lg
      ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}
    `}>
      {[
        { key: 'ALL', label: 'Todos' },
        { key: 'ACTIVO', label: 'Activos', icon: <FiCheckCircle size={12} /> },
        { key: 'INACTIVO', label: 'Inactivos', icon: <FiXCircle size={12} /> }
      ].map((item) => (
        <button
          key={item.key}
          onClick={() => onFilterChange(item.key as 'ALL' | 'ACTIVO' | 'INACTIVO')}
          className={`
            px-3 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5
            ${filterStatus === item.key
              ? isDark
                ? 'bg-neutral-700 text-white shadow-sm'
                : 'bg-white text-gray-900 shadow-sm'
              : isDark
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>

    {/* Separador */}
    <div className={`hidden lg:block w-px ${isDark ? 'bg-neutral-700' : 'bg-gray-200'}`} />

    {/* View Mode Toggle */}
    <div className={`
      flex p-1 rounded-lg
      ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}
    `}>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`
          px-3 py-2 rounded-md transition-all
          ${viewMode === 'grid'
            ? isDark
              ? 'bg-neutral-700 text-white shadow-sm'
              : 'bg-white text-gray-900 shadow-sm'
            : isDark
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        <FiGrid size={16} />
      </button>
      <button
        onClick={() => onViewModeChange('table')}
        className={`
          px-3 py-2 rounded-md transition-all
          ${viewMode === 'table'
            ? isDark
              ? 'bg-neutral-700 text-white shadow-sm'
              : 'bg-white text-gray-900 shadow-sm'
            : isDark
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        <FiList size={16} />
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Proveedores() {
  const { proveedores, loading, error, fetchProveedores, addProveedor, editProveedor, removeProveedor } = useProveedores();
  const { isDark } = useThemeClasses();

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVO' | 'INACTIVO'>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProveedorData | null>(null);
  const [selectedProveedor, setSelectedProveedor] = useState<ProveedorData | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsTarget, setProductsTarget] = useState<ProveedorData | undefined>(undefined);

  // Alert State
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stats
  const totalActivos = proveedores.filter(p => p.estado === 'ACTIVO').length;
  const totalInactivos = proveedores.filter(p => p.estado === 'INACTIVO').length;

  const filteredProveedores = proveedores.filter(p => {
    // Filter by status
    if (filterStatus !== 'ALL' && p.estado !== filterStatus) return false;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const razonSocial = (p.razon_social || '').toLowerCase();
      const ruc = (p.ruc || '').toLowerCase();
      if (!razonSocial.includes(search) && !ruc.includes(search)) return false;
    }

    return true;
  });

  const hasActiveFilters = filterStatus !== 'ALL' || searchTerm !== '';

  // Handlers
  const handleSearch = () => {
    fetchProveedores(searchTerm);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedProveedor(undefined);
    setShowModal(true);
  };

  const openEditModal = (p: ProveedorData) => {
    setIsEditing(true);
    setSelectedProveedor(p);
    setShowModal(true);
  };

  const openDeleteModal = (p: ProveedorData) => {
    setDeleteTarget(p);
    setShowDeleteModal(true);
  };

  const openProductsModal = (p: ProveedorData) => {
    setProductsTarget(p);
    setShowProductsModal(true);
  };

  const handleSubmit = async (data: ProveedorData) => {
    const result = isEditing && data.id
      ? await editProveedor(data.id, data)
      : await addProveedor(data);

    if (result.success) {
      setShowModal(false);
      setSuccessMessage(isEditing ? 'Proveedor actualizado correctamente' : 'Proveedor registrado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      alert(result.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    const result = await removeProveedor(deleteTarget.id);
    if (result.success) {
      setShowDeleteModal(false);
      setSuccessMessage('Proveedor eliminado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      alert(result.message);
    }
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setSearchTerm('');
  };

  const getNombre = (p: ProveedorData) => p.razon_social || "Sin Nombre";

  // Loading state
  if (loading && proveedores.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <LoadingSkeleton isDark={isDark} />
        </div>
      </div>
    );
  }

  return (
    <PageWrapper
      title="Gestión de Proveedores"
      subtitle="Administre su red de proveedores y contactos comerciales — Peru Market"
      icon={<FiTruck />}
      actions={[
        { label: 'Nuevo Proveedor', onClick: openCreateModal, icon: <FiPlus />, variant: 'primary' }
      ]}
    >
      <div className="space-y-6">

        {/* ═══ ALERTAS ═══ */}
        {successMessage && (
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border animate-fadeIn
            ${isDark ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}
          `}>
            <FiCheckCircle size={18} />
            <span className="text-sm font-medium">{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto">
              <FiX size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border
            ${isDark ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}
          `}>
            <FiAlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* ═══ KPI CARDS ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Proveedores"
            value={proveedores.length}
            icon={<FiUsers className="w-6 h-6" />}
            color="neutral"
            isDark={isDark}
          />
          <KPICard
            title="Activos"
            value={totalActivos}
            icon={<FiCheckCircle className="w-6 h-6" />}
            color="green"
            isDark={isDark}
          />
          <KPICard
            title="Inactivos"
            value={totalInactivos}
            icon={<FiXCircle className="w-6 h-6" />}
            color="red"
            isDark={isDark}
          />
          <KPICard
            title="Resultados"
            value={filteredProveedores.length}
            icon={<FiFilter className="w-6 h-6" />}
            color="amber"
            isDark={isDark}
          />
        </div>

        {/* ═══ FILTROS Y CONTENIDO ═══ */}
        <SectionCard
          title="Directorio de Proveedores"
          subtitle={`${filteredProveedores.length} de ${proveedores.length} proveedores`}
          isDark={isDark}
          headerAction={
            hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`
                  text-xs font-medium px-3 py-1.5 rounded-full transition-colors
                  ${isDark
                    ? 'text-[#F0726A] bg-[#E0312A]/20 hover:bg-[#E0312A]/30'
                    : 'text-[#E0312A] bg-[#E0312A]/10 hover:bg-[#E0312A]/20'
                  }
                `}
              >
                Limpiar filtros
              </button>
            )
          }
        >
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isDark={isDark}
            />
          </div>

          {/* Content */}
          {filteredProveedores.length === 0 ? (
            <EmptyState
              isInitial={proveedores.length === 0}
              onAction={openCreateModal}
              onClear={clearFilters}
              isDark={isDark}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProveedores.map((p) => (
                <ProveedorCard
                  key={p.id}
                  proveedor={p}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onViewProducts={openProductsModal}
                />
              ))}
            </div>
          ) : (
            /* Vista Tabla */
            <div className={`
              rounded-xl border overflow-hidden
              ${isDark ? 'border-neutral-800' : 'border-gray-200'}
            `}>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className={isDark ? 'bg-neutral-800' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Empresa
                      </th>
                      <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        RUC
                      </th>
                      <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Contacto
                      </th>
                      <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Información
                      </th>
                      <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Estado
                      </th>
                      <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                    {filteredProveedores.map((p) => (
                      <tr
                        key={p.id}
                        className={`
                          transition-colors
                          ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'}
                        `}
                      >
                        <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                          {getNombre(p)}
                        </td>
                        <td className={`px-4 py-3 font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {p.ruc}
                        </td>
                        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {p.contacto || '--'}
                        </td>
                        <td className={`px-4 py-3 hidden md:table-cell text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex items-center gap-1.5">
                            <FiPhone size={12} />
                            {p.telefono || '--'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiMail size={12} />
                            {p.correo || '--'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`
                            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase
                            ${p.estado === 'ACTIVO'
                              ? isDark
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-green-50 text-green-700'
                              : isDark
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-red-50 text-red-700'
                            }
                          `}>
                            {p.estado === 'ACTIVO' ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                            {p.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openProductsModal(p)}
                              className={`
                                p-2 rounded-lg transition-colors
                                ${isDark
                                  ? 'text-blue-400 hover:bg-blue-900/30'
                                  : 'text-blue-600 hover:bg-blue-50'
                                }
                              `}
                              title="Ver productos"
                            >
                              <FiPackage size={16} />
                            </button>
                            <button
                              onClick={() => openEditModal(p)}
                              className={`
                                p-2 rounded-lg transition-colors
                                ${isDark
                                  ? 'text-gray-400 hover:text-white hover:bg-neutral-700'
                                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }
                              `}
                              title="Editar"
                            >
                              <FiEdit3 size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(p)}
                              className={`
                                p-2 rounded-lg transition-colors
                                ${isDark
                                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                }
                              `}
                              title="Eliminar"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════════════
           MODALES
           ═══════════════════════════════════════════════════════════════ */}

        <ProveedorFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          initialData={selectedProveedor}
          isEditing={isEditing}
          existingProviders={proveedores}
        />

        <ProveedorDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          nombreProveedor={deleteTarget ? getNombre(deleteTarget) : ''}
        />

        <ProveedorProductosModal
          isOpen={showProductsModal}
          onClose={() => setShowProductsModal(false)}
          proveedor={productsTarget}
        />
      </div>
    </PageWrapper>
  );
}
