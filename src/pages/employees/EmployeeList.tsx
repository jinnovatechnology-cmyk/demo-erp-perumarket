import type { Employee } from "../../types/Employee";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface Props {
  employees: Employee[];
  departamentos: { id: string | number; nombre: string }[];
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  // ...otros props de acciones
}

export default function EmployeeList({ employees, onEdit, onDelete }: Props) {
  const theme = useThemeClasses();

  return (
    <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${theme.isDark ? 'ring-gray-700' : ''}`}>
      <table className={`min-w-full divide-y ${theme.divider}`}>
        <thead className={theme.tableHeader}>
          <tr>
            <th scope="col" className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${theme.heading} sm:pl-6`}>Empleado</th>
            <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${theme.heading}`}>Documento</th>
            <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${theme.heading}`}>Departamento</th>
            <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${theme.heading}`}>Estado</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${theme.divider} ${theme.isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {employees.map((emp) => (
            <tr key={emp.empleadoId} className={`${theme.listItemHover} transition-colors`}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs border ${
                      theme.isDark
                        ? 'bg-[var(--color-primary-900)]/20 text-[var(--color-primary-400)] border-[var(--color-primary-800)]'
                        : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    }`}>
                        {emp.persona.nombres.charAt(0)}{emp.persona.apellidoPaterno.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className={`font-medium ${theme.heading}`}>{emp.persona.nombres} {emp.persona.apellidoPaterno}</div>
                    <div className={theme.textTertiary}>{emp.persona.correo}</div>
                  </div>
                </div>
              </td>
              <td className={`whitespace-nowrap px-3 py-4 text-sm ${theme.textTertiary}`}>
                <div className={theme.heading}>{emp.persona.numeroDocumento}</div>
                <div className={`text-xs ${theme.isDark ? 'text-gray-500' : 'text-slate-400'}`}>{emp.persona.tipoDocumento}</div>
              </td>
              <td className={`whitespace-nowrap px-3 py-4 text-sm ${theme.textTertiary}`}>
                {emp.departamento?.nombre || <span className={`italic ${theme.isDark ? 'text-gray-500' : 'text-slate-400'}`}>No asignado</span>}
              </td>
              <td className={`whitespace-nowrap px-3 py-4 text-sm ${theme.textTertiary}`}>
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  emp.estado === 'ACTIVO'
                  ? theme.statusActive
                  : theme.statusInactive
                }`}>
                  {emp.estado}
                </span>
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button
                    onClick={() => onEdit(emp)}
                    className="mr-4 hover:opacity-80"
                    style={{ color: 'var(--color-primary-500)' }}
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete(emp)}
                    className="text-red-600 hover:text-red-900"
                >
                    Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
