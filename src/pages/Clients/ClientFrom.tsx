/**
 * ClienteForm.tsx - Formulario de cliente estilo Power BI
 * Diseño profesional, limpio y formal
 */

import { useState } from "react";
import { useThemeClasses } from '../../hooks/useThemeClasses';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiX,
  FiSave,
  FiBriefcase,
  FiToggleRight
} from "react-icons/fi";

import type { FormEvent } from "react";
import type { Cliente } from "../../types/clientes/Client";
import { checkDniExists } from "../../services/clientes/clienteService";

interface Props {
  state: Cliente;
  setField: (path: string, value: any) => void;
  onCancel: () => void;
  onSave: (cli: Cliente) => void;
  loading?: boolean;
}

// ============================================
// INPUT FIELD COMPONENT
// ============================================
interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
  success?: boolean;
  isDark: boolean;
}

const InputField = ({
  label,
  icon,
  value,
  type = "text",
  placeholder,
  onChange,
  required = false,
  disabled = false,
  error = "",
  onBlur,
  success = false,
  isDark
}: InputFieldProps) => (
  <div>
    <label className={`
      flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2
      ${isDark ? 'text-gray-400' : 'text-gray-500'}
    `}>
      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{icon}</span>
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${disabled
            ? isDark
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : error
              ? isDark
                ? 'border-red-500/50 bg-red-500/10 text-white focus:ring-red-500/20'
                : 'border-red-300 bg-red-50 focus:ring-red-200'
              : success
                ? isDark
                  ? 'border-green-500/50 bg-green-500/10 text-white focus:ring-green-500/20'
                  : 'border-green-300 bg-green-50 focus:ring-green-200'
                : isDark
                  ? 'border-neutral-700 bg-[#0a0a0a] text-white placeholder-gray-500 focus:border-[#E0312A] focus:ring-[#E0312A]/20'
                  : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#E0312A] focus:ring-[#E0312A]/20'
          }
        `}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        onBlur={onBlur}
      />
      {/* Status icon */}
      {(error || success) && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {error && <FiAlertCircle className="w-4 h-4 text-red-500" />}
          {success && <FiCheckCircle className="w-4 h-4 text-green-500" />}
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
        <FiAlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
);

// ============================================
// SELECT FIELD COMPONENT
// ============================================
interface SelectFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  isDark: boolean;
}

const SelectField = ({
  label,
  icon,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  error = "",
  isDark
}: SelectFieldProps) => (
  <div>
    <label className={`
      flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2
      ${isDark ? 'text-gray-400' : 'text-gray-500'}
    `}>
      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{icon}</span>
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <select
      className={`
        w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${disabled
          ? isDark
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
          : error
            ? isDark
              ? 'border-red-500/50 bg-red-500/10 text-white focus:ring-red-500/20'
              : 'border-red-300 bg-red-50 focus:ring-red-200'
            : isDark
              ? 'border-neutral-700 bg-[#0a0a0a] text-white focus:border-[#E0312A] focus:ring-[#E0312A]/20'
              : 'border-gray-200 bg-white text-gray-900 focus:border-[#E0312A] focus:ring-[#E0312A]/20'
        }
      `}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    >
      <option value="">Seleccionar...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && (
      <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
        <FiAlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
);

// ============================================
// MAIN FORM COMPONENT
// ============================================

export default function ClienteForm({ state, setField, onCancel, onSave, loading = false }: Props) {
  const { isDark } = useThemeClasses();

  const tiposCliente = [
    { value: "NATURAL", label: "Persona Natural" },
    { value: "JURIDICA", label: "Persona Jurídica" }
  ];
  const tiposDocumento = [
    { value: "DNI", label: "DNI" },
    { value: "Pasaporte", label: "Pasaporte" },
    { value: "CE", label: "Carné de Extranjería" }
  ];
  const estadosCliente = [
    { value: "ACTIVO", label: "Activo" },
    { value: "INACTIVO", label: "Inactivo" }
  ];

  // Estados para validación
  const [dniError, setDniError] = useState<string>("");
  const [dniSuccess, setDniSuccess] = useState<boolean>(false);
  const [validatingDni, setValidatingDni] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateDni = async () => {
    const dni = state.persona.numeroDocumento.trim();
    setDniSuccess(false);

    if (!dni) { setDniError(""); return; }

    setValidatingDni(true);
    try {
      const { exists, message } = await checkDniExists(dni, state.id);

      if (exists) {
        setDniError(message || "Este documento ya está registrado.");
      } else {
        setDniError("");
        setDniSuccess(true);
      }
    } catch (error) {
      console.error('Error validando DNI:', error);
      setDniError("");
    } finally {
      setValidatingDni(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!state.persona.nombres.trim()) errors.nombres = "Campo requerido";
    if (!state.persona.numeroDocumento.trim()) errors.dni = "Campo requerido";
    else if (dniError) errors.dni = dniError;
    if (!state.persona.apellidoPaterno.trim()) errors.apellidoPaterno = "Campo requerido";
    if (!state.tipo) errors.tipo = "Seleccione una opción";
    if (!state.persona.tipoDocumento) errors.tipoDocumento = "Seleccione una opción";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormErrors({});
    if (!validateForm()) return;
    if (dniError) return;
    onSave(state);
  }

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${isDark ? 'bg-[#171717]' : 'bg-white'}`}>
      {/* Header */}
      <div className={`flex-none px-6 py-5 border-b ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'}
            `}>
              <FiUser className="w-6 h-6 text-[#E0312A]" />
            </div>
            {/* Title */}
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {state.id ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {state.id ? `Modificando registro #${state.id}` : 'Complete los datos del nuevo cliente'}
              </p>
            </div>
          </div>

          {/* Estado badge (solo edición) */}
          {state.id && (
            <span className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold
              ${state.estado === 'ACTIVO'
                ? isDark ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-green-50 text-green-600 border border-green-200'
                : isDark ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-200'
              }
            `}>
              {state.estado || 'ACTIVO'}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <form onSubmit={submit} className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-6 py-6">
          {/* Sección: Estado (solo edición) */}
          {state.id && (
            <div className={`mb-8 p-4 rounded-xl ${isDark ? 'bg-[#0a0a0a] border border-neutral-800' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiToggleRight className="text-[#E0312A]" />
                Estado del Cliente
              </h3>
              <SelectField
                label="Estado"
                icon={<FiToggleRight size={14} />}
                value={state.estado || "ACTIVO"}
                options={estadosCliente}
                onChange={(val) => setField("estado", val)}
                required
                isDark={isDark}
              />
            </div>
          )}

          {/* Grid de dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda: Información Básica */}
            <div>
              <h3 className={`text-sm font-semibold mb-5 pb-2 border-b flex items-center gap-2 ${isDark ? 'text-white border-neutral-800' : 'text-gray-900 border-gray-200'}`}>
                <FiUser className="text-[#E0312A]" />
                Información Básica
              </h3>

              <div className="space-y-5">
                {/* Tipo de cliente y documento */}
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Tipo de Cliente"
                    icon={<FiBriefcase size={14} />}
                    value={state.tipo || ""}
                    options={tiposCliente}
                    onChange={(val) => setField("tipo", val)}
                    required
                    error={formErrors.tipo}
                    isDark={isDark}
                  />
                  <SelectField
                    label="Tipo Documento"
                    icon={<FiFileText size={14} />}
                    value={state.persona.tipoDocumento}
                    options={tiposDocumento}
                    onChange={(val) => {
                      setField("persona.tipoDocumento", val);
                      setDniSuccess(false);
                    }}
                    required
                    error={formErrors.tipoDocumento}
                    isDark={isDark}
                  />
                </div>

                {/* Número de documento */}
                <div className="relative">
                  <InputField
                    label="Número de Documento"
                    icon={<FiFileText size={14} />}
                    placeholder="Ej: 12345678"
                    value={state.persona.numeroDocumento}
                    onChange={(val) => {
                      if (/^\d*$/.test(val)) {
                        setField("persona.numeroDocumento", val);
                        setDniError("");
                        setDniSuccess(false);
                      }
                    }}
                    onBlur={validateDni}
                    required
                    error={formErrors.dni || dniError}
                    success={dniSuccess}
                    disabled={validatingDni}
                    isDark={isDark}
                  />
                  {validatingDni && (
                    <div className="absolute right-3 top-[38px]">
                      <FiLoader className="w-4 h-4 text-[#E0312A] animate-spin" />
                    </div>
                  )}
                </div>

                {/* Nombres */}
                <InputField
                  label="Nombres"
                  icon={<FiUser size={14} />}
                  placeholder="Nombres completos"
                  value={state.persona.nombres}
                  onChange={(val) => setField("persona.nombres", val)}
                  required
                  error={formErrors.nombres}
                  isDark={isDark}
                />

                {/* Apellidos */}
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Apellido Paterno"
                    icon={<FiUser size={14} />}
                    placeholder="Apellido paterno"
                    value={state.persona.apellidoPaterno}
                    onChange={(val) => setField("persona.apellidoPaterno", val)}
                    required
                    error={formErrors.apellidoPaterno}
                    isDark={isDark}
                  />
                  <InputField
                    label="Apellido Materno"
                    icon={<FiUser size={14} />}
                    placeholder="Apellido materno"
                    value={state.persona.apellidoMaterno}
                    onChange={(val) => setField("persona.apellidoMaterno", val)}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha: Contacto */}
            <div>
              <h3 className={`text-sm font-semibold mb-5 pb-2 border-b flex items-center gap-2 ${isDark ? 'text-white border-neutral-800' : 'text-gray-900 border-gray-200'}`}>
                <FiMail className="text-[#E0312A]" />
                Datos de Contacto
              </h3>

              <div className="space-y-5">
                {/* Email */}
                <InputField
                  label="Correo Electrónico"
                  icon={<FiMail size={14} />}
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={state.persona.correo}
                  onChange={(val) => setField("persona.correo", val)}
                  isDark={isDark}
                />

                {/* Teléfono */}
                <InputField
                  label="Teléfono"
                  icon={<FiPhone size={14} />}
                  placeholder="999 999 999"
                  value={state.persona.telefono}
                  onChange={(val) => setField("persona.telefono", val)}
                  isDark={isDark}
                />

                {/* Dirección */}
                <InputField
                  label="Dirección"
                  icon={<FiMapPin size={14} />}
                  placeholder="Dirección completa"
                  value={state.persona.direccion}
                  onChange={(val) => setField("persona.direccion", val)}
                  isDark={isDark}
                />

                {/* Fecha de nacimiento */}
                <InputField
                  label="Fecha de Nacimiento"
                  icon={<FiCalendar size={14} />}
                  type="date"
                  value={state.persona.fechaNacimiento || ""}
                  onChange={(val) => setField("persona.fechaNacimiento", val)}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className={`flex-none px-6 py-4 border-t flex items-center justify-end gap-3 ${isDark ? 'bg-[#0a0a0a]/50 border-neutral-800' : 'bg-gray-50 border-gray-200'}`}>
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          className={`
            px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            inline-flex items-center gap-2
            ${isDark
              ? 'text-gray-300 bg-gray-800 border border-neutral-700 hover:bg-gray-700'
              : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <FiX size={16} />
          Cancelar
        </button>

        <button
          onClick={submit}
          disabled={loading || validatingDni || !!dniError}
          className={`
            px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200
            inline-flex items-center gap-2
            ${loading || validatingDni || !!dniError
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-[#E0312A] hover:bg-[#A91E16]'
            }
          `}
        >
          {loading ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <FiSave size={16} />
              {state.id ? 'Guardar Cambios' : 'Registrar Cliente'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
