import { ventaService } from "../../services/ventas/ventaService";
import type { Cliente } from "../../types/clientes/Client";
import type { DetallePago } from "../../types/ventas/ventas";

export const useVenta = () => {
  const procesarVenta = async (cliente: Cliente | null, carrito: any[], detallesPago: DetallePago[]) => {
    try {
      if (!cliente || !cliente.clienteid) return alert('⚠️ Selecciona un cliente válido primero');
      if (carrito.length === 0) return alert('⚠️ Agrega productos al carrito primero');

      const totalPagos = detallesPago.reduce((sum, pago) => sum + pago.monto, 0);
      const { total } = ventaService.calcularTotales(carrito);

      if (Math.abs(totalPagos - total) > 0.01) {
        return alert(`⚠️ Total pagos (S/ ${totalPagos}) no coincide con total venta (S/ ${total})`);
      }

      const { idUsuario, idAlmacen } = ventaService.obtenerDatosSesion();
      const { subtotal, igv, total: totalVenta } = ventaService.calcularTotales(carrito);

      const ventaBody = {
        idCliente: cliente.clienteid,
        idUsuario,
        idAlmacen,
        subtotal,
        igv,
        total: totalVenta,
        detalles: carrito.map(item => ({
          idProducto: item.producto.id,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
          subtotal: item.subtotal
        })),
        pagos: detallesPago.map(pago => ({
          id_metodo_pago: pago.id_metodo_pago,
          monto: pago.monto,
          referencia: pago.referencia || ''
        }))
      };

      // Enviamos al backend
      const resultado = await ventaService.procesarVenta(ventaBody);

      // --- ELIMINADO: Actualizar stock manual ---
      // El backend ya lo hace. Si lo hacemos aquí, podríamos estar enviando
      // el stock "local" (del navegador) que podría estar desfasado.
      
      alert(`✅ Venta procesada correctamente. Total: S/ ${totalVenta.toFixed(2)}`);
      return resultado;

    } catch (error: any) {
      console.error('Error procesarVenta:', error);
      alert(error.message || "❌ Ocurrió un error al procesar la venta");
    }
  };

  return { procesarVenta };
};