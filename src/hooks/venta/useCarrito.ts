import { useState, useCallback } from 'react';
import type { Producto, ProductoVenta } from '../../types/ventas/ventas';

export const useCarrito = (productos: Producto[], setProductos: (p: Producto[]) => void) => {
  const [carrito, setCarrito] = useState<ProductoVenta[]>([]);

  const agregar = useCallback((producto: Producto) => {
    if (producto.stock <= 0) return alert('❌ No hay stock');
    const item = carrito.find(i => i.producto.id === producto.id);

    if (item) {
      if (producto.stock - 1 < 0) return alert('❌ No hay más unidades disponibles');
      setCarrito(carrito.map(i =>
        i.producto.id === producto.id
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.producto.precio }
          : i
      ));
    } else {
      setCarrito([...carrito, { producto, cantidad: 1, subtotal: producto.precio }]);
    }

    setProductos(productos.map(p =>
      p.id === producto.id ? { ...p, stock: p.stock - 1 } : p
    ));
  }, [carrito, productos, setProductos]);

  const actualizarCantidad = useCallback((id: number, cantidad: number) => {
    const item = carrito.find(i => i.producto.id === id);
    if (!item) return;

    const diferencia = cantidad - item.cantidad;

    if (diferencia > 0) {
      const prod = productos.find(p => p.id === id);
      if (!prod || prod.stock < diferencia) return alert('❌ No hay stock suficiente');
    }

    if (cantidad <= 0) {
      setCarrito(carrito.filter(i => i.producto.id !== id));
    } else {
      setCarrito(carrito.map(i =>
        i.producto.id === id
          ? { ...i, cantidad, subtotal: cantidad * i.producto.precio }
          : i
      ));
    }

    setProductos(productos.map(p =>
      p.id === id ? { ...p, stock: p.stock - diferencia } : p
    ));
  }, [carrito, productos, setProductos]);

  const limpiar = useCallback(() => {
    if (carrito.length === 0) return;
    if (!confirm('¿Seguro que quieres limpiar el carrito?')) return;

    const prodActualizados = productos.map(p => {
      const item = carrito.find(i => i.producto.id === p.id);
      return item ? { ...p, stock: p.stock + item.cantidad } : p;
    });

    setProductos(prodActualizados);
    setCarrito([]);
  }, [carrito, productos, setProductos]);

  return { carrito, agregar, actualizarCantidad, limpiar, setCarrito };
};
