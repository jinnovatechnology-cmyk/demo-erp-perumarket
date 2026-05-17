// hooks/useDatosIniciales.ts
import { useState, useEffect } from 'react';
import type { MetodoPago, Producto } from '../../types/ventas/ventas';
import type { Cliente } from '../../types/clientes/Client';
import { ventaService } from '../../services/ventas/ventaService';


export const useDatosIniciales = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [metodos, clientesData, productosData, almacenesData] = await Promise.all([
          ventaService.cargarMetodosPago(),
          ventaService.fetchClientes(),
          ventaService.fetchProductos(),
          ventaService.fetchAlmacenes()
        ]);
        setMetodosPago(metodos);
        setClientes(clientesData);
        setProductos(productosData);
        setAlmacenes(almacenesData);
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        alert('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return { productos, setProductos, clientes, setClientes, metodosPago, almacenes, loading };
};
