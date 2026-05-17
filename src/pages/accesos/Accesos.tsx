/**
 * Accesos.tsx - Módulo de Gestión de Accesos con UX Profesional
 * Incluye: KPI Cards, Paginación, Filtros avanzados, Dark/Light mode
 */

import { useState, useEffect, useMemo } from "react";
import {
  FiMenu, FiX, FiUser, FiLock, FiSettings, FiShield,
  FiUsers, FiLayers, FiActivity, FiTrendingUp, FiSearch,
  FiFilter, FiRefreshCw
} from "react-icons/fi";
import { ModalDetalles, ModalEditar, ModalConfirmar, ModalPermisos, InfoCard, InfoRow } from "./AccesosModals";
import { UsuariosTab } from "./AccesosUsuarios";
import { RolesTab } from "./AccesosRoles";
import { ModulosTab } from "./AccesosModulos";
import { accesosService } from "../../services/accesosService";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import PageWrapper from "../../components/ui/PageWrapper";

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTES DE DISEÑO - Colores del logo Peru Market
// ════════════════════════════════════════════════════════════════════════════
const COLORS = {
  primary: '#E0312A',      // Verde principal del logo
  primaryLight: '#F0726A',
  primaryDark: '#A91E16',
  secondary: '#1e3a5f',    // Azul oscuro
  accent: '#0ea5e9',       // Azul claro
  warning: '#f59e0b',      // Amarillo
  danger: '#ef4444',       // Rojo
  success: '#10b981',      // Verde éxito
};

const ITEMS_PER_PAGE = 8;

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE: KPI Card - Estilo uniforme con tabla
// ════════════════════════════════════════════════════════════════════════════
interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  isDark: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, trend, color, isDark }) => (
  <div
    className={`
      relative overflow-hidden rounded-xl p-5 transition-all duration-300
      hover:scale-[1.02] cursor-pointer group border
      ${isDark
        ? 'bg-[#171717] border-neutral-800 hover:border-neutral-700'
        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}
    `}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {title}
        </p>
        <p
          className="text-3xl font-bold mb-1"
          style={{ color }}
        >
          {value}
        </p>
        {subtitle && (
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <FiTrendingUp size={12} className="text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">
              {trend}
            </span>
          </div>
        )}
      </div>

      <div
        className={`p-3.5 rounded-xl transition-all group-hover:scale-105 ${
          isDark ? 'bg-neutral-800/80' : 'bg-gray-50'
        }`}
        style={{ color }}
      >
        {icon}
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Tab Button - Estilo uniforme con tabla
// ════════════════════════════════════════════════════════════════════════════
interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  isActive: boolean;
  onClick: () => void;
  isDark: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  label, icon, count, isActive, onClick, isDark
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 px-5 py-3 rounded-lg font-semibold transition-all duration-200
      ${isActive
        ? 'text-white'
        : isDark
          ? 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }
    `}
    style={isActive ? {
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`
    } : {}}
  >
    <span className="text-lg">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
    <span
      className={`
        px-2.5 py-1 rounded-lg text-xs font-bold transition-colors
        ${isActive
          ? 'bg-white/20 text-white'
          : isDark
            ? 'bg-neutral-700 text-gray-300'
            : 'bg-gray-200 text-gray-600'
        }
      `}
    >
      {count}
    </span>
  </button>
);
// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Filtros Avanzados - Estilo uniforme con tabla
// ════════════════════════════════════════════════════════════════════════════
interface FiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  roleFilter?: string;
  onRoleChange?: (value: string) => void;
  roles?: { id: number; nombre: string }[];
  showRoleFilter?: boolean;
  showStatusFilter?: boolean;
  onAddNew: () => void;
  addButtonText: string;
  onRefresh: () => void;
  loading: boolean;
  isDark: boolean;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  searchTerm, onSearchChange, statusFilter, onStatusChange,
  roleFilter, onRoleChange, roles, showRoleFilter, showStatusFilter = true,
  onAddNew, addButtonText, onRefresh, loading, isDark
}) => (
  <div className={`
    p-4 rounded-xl mb-6 transition-all border
    ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200 shadow-sm'}
  `}>
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <FiSearch
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por nombre, usuario, email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`
            w-full pl-11 pr-10 py-3 rounded-lg border text-sm transition-all
            focus:ring-2 focus:ring-offset-0 outline-none
            ${isDark
              ? 'bg-neutral-800 border-neutral-700 text-gray-100 placeholder-gray-500 focus:ring-[#E0312A]/30 focus:border-[#E0312A]'
              : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-[#E0312A]/20 focus:border-[#E0312A]'
            }
          `}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
              ${isDark ? 'hover:bg-neutral-700 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'}
            `}
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
          <FiFilter size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
        </div>

        {showStatusFilter && (
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className={`
              px-4 py-3 rounded-lg border text-sm font-medium cursor-pointer transition-all
              ${isDark
                ? 'bg-neutral-800 border-neutral-700 text-gray-200 focus:border-[#E0312A]'
                : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#E0312A]'
              }
            `}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
        )}

        {showRoleFilter && roles && (
          <select
            value={roleFilter || ''}
            onChange={(e) => onRoleChange?.(e.target.value)}
            className={`
              px-4 py-3 rounded-lg border text-sm font-medium cursor-pointer transition-all
              ${isDark
                ? 'bg-neutral-800 border-neutral-700 text-gray-200 focus:border-[#E0312A]'
                : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#E0312A]'
              }
            `}
          >
            <option value="">Todos los roles</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.id}>{rol.nombre}</option>
            ))}
          </select>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className={`
            p-3 rounded-lg border transition-all
            ${isDark
              ? 'bg-neutral-800 border-neutral-700 text-gray-400 hover:bg-neutral-700 hover:text-gray-200'
              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }
            ${loading ? 'opacity-60' : ''}
          `}
          title="Actualizar datos"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`
          }}
        >
          <FiUser size={18} />
          <span className="hidden sm:inline">{addButtonText}</span>
        </button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: Accesos
