import type { Warehouse, WarehouseUpdateDTO } from '../../types/inventario/warehouse';
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
// Mappers
// ---------------------------------------------------------------------------

/** Convierte `WarehouseUpdateDTO` (camelCase) al row de `almacen` (snake_case). */
function dtoToAlmacenRow(data: WarehouseUpdateDTO) {
  return {
    nombre: data.nombre,
    codigo: data.codigo,
    direccion: data.direccion,
    responsable: data.responsable,
    capacidad_m3: data.capacidadM3,
    estado: data.estado,
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const warehouseService = {

  /**
   * Obtiene almacenes con datos calculados (productos, stock usado, stock máximo).
   * Hace el cruce con la tabla `inventario` para sumas reales.
   */
  fetchWarehousesData: async (): Promise<{ warehouses: Warehouse[]; totalProductTypes: number }> => {
    try {
      const [almRes, invRes] = await Promise.all([
        supabase
          .from('almacen')
          .select('id, nombre, codigo, estado, direccion, responsable, capacidad_m3')
          .order('nombre'),
        supabase
          .from('inventario')
          .select('id_almacen, id_producto, stock_actual, stock_maximo'),
      ]);

      if (almRes.error) throw new Error(almRes.error.message);
      if (invRes.error) throw new Error(invRes.error.message);

      const inventarioRows = invRes.data ?? [];

      // Conteo total de tipos de producto únicos en todo el inventario
      const allProductIds = new Set(inventarioRows.map((i) => Number(i.id_producto)));
      const totalProductTypes = allProductIds.size;

      const warehouses: Warehouse[] = (almRes.data ?? []).map((a) => {
        const almacenId = Number(a.id);
        const invForWarehouse = inventarioRows.filter((i) => Number(i.id_almacen) === almacenId);

        const capacityUsed = invForWarehouse.reduce((sum, i) => sum + Number(i.stock_actual ?? 0), 0);
        const capacityTotalUnits = invForWarehouse.reduce((sum, i) => sum + Number(i.stock_maximo ?? 0), 0);
        const productsCount = invForWarehouse.length;

        return {
          id: almacenId,
          nombre: String(a.nombre),
          codigo: String(a.codigo ?? ''),
          estado: (a.estado as 'ACTIVO' | 'INACTIVO' | string) ?? 'ACTIVO',
          direccion: String(a.direccion ?? ''),
          responsable: String(a.responsable ?? ''),
          capacidadM3: parseFloat(String(a.capacidad_m3 ?? '0')),
          productsCount,
          capacityUsed,
          capacityTotalUnits,
        };
      });

      return { warehouses, totalProductTypes };

    } catch (error: unknown) {
      console.error('[warehouseService.fetchWarehousesData]', error);
      throw new Error(getErrorMessage(error) || 'Error al obtener datos de almacenes y productos.');
    }
  },

  /** Actualiza los datos de un almacén. */
  updateWarehouse: async (id: number, data: WarehouseUpdateDTO): Promise<void> => {
    try {
      const { error } = await supabase
        .from('almacen')
        .update(dtoToAlmacenRow(data))
        .eq('id', id);

      if (error) throw new Error(error.message);

    } catch (error: unknown) {
      console.error('[warehouseService.updateWarehouse]', error);
      throw new Error(getErrorMessage(error) || 'Error al actualizar el almacén');
    }
  },
};
