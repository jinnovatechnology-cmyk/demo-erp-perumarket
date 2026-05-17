import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiSettings, FiChevronDown, FiBell, FiSun, FiMoon } from "react-icons/fi";
import ModalConfirmarLogout from "./modals/ModalConfirmarLogout";
import { authService } from "../services/authService";
import { useTheme } from "../context/ThemeContext";

interface UserInfo {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  rol: string;
  email: string;
}

interface AuthData {
  success: boolean;
  message: string;
  token: string;
  user: UserInfo;
  modules: any[];
}

// Verde Lima - Color primario fijo
const VERDE_LIMA = {
  400: "#7abf4e",
  500: "#4A7C23",
  600: "#3d6a1c",
};

export default function Header() {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === "dark";

  const [user, setUser] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsedData: AuthData = JSON.parse(authData);
        if (parsedData.user) setUser(parsedData.user);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowDropdown(false);
  };

  const confirmLogout = async () => {
    await authService.logout();
    setShowLogoutModal(false);
    window.location.href = "/login";
  };

  const getNombreCompleto = () => {
    if (!user) return "Usuario";
    return `${user.nombres} ${user.apellidos}`.trim();
  };

  const getIniciales = () => {
    if (!user) return "U";
    const nombres = user.nombres.split(' ');
    const apellidos = user.apellidos.split(' ');
    let iniciales = '';
    if (nombres.length > 0) iniciales += nombres[0].charAt(0);
    if (apellidos.length > 0) iniciales += apellidos[0].charAt(0);
    return iniciales.toUpperCase() || "U";
  };

  return (
    <>
      <header className={`w-full h-[70px] flex justify-end items-center px-6 border-b sticky top-0 z-20 transition-colors duration-300 ${
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
      }`}>
        <div className="flex items-center gap-6">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleMode}
            className={`relative p-2 rounded-full transition-all duration-200 ${
              isDark ? "text-yellow-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-50"
            }`}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button
            className={`relative p-2 rounded-full transition-all duration-200 ${
              isDark ? "text-gray-400 hover:bg-gray-800 hover:text-[#4A7C23]" : "text-gray-400 hover:bg-gray-50 hover:text-[#4A7C23]"
            }`}
            aria-label="Ver notificaciones"
          >
            <FiBell className="w-5 h-5" />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full border"
              style={{ backgroundColor: VERDE_LIMA[500], borderColor: isDark ? '#111827' : '#ffffff' }}
              aria-hidden="true"
            ></span>
          </button>

          <div className={`h-8 w-[1px] hidden md:block ${isDark ? "bg-gray-700" : "bg-gray-100"}`} aria-hidden="true"></div>

          {/* User section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-3 p-1.5 pl-3 rounded-full border border-transparent transition-all duration-200 group ${
                isDark ? "hover:bg-gray-800 hover:border-gray-700" : "hover:bg-gray-50 hover:border-gray-100"
              }`}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <div className="text-right hidden md:block mr-1">
                <span className={`font-bold text-sm block leading-tight ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  {getNombreCompleto()}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase block mt-0.5 text-[#4A7C23]">
                  {user?.rol || "USUARIO"}
                </span>
              </div>

              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${VERDE_LIMA[400]}, ${VERDE_LIMA[600]})`,
                  boxShadow: `0 4px 12px -2px rgba(224, 49, 42, 0.4)`
                }}
              >
                {user?.nombres ? getIniciales() : <FiUser className="w-5 h-5" />}
              </div>

              <FiChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''} ${isDark ? "text-gray-400" : "text-gray-400"}`}
                style={showDropdown ? { color: VERDE_LIMA[500] } : {}}
                aria-hidden="true"
              />
            </button>

            {showDropdown && (
              <div
                className={`absolute right-0 top-[110%] w-64 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border py-2 animate-fadeIn origin-top-right overflow-hidden ${
                  isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
                role="menu"
              >
                {/* Mobile header */}
                <div className={`px-5 py-4 border-b md:hidden ${isDark ? "border-gray-700 bg-gray-700/50" : "border-gray-50 bg-gray-50/50"}`}>
                  <p className={`text-sm font-bold truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>{getNombreCompleto()}</p>
                  <p className={`text-xs truncate mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>@{user?.username}</p>
                </div>

                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setShowDropdown(false); navigate("/settings"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors group ${
                      isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-50"
                    }`}
                    role="menuitem"
                  >
                    <div className={`p-2 rounded-lg transition-colors ${isDark ? "bg-gray-700 text-gray-400 group-hover:text-gray-200" : "bg-gray-100 text-gray-500"}`}>
                      <FiUser size={16} />
                    </div>
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => { setShowDropdown(false); navigate("/settings"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors group ${
                      isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-50"
                    }`}
                    role="menuitem"
                  >
                    <div className={`p-2 rounded-lg transition-colors ${isDark ? "bg-gray-700 text-gray-400 group-hover:text-gray-200" : "bg-gray-100 text-gray-500"}`}>
                      <FiSettings size={16} />
                    </div>
                    <span>Configuracion</span>
                  </button>
                </div>

                <div className={`border-t mx-2 my-1 pt-1 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors group ${
                      isDark ? "text-red-400 hover:bg-red-900/20" : "text-red-500 hover:bg-red-50"
                    }`}
                    role="menuitem"
                  >
                    <div className={`p-2 rounded-lg transition-all ${isDark ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-500"}`}>
                      <FiLogOut size={16} />
                    </div>
                    <span>Cerrar Sesion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ModalConfirmarLogout
          isOpen={showLogoutModal}
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </header>
    </>
  );
}
