/**
 * ProveedorFormModal.tsx - Modal de formulario de proveedor
 * Diseño Power BI - Estilo profesional y minimalista
 */

import { useState, useEffect } from 'react';
import {
  FiX,
  FiCheck,
  FiTruck,
  FiFileText,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiAlertCircle,
  FiBriefcase
} from 'react-icons/fi';
import type { ProveedorData } from '../../../types/proveedor/proveedorType';
import { useThemeClasses } from '../../../hooks/useThemeClasses';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProveedorData) => Promise<void>;
  initialData?: ProveedorData;
  isEditing: boolean;
  existingProviders?: ProveedorData[];
}

const DEFAULT_DATA: ProveedorData = {
  ruc: '',
  razon_social: '',
  contacto: '',
  telefono: '',
  correo: '',
  direccion: '',
  estado: 'ACTIVO'
};

export default function ProveedorFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  existingProviders = []
}: Props) {
  const [formData, setFormData] = useState<ProveedorData>(DEFAULT_DATA);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { isDark } = useThemeClasses();

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || DEFAULT_DATA);
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'ruc' || name === 'telefono') {
      const soloNumeros = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: soloNumeros }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.ruc.trim() || !formData.razon_social.trim() || !formData.contacto.trim() || !formData.telefono.trim()) {
      setError('Por favor complete todos los campos obligatorios.');
      return false;
    }

    if (formData.ruc.length !== 11) {
      setError('El RUC debe tener 11 dígitos.');
      return false;
    }

    if (existingProviders && existingProviders.length > 0) {
      const normalizedRuc = formData.ruc.trim();
      const duplicate = existingProviders.find(p => {
        if (isEditing && String(p.id) === String(formData.id)) return false;
        return String(p.ruc) === normalizedRuc;
      });

      if (duplicate) {
        setError(`El RUC ${normalizedRuc} ya existe en el sistema.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Error al guardar. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-900/50'} backdrop-blur-sm transition-opacity`}
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`
          relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden
          ${isDark ? 'bg-[#171717] border-neutral-700' : 'bg-white border-gray-200'}
        `}>
          {/* ═══ HEADER ═══ */}
          <div className={`
            px-6 py-5 border-b flex items-center justify-between
            ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
          `}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'}`}>
                <FiTruck className="w-6 h-6 text-[#E0312A]" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isEditing ? 'Actualice la información del proveedor' : 'Complete los datos del nuevo proveedor'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
              `}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* ═══ ERROR ALERT ═══ */}
          {error && (
            <div className={`
              mx-6 mt-6 flex items-center gap-3 px-4 py-3 rounded-lg border
              ${isDark ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}
            `}>
              <FiAlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* ═══ BODY ═══ */}
          <form onSubmit={handleSubmit} className={`p-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            <div className="space-y-6">

              {/* Sección: Información Fiscal */}
              <FormSection title="Información Fiscal" icon={<FiBriefcase />} isDark={isDark}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="RUC"
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleChange}
                    icon={<FiFileText />}
                    placeholder="Ej: 20123456789"
                    maxLength={11}
                    required
                    isDark={isDark}
                    counter={`${formData.ruc.length}/11`}
                  />
                  <InputField
                    label="Razón Social"
                    name="razon_social"
                    value={formData.razon_social}
                    onChange={handleChange}
                    icon={<FiBriefcase />}
                    placeholder="Nombre de la empresa"
                    required
                    isDark={isDark}
                  />
                </div>
              </FormSection>

              {/* Sección: Contacto */}
              <FormSection title="Información de Contacto" icon={<FiUser />} isDark={isDark}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Persona de Contacto"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleChange}
                    icon={<FiUser />}
                    placeholder="Nombre completo"
                    required
                    isDark={isDark}
                  />
                  <InputField
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    icon={<FiPhone />}
                    placeholder="999 999 999"
                    maxLength={9}
                    required
                    isDark={isDark}
                  />
                  <InputField
                    label="Correo Electrónico"
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                    icon={<FiMail />}
                    placeholder="ejemplo@empresa.com"
                    isDark={isDark}
                  />
                  <InputField
                    label="Dirección Fiscal"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    icon={<FiMapPin />}
                    placeholder="Av. Principal 123"
                    isDark={isDark}
                  />
                </div>
              </FormSection>

              {/* Sección: Estado */}
              <div className={`
                p-5 rounded-xl border
                ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
              `}>
                <label className={`
                  block text-xs font-semibold uppercase tracking-wider mb-3
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  Estado del Proveedor
                </label>
                <div className="flex gap-4">
                  <RadioOption
                    name="estado"
                    value="ACTIVO"
                    checked={formData.estado === 'ACTIVO'}
                    onChange={handleChange}
                    label="Activo"
                    color="green"
                    isDark={isDark}
                  />
                  <RadioOption
                    name="estado"
                    value="INACTIVO"
                    checked={formData.estado === 'INACTIVO'}
                    onChange={handleChange}
                    label="Inactivo"
                    color="red"
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          </form>

          {/* ═══ FOOTER ═══ */}
          <div className={`
            px-6 py-4 border-t flex items-center justify-end gap-3
            ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
          `}>
            <button
              type="button"
              onClick={onClose}
              className={`
                px-5 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isDark
                  ? 'bg-neutral-700 text-white hover:bg-neutral-600 border border-neutral-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }
              `}
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className={`
                px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
                bg-[#E0312A] hover:bg-[#A91E16] disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              `}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FiCheck size={18} />
                  {isEditing ? 'Actualizar' : 'Registrar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FORM SECTION
   ═══════════════════════════════════════════════════════════════════════════ */
interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
}

const FormSection = ({ title, icon, children, isDark }: FormSectionProps) => (
  <div className={`
    rounded-xl border overflow-hidden
    ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
  `}>
    <div className={`
      px-5 py-3 border-b flex items-center gap-2
      ${isDark ? 'border-neutral-800 bg-neutral-800/50' : 'border-gray-100 bg-gray-50'}
    `}>
      <div className="text-[#E0312A]">{icon}</div>
      <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   INPUT FIELD
   ═══════════════════════════════════════════════════════════════════════════ */
interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  isDark: boolean;
  maxLength?: number;
  counter?: string;
}

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  icon,
  isDark,
  maxLength,
  counter
}: InputFieldProps) => {
  const hasValue = value && value.length > 0;

  return (
    <div>
      <label className={`
        block text-xs font-semibold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-gray-400' : 'text-gray-500'}
      `}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className={`
            absolute left-3 top-1/2 -translate-y-1/2
            ${hasValue ? 'text-[#E0312A]' : isDark ? 'text-gray-500' : 'text-gray-400'}
          `}>
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`
            w-full rounded-lg border text-sm transition-colors
            ${icon ? 'pl-10 pr-4' : 'px-4'} py-2.5
            ${counter ? 'pr-16' : ''}
            ${isDark
              ? 'bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-[#E0312A] focus:ring-1 focus:ring-[#E0312A]/20'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#E0312A] focus:ring-1 focus:ring-[#E0312A]/20'
            }
          `}
        />
        {counter && (
          <span className={`
            absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-1.5 py-0.5 rounded
            ${isDark ? 'bg-neutral-700 text-gray-400' : 'bg-gray-100 text-gray-500'}
          `}>
            {counter}
          </span>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   RADIO OPTION
   ═══════════════════════════════════════════════════════════════════════════ */
interface RadioOptionProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  color: 'green' | 'red';
  isDark: boolean;
}

const RadioOption = ({ name, value, checked, onChange, label, color, isDark }: RadioOptionProps) => {
  const colorClasses = {
    green: checked
      ? 'border-green-500 bg-green-500'
      : isDark ? 'border-neutral-600' : 'border-gray-300',
    red: checked
      ? 'border-red-500 bg-red-500'
      : isDark ? 'border-neutral-600' : 'border-gray-300'
  };

  return (
    <label className="flex items-center cursor-pointer group">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <div className={`
        w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center
        ${colorClasses[color]}
      `}>
        {checked && (
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        )}
      </div>
      <span className={`
        ml-2 text-sm font-medium transition-colors
        ${checked
          ? isDark ? 'text-white' : 'text-gray-900'
          : isDark ? 'text-gray-400' : 'text-gray-600'
        }
      `}>
        {label}
      </span>
    </label>
  );
};