// ════════════════════════════════════════════════════════════════════════════
export default function Accesos() {
  const { isDark } = useThemeClasses();

  // Estados de UI
  const [tab, setTab] = useState("usuarios");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de datos
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [modulos, setModulos] = useState<any[]>([]);
  const [rolesDropdown, setRolesDropdown] = useState<any[]>([]);

  // Estados para modales
  const [modalDetalles, setModalDetalles] = useState({
    isOpen: false,
    titulo: "",
    children: null as React.ReactNode
  });

  const [modalEditar, setModalEditar] = useState({
    isOpen: false,
    titulo: "",
    fields: {} as any,
    tipo: ""
  });

  const [modalConfirmar, setModalConfirmar] = useState({
    isOpen: false,
    titulo: "",
    mensaje: "",
    onConfirm: () => {},
    tipo: "eliminar"
  });

  const [modalPermisos, setModalPermisos] = useState({
    isOpen: false,
    rol: null as any,
    permisos: [] as any[]
  });

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter, tab]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const [usuariosData, rolesData, modulosData, rolesDropdownData] = await Promise.all([
        accesosService.getUsuarios(),
        accesosService.getRoles(),
        accesosService.getModulos(),
        accesosService.getRolesForDropdown()
      ]);

      setUsuarios(usuariosData);
      setRoles(rolesData);
      setModulos(modulosData);
      setRolesDropdown(rolesDropdownData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: "usuarios", label: "Usuarios", icon: <FiUser size={20} />, count: usuarios.length },
    { id: "roles", label: "Roles", icon: <FiLock size={20} />, count: roles.length },
    { id: "modulos", label: "Módulos", icon: <FiSettings size={20} />, count: modulos.length }
  ];

  // KPIs calculados
  const kpis = useMemo(() => {
    const usuariosActivos = usuarios.filter(u => u.estado === 'ACTIVO').length;
    const usuariosInactivos = usuarios.filter(u => u.estado === 'INACTIVO').length;
    const totalPermisos = roles.reduce((acc, r) => acc + (r.modulosActivosCount || 0), 0);

    return [
      {
        title: 'Total Usuarios',
        value: usuarios.length,
        subtitle: `${usuariosActivos} activos, ${usuariosInactivos} inactivos`,
        icon: <FiUsers size={28} />,
        color: COLORS.primary,
        trend: '+2 este mes'
      },
      {
        title: 'Roles del Sistema',
        value: roles.length,
        subtitle: 'Configuraciones de acceso',
        icon: <FiShield size={28} />,
        color: COLORS.accent
      },
      {
        title: 'Módulos Activos',
        value: modulos.length,
        subtitle: 'Secciones del sistema',
        icon: <FiLayers size={28} />,
        color: COLORS.warning
      },
      {
        title: 'Permisos Totales',
        value: totalPermisos,
        subtitle: 'Asignaciones de acceso',
        icon: <FiActivity size={28} />,
        color: COLORS.success
      }
    ];
  }, [usuarios, roles, modulos]);

  // Funciones de utilidad
  const getEstadoColor = (estado: string) =>
    estado === 'ACTIVO'
      ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
      : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';

  const getRolColor = (rolNombre: string) => {
    const colorsMap: { [key: string]: string } = {
      'Administrador': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'Vendedor': 'bg-gradient-to-r from-green-500 to-green-600',
      'Almacenero': 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      'Almacén': 'bg-gradient-to-r from-amber-500 to-amber-600'
    };
    return colorsMap[rolNombre] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getNombreCompleto = (persona: any) =>
    `${persona?.nombres || ''} ${persona?.apellidoPaterno || ''} ${persona?.apellidoMaterno || ''}`.trim();

  // ========== FUNCIONES USUARIOS ==========
  const verDetallesUsuario = (usuario: any) => {
    const p = usuario.persona;
    setModalDetalles({
      isOpen: true,
      titulo: `Detalles del Usuario`,
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Información Personal" variant="blue">
              <div className="space-y-3">
                <InfoRow label="Nombre Completo" value={getNombreCompleto(p)} />
                <InfoRow label="Documento" value={`${p?.tipoDocumento} - ${p?.numeroDocumento}`} />
                <InfoRow label="Fecha Nacimiento" value={p?.fechaNacimiento || 'No especificada'} />
              </div>
            </InfoCard>

            <InfoCard title="Información de Contacto" variant="emerald">
              <div className="space-y-3">
                <InfoRow label="Correo Electrónico" value={p?.correo || 'No especificado'} />
                <InfoRow label="Teléfono" value={p?.telefono || 'No especificado'} />
                <InfoRow label="Dirección" value={p?.direccion || 'No especificada'} />
              </div>
            </InfoCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Información de Cuenta" variant="purple">
              <div className="space-y-3">
                <InfoRow label="Usuario" value={<code className="font-mono">@{usuario.username}</code>} />
                <InfoRow
                  label="Rol"
                  value={
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRolColor(usuario.rol?.nombre || '')} text-white`}>
                      {usuario.rol?.nombre}
                    </span>
                  }
                />
              </div>
            </InfoCard>

            <InfoCard title="Estado" variant="amber">
              <div className="space-y-3">
                <InfoRow
                  label="Estado de la Cuenta"
                  value={
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(usuario.estado)}`}>
                      {usuario.estado}
                    </span>
                  }
                />
              </div>
            </InfoCard>
          </div>
        </div>
      )
    });
  };

  const crearUsuario = () => {
    setModalEditar({
      isOpen: true,
      titulo: "Crear Nuevo Usuario",
      fields: {
        username: "",
        idRol: "",
        password: "",
        estado: "ACTIVO",
        tipoDocumento: "DNI",
        numeroDocumento: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        correo: "",
        telefono: "",
        fechaNacimiento: "",
        direccion: ""
      },
      tipo: "usuario"
    });
  };

  const editarUsuario = (usuario: any) => {
    setModalEditar({
      isOpen: true,
      titulo: "Editar Usuario",
      fields: {
        id: usuario.id,
        username: usuario.username,
        idRol: usuario.rol.id,
        password: "",
        estado: usuario.estado,
        tipoDocumento: usuario.persona?.tipoDocumento || "DNI",
        numeroDocumento: usuario.persona?.numeroDocumento || "",
        nombres: usuario.persona?.nombres || "",
        apellidoPaterno: usuario.persona?.apellidoPaterno || "",
        apellidoMaterno: usuario.persona?.apellidoMaterno || "",
        correo: usuario.persona?.correo || "",
        telefono: usuario.persona?.telefono || "",
        fechaNacimiento: usuario.persona?.fechaNacimiento || "",
        direccion: usuario.persona?.direccion || ""
      },
      tipo: "usuario"
    });
  };

  const guardarUsuario = async (formData: any) => {
    try {
      setLoading(true);

      if (formData.id) {
        const usuarioActualizado = await accesosService.updateUsuario(formData.id, formData);
        setUsuarios(prev => prev.map(u => u.id === formData.id ? usuarioActualizado : u));
      } else {
        const nuevoUsuario = await accesosService.createUsuario(formData);
        setUsuarios(prev => [...prev, nuevoUsuario]);
      }
    } catch (error: any) {
      console.error('Error guardando usuario:', error);
      alert('Error al guardar usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminarUsuario = (usuario: any) => {
    setModalConfirmar({
      isOpen: true,
      titulo: "Eliminar Usuario",
      mensaje: `¿Estás seguro de que deseas eliminar al usuario "${getNombreCompleto(usuario.persona!)}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await accesosService.deleteUsuario(usuario.id);
          setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
        } catch (error: any) {
          console.error('Error eliminando usuario:', error);
          alert('Error al eliminar usuario: ' + error.message);
        }
      },
      tipo: "eliminar"
    });
  };

  // ========== FUNCIONES ROLES ==========
  const verDetallesRol = (rol: any) => {
    setModalDetalles({
      isOpen: true,
      titulo: `Detalles del Rol`,
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Información del Rol" variant="blue">
            <div className="space-y-3">
              <InfoRow label="Nombre del Rol" value={rol.nombre} />
              <InfoRow label="Descripción" value={rol.descripcion || 'Sin descripción'} />
            </div>
          </InfoCard>

          <InfoCard title="Estadísticas" variant="emerald">
            <div className="space-y-3">
              <InfoRow
                label="Usuarios con este Rol"
                value={
                  <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                    {rol.usuariosCount || 0}
                  </span>
                }
              />
              <InfoRow
                label="Módulos con Acceso"
                value={
                  <span className="text-2xl font-bold text-emerald-500">
                    {rol.modulosActivosCount || 0}
                  </span>
                }
              />
            </div>
          </InfoCard>
        </div>
      )
    });
  };

  const crearRol = () => {
    setModalEditar({
      isOpen: true,
      titulo: "Crear Nuevo Rol",
      fields: {
        nombre: "",
        descripcion: ""
      },
      tipo: "rol"
    });
  };

  const editarRol = (rol: any) => {
    setModalEditar({
      isOpen: true,
      titulo: "Editar Rol",
      fields: {
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion
      },
      tipo: "rol"
    });
  };

  const guardarRol = async (formData: any) => {
    try {
      setLoading(true);

      if (formData.id) {
        const rolActualizado = await accesosService.updateRol(formData.id, formData);
        setRoles(prev => prev.map(r => r.id === formData.id ? rolActualizado : r));
      } else {
        const nuevoRol = await accesosService.createRol(formData);
        setRoles(prev => [...prev, nuevoRol]);
        const nuevosRolesDropdown = await accesosService.getRolesForDropdown();
        setRolesDropdown(nuevosRolesDropdown);
      }
    } catch (error: any) {
      console.error('Error guardando rol:', error);
      alert('Error al guardar rol: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminarRol = async (rol: any) => {
    try {
      const dependencies = await accesosService.checkRolDependencies(rol.id);
      const usuariosCount = dependencies.usuariosAsociados;
      const permisosCount = dependencies.permisosAsociados;

      if (usuariosCount > 0) {
        alert(`No se puede eliminar el rol "${rol.nombre}" porque tiene ${usuariosCount} usuario(s) asignado(s).\n\nReasigne los usuarios a otro rol primero.`);
        return;
      }

      let mensaje = `¿Estás seguro de que deseas eliminar el rol "${rol.nombre}"?`;

      if (permisosCount > 0) {
        mensaje += `\n\n⚠️ Este rol tiene ${permisosCount} permiso(s) asociado(s) que se eliminarán automáticamente.`;
      }

      mensaje += "\n\nEsta acción no se puede deshacer.";

      setModalConfirmar({
        isOpen: true,
        titulo: "Eliminar Rol",
        mensaje: mensaje,
        onConfirm: async () => {
          try {
            await accesosService.deleteRol(rol.id);
            setRoles(prev => prev.filter(r => r.id !== rol.id));

            const nuevosRolesDropdown = await accesosService.getRolesForDropdown();
            setRolesDropdown(nuevosRolesDropdown);

          } catch (error: any) {
            console.error('Error eliminando rol:', error);
            alert('Error al eliminar el rol: ' + error.message);
          }
        },
        tipo: "eliminar"
      });

    } catch (error: any) {
      console.error('Error verificando dependencias:', error);
      alert('Error al verificar dependencias del rol: ' + error.message);
    }
  };

  // ========== FUNCIONES PERMISOS ==========
  const gestionarPermisos = async (rol: any) => {
    try {
      setLoading(true);
      const permisos = await accesosService.getPermissionsByRol(rol.id);

      setModalPermisos({
        isOpen: true,
        rol,
        permisos
      });
    } catch (error: any) {
      console.error('Error cargando permisos:', error);
      alert('Error al cargar permisos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarPermisos = async (permisos: any[]) => {
    try {
      setLoading(true);

      const request = {
        idRol: modalPermisos.rol.id,
        permissions: permisos
      };

      await accesosService.updatePermissions(request);

      const modulosActivos = permisos.filter(p => p.hasAccess).length;
      setRoles(prev => prev.map(r =>
        r.id === modalPermisos.rol.id
          ? { ...r, modulosActivosCount: modulosActivos }
          : r
      ));
    } catch (error: any) {
      console.error('Error guardando permisos:', error);
      alert('Error al guardar permisos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES MÓDULOS ==========
  const verDetallesModulo = (modulo: any) => {
    setModalDetalles({
      isOpen: true,
      titulo: `Detalles del Módulo`,
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Información del Módulo" variant="blue">
            <div className="space-y-3">
              <InfoRow label="Nombre" value={modulo.nombre} />
              <InfoRow label="Descripción" value={modulo.descripcion || 'Sin descripción'} />
            </div>
          </InfoCard>

          <InfoCard title="Configuración" variant="emerald">
            <div className="space-y-3">
              <InfoRow
                label="Ruta"
                value={
                  <code className={`font-mono px-2 py-1 rounded-lg text-sm ${
                    isDark
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    {modulo.ruta}
                  </code>
                }
              />
            </div>
          </InfoCard>
        </div>
      )
    });
  };

  const crearModulo = () => {
    setModalEditar({
      isOpen: true,
      titulo: "Crear Nuevo Módulo",
      fields: {
        nombre: "",
        descripcion: "",
        ruta: ""
      },
      tipo: "modulo"
    });
  };

  const editarModulo = (modulo: any) => {
    setModalEditar({
      isOpen: true,
      titulo: "Editar Módulo",
      fields: {
        id: modulo.id,
        nombre: modulo.nombre,
        descripcion: modulo.descripcion,
        ruta: modulo.ruta
      },
      tipo: "modulo"
    });
  };

  const guardarModulo = async (formData: any) => {
    try {
      setLoading(true);

      if (formData.id) {
        const moduloActualizado = await accesosService.updateModulo(formData.id, formData);
        setModulos(prev => prev.map(m => m.id === formData.id ? moduloActualizado : m));
      } else {
        const nuevoModulo = await accesosService.createModulo(formData);
        setModulos(prev => [...prev, nuevoModulo]);
      }
    } catch (error: any) {
      console.error('Error guardando módulo:', error);
      alert('Error al guardar módulo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarDatosReniec = async () => {
    const dni = modalEditar.fields.numeroDocumento;

    if (!dni || dni.length !== 8) {
      alert("Por favor ingrese un DNI válido de 8 dígitos.");
      return;
    }

    try {
      setLoading(true);

      const datosPersona = await accesosService.consultarReniec(dni);

      if (datosPersona) {
        setModalEditar(prev => ({
          ...prev,
          fields: {
            ...prev.fields,
            nombres: datosPersona.nombres || '',
            apellidoPaterno: datosPersona.apellidoPaterno || '',
            apellidoMaterno: datosPersona.apellidoMaterno || '',
            direccion: datosPersona.direccion || prev.fields.direccion || ''
          }
        }));
      }
    } catch (error: any) {
      console.error('Error consultando RENIEC:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminarModulo = (modulo: any) => {
    setModalConfirmar({
      isOpen: true,
      titulo: "Eliminar Módulo",
      mensaje: `¿Estás seguro de que deseas eliminar el módulo "${modulo.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await accesosService.deleteModulo(modulo.id);
          setModulos(prev => prev.filter(m => m.id !== modulo.id));
        } catch (error: any) {
          console.error('Error eliminando módulo:', error);
          alert('Error al eliminar módulo: ' + error.message);
        }
      },
      tipo: "eliminar"
    });
  };

  const handleSaveFromModal = (formData: any) => {
    if (modalEditar.tipo === "usuario") guardarUsuario(formData);
    if (modalEditar.tipo === "rol") guardarRol(formData);
    if (modalEditar.tipo === "modulo") guardarModulo(formData);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <PageWrapper
      title="Gestión de Accesos"
      subtitle="Administra usuarios, roles y permisos del sistema — Peru Market"
      icon={<FiShield />}
      onRefresh={cargarDatosIniciales}
      refreshing={loading}
    >
      <div className="space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} isDark={isDark} />
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`
              p-3 rounded-lg transition-all duration-200 border
              ${isDark
                ? 'bg-[#171717] text-gray-300 border-neutral-800 hover:bg-neutral-800'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
            `}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Tabs - Desktop */}
        <div className={`
          hidden lg:flex items-center gap-2 p-2 rounded-xl mb-6 border
          ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200 shadow-sm'}
        `}>
          {tabs.map((t) => (
            <TabButton
              key={t.id}
              {...t}
              isActive={tab === t.id}
              onClick={() => setTab(t.id)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Mobile Tabs */}
        {mobileMenuOpen && (
          <div className={`
            lg:hidden flex flex-col gap-2 p-3 rounded-xl mb-6 border
            ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200 shadow-sm'}
          `}>
            {tabs.map((t) => (
              <TabButton
                key={t.id}
                {...t}
                isActive={tab === t.id}
                onClick={() => { setTab(t.id); setMobileMenuOpen(false); }}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`p-8 rounded-xl border ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200 shadow-lg'}`}>
              <div
                className="animate-spin rounded-full h-10 w-10 border-3 border-t-transparent mx-auto"
                style={{ borderColor: `${COLORS.primary}30`, borderTopColor: COLORS.primary }}
              />
              <p className={`mt-4 font-medium text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Procesando...
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* USUARIOS */}
          {tab === "usuarios" && (
            <div>
              <FiltersBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                roleFilter={roleFilter}
                onRoleChange={setRoleFilter}
                roles={rolesDropdown}
                showRoleFilter={true}
                showStatusFilter={true}
                onAddNew={crearUsuario}
                addButtonText="Nuevo Usuario"
                onRefresh={cargarDatosIniciales}
                loading={loading}
                isDark={isDark}
              />

              <UsuariosTab
                usuarios={usuarios}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                roleFilter={roleFilter}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onVerDetalles={verDetallesUsuario}
                onEditar={editarUsuario}
                onEliminar={confirmarEliminarUsuario}
                getNombreCompleto={getNombreCompleto}
                getEstadoColor={getEstadoColor}
                getRolColor={getRolColor}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* ROLES */}
          {tab === "roles" && (
            <div>
              <FiltersBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter=""
                onStatusChange={() => {}}
                showStatusFilter={false}
                onAddNew={crearRol}
                addButtonText="Nuevo Rol"
                onRefresh={cargarDatosIniciales}
                loading={loading}
                isDark={isDark}
              />

              <RolesTab
                roles={roles}
                searchTerm={searchTerm}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onVerDetalles={verDetallesRol}
                onEditar={editarRol}
                onEliminar={confirmarEliminarRol}
                onGestionarPermisos={gestionarPermisos}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* MÓDULOS */}
          {tab === "modulos" && (
            <div>
              <FiltersBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                showStatusFilter={true}
                onAddNew={crearModulo}
                addButtonText="Nuevo Módulo"
                onRefresh={cargarDatosIniciales}
                loading={loading}
                isDark={isDark}
              />

              <ModulosTab
                modulos={modulos}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onVerDetalles={verDetallesModulo}
                onEditar={editarModulo}
                onEliminar={confirmarEliminarModulo}
                getEstadoColor={getEstadoColor}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

      {/* Modales */}
      <ModalDetalles
        isOpen={modalDetalles.isOpen}
        titulo={modalDetalles.titulo}
        children={modalDetalles.children}
        onClose={() => setModalDetalles({ isOpen: false, titulo: "", children: null })}
      />

      <ModalEditar
        isOpen={modalEditar.isOpen}
        titulo={modalEditar.titulo}
        fields={modalEditar.fields}
        onSave={handleSaveFromModal}
        onClose={() => setModalEditar({ isOpen: false, titulo: "", fields: {}, tipo: "" })}
        type={modalEditar.tipo}
        rolesDropdown={rolesDropdown}
        onSearchDni={buscarDatosReniec}
        onChangeField={(campo, valor) => {
          setModalEditar(prev => ({
            ...prev,
            fields: { ...prev.fields, [campo]: valor }
          }));
        }}
      />

      <ModalConfirmar
        isOpen={modalConfirmar.isOpen}
        titulo={modalConfirmar.titulo}
        mensaje={modalConfirmar.mensaje}
        onConfirm={modalConfirmar.onConfirm}
        onCancel={() => setModalConfirmar({ isOpen: false, titulo: "", mensaje: "", onConfirm: () => {}, tipo: "eliminar" })}
        tipo={modalConfirmar.tipo}
      />

      <ModalPermisos
        isOpen={modalPermisos.isOpen}
        rol={modalPermisos.rol}
        modulos={modulos}
        permisos={modalPermisos.permisos}
        onSave={guardarPermisos}
        onClose={() => setModalPermisos({ isOpen: false, rol: null, permisos: [] })}
      />
      </div>
    </PageWrapper>
  );
}
