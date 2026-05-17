/**
 * AccesosRoles.tsx - Tab de Roles con estilo igual al módulo de compras
 */

import React, { useMemo } from 'react';
import { FiLock, FiEye, FiEdit, FiTrash2, FiShield, FiUsers, FiLayers, FiFileText,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  usuarios_count?: number;
  modulos_activos?: number;
  usuariosCount?: number;
  modulosActivosCount?: number;
}

interface RolesTabProps {
  roles: Rol[];
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  onVerDetalles: (rol: Rol) => void;
  onEditar: (rol: Rol) => void;
  onEliminar: (rol: Rol) => void;
  onGestionarPermisos: (rol: Rol) => void;
  onPageChange: (page: number) => void;
}

// Obtener iniciales
const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

// Componente de Paginación
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isDark: boolean;
}> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, isDark }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) end = Math.min(maxVisible, totalPages - 1);
      else if (currentPage >= totalPages - 2) start = Math.max(2, totalPages - maxVisible + 1);

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t ${isDark ? 'border-neutral-800 bg-[#171717]' : 'border-gray-100 bg-gray-50/50'}`}>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Mostrando <span className="font-bold text-[#E0312A]">
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
        </span> - <span className="font-bold text-[#E0312A]">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span> de <span className="font-bold">{totalItems}</span> registros
      </p>

      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all disabled:opacity-50 ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-neutral-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
          <FiChevronsLeft size={18} />
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all disabled:opacity-50 ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-neutral-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
          <FiChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className={`px-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[36px] h-9 rounded-lg font-semibold text-sm transition-all ${
                  currentPage === page
                    ? 'bg-[#E0312A] text-white shadow-lg'
                    : isDark
                      ? 'text-gray-400 hover:bg-neutral-800 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all disabled:opacity-50 ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-neutral-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
          <FiChevronRight size={18} />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all disabled:opacity-50 ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-neutral-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
          <FiChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export const RolesTab: React.FC<RolesTabProps> = ({
  roles,
  searchTerm,
  currentPage,
  itemsPerPage,
  onVerDetalles,
  onEditar,
  onEliminar,
  onGestionarPermisos,
  onPageChange,
}) => {
  const { isDark } = useThemeClasses();

  // Filtrar roles
  const rolesFiltrados = useMemo(() => {
    return roles.filter(rol =>
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(rolesFiltrados.length / itemsPerPage);
  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return rolesFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [rolesFiltrados, currentPage, itemsPerPage]);

  const hasFilters = searchTerm !== '';

  return (
    <div className={`${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>

      {/* Barra de resultados */}
      <div className={`px-5 py-3 text-xs font-medium flex items-center justify-between ${isDark ? 'text-gray-400 bg-[#171717] border-b border-neutral-800' : 'text-gray-600 bg-gray-50/80 border-b border-gray-100'}`}>
        <span>
          {hasFilters ? (
            <>Mostrando <span className="font-bold text-[#E0312A]">{rolesFiltrados.length}</span> de {roles.length} registros</>
          ) : (
            <>{roles.length} registros en total</>
          )}
        </span>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className={`min-w-full divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
          <thead className={isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}>
            <tr>
              {['Rol', 'Descripción', 'Usuarios', 'Módulos', 'Acciones'].map((h) => (
                <th key={h} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`${isDark ? 'bg-[#171717]' : 'bg-white'} divide-y ${isDark ? 'divide-neutral-800' : 'divide-gray-100'}`}>
            {paginatedRoles.length === 0 ? (
              <tr>
                <td colSpan={5} className={`px-6 py-12 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <FiLock size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No se encontraron roles</p>
                  <p className="text-sm mt-1">
                    {hasFilters ? 'Intenta ajustar los filtros de búsqueda' : 'No hay roles registrados en el sistema'}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedRoles.map((rol) => {
                const usuariosCount = rol.usuarios_count ?? rol.usuariosCount ?? 0;
                const modulosCount = rol.modulos_activos ?? rol.modulosActivosCount ?? 0;

                return (
                  <tr
                    key={rol.id}
                    className={`${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'} transition-colors duration-150 group cursor-pointer`}
                    onClick={() => onVerDetalles(rol)}
                  >
                    {/* Rol */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-[#E0312A]/20 text-emerald-400' : 'bg-[#E0312A]/10 text-[#E0312A]'} flex items-center justify-center text-xs font-bold mr-3`}>
                          {getInitials(rol.nombre)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#E0312A]">{rol.nombre}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ID: {rol.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Descripción */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-sm">
                        <FiFileText size={14} className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rol.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                    </td>

                    {/* Usuarios */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <FiUsers size={14} />
                        <span className="font-bold text-sm">{usuariosCount} usuarios</span>
                      </div>
                    </td>

                    {/* Módulos */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        <FiLayers size={14} />
                        <span className="font-bold text-sm">{modulosCount} módulos</span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); onVerDetalles(rol); }}
                          className={`${isDark ? 'text-gray-500 hover:text-[#F0726A] hover:bg-[#E0312A]/20' : 'text-gray-400 hover:text-[#E0312A] hover:bg-[#E0312A]/10'} transition-colors p-2 rounded-full`}
                          title="Ver detalles"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onGestionarPermisos(rol); }}
                          className={`${isDark ? 'text-gray-500 hover:text-purple-400 hover:bg-purple-900/30' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'} transition-colors p-2 rounded-full`}
                          title="Permisos"
                        >
                          <FiShield size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditar(rol); }}
                          className={`${isDark ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-900/30' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'} transition-colors p-2 rounded-full`}
                          title="Editar"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onEliminar(rol); }}
                          className={`${isDark ? 'text-gray-500 hover:text-rose-400 hover:bg-rose-900/30' : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'} transition-colors p-2 rounded-full`}
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="lg:hidden p-4 space-y-3">
        {paginatedRoles.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <FiLock size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No se encontraron roles</p>
          </div>
        ) : (
          paginatedRoles.map((rol) => {
            const usuariosCount = rol.usuarios_count ?? rol.usuariosCount ?? 0;
            const modulosCount = rol.modulos_activos ?? rol.modulosActivosCount ?? 0;

            return (
              <div
                key={rol.id}
                className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-800/30 border-neutral-700 hover:bg-neutral-800/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-all cursor-pointer`}
                onClick={() => onVerDetalles(rol)}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-12 w-12 rounded-full ${isDark ? 'bg-[#E0312A]/20 text-emerald-400' : 'bg-[#E0312A]/10 text-[#E0312A]'} flex items-center justify-center font-bold`}>
                    {getInitials(rol.nombre)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#E0312A]">{rol.nombre}</div>
                    <div className={`text-xs line-clamp-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {rol.descripcion || 'Sin descripción'}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mb-4 ml-[60px]">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <FiUsers size={12} />
                    {usuariosCount}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    <FiLayers size={12} />
                    {modulosCount}
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-2 gap-2 ml-[60px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); onVerDetalles(rol); }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-[#E0312A]/20 text-emerald-400' : 'bg-[#E0312A]/10 text-[#E0312A]'}`}
                  >
                    <FiEye size={14} />
                    <span>Detalles</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onGestionarPermisos(rol); }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}
                  >
                    <FiShield size={14} />
                    <span>Permisos</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditar(rol); }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}
                  >
                    <FiEdit size={14} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEliminar(rol); }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600'}`}
                  >
                    <FiTrash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={rolesFiltrados.length}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        isDark={isDark}
      />
    </div>
  );
};
