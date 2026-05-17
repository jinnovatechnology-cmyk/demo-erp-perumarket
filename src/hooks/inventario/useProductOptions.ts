import { useState, useEffect, useCallback } from 'react';
import type { Option } from '../../types/inventario/product';
import { productService } from '../../services/inventario/productService';

export const useProductOptions = (onError: (msg: string) => void) => {
  const [categorias, setCategorias] = useState<Option[]>([]);
  const [almacenes, setAlmacenes] = useState<Option[]>([]);
  const [proveedores, setProveedores] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const data = await productService.fetchOptions();
      setCategorias(data.categorias);
      setAlmacenes(data.almacenes);
      setProveedores(data.proveedores);
    } catch (error) {
      console.error('Error al cargar opciones:', error);
      onError('Error al cargar opciones iniciales.');
    } finally {
      setLoadingOptions(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return { categorias, almacenes, proveedores, loadingOptions };
};