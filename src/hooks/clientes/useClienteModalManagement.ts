import { useState } from 'react';
import type { Cliente } from '../../types/clientes/Client';

export const useClienteModalManagement = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);
  const [formCliente, setFormCliente] = useState<Cliente | null>(null);

  // Abrir formulario (crear o editar)
  const openForm = (cliente?: Cliente) => {
    setFormCliente(cliente || {
      clienteId: undefined,
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
      tipo: "NATURAL",
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: "ACTIVO"
    });
    setIsFormVisible(true);
  };

  // Cerrar formulario
  const closeForm = () => {
    setIsFormVisible(false);
    setFormCliente(null);
  };

  // Manejar campos del formulario
  const setFormClienteField = (path: string, value: any) => {
    setFormCliente(prev => {
      if (!prev) return prev;
      
      // Si el path tiene puntos, navegamos por el objeto
      if (path.includes('.')) {
        const parts = path.split('.');
        if (parts.length === 2 && parts[0] === 'persona') {
          return {
            ...prev,
            persona: {
              ...prev.persona,
              [parts[1]]: value
            }
          };
        }
      }
      
      // Si no, es un campo directo
      return { ...prev, [path]: value };
    });
  };

  return {
    // Estados
    isFormVisible,
    deletingCliente,
    formCliente,
    
    // Acciones
    openForm,
    closeForm,
    setDeletingCliente,
    setFormClienteField,
    
    // Acción para cerrar modal de eliminación
    closeDeleteModal: () => setDeletingCliente(null)
  };
};