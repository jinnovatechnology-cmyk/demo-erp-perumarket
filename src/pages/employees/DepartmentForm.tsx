import type { Departament } from "../../types/Employee";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { LuX } from "react-icons/lu";

interface Props {
  state: Departament;
  setField: (field: keyof Departament, value: any) => void;
  onCancel: () => void;
  onSave: (dep: Departament) => Promise<void>;
}

export default function DepartmentForm({ state, setField, onCancel, onSave }: Props) {
  const theme = useThemeClasses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!state.nombre.trim()) {
      alert("El nombre del departamento es requerido");
      return;
    }

    await onSave(state);
  };

  const inputClass = `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-500)] ${theme.input}`;

  return (
    <div className={`p-6 ${theme.isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="sm:flex sm:items-start">
        <div className={`hidden sm:flex mx-auto flex-shrink-0 items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
          theme.isDark ? 'bg-[var(--color-primary-900)]/30' : 'bg-indigo-100'
        }`}>
          <svg className="h-6 w-6" style={{ color: 'var(--color-primary-500)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 w-full">
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${theme.heading}`}>
              {state.id ? 'Editar Departamento' : 'Nuevo Departamento'}
            </h3>
            <button
              onClick={onCancel}
              className={`sm:hidden p-2 ${theme.btnGhost}`}
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>

          <p className={`text-sm ${theme.textTertiary} mt-1 mb-6`}>
            Complete la informacion basica del area operativa.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>
                Nombre del Departamento *
              </label>
              <input
                type="text"
                className={inputClass}
                value={state.nombre}
                onChange={e => setField("nombre", e.target.value)}
                placeholder="Ej: Recursos Humanos, Ventas, IT..."
                required
                autoFocus
              />
            </div>

            {/* Descripcion */}
            <div>
              <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>
                Descripcion Funcional
              </label>
              <textarea
                className={`${inputClass} min-h-[100px]`}
                value={state.descripcion || ""}
                onChange={e => setField("descripcion", e.target.value)}
                placeholder="Describa las responsabilidades principales y objetivos del departamento..."
                rows={4}
              />
            </div>

            {/* Footer de Acciones */}
            <div className={`flex justify-end gap-3 pt-4 border-t ${theme.border}`}>
              <button
                type="button"
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${theme.btnGhost}`}
                onClick={onCancel}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.btnPrimary}`}
              >
                {state.id ? 'Actualizar' : 'Crear'} Departamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
