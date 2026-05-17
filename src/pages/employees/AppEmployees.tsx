/**
 * AppEmployees.tsx - Módulo de Gestión de Empleados
 * Diseño Power BI - Estilo profesional y minimalista
 */

import { useEmployeeManagement } from "../../hooks/useEmployeeManagement";
import { useModalManagement } from "../../hooks/useModalManagement";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import type { Departament, Employee } from "../../types/Employee";
import { useState } from "react";
import PageWrapper from '../../components/ui/PageWrapper';

// Iconos
import {
  FiUsers,
  FiUserCheck,
  FiFilter,
  FiPlus,
  FiSearch,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiBriefcase
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";

// Componentes
import EmployeeSearchBar from "./EmployeeSearchBar";
import EmployeeCard from "./EmployeeCards";
import EmployeeForm from "./EmployeeForm";
import DeleteModal from "./EmployeeDeleteModal";
import DepartmentForm from "./DepartmentForm";

/* ═══════════════════════════════════════════════════════════════════════════
   KPI CARD - Tarjeta de estadística estilo Power BI
   ═══════════════════════════════════════════════════════════════════════════ */
interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'neutral';
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
    {/* KPIs skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`h-24 rounded-xl ${isDark ? 'bg-neutral-800' : 'bg-gray-200'}`} />
      ))}
    </div>
    {/* Cards skeleton */}
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
        <FiUsers className={`w-8 h-8 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
      ) : (
        <FiSearch className={`w-8 h-8 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
      )}
    </div>
    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {isInitial ? 'Sin empleados registrados' : 'Sin resultados'}
    </h3>
    <p className={`mt-2 text-sm max-w-sm mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      {isInitial
        ? 'Comience agregando su primer colaborador al sistema.'
        : 'No se encontraron empleados con los filtros actuales.'}
    </p>
    <div className="mt-6">
      {isInitial ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all bg-[#E0312A] hover:bg-[#A91E16]"
        >
          <FiPlus size={18} />
          Registrar Empleado
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
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AppEmployees() {
  const {
    departamentos,
    loading,
    error,
    filters,
    stats,
    filteredEmployees,
    handleFilterChange,
    clearFilters,
    handleSaveEmployee,
    handleDeleteEmployee,
    handleSaveDepartment,
  } = useEmployeeManagement();

  const {
    isFormVisible,
    isDepFormVisible,
    deletingEmployee,
    formEmployee,
    formDepartment,
    openForm,
    closeForm,
    openDepartmentForm,
    closeDepartmentForm,
    setDeletingEmployee,
    setFormEmployeeField,
    setFormDepartmentField,
  } = useModalManagement();

  const { isDark } = useThemeClasses();

  // Estados locales
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handlers
  const handleSaveEmployeeAndClose = async (emp: Employee): Promise<void> => {
    const success = await handleSaveEmployee(emp);
    if (success) {
      closeForm();
      setSuccessMessage(emp.empleadoId ? 'Empleado actualizado correctamente' : 'Empleado registrado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSaveDepartmentAndClose = async (dep: Departament): Promise<void> => {
    const success = await handleSaveDepartment(dep);
    if (success) {
      closeDepartmentForm();
      setSuccessMessage('Departamento guardado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingEmployee?.empleadoId) return;
    setDeleting(true);
    try {
      const success = await handleDeleteEmployee(deletingEmployee.empleadoId);
      if (success) {
        setDeletingEmployee(null);
        setSuccessMessage('Empleado eliminado correctamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = filters.texto || filters.dni || filters.estado;

  // Loading state
  if (loading && stats.total === 0) {
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
      title="Directorio de Empleados"
      subtitle="Peru Market ERP • Gestione su capital humano y organice departamentos"
      icon={<FiUsers />}
      actions={[
        { label: 'Nuevo Departamento', icon: <HiOutlineOfficeBuilding />, variant: 'secondary', onClick: () => openDepartmentForm() },
        { label: 'Nuevo Empleado', icon: <FiPlus />, variant: 'primary', onClick: () => openForm() },
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
            title="Total Empleados"
            value={stats.total}
            icon={<FiUsers className="w-6 h-6" />}
            color="neutral"
            isDark={isDark}
          />
          <KPICard
            title="Activos"
            value={stats.activos}
            icon={<FiUserCheck className="w-6 h-6" />}
            color="green"
            isDark={isDark}
          />
          <KPICard
            title="Departamentos"
            value={departamentos.length}
            icon={<FiBriefcase className="w-6 h-6" />}
            color="blue"
            isDark={isDark}
          />
          <KPICard
            title="Resultados"
            value={stats.filtered}
            icon={<FiFilter className="w-6 h-6" />}
            color="amber"
            isDark={isDark}
          />
        </div>

        {/* ═══ FILTROS Y CONTENIDO ═══ */}
        <SectionCard
          title="Directorio"
          subtitle={`${stats.filtered} de ${stats.total} empleados`}
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
            <EmployeeSearchBar
              filters={filters}
              onChange={handleFilterChange}
            />
          </div>

          {/* Grid de empleados o Empty State */}
          {filteredEmployees.length === 0 ? (
            <EmptyState
              isInitial={stats.total === 0}
              onAction={() => openForm()}
              onClear={clearFilters}
              isDark={isDark}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.empleadoId}
                  data={emp}
                  onEdit={() => openForm(emp)}
                  onDelete={() => setDeletingEmployee(emp)}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════════════
           MODALES
           ═══════════════════════════════════════════════════════════════ */}

        {/* Modal Empleado */}
        {isFormVisible && formEmployee && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm transition-opacity`}
                onClick={closeForm}
              />
              <div className={`
                relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col
                ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
              `}>
                <EmployeeForm
                  state={formEmployee}
                  departamentos={departamentos}
                  onCancel={closeForm}
                  onSave={handleSaveEmployeeAndClose}
                  setField={setFormEmployeeField}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Departamento */}
        {isDepFormVisible && formDepartment && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm`}
                onClick={closeDepartmentForm}
              />
              <div className={`
                relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col
                ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
              `}>
                <DepartmentForm
                  state={formDepartment}
                  setField={setFormDepartmentField}
                  onCancel={closeDepartmentForm}
                  onSave={handleSaveDepartmentAndClose}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {deletingEmployee && (
          <DeleteModal
            visible={!!deletingEmployee}
            message="Dar de baja empleado"
            subMessage={`¿Está seguro que desea eliminar permanentemente a ${deletingEmployee.persona.nombres} ${deletingEmployee.persona.apellidoPaterno}? Esta acción no se puede deshacer.`}
            onCancel={() => setDeletingEmployee(null)}
            onConfirm={handleConfirmDelete}
            loading={deleting}
          />
        )}
      </div>
    </PageWrapper>
  );
}
