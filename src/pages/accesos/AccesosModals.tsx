/**
 * AccesosModals.tsx - Modales profesionales con UX mejorada
 * Soporta dark/light mode y es completamente responsive
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  FiX,
  FiCheck,
  FiAlertCircle,
  FiAlertTriangle,
  FiEyeOff,
  FiEye,
  FiSearch,
  FiShield,
  FiSettings,
  FiUser,
  FiLock,
  FiMail,
  FiFileText,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiHash,
} from "react-icons/fi";
import { useThemeClasses } from "../../hooks/useThemeClasses";

/* ═══════════════════════════════════════════════════════════════════════════
   BASE MODAL WRAPPER - Componente base para todos los modales
   ═══════════════════════════════════════════════════════════════════════════ */

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = "lg",
}) => {
  const { isDark } = useThemeClasses();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative w-full ${maxWidthClasses[maxWidth]} transform transition-all duration-300
            ${isDark ? "bg-gray-800" : "bg-white"}
            rounded-2xl shadow-2xl border
            ${isDark ? "border-gray-700" : "border-gray-200"}
            animate-modal-enter
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL HEADER - Encabezado del modal
   ═══════════════════════════════════════════════════════════════════════════ */

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  variant?: "default" | "danger" | "success" | "warning";
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  variant = "default",
}) => {
  const { isDark } = useThemeClasses();

  const variantColors = {
    default: {
      iconBg: isDark
        ? "bg-blue-500/20 text-blue-400"
        : "bg-blue-100 text-blue-600",
      titleColor: isDark ? "text-gray-100" : "text-gray-900",
    },
    danger: {
      iconBg: isDark
        ? "bg-rose-500/20 text-rose-400"
        : "bg-rose-100 text-rose-600",
      titleColor: isDark ? "text-rose-400" : "text-rose-700",
    },
    success: {
      iconBg: isDark
        ? "bg-emerald-500/20 text-emerald-400"
        : "bg-emerald-100 text-emerald-600",
      titleColor: isDark ? "text-emerald-400" : "text-emerald-700",
    },
    warning: {
      iconBg: isDark
        ? "bg-amber-500/20 text-amber-400"
        : "bg-amber-100 text-amber-600",
      titleColor: isDark ? "text-amber-400" : "text-amber-700",
    },
  };

  const v = variantColors[variant];

  return (
    <div
      className={`
      flex items-start justify-between p-6 border-b
      ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-100 bg-gray-50/50"}
    `}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`p-3 rounded-xl ${v.iconBg}`}>
            {icon}
          </div>
        )}
        <div>
          <h2
            id="modal-title"
            className={`text-xl font-bold ${v.titleColor}`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className={`
          p-2 rounded-xl transition-all duration-200 hover:scale-105
          ${isDark ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200" : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"}
        `}
        aria-label="Cerrar modal"
      >
        <FiX size={20} />
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL FOOTER - Footer con botones de acción
   ═══════════════════════════════════════════════════════════════════════════ */

interface ModalFooterProps {
  children: React.ReactNode;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  const { isDark } = useThemeClasses();

  return (
    <div
      className={`
      flex flex-col-reverse sm:flex-row gap-3 justify-end p-6 border-t
      ${isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-100 bg-gray-50/30"}
    `}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTONS - Botones estilizados
   ═══════════════════════════════════════════════════════════════════════════ */

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  type = "button",
  fullWidth = false,
}) => {
  const { isDark, colors } = useThemeClasses();

  const variants = {
    primary: `text-white shadow-lg hover:shadow-xl`,
    secondary: `border shadow-sm hover:shadow-md ${
      isDark
        ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
    }`,
    danger:
      "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl",
    success:
      "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
        transition-all duration-200 transform hover:scale-[1.02] active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${fullWidth ? "w-full" : "min-w-[120px]"}
        ${variants[variant]}
      `}
      style={
        variant === "primary"
          ? { background: `linear-gradient(135deg, ${colors[500]}, ${colors[600]})` }
          : {}
      }
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   FORM INPUT - Input de formulario
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  helpText?: string;
  rightElement?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
  error,
  required = false,
  disabled = false,
  maxLength,
  helpText,
  rightElement,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          {icon && (
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {icon}
            </div>
          )}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`
              w-full border rounded-xl px-4 py-3 transition-all duration-200
              focus:ring-2 focus:ring-offset-0 outline-none
              ${icon ? "pl-10" : ""}
              ${rightElement ? "pr-12" : ""}
              ${error ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" : ""}
              ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:ring-blue-500/20 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            `}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
      </div>
      {helpText && !error && (
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="text-rose-500 text-xs flex items-center gap-1">
          <FiAlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   FORM SELECT - Select de formulario
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full border rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer
          focus:ring-2 focus:ring-offset-0 outline-none appearance-none
          ${error ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" : ""}
          ${
            isDark
              ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500/20 focus:border-blue-500"
              : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500/20 focus:border-blue-500"
          }
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.75rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-rose-500 text-xs flex items-center gap-1">
          <FiAlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INFO CARD - Tarjeta de información
   ═══════════════════════════════════════════════════════════════════════════ */

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  variant?: "blue" | "emerald" | "purple" | "amber" | "rose";
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  variant = "blue",
}) => {
  const { isDark } = useThemeClasses();

  const variants = {
    blue: isDark
      ? "bg-blue-900/20 border-blue-800/50"
      : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
    emerald: isDark
      ? "bg-emerald-900/20 border-emerald-800/50"
      : "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100",
    purple: isDark
      ? "bg-purple-900/20 border-purple-800/50"
      : "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100",
    amber: isDark
      ? "bg-amber-900/20 border-amber-800/50"
      : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100",
    rose: isDark
      ? "bg-rose-900/20 border-rose-800/50"
      : "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100",
  };

  return (
    <div className={`rounded-2xl p-6 border ${variants[variant]}`}>
      <h3
        className={`font-bold text-base mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INFO ROW - Fila de información
   ═══════════════════════════════════════════════════════════════════════════ */

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <span
        className={`text-sm font-medium flex items-center gap-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        {icon && <span className="opacity-70">{icon}</span>}
        {label}
      </span>
      <span
        className={`font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL DETALLES - Ver detalles
   ═══════════════════════════════════════════════════════════════════════════ */

export const ModalDetalles = ({
  isOpen,
  titulo,
  subtitulo,
  children,
  onClose,
}: {
  isOpen: boolean;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <ModalHeader title={titulo} subtitle={subtitulo} onClose={onClose} />
      <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </BaseModal>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL EDITAR - Crear/Editar entidades
   ═══════════════════════════════════════════════════════════════════════════ */

export const ModalEditar = ({
  isOpen,
  titulo,
  subtitulo,
  fields,
  onSave,
  onClose,
  type = "edit",
  rolesDropdown = [],
  onSearchDni,
  onChangeField,
}: {
  isOpen: boolean;
  titulo: string;
  subtitulo?: string;
  fields: any;
  onSave: (data: any) => void;
  onClose: () => void;
  type?: string;
  rolesDropdown?: any[];
  onSearchDni?: () => void;
  onChangeField?: (field: string, value: any) => void;
}) => {
  const { isDark } = useThemeClasses();
  const [formData, setFormData] = useState<any>(fields);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loadingDni, setLoadingDni] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (key: string, value: string) => {
      setFormData((prev: any) => ({ ...prev, [key]: value }));
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }));
      }
      onChangeField?.(key, value);
    },
    [errors, onChangeField]
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (type === "usuario") {
      if (!formData.username?.trim())
        newErrors.username = "El usuario es requerido";
      if (!formData.nombres?.trim())
        newErrors.nombres = "Los nombres son requeridos";
      if (!formData.correo?.trim())
        newErrors.correo = "El correo es requerido";
      if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo))
        newErrors.correo = "Correo electrónico inválido";
      if (!formData.idRol) newErrors.idRol = "El rol es requerido";
      if (!formData.id && (!formData.password || formData.password.length < 6)) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }
    }

    if (type === "rol" && !formData.nombre?.trim())
      newErrors.nombre = "El nombre del rol es requerido";
    if (type === "modulo" && !formData.nombre?.trim())
      newErrors.nombre = "El nombre del módulo es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchDni = async () => {
    if (onSearchDni) {
      setLoadingDni(true);
      try {
        await onSearchDni();
      } finally {
        setLoadingDni(false);
      }
    }
  };

  useEffect(() => {
    setFormData(fields);
    setShowPassword(false);
    setErrors({});
  }, [fields, isOpen]);

  const isEdit = !!formData.id;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <ModalHeader
        title={titulo}
        subtitle={subtitulo}
        icon={
          type === "usuario" ? (
            <FiUser size={24} />
          ) : type === "rol" ? (
            <FiLock size={24} />
          ) : (
            <FiSettings size={24} />
          )
        }
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* USUARIO FORM */}
          {type === "usuario" && (
            <>
              {/* Username */}
              <FormInput
                label="Usuario"
                value={formData.username || ""}
                onChange={(v) => handleChange("username", v)}
                icon={<FiUser size={16} />}
                placeholder="nombre.usuario"
                required
                error={errors.username}
              />

              {/* Rol */}
              <FormSelect
                label="Rol del Sistema"
                value={formData.idRol || ""}
                onChange={(v) => handleChange("idRol", v)}
                options={rolesDropdown.map((r) => ({
                  value: String(r.id),
                  label: r.nombre,
                }))}
                placeholder="Seleccionar rol..."
                required
                error={errors.idRol}
              />

              {/* Password */}
              <FormInput
                label="Contraseña"
                value={formData.password || ""}
                onChange={(v) => handleChange("password", v)}
                type={showPassword ? "text" : "password"}
                icon={<FiLock size={16} />}
                placeholder={isEdit ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}
                required={!isEdit}
                error={errors.password}
                helpText={isEdit ? "Dejar vacío para mantener la contraseña actual" : undefined}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />

              {/* Estado */}
              <FormSelect
                label="Estado"
                value={formData.estado || "ACTIVO"}
                onChange={(v) => handleChange("estado", v)}
                options={[
                  { value: "ACTIVO", label: "Activo" },
                  { value: "INACTIVO", label: "Inactivo" },
                ]}
              />

              {/* Separador */}
              <div className={`border-t my-6 ${isDark ? "border-gray-700" : "border-gray-200"}`} />

              <h4 className={`font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Datos Personales
              </h4>

              {/* Tipo y Número de Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Tipo Documento"
                  value={formData.tipoDocumento || "DNI"}
                  onChange={(v) => handleChange("tipoDocumento", v)}
                  options={[
                    { value: "DNI", label: "DNI" },
                    { value: "RUC", label: "RUC" },
                    { value: "PASAPORTE", label: "Pasaporte" },
                    { value: "OTRO", label: "Otro" },
                  ]}
                />
                <div>
                  <FormInput
                    label="N° Documento"
                    value={formData.numeroDocumento || ""}
                    onChange={(v) => handleChange("numeroDocumento", v)}
                    icon={<FiHash size={16} />}
                    placeholder="12345678"
                    maxLength={formData.tipoDocumento === "DNI" ? 8 : 20}
                  />
                  {formData.tipoDocumento === "DNI" &&
                    formData.numeroDocumento?.length === 8 &&
                    onSearchDni && (
                      <button
                        type="button"
                        onClick={handleSearchDni}
                        disabled={loadingDni}
                        className={`
                          mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                          text-sm font-medium transition-all
                          ${
                            isDark
                              ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }
                          disabled:opacity-50
                        `}
                      >
                        {loadingDni ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                            Buscando en RENIEC...
                          </>
                        ) : (
                          <>
                            <FiSearch size={14} />
                            Buscar en RENIEC
                          </>
                        )}
                      </button>
                    )}
                </div>
              </div>

              {/* Nombres */}
              <FormInput
                label="Nombres Completos"
                value={formData.nombres || ""}
                onChange={(v) => handleChange("nombres", v)}
                icon={<FiUser size={16} />}
                placeholder="Juan Carlos"
                required
                error={errors.nombres}
              />

              {/* Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Apellido Paterno"
                  value={formData.apellidoPaterno || ""}
                  onChange={(v) => handleChange("apellidoPaterno", v)}
                  placeholder="García"
                />
                <FormInput
                  label="Apellido Materno"
                  value={formData.apellidoMaterno || ""}
                  onChange={(v) => handleChange("apellidoMaterno", v)}
                  placeholder="López"
                />
              </div>

              {/* Email y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Correo Electrónico"
                  value={formData.correo || ""}
                  onChange={(v) => handleChange("correo", v)}
                  type="email"
                  icon={<FiMail size={16} />}
                  placeholder="correo@ejemplo.com"
                  required
                  error={errors.correo}
                />
                <FormInput
                  label="Teléfono"
                  value={formData.telefono || ""}
                  onChange={(v) => handleChange("telefono", v)}
                  type="tel"
                  icon={<FiPhone size={16} />}
                  placeholder="999 888 777"
                />
              </div>

              {/* Fecha Nacimiento */}
              <FormInput
                label="Fecha de Nacimiento"
                value={formData.fechaNacimiento || ""}
                onChange={(v) => handleChange("fechaNacimiento", v)}
                type="date"
                icon={<FiCalendar size={16} />}
              />

              {/* Dirección */}
              <FormInput
                label="Dirección"
                value={formData.direccion || ""}
                onChange={(v) => handleChange("direccion", v)}
                icon={<FiMapPin size={16} />}
                placeholder="Av. Principal 123, Lima"
              />
            </>
          )}

          {/* ROL FORM */}
          {type === "rol" && (
            <>
              <FormInput
                label="Nombre del Rol"
                value={formData.nombre || ""}
                onChange={(v) => handleChange("nombre", v)}
                icon={<FiLock size={16} />}
                placeholder="Administrador"
                required
                error={errors.nombre}
              />
              <FormInput
                label="Descripción"
                value={formData.descripcion || ""}
                onChange={(v) => handleChange("descripcion", v)}
                icon={<FiFileText size={16} />}
                placeholder="Descripción del rol..."
              />
            </>
          )}

          {/* MODULO FORM */}
          {type === "modulo" && (
            <>
              <FormInput
                label="Nombre del Módulo"
                value={formData.nombre || ""}
                onChange={(v) => handleChange("nombre", v)}
                icon={<FiSettings size={16} />}
                placeholder="Dashboard"
                required
                error={errors.nombre}
              />
              <FormInput
                label="Descripción"
                value={formData.descripcion || ""}
                onChange={(v) => handleChange("descripcion", v)}
                icon={<FiFileText size={16} />}
                placeholder="Descripción del módulo..."
              />
              <FormInput
                label="Ruta"
                value={formData.ruta || ""}
                onChange={(v) => handleChange("ruta", v)}
                placeholder="/dashboard"
                helpText="La ruta URL del módulo (ej: /ventas, /inventario)"
              />
            </>
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              isEdit ? "Actualizando..." : "Creando..."
            ) : (
              <>
                <FiCheck size={18} />
                {isEdit ? "Actualizar" : "Crear"}
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </BaseModal>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL CONFIRMAR - Confirmación de acciones
   ═══════════════════════════════════════════════════════════════════════════ */

export const ModalConfirmar = ({
  isOpen,
  titulo,
  mensaje,
  onConfirm,
  onCancel,
  tipo = "eliminar",
  confirmText,
  cancelText = "Cancelar",
}: {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
  tipo?: string;
  confirmText?: string;
  cancelText?: string;
}) => {
  const { isDark } = useThemeClasses();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onCancel();
    } catch (error) {
      console.error("Error en confirmación:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const isDanger = tipo === "eliminar";
  const defaultConfirmText = isDanger ? "Eliminar" : "Confirmar";

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} maxWidth="sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`
            p-3 rounded-xl shrink-0
            ${
              isDanger
                ? isDark
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-rose-100 text-rose-600"
                : isDark
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-amber-100 text-amber-600"
            }
          `}
          >
            {isDanger ? (
              <FiAlertCircle size={24} />
            ) : (
              <FiAlertTriangle size={24} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className={`text-lg font-bold mb-2 ${
                isDanger
                  ? isDark
                    ? "text-rose-400"
                    : "text-rose-700"
                  : isDark
                    ? "text-amber-400"
                    : "text-amber-700"
              }`}
            >
              {titulo}
            </h2>
            <p
              className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {mensaje}
            </p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={isConfirming}>
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? "danger" : "primary"}
          onClick={handleConfirm}
          loading={isConfirming}
          disabled={isConfirming}
        >
          {isConfirming ? "Procesando..." : confirmText || defaultConfirmText}
        </Button>
      </ModalFooter>
    </BaseModal>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL PERMISOS - Gestión de permisos por rol
   ═══════════════════════════════════════════════════════════════════════════ */

export const ModalPermisos = ({
  isOpen,
  rol,
  modulos,
  permisos,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  rol: any;
  modulos: any[];
  permisos: any[];
  onSave: (permisos: any[]) => void;
  onClose: () => void;
}) => {
  const { isDark } = useThemeClasses();
  const [permisosLocales, setPermisosLocales] = useState(permisos);
  const [isSaving, setIsSaving] = useState(false);
  const [searchModule, setSearchModule] = useState("");

  const togglePermiso = (idModulo: number) => {
    setPermisosLocales((prev) =>
      prev.map((p) =>
        p.idModulo === idModulo ? { ...p, hasAccess: !p.hasAccess } : p
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(permisosLocales);
      onClose();
    } catch (error) {
      console.error("Error al guardar permisos:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAll = (access: boolean) => {
    setPermisosLocales((prev) => prev.map((p) => ({ ...p, hasAccess: access })));
  };

  useEffect(() => {
    setPermisosLocales(permisos);
  }, [permisos]);

  const permisosActivos = permisosLocales.filter((p) => p.hasAccess).length;
  const totalPermisos = permisosLocales.length;

  const filteredModulos = modulos.filter((m) =>
    m.nombre.toLowerCase().includes(searchModule.toLowerCase())
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <ModalHeader
        title="Gestión de Permisos"
        subtitle={`Rol: ${rol?.nombre} • ${permisosActivos} de ${totalPermisos} módulos permitidos`}
        icon={<FiShield size={24} />}
        onClose={onClose}
      />

      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {/* Control Panel */}
        <div
          className={`
          flex flex-col sm:flex-row gap-4 mb-6 p-4 rounded-xl border
          ${isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}
        `}
        >
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              size={16}
            />
            <input
              type="text"
              value={searchModule}
              onChange={(e) => setSearchModule(e.target.value)}
              placeholder="Buscar módulo..."
              className={`
                w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition-all
                ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                }
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none
              `}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md
              `}
            >
              <FiCheck size={16} />
              <span className="hidden sm:inline">Permitir Todos</span>
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                bg-gradient-to-r from-rose-500 to-rose-600 text-white
                hover:from-rose-600 hover:to-rose-700 shadow-sm hover:shadow-md
              `}
            >
              <FiX size={16} />
              <span className="hidden sm:inline">Denegar Todos</span>
            </button>
          </div>

          {/* Counter */}
          <div
            className={`
            flex items-center justify-center px-4 py-2.5 rounded-xl border
            ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}
          `}
          >
            <span
              className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}
            >
              {permisosActivos} / {totalPermisos}
            </span>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModulos.map((modulo) => {
            const permiso = permisosLocales.find((p) => p.idModulo === modulo.id);
            const tieneAcceso = permiso?.hasAccess || false;

            return (
              <div
                key={modulo.id}
                onClick={() => togglePermiso(modulo.id)}
                className={`
                  p-5 rounded-xl border cursor-pointer transition-all duration-200
                  hover:shadow-md transform hover:scale-[1.01]
                  ${
                    tieneAcceso
                      ? isDark
                        ? "bg-emerald-900/20 border-emerald-700/50"
                        : "bg-emerald-50 border-emerald-200"
                      : isDark
                        ? "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                        : "bg-white border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`
                        p-2 rounded-lg
                        ${
                          tieneAcceso
                            ? isDark
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-600"
                            : isDark
                              ? "bg-gray-600 text-gray-400"
                              : "bg-gray-100 text-gray-500"
                        }
                      `}
                      >
                        <FiSettings size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`font-semibold truncate ${isDark ? "text-gray-100" : "text-gray-900"}`}
                        >
                          {modulo.nombre}
                        </h4>
                        <span
                          className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1
                          ${
                            tieneAcceso
                              ? isDark
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-emerald-100 text-emerald-700"
                              : isDark
                                ? "bg-gray-600 text-gray-400"
                                : "bg-gray-100 text-gray-600"
                          }
                        `}
                        >
                          {tieneAcceso ? "Permitido" : "Denegado"}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-sm mb-2 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {modulo.descripcion}
                    </p>
                    <code
                      className={`
                      text-xs px-2 py-1 rounded-lg font-mono
                      ${
                        isDark
                          ? "bg-blue-900/30 text-blue-400 border border-blue-800/50"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }
                    `}
                    >
                      {modulo.ruta}
                    </code>
                  </div>

                  {/* Toggle Switch */}
                  <div className="shrink-0">
                    <div
                      className={`
                      relative w-12 h-6 rounded-full transition-colors duration-200
                      ${tieneAcceso ? "bg-emerald-500" : isDark ? "bg-gray-600" : "bg-gray-300"}
                    `}
                    >
                      <div
                        className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm
                        transition-transform duration-200
                        ${tieneAcceso ? "translate-x-7" : "translate-x-1"}
                      `}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredModulos.length === 0 && (
          <div className="text-center py-12">
            <FiSearch
              size={48}
              className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}
            />
            <p className={`font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No se encontraron módulos con "{searchModule}"
            </p>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={isSaving}
          disabled={isSaving}
        >
          {isSaving ? (
            "Guardando..."
          ) : (
            <>
              <FiCheck size={18} />
              Guardar Permisos
            </>
          )}
        </Button>
      </ModalFooter>
    </BaseModal>
  );
};
