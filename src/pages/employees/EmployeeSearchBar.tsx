import type { EmployeeFilters } from "../../types/Employee";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface Props {
  filters: EmployeeFilters;
  onChange: (field: keyof EmployeeFilters, value: string) => void;
}

export default function EmployeeSearchBar({ filters, onChange }: Props) {
  const theme = useThemeClasses();

  const inputClasses = `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-500)] ${theme.input}`;
  const selectClasses = `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-500)] ${theme.select}`;

  return (
    <div className="space-y-4">
      {/* Busqueda por texto general */}
      <div>
        <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>
          Buscar empleado
        </label>
        <input
          type="text"
          className={inputClasses}
          placeholder="Buscar por nombre, apellido, puesto o correo..."
          value={filters.texto}
          onChange={(e) => onChange('texto', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Filtro por DNI */}
        <div>
          <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>
            N° Documento
          </label>
          <input
            type="text"
            className={inputClasses}
            placeholder="Ej: 12345678"
            value={filters.dni}
            onChange={(e) => onChange('dni', e.target.value)}
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>
            Estado
          </label>
          <select
            className={selectClasses}
            value={filters.estado}
            onChange={(e) => onChange('estado', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="PENDIENTE">Pendiente</option>
          </select>
        </div>
      </div>
    </div>
  );
}
