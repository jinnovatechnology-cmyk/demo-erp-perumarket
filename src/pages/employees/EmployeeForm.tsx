/**
 * EmployeeForm.tsx - Formulario de empleado estilo Power BI
 * Diseño profesional con subida de foto y CV mejorada
 */

import { useRef, type FormEvent, useState, useEffect } from "react";
import type { Departament, Employee } from "../../types/Employee";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { EmployeeService } from "../../services/employeeService";
import {
  FiUser,
  FiX,
  FiUpload,
  FiImage,
  FiFileText,
  FiTrash2,
  FiCheck,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiCreditCard,
  FiDownload
} from "react-icons/fi";

interface Props {
  state: Employee;
  setField: (field: string, value: any) => void;
  onCancel: () => void;
  onSave: (emp: Employee) => void;
  departamentos: Departament[];
}

export default function EmployeeForm({
  state,
  setField,
  onCancel,
  onSave,
  departamentos,
}: Props) {
  const fotoFileRef = useRef<HTMLInputElement>(null);
  const cvFileRef = useRef<HTMLInputElement>(null);
  const [selectedFotoFile, setSelectedFotoFile] = useState<File | null>(null);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { isDark } = useThemeClasses();

  // Limpiar preview cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (fotoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  // Base URL del backend (incluye context-path /api)
  const API_BASE = 'http://localhost:8080/api';

  // Inicializar preview si hay foto existente
  useEffect(() => {
    if (state.foto && !state.foto.startsWith('blob:')) {
      // Es una URL existente del servidor
      if (state.foto.startsWith('http') || state.foto.startsWith('data:image/')) {
        setFotoPreview(state.foto);
      } else if (state.foto.startsWith('/')) {
        setFotoPreview(`${API_BASE}${state.foto}`);
      } else {
        // Solo es el nombre del archivo
        setFotoPreview(`${API_BASE}/uploads/fotos/${state.foto}`);
      }
    }
  }, [state.foto]);

  // Handler para descargar CV
  const handleDownloadCV = async () => {
    if (state.empleadoId && state.cv) {
      try {
        await EmployeeService.downloadCV(state.empleadoId, state.cv);
      } catch (error) {
        console.error('Error al descargar CV:', error);
        // Fallback: abrir en nueva pestaña
        let cvUrl = state.cv;
        if (!state.cv.startsWith('http')) {
          cvUrl = state.cv.startsWith('/')
            ? `${API_BASE}${state.cv}`
            : `${API_BASE}/uploads/cvs/${state.cv}`;
        }
        window.open(cvUrl, '_blank');
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!state.persona.nombres.trim()) return alert("El nombre es obligatorio");
    if (!state.persona.apellidoPaterno.trim()) return alert("El apellido paterno es obligatorio");
    if (!state.persona.numeroDocumento.trim()) return alert("El documento es obligatorio");
    if (!state.departamento?.id) return alert("Debe seleccionar un departamento");

    setSaving(true);
    try {
      const employeeToSave = {
        ...state,
        fotoFile: selectedFotoFile,
        cvFile: selectedCvFile,
      };
      await onSave(employeeToSave);
    } finally {
      setSaving(false);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      // Limpiar preview anterior
      if (fotoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(fotoPreview);
      }

      setSelectedFotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFotoPreview(previewUrl);
      setField("foto", previewUrl);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no debe superar los 10MB');
        return;
      }

      setSelectedCvFile(file);
      setField("cv", file.name);
    }
  };

  const handleRemoveFoto = () => {
    if (fotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(fotoPreview);
    }
    setSelectedFotoFile(null);
    setFotoPreview(null);
    setField("foto", "");
    if (fotoFileRef.current) fotoFileRef.current.value = "";
  };

  const handleRemoveCv = () => {
    setSelectedCvFile(null);
    setField("cv", "");
    if (cvFileRef.current) cvFileRef.current.value = "";
  };

  const isEditing = !!state.empleadoId;

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <div className={`
        flex-none px-6 py-5 border-b flex items-center justify-between
        ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
      `}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-[#E0312A]/20' : 'bg-[#E0312A]/10'}`}>
            <FiUser className="w-6 h-6 text-[#E0312A]" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isEditing ? "Editar Empleado" : "Nuevo Empleado"}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isEditing ? 'Actualice la información del colaborador' : 'Complete los datos del nuevo colaborador'}
            </p>
          </div>
        </div>

        {isEditing && (
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${state.estado === 'ACTIVO'
              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
              : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
            }
          `}>
            {state.estado}
          </span>
        )}

        <button
          onClick={onCancel}
          className={`
            p-2 rounded-lg transition-colors
            ${isDark ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
          `}
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* ═══ BODY SCROLLABLE ═══ */}
      <div className={`
        flex-1 overflow-y-auto p-6
        ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}
      `}>
        <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">

          {/* ═══ SECCIÓN: DATOS PERSONALES ═══ */}
          <FormSection title="Información Personal" icon={<FiUser />} isDark={isDark}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Nombres"
                value={state.persona.nombres}
                onChange={(v) => setField('persona.nombres', v)}
                icon={<FiUser />}
                required
                isDark={isDark}
              />
              <InputField
                label="Apellido Paterno"
                value={state.persona.apellidoPaterno}
                onChange={(v) => setField('persona.apellidoPaterno', v)}
                required
                isDark={isDark}
              />
              <InputField
                label="Apellido Materno"
                value={state.persona.apellidoMaterno || ''}
                onChange={(v) => setField('persona.apellidoMaterno', v)}
                isDark={isDark}
              />
              <InputField
                label="DNI / Documento"
                value={state.persona.numeroDocumento}
                onChange={(v) => setField('persona.numeroDocumento', v)}
                icon={<FiCreditCard />}
                required
                isDark={isDark}
              />
              <InputField
                label="Fecha de Nacimiento"
                type="date"
                value={state.persona.fechaNacimiento || ''}
                onChange={(v) => setField('persona.fechaNacimiento', v)}
                icon={<FiCalendar />}
                isDark={isDark}
              />
            </div>
          </FormSection>

          {/* ═══ SECCIÓN: CONTACTO ═══ */}
          <FormSection title="Datos de Contacto" icon={<FiMail />} isDark={isDark}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Correo Electrónico"
                type="email"
                value={state.persona.correo}
                onChange={(v) => setField('persona.correo', v)}
                icon={<FiMail />}
                placeholder="ejemplo@empresa.com"
                isDark={isDark}
              />
              <InputField
                label="Teléfono / Celular"
                type="tel"
                value={state.persona.telefono}
                onChange={(v) => setField('persona.telefono', v)}
                icon={<FiPhone />}
                placeholder="+51 999 999 999"
                isDark={isDark}
              />
              <div className="md:col-span-2">
                <InputField
                  label="Dirección"
                  value={state.persona.direccion}
                  onChange={(v) => setField('persona.direccion', v)}
                  icon={<FiMapPin />}
                  isDark={isDark}
                />
              </div>
            </div>
          </FormSection>

          {/* ═══ SECCIÓN: DATOS LABORALES ═══ */}
          <FormSection title="Información Laboral" icon={<FiBriefcase />} isDark={isDark}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField
                label="Departamento"
                value={state.departamento?.id?.toString() || ''}
                onChange={(v) => setField('departamento', v ? { id: Number(v) } : null)}
                options={departamentos.map(d => ({ value: String(d.id ?? ''), label: d.nombre }))}
                icon={<FiMapPin />}
                required
                isDark={isDark}
              />
              <InputField
                label="Cargo / Puesto"
                value={state.puesto}
                onChange={(v) => setField('puesto', v)}
                icon={<FiBriefcase />}
                isDark={isDark}
              />
              <InputField
                label="Sueldo (S/.)"
                type="number"
                value={state.sueldo?.toString() || ''}
                onChange={(v) => setField('sueldo', v ? Number(v) : 0)}
                icon={<FiDollarSign />}
                isDark={isDark}
              />
              <InputField
                label="Fecha de Contratación"
                type="date"
                value={state.fechaContratacion || ''}
                onChange={(v) => setField('fechaContratacion', v)}
                icon={<FiCalendar />}
                isDark={isDark}
              />
              <SelectField
                label="Estado"
                value={state.estado}
                onChange={(v) => setField('estado', v)}
                options={[
                  { value: 'ACTIVO', label: 'Activo' },
                  { value: 'INACTIVO', label: 'Inactivo' },
                  { value: 'VACACIONES', label: 'Vacaciones' },
                  { value: 'LICENCIA', label: 'Licencia' },
                ]}
                isDark={isDark}
              />
            </div>
          </FormSection>

          {/* ═══ SECCIÓN: DOCUMENTOS ═══ */}
          <FormSection title="Documentación" icon={<FiFileText />} isDark={isDark}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* FOTO UPLOAD */}
              <div className={`
                p-5 rounded-xl border
                ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
              `}>
                <div className="flex items-center gap-2 mb-4">
                  <FiImage className="text-[#E0312A]" />
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Fotografía del Empleado
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className={`
                    relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed flex-shrink-0
                    ${fotoPreview
                      ? 'border-[#E0312A]'
                      : isDark ? 'border-neutral-700' : 'border-gray-300'
                    }
                  `}>
                    {fotoPreview ? (
                      <>
                        <img
                          src={fotoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={handleRemoveFoto}
                            className="p-2 bg-red-500 rounded-full text-white"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <FiCheck size={12} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className={`
                        w-full h-full flex flex-col items-center justify-center
                        ${isDark ? 'bg-neutral-800' : 'bg-gray-50'}
                      `}>
                        <FiUser className={`w-8 h-8 ${isDark ? 'text-neutral-600' : 'text-gray-300'}`} />
                      </div>
                    )}
                  </div>

                  {/* Upload controls */}
                  <div className="flex-1">
                    <input
                      ref={fotoFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                      id="foto-upload"
                    />
                    <label
                      htmlFor="foto-upload"
                      className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors
                        ${isDark
                          ? 'bg-neutral-700 text-white hover:bg-neutral-600 border border-neutral-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }
                      `}
                    >
                      <FiUpload size={16} />
                      Subir imagen
                    </label>
                    <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      JPG, PNG o GIF. Máximo 5MB.
                    </p>
                    {selectedFotoFile && (
                      <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                        <FiCheck size={12} />
                        {selectedFotoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CV UPLOAD */}
              <div className={`
                p-5 rounded-xl border
                ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-200'}
              `}>
                <div className="flex items-center gap-2 mb-4">
                  <FiFileText className="text-[#E0312A]" />
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Curriculum Vitae (CV)
                  </span>
                </div>

                <input
                  ref={cvFileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleCvChange}
                  className="hidden"
                  id="cv-upload"
                />

                {!state.cv && !selectedCvFile ? (
                  <label
                    htmlFor="cv-upload"
                    className={`
                      flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                      ${isDark
                        ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    <FiUpload className={`w-8 h-8 mb-2 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-[#E0312A]">
                      Seleccionar PDF
                    </span>
                    <span className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Máximo 10MB
                    </span>
                  </label>
                ) : (
                  <div className={`
                    flex items-center justify-between p-4 rounded-xl border
                    ${isDark ? 'bg-[#E0312A]/10 border-[#E0312A]/30' : 'bg-green-50 border-green-200'}
                  `}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`
                        p-2 rounded-lg
                        ${isDark ? 'bg-[#E0312A]/20' : 'bg-green-100'}
                      `}>
                        <FiFileText className="w-5 h-5 text-[#E0312A]" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCvFile ? selectedCvFile.name : state.cv}
                        </p>
                        {selectedCvFile && (
                          <p className="text-xs text-green-500">Nuevo archivo seleccionado</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {state.cv && !selectedCvFile && state.empleadoId && (
                        <button
                          type="button"
                          onClick={handleDownloadCV}
                          className={`
                            p-2 rounded-lg transition-colors
                            ${isDark ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
                          `}
                          title="Descargar CV"
                        >
                          <FiDownload size={18} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveCv}
                        className={`
                          p-2 rounded-lg transition-colors
                          ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'}
                        `}
                        title="Eliminar CV"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormSection>
        </form>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className={`
        flex-none px-6 py-4 border-t flex items-center justify-end gap-3
        ${isDark ? 'bg-[#171717] border-neutral-800' : 'bg-white border-gray-100'}
      `}>
        <button
          type="button"
          onClick={onCancel}
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
          form="employee-form"
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
              {isEditing ? 'Actualizar' : 'Guardar'}
            </>
          )}
        </button>
      </div>
    </>
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
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  isDark: boolean;
}

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  icon,
  isDark
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`
            w-full rounded-lg border text-sm transition-colors
            ${icon ? 'pl-10 pr-4' : 'px-4'} py-2.5
            ${isDark
              ? 'bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus:border-[#E0312A] focus:ring-1 focus:ring-[#E0312A]/20'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#E0312A] focus:ring-1 focus:ring-[#E0312A]/20'
            }
          `}
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SELECT FIELD
   ═══════════════════════════════════════════════════════════════════════════ */
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  icon?: React.ReactNode;
  isDark: boolean;
}

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required,
  icon,
  isDark
}: SelectFieldProps) => {
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
            absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none
            ${hasValue ? 'text-[#E0312A]' : isDark ? 'text-gray-500' : 'text-gray-400'}
          `}>
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`
            w-full rounded-lg border text-sm transition-colors appearance-none cursor-pointer
            ${icon ? 'pl-10 pr-10' : 'px-4 pr-10'} py-2.5
            ${isDark
              ? 'bg-neutral-800 border-neutral-700 text-white focus:border-[#E0312A] focus:ring-1 focus:ring-[#E0312A]/20'
              : 'bg-white border-gray-200 text-gray-900 focus:border-[#E0312A] focus:ring-1 focus:ring-[#E0312A]/20'
            }
          `}
        >
          <option value="">Seleccione...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className={`
          absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
          ${isDark ? 'text-gray-500' : 'text-gray-400'}
        `}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
