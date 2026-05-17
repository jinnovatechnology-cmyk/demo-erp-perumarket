import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Warehouse } from '../../types/inventario/warehouse';
import { warehouseService } from '../../services/inventario/warehouseService';

export const useWarehouseList = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProductTypes, setTotalProductTypes] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseService.fetchWarehousesData();
      setWarehouses(data.warehouses);
      setTotalProductTypes(data.totalProductTypes);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Cálculos derivados (Stats)
  const activeWarehouses = useMemo(() => warehouses.filter(w => w.estado === 'ACTIVO').length, [warehouses]);
  const totalProductUnits = useMemo(() => warehouses.reduce((sum, w) => sum + w.capacityUsed, 0), [warehouses]);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(w =>
      w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, warehouses]);

  return {
    warehouses,
    setWarehouses, // Exponemos esto para que el hook de edición pueda actualizar la lista localmente
    loading,
    error,
    totalProductTypes,
    activeWarehouses,
    totalProductUnits,
    searchTerm,
    setSearchTerm,
    filteredWarehouses
  };
};