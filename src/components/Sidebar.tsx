import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  FiHome, FiUsers, FiMenu, FiUserCheck, FiUser, FiBox,
  FiShoppingCart, FiClipboard, FiTruck, FiArchive, FiBarChart2,
  FiLogOut, FiX, FiSettings, FiChevronRight, FiChevronLeft, FiChevronDown
} from "react-icons/fi";
import type { AuthData, Module } from "../types/auth";
import ModalConfirmarLogout from "./modals/ModalConfirmarLogout";
import { authService } from "../services/authService";
import JinnovaMarketLogo from "../resources/PeruMarketERPLogo.png";

// Definición de categorías con sus módulos
const MODULE_CATEGORIES = {
  general: {
    label: 'General',
    modules: ['Dashboard']
  },
  gestion: {
    label: 'Gestión',
    modules: ['Clientes', 'Empleados', 'Proveedores']
  },
  operaciones: {
    label: 'Operaciones',
    modules: ['Inventario', 'Ventas', 'Compras', 'Pedidos', 'Envios']
  },
  sistema: {
    label: 'Sistema',
    modules: ['Accesos', 'Reportes']
  }
};

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['general', 'gestion', 'operaciones', 'sistema']);

  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsedData: AuthData = JSON.parse(authData);
        if (parsedData.modules && Array.isArray(parsedData.modules)) {
          setModules(parsedData.modules);
        }
      }
    } catch (error) {
      console.error('Error cargando modulos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [navigate]);

  const getModuleConfig = (moduleName: string) => {
    const configMap: { [key: string]: { icon: any; route: string } } = {
      'Dashboard': { icon: FiHome, route: '/dashboard' },
      'Accesos': { icon: FiUsers, route: '/accesos' },
      'Empleados': { icon: FiUserCheck, route: '/empleados' },
      'Clientes': { icon: FiUser, route: '/clientes' },
      'Inventario': { icon: FiBox, route: '/inventario' },
      'Ventas': { icon: FiShoppingCart, route: '/ventas' },
      'Pedidos': { icon: FiClipboard, route: '/pedidos' },
      'Compras': { icon: FiArchive, route: '/compras' },
      'Proveedores': { icon: FiUsers, route: '/proveedores' },
      'Envios': { icon: FiTruck, route: '/envios' },
      'Reportes': { icon: FiBarChart2, route: '/reportes' },
    };
    return configMap[moduleName] || { icon: FiBox, route: `/${moduleName.toLowerCase().replace(/\s+/g, '-')}` };
  };

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    await authService.logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Filtrar módulos por categoría
  const getModulesByCategory = (categoryModules: string[]) => {
    return modules.filter(m => categoryModules.includes(m.nombre));
  };

  // MenuItem component
  const MenuItem = ({ name, icon: Icon, route, isMobile = false }: { name: string, icon: any, route: string, isMobile?: boolean }) => {
    const isActive = location.pathname.startsWith(route);

    return (
      <Link
        to={route}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
          ${isActive
            ? 'bg-[#E0312A] text-white'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
          }
          ${!open && !isMobile ? 'justify-center px-2' : 'ml-3'}
        `}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          size={18}
          className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#F0726A]'}`}
        />
        {(open || isMobile) && (
          <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : ''}`}>
            {name}
          </span>
        )}
      </Link>
    );
  };

  // Category component
  const Category = ({ categoryKey, label, categoryModules, isMobile = false }: { categoryKey: string, label: string, categoryModules: string[], isMobile?: boolean }) => {
    const filteredModules = getModulesByCategory(categoryModules);
    const isExpanded = expandedCategories.includes(categoryKey);

    if (filteredModules.length === 0) return null;

    return (
      <div className="mb-2">
        {(open || isMobile) ? (
          <button
            onClick={() => toggleCategory(categoryKey)}
            className="w-full flex items-center justify-between px-3 py-2 text-gray-500 hover:text-white transition-colors"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
            <FiChevronDown
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
            />
          </button>
        ) : (
          <div className="w-full h-px bg-white/10 my-2"></div>
        )}

        {(isExpanded || !open) && (
          <div className="space-y-1">
            {filteredModules.map((module) => {
              const config = getModuleConfig(module.nombre);
              return <MenuItem key={module.id} name={module.nombre} icon={config.icon} route={config.route} isMobile={isMobile} />;
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-72 h-screen bg-[#000000] hidden lg:flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E0312A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR DESKTOP */}
      <div className={`hidden lg:flex flex-col h-screen bg-[#000000] transition-all duration-300 ${open ? "w-72" : "w-20"}`}>

        {/* Header con logo */}
        <div className={`flex flex-col items-center border-b border-white/10 ${open ? 'p-4' : 'p-3'}`}>
          {open ? (
            <div className="flex items-center gap-3 w-full">
              {/* Logo */}
              <div className="w-14 h-14 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-lg shadow-black/30 flex-shrink-0">
                <img
                  src={JinnovaMarketLogo}
                  className="w-full h-full object-contain"
                  alt="Peru Market"
                />
              </div>
              {/* Nombre */}
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-white text-base tracking-tight">Peru Market</h1>
                <p className="text-[10px] text-[#F0726A] font-medium uppercase tracking-wider">Sistema ERP</p>
              </div>
              {/* Botón colapsar */}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
              >
                <FiChevronLeft size={18} />
              </button>
            </div>
          ) : (
            <>
              {/* Logo pequeño cuando está colapsado */}
              <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-lg shadow-black/30">
                <img src={JinnovaMarketLogo} className="w-full h-full object-contain" alt="Peru Market" />
              </div>
              {/* Botón expandir */}
              <button
                onClick={() => setOpen(true)}
                className="mt-3 p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
              >
                <FiChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Navegación con categorías */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {Object.entries(MODULE_CATEGORIES).map(([key, { label, modules: categoryModules }]) => (
            <Category
              key={key}
              categoryKey={key}
              label={label}
              categoryModules={categoryModules}
            />
          ))}

          {modules.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay módulos disponibles
            </div>
          )}

          {/* Separador */}
          <div className="my-4 border-t border-white/10"></div>

          {/* Configuración */}
          {open && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2 px-3">
              Configuración
            </p>
          )}
          <MenuItem name="Ajustes" icon={FiSettings} route="/settings" />
        </nav>

        {/* Footer con logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200
              text-gray-500 hover:bg-red-500/20 hover:text-red-400
              ${!open ? 'justify-center px-2' : ''}
            `}
          >
            <FiLogOut size={20} className="flex-shrink-0" />
            {open && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* SIDEBAR MOBILE */}
      <div className="lg:hidden">
        {/* Botón hamburguesa */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-30 p-2.5 bg-[#000000] rounded-xl shadow-lg border border-white/10"
        >
          <FiMenu size={22} className="text-white" />
        </button>

        {/* Sidebar móvil */}
        <div
          ref={sidebarRef}
          className={`
            fixed top-0 left-0 h-full w-80 bg-[#000000] z-50 shadow-2xl
            transform transition-transform duration-300 flex flex-col
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Header con logo */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-lg shadow-black/30 flex-shrink-0">
                <img
                  src={JinnovaMarketLogo}
                  className="w-full h-full object-contain"
                  alt="Peru Market"
                />
              </div>
              {/* Nombre */}
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-white text-base tracking-tight">Peru Market</h1>
                <p className="text-[10px] text-[#F0726A] font-medium uppercase tracking-wider">Sistema ERP</p>
              </div>
              {/* Botón cerrar */}
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {Object.entries(MODULE_CATEGORIES).map(([key, { label, modules: categoryModules }]) => (
              <Category
                key={key}
                categoryKey={key}
                label={label}
                categoryModules={categoryModules}
                isMobile
              />
            ))}

            <div className="my-4 border-t border-white/10"></div>

            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2 px-3">
              Configuración
            </p>

            <MenuItem name="Ajustes" icon={FiSettings} route="/settings" isMobile />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
            >
              <FiLogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <ModalConfirmarLogout
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
