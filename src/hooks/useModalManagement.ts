// En useModalManagement.ts (o agregar en tu hook existente)
import { useState } from 'react';
import type { Employee, Departament } from '../types/Employee';

export const useModalManagement = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDepFormVisible, setIsDepFormVisible] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [formEmployee, setFormEmployee] = useState<Employee | null>(null);
  const [formDepartment, setFormDepartment] = useState<Departament>({
    id: undefined,
    nombre: "",
    descripcion: ""
  });

  const openForm = (emp?: Employee) => {
    setFormEmployee(emp || {
      empleadoId: undefined,
      persona: {
        tipoDocumento: "DNI",
        numeroDocumento: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        correo: "",
        telefono: "",
        fechaNacimiento: "",
        direccion: ""
      },
      departamento: null,
      puesto: "",
      sueldo: 0,
      fechaContratacion: new Date().toISOString().split('T')[0],
      estado: "ACTIVO",
      foto: "",
      cv: ""
    });
    setIsFormVisible(true);
  };

  const openDepartmentForm = (dep?: Departament) => {
    setFormDepartment(dep || { id: undefined, nombre: "", descripcion: "" });
    setIsDepFormVisible(true);
  };

  const setFormEmployeeField = (field: string, value: any) => {
    setFormEmployee(prev => {
      if (!prev) return prev;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const setFormDepartmentField = (field: keyof Departament, value: any) => {
    setFormDepartment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    isFormVisible,
    isDepFormVisible,
    deletingEmployee,
    formEmployee,
    formDepartment, // ← NUEVO
    openForm,
    closeForm: () => setIsFormVisible(false),
    openDepartmentForm,
    closeDepartmentForm: () => setIsDepFormVisible(false),
    setDeletingEmployee,
    setFormEmployeeField,
    closeDeleteModal: () => setDeletingEmployee(null),
    setFormDepartmentField // ← NUEVO
  };
};