/**
 * Settings.tsx - Módulo de Configuración
 * Diseño Power BI - Estilo profesional (igual que Empleados)
 */

import { useState, useEffect } from "react";
import {
  FiSettings, FiUser, FiLock, FiSun, FiMoon, FiInfo,
  FiSave, FiMail, FiPhone, FiMapPin, FiShield, FiCheck,
  FiAlertCircle, FiEye, FiEyeOff, FiCheckCircle, FiX,
  FiDatabase, FiCpu, FiCode, FiRefreshCw, FiChevronDown,
  FiChevronRight, FiCopy, FiHash, FiCalendar, FiKey,
  FiLayers, FiActivity
} from "react-icons/fi";
import { configuracionService } from "../../services/configuracionService";
import type { ProfileData, UpdateProfileRequest, SystemInfo } from "../../services/configuracionService";
import { useTheme } from "../../context/ThemeContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import PageWrapper from "../../components/ui/PageWrapper";

type Tab = "perfil" | "seguridad" | "apariencia" | "sistema" | "debug";

/* ═══════════════════════════════════════════════════════════════════════════
   KPI CARD - Tarjeta de estadística estilo Power BI
   ═══════════════════════════════════════════════════════════════════════════ */
interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'purple' | 'neutral';
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
    purple: {
      iconBg: isDark ? 'bg-purple-500/20' : 'bg-purple-50',
      iconColor: isDark ? 'text-purple-400' : 'text-purple-600',
      value: isDark ? 'text-purple-400' : 'text-purple-600'
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
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-lg font-bold truncate ${styles.value}`}>
            {value}
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
  noPadding?: boolean;
}

const SectionCard = ({ title, subtitle, children, isDark, headerAction, noPadding }: SectionCardProps) => (
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
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   TAB BUTTON
   ═══════════════════════════════════════════════════════════════════════════ */
interface TabButtonProps {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  isDark: boolean;
}

const TabButton = ({ label, icon, isActive, onClick, isDark }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
      ${isActive
        ? 'text-white bg-[#E0312A]'
        : isDark
          ? 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }
    `}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
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
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Settings() {
  const { mode, setMode } = useTheme();
  const { isDark } = useThemeClasses();

  const [tab, setTab] = useState<Tab>("perfil");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({
    nombres: "", apellidoPaterno: "", apellidoMaterno: "",
    correo: "", telefono: "", direccion: ""
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Debug
  const [debugExpanded, setDebugExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const getUserId = (): number | null => {
    try {
      const authData = localStorage.getItem("auth");
      if (authData) return JSON.parse(authData).user?.id || null;
    } catch { /* ignore */ }
    return null;
  };

  const getAuthData = () => {
    try {
      const auth = localStorage.getItem("auth");
      return auth ? JSON.parse(auth) : null;
    } catch { return null; }
  };

  const getLocalStorageData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? (value.startsWith('{') || value.startsWith('[') ? JSON.parse(value) : value) : null;
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => { if (tab === "sistema" && !systemInfo) loadSystemInfo(); }, [tab, systemInfo]);
  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 4000); return () => clearTimeout(t); } }, [successMsg]);
  useEffect(() => { if (errorMsg) { const t = setTimeout(() => setErrorMsg(""), 5000); return () => clearTimeout(t); } }, [errorMsg]);

  const loadProfile = async () => {
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await configuracionService.getProfile(userId);
      setProfile(data);
      setProfileForm({
        nombres: data.persona.nombres || "",
        apellidoPaterno: data.persona.apellidoPaterno || "",
        apellidoMaterno: data.persona.apellidoMaterno || "",
        correo: data.persona.correo || "",
        telefono: data.persona.telefono || "",
        direccion: data.persona.direccion || ""
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMsg("Error al cargar el perfil: " + message);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const data = await configuracionService.getSystemInfo();
      setSystemInfo(data);
    } catch (error) {
      console.error("Error loading system info:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) return;
    try {
      setSaving(true);
      const updated = await configuracionService.updateProfile(userId, profileForm);
      setProfile(updated);
      setSuccessMsg("Perfil actualizado correctamente");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMsg("Error al actualizar: " + message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }
    const userId = getUserId();
    if (!userId) return;
    try {
      setSaving(true);
      await configuracionService.changePassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccessMsg("Contraseña actualizada correctamente");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMsg("Error al cambiar contraseña: " + message);
    } finally {
      setSaving(false);
    }
  };

  const getNombreCompleto = () => {
    if (!profile?.persona) return "Usuario";
    const { nombres, apellidoPaterno, apellidoMaterno } = profile.persona;
    return `${nombres || ''} ${apellidoPaterno || ''} ${apellidoMaterno || ''}`.trim() || "Usuario";
  };

  const getIniciales = () => {
    if (!profile?.persona) return "U";
    const n = profile.persona.nombres?.[0] || "";
    const a = profile.persona.apellidoPaterno?.[0] || "";
    return (n + a).toUpperCase() || "U";
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "perfil", label: "Mi Perfil", icon: <FiUser size={18} /> },
    { id: "seguridad", label: "Seguridad", icon: <FiLock size={18} /> },
    { id: "apariencia", label: "Apariencia", icon: isDark ? <FiMoon size={18} /> : <FiSun size={18} /> },
    { id: "sistema", label: "Sistema", icon: <FiInfo size={18} /> },
    { id: "debug", label: "Debug", icon: <FiCode size={18} /> },
  ];

  const inputStyle = `w-full px-4 py-3 rounded-lg border text-sm transition-all outline-none ${
    isDark
      ? "bg-neutral-800 border-neutral-700 text-gray-100 placeholder-gray-500 focus:border-[#E0312A] focus:ring-2 focus:ring-[#E0312A]/20"
      : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#E0312A] focus:ring-2 focus:ring-[#E0312A]/20"
  }`;
  const labelStyle = `block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`;

  // Loading state
  if (loading) {
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
      title="Configuración"
      subtitle="Gestiona tu perfil, seguridad y preferencias del sistema"
      icon={<FiSettings />}
    >
      <div className="space-y-6">

        {/* ═══ ALERTAS ═══ */}
        {successMsg && (
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border animate-fadeIn
            ${isDark ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}
          `}>
            <FiCheckCircle size={18} />
            <span className="text-sm font-medium">{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="ml-auto">
              <FiX size={16} />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border
            ${isDark ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}
          `}>
            <FiAlertCircle size={18} />
            <span className="text-sm font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="ml-auto">
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* ═══ KPI CARDS ═══ */}
        {profile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Usuario"
              value={`@${profile.username}`}
              icon={<FiUser className="w-6 h-6" />}
              color="neutral"
              isDark={isDark}
            />
            <KPICard
              title="Documento"
              value={profile.persona.numeroDocumento || "No registrado"}
              icon={<FiHash className="w-6 h-6" />}
              color="blue"
              isDark={isDark}
            />
            <KPICard
              title="Rol"
              value={profile.rol.nombre}
              icon={<FiShield className="w-6 h-6" />}
              color="purple"
              isDark={isDark}
            />
            <KPICard
              title="Estado"
              value={profile.estado}
              icon={<FiCheckCircle className="w-6 h-6" />}
              color={profile.estado === "ACTIVO" ? "green" : "amber"}
              isDark={isDark}
            />
          </div>
        )}

        {/* ═══ TABS ═══ */}
        <div className={`
          flex flex-wrap items-center gap-1 p-1.5 rounded-xl border
          ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
        `}>
          {tabs.map((t) => (
            <TabButton
              key={t.id}
              id={t.id}
              label={t.label}
              icon={t.icon}
              isActive={tab === t.id}
              onClick={() => setTab(t.id)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* ═══ SAVING OVERLAY ═══ */}
        {saving && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto" style={{ borderColor: '#E0312A30', borderTopColor: '#E0312A' }} />
              <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Guardando...</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
           TAB: PERFIL
           ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "perfil" && profile && (
          <div className="space-y-6">
            {/* Profile Card */}
            <SectionCard title="Información del Usuario" subtitle="Tu identidad en el sistema" isDark={isDark}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-neutral-800">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl bg-[#E0312A]"
                >
                  {getIniciales()}
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getNombreCompleto()}</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>@{profile.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-blue-600">
                      <FiShield size={12} />
                      {profile.rol.nombre}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      profile.estado === "ACTIVO"
                        ? isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                        : isDark ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {profile.estado}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account info grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Usuario", value: `@${profile.username}`, icon: <FiUser size={14} /> },
                  { label: "Documento", value: `${profile.persona.tipoDocumento || 'DNI'} - ${profile.persona.numeroDocumento || 'N/R'}`, icon: <FiHash size={14} /> },
                  { label: "Fecha Nacimiento", value: profile.persona.fechaNacimiento || "No registrada", icon: <FiCalendar size={14} /> },
                  { label: "ID Usuario", value: `#${profile.id}`, icon: <FiKey size={14} /> }
                ].map((item) => (
                  <div key={item.label} className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{item.icon}</span>
                      <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</p>
                    </div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Edit Profile Form */}
            <SectionCard title="Editar Información Personal" subtitle="Actualiza tus datos de contacto" isDark={isDark}>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelStyle}>Nombres</label>
                    <input type="text" value={profileForm.nombres} onChange={(e) => setProfileForm({ ...profileForm, nombres: e.target.value })} className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>Apellido Paterno</label>
                    <input type="text" value={profileForm.apellidoPaterno} onChange={(e) => setProfileForm({ ...profileForm, apellidoPaterno: e.target.value })} className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>Apellido Materno</label>
                    <input type="text" value={profileForm.apellidoMaterno} onChange={(e) => setProfileForm({ ...profileForm, apellidoMaterno: e.target.value })} className={inputStyle} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}><FiMail className="inline mr-1.5" size={14} />Correo</label>
                    <input type="email" value={profileForm.correo} onChange={(e) => setProfileForm({ ...profileForm, correo: e.target.value })} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}><FiPhone className="inline mr-1.5" size={14} />Teléfono</label>
                    <input type="text" value={profileForm.telefono} onChange={(e) => setProfileForm({ ...profileForm, telefono: e.target.value })} className={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}><FiMapPin className="inline mr-1.5" size={14} />Dirección</label>
                  <input type="text" value={profileForm.direccion} onChange={(e) => setProfileForm({ ...profileForm, direccion: e.target.value })} className={inputStyle} />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all bg-[#E0312A] hover:bg-[#A91E16] disabled:opacity-50">
                    <FiSave size={16} /> Guardar Cambios
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
           TAB: SEGURIDAD
           ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "seguridad" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Cambiar Contraseña" subtitle="Mantén tu cuenta segura" isDark={isDark}>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className={labelStyle}>Contraseña Actual</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className={inputStyle}
                      required
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                      {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className={inputStyle}
                      required
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className={`${inputStyle} ${
                      passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                    required
                  />
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving || (passwordForm.confirmPassword !== "" && passwordForm.newPassword !== passwordForm.confirmPassword)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all bg-[#E0312A] hover:bg-[#A91E16] disabled:opacity-50"
                >
                  <FiLock size={16} /> Actualizar Contraseña
                </button>
              </form>
            </SectionCard>

            <SectionCard title="Recomendaciones de Seguridad" subtitle="Consejos para proteger tu cuenta" isDark={isDark}>
              <ul className="space-y-4">
                {[
                  "Usa al menos 8 caracteres con letras, números y símbolos",
                  "No reutilices contraseñas de otros servicios",
                  "Cambia tu contraseña periódicamente",
                  "No compartas tu contraseña con nadie"
                ].map((tip, i) => (
                  <li key={i} className={`flex items-start gap-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="mt-0.5">
                      <FiCheck className="text-emerald-500" size={16} />
                    </div>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
           TAB: APARIENCIA
           ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "apariencia" && (
          <SectionCard title="Modo de Visualización" subtitle="Elige entre modo claro u oscuro" isDark={isDark}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              {/* Light mode */}
              <button
                onClick={() => setMode("light")}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  mode === "light"
                    ? 'border-[#E0312A]'
                    : isDark ? 'border-neutral-700 hover:border-neutral-600' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {mode === "light" && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white bg-[#E0312A]">
                    <FiCheck size={12} />
                  </div>
                )}
                <div className={`w-full h-20 rounded-lg mb-4 flex items-center justify-center ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
                  <div className="w-3/4 flex gap-2">
                    <div className="w-8 h-14 bg-gray-800 rounded"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-white rounded border border-gray-200"></div>
                      <div className="h-6 bg-white rounded border border-gray-200"></div>
                      <div className="h-2.5 bg-[#E0312A] rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiSun size={20} className="text-amber-500" />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Modo Claro</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Fondo blanco, ideal para el día</p>
                  </div>
                </div>
              </button>

              {/* Dark mode */}
              <button
                onClick={() => setMode("dark")}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  mode === "dark"
                    ? 'border-[#E0312A]'
                    : isDark ? 'border-neutral-700 hover:border-neutral-600' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {mode === "dark" && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white bg-[#E0312A]">
                    <FiCheck size={12} />
                  </div>
                )}
                <div className={`w-full h-20 rounded-lg mb-4 flex items-center justify-center bg-gray-800`}>
                  <div className="w-3/4 flex gap-2">
                    <div className="w-8 h-14 bg-gray-900 rounded border border-gray-700"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-gray-700 rounded"></div>
                      <div className="h-6 bg-gray-700 rounded"></div>
                      <div className="h-2.5 bg-[#E0312A] rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMoon size={20} className="text-indigo-400" />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Modo Oscuro</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Reduce fatiga visual en la noche</p>
                  </div>
                </div>
              </button>
            </div>
          </SectionCard>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
           TAB: SISTEMA
           ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "sistema" && (
          <div className="space-y-6">
            <SectionCard title="Información del Sistema" subtitle="Datos generales del ERP" isDark={isDark}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Aplicación", value: systemInfo?.nombre || "PeruMarket ERP", icon: <FiLayers className="w-5 h-5" />, color: 'green' as const },
                  { label: "Versión", value: systemInfo?.version || "1.0.0", icon: <FiHash className="w-5 h-5" />, color: 'blue' as const },
                  { label: "Usuarios Activos", value: String(systemInfo?.usuariosActivos ?? "-"), icon: <FiActivity className="w-5 h-5" />, color: 'amber' as const },
                  { label: "Total Usuarios", value: String(systemInfo?.totalUsuarios ?? "-"), icon: <FiUser className="w-5 h-5" />, color: 'purple' as const },
                ].map((item) => (
                  <div key={item.label} className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}`}>
                    <div className={`flex items-center gap-2 mb-2 ${
                      item.color === 'green' ? 'text-[#E0312A]' :
                      item.color === 'blue' ? (isDark ? 'text-blue-400' : 'text-blue-600') :
                      item.color === 'amber' ? (isDark ? 'text-amber-400' : 'text-amber-600') :
                      (isDark ? 'text-purple-400' : 'text-purple-600')
                    }`}>
                      {item.icon}
                      <p className="text-xs font-medium uppercase tracking-wider">{item.label}</p>
                    </div>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {profile && (
              <SectionCard title="Sesión Actual" subtitle="Información de tu sesión" isDark={isDark}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Usuario", value: `@${profile.username}` },
                    { label: "Rol", value: profile.rol.nombre },
                    { label: "Estado", value: profile.estado, isBadge: true }
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800/50' : 'bg-gray-50'}`}>
                      <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</p>
                      {item.isBadge ? (
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          item.value === "ACTIVO"
                            ? isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                            : isDark ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-700'
                        }`}>{item.value}</span>
                      ) : (
                        <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
           TAB: DEBUG
           ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "debug" && (
          <div className="space-y-4">
            {/* Auth Data */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
              <button
                onClick={() => setDebugExpanded(prev => ({ ...prev, auth: !prev.auth }))}
                className={`w-full px-6 py-4 flex items-center justify-between ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                    <FiDatabase className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Auth Data (localStorage)</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Datos de autenticación guardados</p>
                  </div>
                </div>
                {debugExpanded.auth ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
              </button>
              {debugExpanded.auth && (
                <div className={`px-6 pb-5 border-t ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>JSON</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(getAuthData(), null, 2), 'auth')}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        {copied === 'auth' ? <FiCheck size={14} /> : <FiCopy size={14} />}
                        {copied === 'auth' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <pre className={`text-xs p-4 rounded-lg overflow-x-auto ${isDark ? 'bg-neutral-900 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                      {JSON.stringify(getAuthData(), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Data */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
              <button
                onClick={() => setDebugExpanded(prev => ({ ...prev, profile: !prev.profile }))}
                className={`w-full px-6 py-4 flex items-center justify-between ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                    <FiUser className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Data (API)</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Datos del perfil desde el servidor</p>
                  </div>
                </div>
                {debugExpanded.profile ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
              </button>
              {debugExpanded.profile && (
                <div className={`px-6 pb-5 border-t ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>JSON</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(profile, null, 2), 'profile')}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        {copied === 'profile' ? <FiCheck size={14} /> : <FiCopy size={14} />}
                        {copied === 'profile' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <pre className={`text-xs p-4 rounded-lg overflow-x-auto ${isDark ? 'bg-neutral-900 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                      {JSON.stringify(profile, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* All localStorage */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}`}>
              <button
                onClick={() => setDebugExpanded(prev => ({ ...prev, storage: !prev.storage }))}
                className={`w-full px-6 py-4 flex items-center justify-between ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isDark ? 'bg-amber-500/20' : 'bg-amber-50'}`}>
                    <FiCpu className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Todo LocalStorage</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Todos los datos almacenados</p>
                  </div>
                </div>
                {debugExpanded.storage ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
              </button>
              {debugExpanded.storage && (
                <div className={`px-6 pb-5 border-t ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>JSON</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(getLocalStorageData(), null, 2), 'storage')}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        {copied === 'storage' ? <FiCheck size={14} /> : <FiCopy size={14} />}
                        {copied === 'storage' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <pre className={`text-xs p-4 rounded-lg overflow-x-auto max-h-96 ${isDark ? 'bg-neutral-900 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                      {JSON.stringify(getLocalStorageData(), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Debug Actions */}
            <SectionCard title="Acciones de Debug" subtitle="Herramientas para desarrolladores" isDark={isDark}>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={loadProfile}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-300 hover:bg-neutral-700' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
                >
                  <FiRefreshCw size={16} />
                  Recargar Perfil
                </button>
                <button
                  onClick={() => { console.log('Auth Data:', getAuthData()); console.log('Profile:', profile); console.log('LocalStorage:', getLocalStorageData()); }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                  <FiCode size={16} />
                  Log to Console
                </button>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
