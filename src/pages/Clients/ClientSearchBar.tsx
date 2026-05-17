import {
  LuSearch,
  LuCreditCard,
  LuFilter,
  LuUser,
  LuBriefcase
} from "react-icons/lu";
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { ClienteFilters } from "../../types/clientes/Client";

interface Props {
  filters: ClienteFilters;
  onChange: (field: keyof ClienteFilters, value: string) => void;
}

export default function ClientsSearchBar({ filters, onChange }: Props) {
  const { isDark } = useThemeClasses();

  const inputClasses = `block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm transition-all shadow-sm focus:outline-none focus:ring-1 ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-gray-700'
      : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white'
  }`;

  const selectClasses = `block w-full rounded-lg border pl-10 pr-10 py-2.5 text-sm transition-all shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 ${
    isDark
      ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-gray-700'
      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white'
  }`;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* --- Campo 1: Búsqueda por Nombre (Ocupa más espacio) --- */}
        <div className="md:col-span-6 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LuSearch className={`h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombres o apellidos..."
            className={inputClasses}
            value={filters.texto}
            onChange={(e) => onChange("texto", e.target.value)}
          />
        </div>

        {/* --- Campo 2: Búsqueda por DNI --- */}
        <div className="md:col-span-3 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LuCreditCard className={`h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Documento / DNI"
            className={inputClasses}
            value={filters.dni}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) onChange("dni", val);
            }}
            maxLength={12}
          />
        </div>

        {/* --- Campo 3: Filtro por Tipo --- */}
        <div className="md:col-span-3 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LuFilter className={`h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
          </div>
          <select
            className={selectClasses}
            value={filters.tipo}
            onChange={(e) => onChange("tipo", e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="NATURAL">Persona Natural</option>
            <option value="JURIDICA">Persona Jurídica</option>
          </select>

          {/* Icono decorativo a la derecha */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
             {filters.tipo === 'NATURAL' && <LuUser className="h-4 w-4 text-emerald-500" />}
             {filters.tipo === 'JURIDICA' && <LuBriefcase className="h-4 w-4 text-indigo-500" />}
          </div>
        </div>

      </div>
    </div>
  );
}
