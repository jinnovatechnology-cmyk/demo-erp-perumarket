import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
// NOTA: Ajusta la ruta "../.." según donde tengas la carpeta 'types'
import type { Product, Warehouse } from '../../types/inventario/stock';
import { stockService } from '../../services/inventario/stockService';

export const useStockByWarehouse = () => {
  const { id: warehouseIdParam } = useParams<{ id: string }>();

  // Estados
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // Carga de datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { warehouses, products } = await stockService.fetchAllData();

      setAllWarehouses(warehouses);
      setAllProducts(products);

      // Lógica de selección inicial
      const initialId = warehouseIdParam ? parseInt(warehouseIdParam) : (warehouses[0]?.id || null);
      if (initialId) {
        const initialWarehouse = warehouses.find(w => w.id === initialId);
        setSelectedWarehouse(initialWarehouse || warehouses[0] || null);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [warehouseIdParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrado
  const filteredProducts = useMemo(() => {
    if (!selectedWarehouse) return [];
    
    return allProducts.filter(product => {
      // Validación de seguridad por si algún dato viene nulo
      const prodAlmacen = product.almacenNombre || '';
      const prodNombre = product.nombre || '';
      const prodSku = product.sku || '';

      const matchesWarehouse = prodAlmacen === selectedWarehouse.nombre;
      const matchesSearch = prodNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prodSku.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesWarehouse && matchesSearch;
    });
  }, [searchTerm, selectedWarehouse, allProducts]);

  // Estadísticas
  const stats = useMemo(() => ({
    totalStock: filteredProducts.reduce((sum, p) => sum + (p.stockActual || 0), 0),
    totalValue: filteredProducts.reduce((sum, p) => sum + ((p.stockActual || 0) * (p.precioVenta || 0)), 0)
  }), [filteredProducts]);

  // Handlers
  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const newWarehouse = allWarehouses.find(w => w.id === selectedId);
    if (newWarehouse) {
      setSelectedWarehouse(newWarehouse);
    }
  };

  return {
    allWarehouses,
    selectedWarehouse,
    filteredProducts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleWarehouseChange,
    stats
  };
};