import { useState, useEffect, useMemo } from 'react';
import { ventaService } from '../../services/ventas/ventaService';
import type { Producto } from '../../types/ventas/ventas';

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const data = await ventaService.fetchProductos();
        setProductos(data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const productosFiltrados = useMemo(() => 
    productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.nombre.toLowerCase().includes(busqueda.toLowerCase())
    ), [productos, busqueda]);

  return { productos, productosFiltrados, busqueda, setBusqueda, setProductos, loading };
};
