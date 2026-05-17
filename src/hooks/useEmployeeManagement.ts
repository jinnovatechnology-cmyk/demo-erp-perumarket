import { useState, useEffect, useCallback, useMemo } from 'react';
import { EmployeeService, DepartmentService } from '../services/employeeService';
import type { Employee, Departament, EmployeeFilters, EmployeeStats } from '../types/Employee';

const initialFilters: EmployeeFilters = {
  texto: '',
  dni: '',
  estado: ''
};

export const useEmployeeManagement = () => {
  // Estados
  const [departamentos, setDepartamentos] = useState<Departament[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>(initialFilters);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar en paralelo
      const [deptsData, empsData] = await Promise.all([
        DepartmentService.getAllDepartments(),
        EmployeeService.getAllEmployees()
      ]);
      
      setDepartamentos(deptsData);
      setEmployees(empsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrado de empleados
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Filtro por texto (busca en nombres, apellidos, puesto)
      if (filters.texto) {
        const searchText = filters.texto.toLowerCase();
        const fullName = `${emp.persona.nombres} ${emp.persona.apellidoPaterno} ${emp.persona.apellidoMaterno}`.toLowerCase();
        const matches = 
          fullName.includes(searchText) ||
          emp.puesto.toLowerCase().includes(searchText) ||
          emp.persona.correo.toLowerCase().includes(searchText);
        if (!matches) return false;
      }

      // Filtro por DNI
      if (filters.dni && !emp.persona.numeroDocumento.includes(filters.dni)) {
        return false;
      }

      // Filtro por estado
      if (filters.estado && emp.estado !== filters.estado) {
        return false;
      }

      return true;
    });
  }, [employees, filters]);

  // Estadísticas
  const stats: EmployeeStats = useMemo(() => {
    const total = employees.length;
    const activos = employees.filter(e => e.estado === 'ACTIVO').length;
    const inactivos = employees.filter(e => e.estado === 'INACTIVO').length;
    const filtered = filteredEmployees.length;

    return { total, activos, inactivos, filtered };
  }, [employees, filteredEmployees]);

  // Handlers
  const handleFilterChange = useCallback((field: keyof EmployeeFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const handleSaveEmployee = async (emp: Employee): Promise<boolean> => {
    try {
      setError(null);
      const savedEmp = await EmployeeService.saveEmployee(emp);
      
      // Actualizar lista de empleados
      setEmployees(prev => {
        if (emp.empleadoId) {
          // Edición
          return prev.map(e => e.empleadoId === emp.empleadoId ? savedEmp : e);
        } else {
          // Nuevo
          return [...prev, savedEmp];
        }
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al guardar empleado');
      return false;
    }
  };

  const handleDeleteEmployee = async (empleadoId: number): Promise<boolean> => {
    try {
      await EmployeeService.deleteEmployee(empleadoId);
      
      // Remover de la lista
      setEmployees(prev => prev.filter(e => e.empleadoId !== empleadoId));
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar empleado');
      return false;
    }
  };

  const handleSaveDepartment = async (dep: Departament): Promise<boolean> => {
    try {
      setError(null);
      const savedDep = await DepartmentService.saveDepartment(dep);
      
      // Actualizar lista de departamentos
      setDepartamentos(prev => {
        if (dep.id) {
          // Edición
          return prev.map(d => d.id === dep.id ? savedDep : d);
        } else {
          // Nuevo
          return [...prev, savedDep];
        }
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al guardar departamento');
      return false;
    }
  };

  return {
    // Estados
    departamentos,
    employees,
    loading,
    error,
    filters,
    
    // Datos procesados
    filteredEmployees,
    stats,
    
    // Handlers
    handleFilterChange,
    clearFilters,
    handleSaveEmployee,
    handleDeleteEmployee,
    handleSaveDepartment,
    
    // Para recargar datos si es necesario
    refreshData: loadData
  };
};