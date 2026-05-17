import { useState, useEffect, useCallback, useMemo } from 'react';

import { inventoryService } from '../../services/inventario/inventoryService';
import type { Product } from '../../types/inventario/inventory';


export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal de Código de Barras
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  // --- NUEVO: ESTADOS PARA EL MODAL DE ELIMINAR ---
  const [productToDelete, setProductToDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Para mostrar spinner si demora

  // --- Carga de Datos ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAllProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- NUEVA LÓGICA DE BORRADO ---
  
  // 1. El usuario hace click en el botón de basura (abre modal)
  const initiateDelete = (id: number, nombre: string) => {
    setProductToDelete({ id, nombre });
  };

  // 2. El usuario confirma en el modal (ejecuta borrado)
  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
        await inventoryService.deleteProduct(productToDelete.id);
        // Actualización optimista
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        setProductToDelete(null); // Cierra el modal
    } catch (err: any) {
        console.error('Error:', err);
        alert(`Error al eliminar: ${err.message}`); // Aquí sí dejamos un alert simple por si falla el API
    } finally {
        setIsDeleting(false);
    }
  };

  // 3. El usuario cancela
  const cancelDelete = () => {
    setProductToDelete(null);
  };

  // ... (El resto de lógica de filtros y stats se mantiene igual) ...
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.categoriaNombre)));
    return ['all', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigoBarrasPrincipal?.includes(searchTerm);
      const matchesCategory = filterCategory === 'all' || product.categoriaNombre === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory, products]);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + p.stockActual * p.precioVenta, 0),
    lowStockCount: products.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo).length,
    outOfStockCount: products.filter(p => p.stockActual <= 0).length
  }), [products]);

  // Modal controls Barcode
  const openBarcodeModal = (product: Product) => {
    setSelectedProduct(product);
    setShowBarcodeModal(true);
  };

  const closeBarcodeModal = () => {
    setShowBarcodeModal(false);
    setSelectedProduct(null);
  };

  return {
    products,
    loading,
    error,
    filteredProducts,
    stats,
    categories,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    // Nuevos retornos para el delete
    initiateDelete,
    confirmDelete,
    cancelDelete,
    productToDelete,
    isDeleting,
    // Modal controls Barcode
    showBarcodeModal,
    selectedProduct,
    openBarcodeModal,
    closeBarcodeModal
  };
};