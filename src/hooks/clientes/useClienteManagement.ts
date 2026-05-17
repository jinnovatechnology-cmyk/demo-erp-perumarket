import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Cliente, ClienteFilters, ClienteStats } from '../../types/clientes/Client';
import { ClienteService } from '../../services/clientes/clienteService';

const initialFilters: ClienteFilters = {
  texto: '',
  dni: '',
  tipo: ''
};

export const useClienteManagement = () => {
  // --- ESTADOS ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClienteFilters>(initialFilters);
  
  // Estados UI
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formCliente, setFormCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);
  
  const hasLoaded = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  // --- CARGA DE DATOS ---
 const loadClientes = useCallback(async () => {
    if (hasLoaded.current && import.meta.env.DEV) return;
    try {
      setLoading(true);
      clearError();
      const data = await ClienteService.getAllClientes();
      setClientes(data);
      hasLoaded.current = true;
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [clearError]);
  // Inicializar
  useEffect(() => {
    if (!hasLoaded.current) loadClientes();
  }, [loadClientes]);

  // --- LÓGICA DE FILTRADO (Frontend) ---
  const filteredClientes = useMemo(() => {
    if (!filters.texto && !filters.dni && !filters.tipo) return clientes;
    
    return clientes.filter(cli => {
      if (filters.texto) {
        const txt = filters.texto.toLowerCase();
        const nombre = `${cli.persona.nombres} ${cli.persona.apellidoPaterno} ${cli.persona.apellidoMaterno}`.toLowerCase();
        if (!nombre.includes(txt) && !cli.persona.correo?.toLowerCase().includes(txt)) return false;
      }
      if (filters.dni && !cli.persona.numeroDocumento.includes(filters.dni)) return false;
      if (filters.tipo && cli.tipo !== filters.tipo) return false;
      return true;
    });
  }, [clientes, filters]);

  // --- ESTADÍSTICAS ---
  const stats: ClienteStats = useMemo(() => {
    return {
      total: clientes.length,
      activos: clientes.filter(c => c.estado === 'ACTIVO' || !c.estado).length,
      filtrados: filteredClientes.length
    };
  }, [clientes, filteredClientes]);

  // --- HANDLERS (CRUD) ---

  const handleFilterChange = useCallback((field: keyof ClienteFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

const clearFilters = useCallback(() => setFilters(initialFilters), []);
  const handleSaveCliente = async (cliente: Cliente): Promise<boolean> => {
    try {
      clearError();
      const saved = await ClienteService.saveCliente(cliente);
      setClientes(prev => cliente.id ? prev.map(c => c.id === cliente.id ? saved : c) : [...prev, saved]);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // hooks/clientes/useClienteManagement.ts

  // --- ELIMINAR (LÓGICA MEJORADA) ---
  const handleDeleteCliente = async (id: number): Promise<boolean> => {
    try {
      clearError();
      // 1. Intentar borrado físico
      await ClienteService.deleteCliente(id);
      
      // 2. Éxito: Quitar de la lista
      setClientes(prev => prev.filter(c => c.id !== id));
      return true;

    } catch (err: any) {
      const status = err.response?.status || err.status;

      // 3. Si hay conflicto (Ventas asociadas)
      if (status === 409) {
          const clienteActual = clientes.find(c => c.id === id);
          
          if (clienteActual?.estado === 'INACTIVO') {
             // Mensaje formal si ya está inactivo
             setError("No es posible eliminar este registro de la base de datos debido a que posee historial de ventas asociado. El cliente ya se encuentra en estado INACTIVO.");
          } else {
             // Preguntar para desactivar
             const confirmar = window.confirm(
                 "No es posible eliminar este cliente permanentemente porque tiene historial de ventas asociado.\n\n" +
                 "Para mantener la integridad de los datos, se recomienda cambiar su estado a INACTIVO.\n\n" +
                 "¿Desea desactivar al cliente ahora?"
             );
             
             if (confirmar) {
                 try {
                     await ClienteService.desactivarCliente(id);
                     setClientes(prev => prev.map(c => c.id === id ? { ...c, estado: 'INACTIVO' } : c));
                     return true; 
                 } catch (desactivarErr: any) {
                     setError("Error al intentar desactivar el cliente: " + desactivarErr.message);
                 }
             }
          }
          return false;
      }

      // Otros errores
      setError(err.message || 'Error al eliminar cliente');
      return false;
    }
  };

  // --- HANDLERS (MODALES) ---

 const openForm = useCallback((c?: Cliente) => {
      if (c) setFormCliente({...c});
      else setFormCliente({ 
          tipo: "NATURAL", estado: "ACTIVO", fechaCreacion: new Date().toISOString(),
          persona: { tipoDocumento: "DNI", numeroDocumento: "", nombres: "", apellidoPaterno: "", apellidoMaterno: "", correo: "", telefono: "", direccion: "" }
      });
      setIsFormVisible(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormVisible(false);
    setFormCliente(null);
    clearError();
  }, [clearError]);

  const closeDeleteModal = useCallback(() => {
    setDeletingCliente(null);
    clearError();
  }, [clearError]);

  // Helper para actualizar campos anidados del formulario
  const setFormField = useCallback((path: string, value: any) => {
    setFormCliente(prev => {
      if (!prev) return prev;
      const updated: any = { ...prev };
      let ref = updated;
      const keys = path.split('.');

      keys.forEach((k, i) => {
        if (i === keys.length - 1) {
          ref[k] = value;
        } else {
          if (!ref[k] || typeof ref[k] !== 'object') ref[k] = {};
          else ref[k] = { ...ref[k] }; // Clonar nivel
          ref = ref[k];
        }
      });
      return updated;
    });
  }, []);

  return {
    clientes,
    loading,
    error,
    filters,
    filteredClientes,
    stats,
    isFormVisible,
    formCliente,
    deletingCliente,
    handleFilterChange,
    clearFilters,
    handleSaveCliente,
    handleDeleteCliente,
    openForm,
    closeForm,
    setDeletingCliente,
    setFormField,
    closeDeleteModal,
    refreshData: loadClientes,
    clearError
  };
};