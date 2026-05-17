import type { Warehouse, Product } from '../../types/inventario/stock';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    return String((e as Record<string, unknown>)['message']);
  }
  return 'Error desconocido';
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const stockService = {
  /**
   * Obtiene todos los almacenes y todos los productos con datos de stock.
   * Los productos se construyen a partir de la tabla `inventario` (JOIN con
   * `producto` y `almacen`) para obtener el almacén y stock real por fila.
   */
  fetchAllData: async (): Promise<{ warehouses: Warehouse[]; products: Product[] }> => {
    try {
      const [almRes, invRes, prodCategRes] = await Promise.all([
        supabase
          .from('almacen')
          .select('id, nombre, codigo, estado, direccion')
          .order('nombre'),
        supabase
          .from('inventario')
          .select(
            'id_producto, id_almacen, stock_actual, stock_minimo, stock_maximo, ubicacion',
          ),
        supabase
          .from('vw_productos')
          .select('id, nombre, sku, precio_venta, precio_compra, unidad_medida, "categoriaNombre"'),
      ]);

      if (almRes.error) throw new Error(almRes.error.message);
      if (invRes.error) throw new Error(invRes.error.message);
      if (prodCategRes.error) throw new Error(prodCategRes.error.message);

      const warehouses: Warehouse[] = (almRes.data ?? []).map((a) => ({
        id: Number(a.id),
        nombre: String(a.nombre),
        codigo: String(a.codigo ?? ''),
        estado: (a.estado as 'ACTIVO' | 'INACTIVO') ?? 'ACTIVO',
        direccion: String(a.direccion ?? ''),
      }));

      // Mapa de almacén por id
      const almacenMap = new Map<number, string>();
      for (const a of almRes.data ?? []) {
        almacenMap.set(Number(a.id), String(a.nombre));
      }

      // Mapa de producto base por id (desde vw_productos)
      const prodMap = new Map<number, Record<string, unknown>>();
      for (const p of prodCategRes.data ?? []) {
        prodMap.set(Number(p.id), p as Record<string, unknown>);
      }

      // Construir lista de productos desde inventario (un registro por fila de inventario)
      const seenProducts = new Set<number>();
      const products: Product[] = [];

      for (const inv of invRes.data ?? []) {
        const pid = Number(inv.id_producto);
        if (seenProducts.has(pid)) continue;
        seenProducts.add(pid);

        const prod = prodMap.get(pid);
        if (!prod) continue;

        const almId = Number(inv.id_almacen);

        products.push({
          id: pid,
          nombre: String(prod['nombre'] ?? ''),
          sku: String(prod['sku'] ?? 'N/A'),
          categoria: String(prod['categoriaNombre'] ?? 'General'),
          stockActual: Number(inv.stock_actual ?? 0),
          stockMinimo: Number(inv.stock_minimo ?? 0),
          stockMaximo: Number(inv.stock_maximo ?? 0),
          precioVenta: parseFloat(String(prod['precio_venta'] ?? '0')),
          precioCompra: parseFloat(String(prod['precio_compra'] ?? '0')),
          almacenNombre: almacenMap.get(almId) ?? 'Principal',
          unidad: String(prod['unidad_medida'] ?? 'UNIDAD'),
          ubicacion: String(inv.ubicacion ?? ''),
        });
      }

      return { warehouses, products };

    } catch (error: unknown) {
      console.error('[stockService.fetchAllData]', error);
      throw new Error(getErrorMessage(error) || 'No se pudieron cargar los datos del inventario.');
    }
  },
};
