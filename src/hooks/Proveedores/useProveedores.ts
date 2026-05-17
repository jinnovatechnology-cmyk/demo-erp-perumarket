import { useState, useEffect, useCallback } from 'react';
import type { ProveedorData } from '../../types/proveedor/proveedorType';
import { ProveedorService } from '../../services/Proveedores/proveedorService';

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState<ProveedorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProveedores = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const data = await ProveedorService.getAll(query);
      setProveedores(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos del servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  const addProveedor = async (data: ProveedorData) => {
    try {
      await ProveedorService.create(data);
      await fetchProveedores();
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Error al crear proveedor' };
    }
  };

  const editProveedor = async (id: number, data: ProveedorData) => {
    try {
      await ProveedorService.update(id, data);
      await fetchProveedores();
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Error al editar proveedor' };
    }
  };

const removeProveedor = async (id: number) => {
    try {
      await ProveedorService.delete(id);
      await fetchProveedores();
      return { success: true };
    } catch (error: any) {
      // 1. ELIMINA O COMENTA ESTA LÍNEA 
      // Al quitar esto, ya no verás el objeto de error expandible, solo la línea del navegador.
      // console.error("Error eliminando:", error); 

      // 2. Lógica para mostrar mensaje bonito al usuario
      let mensajeError = "No se puede eliminar el proveedor.";

      // Si el backend te manda un mensaje específico
      if (error.response?.data?.message) {
          mensajeError = error.response.data.message;
      } 
      
      // Si es error 500 (Server Error) o 409 (Conflicto de llaves foráneas)
      if (error.response?.status === 500 || error.response?.status === 409) {
         mensajeError = "No se puede eliminar: El proveedor tiene productos o compras asociadas.";
      }

      // Retornamos false para que el modal muestre la alerta, pero sin ensuciar la consola
      return { success: false, message: mensajeError };
    }
  };

  return {
    proveedores,
    loading,
    error,
    fetchProveedores,
    addProveedor,
    editProveedor,
    removeProveedor
  };
};