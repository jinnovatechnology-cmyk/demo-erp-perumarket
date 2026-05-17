import type { Product } from '../../types/inventario/inventory';
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

/** Normaliza una relación embebida de Supabase (objeto o array) a un único registro o null. */
function relOne<T>(rel: unknown): T | null {
  if (rel == null) return null;
  return (Array.isArray(rel) ? (rel[0] ?? null) : rel) as T | null;
}

// ---------------------------------------------------------------------------
// Tipos exportados (mantener idénticos para que las páginas no rompan)
// ---------------------------------------------------------------------------

export interface MovimientoInventario {
  id: number;
  tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  nombreAlmacen: string;
  fechaMovimiento: string;
  idUsuario: number;
  /** Campo adicional accedido en InventoryMovements.tsx (sin mapeo en BD, se deja vacío). */
  referencia?: string;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/**
 * Convierte un row de `vw_productos` (snake_case) al tipo `Product` (camelCase).
 * La vista trae: id, nombre, descripcion, sku, precio_venta, precio_compra,
 *   stock, stock_minimo, stock_maximo, unidad_medida, peso_kg, imagen,
 *   categoria_id, requiere_codigo_barras, estado, "categoriaNombre", "stockTotal".
 * Los campos que el backend original calculaba (almacén, proveedor, ubicación)
 * se obtienen desde tablas relacionadas (inventario y proveedor_producto).
 */
function mapVwProductoToProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row['id']),
    nombre: String(row['nombre'] ?? ''),
    descripcion: String(row['descripcion'] ?? ''),
    categoriaNombre: String(row['categoriaNombre'] ?? ''),
    estado: String(row['estado'] ?? 'ACTIVO'),
    precioVenta: parseFloat(String(row['precio_venta'] ?? '0')),
    sku: String(row['sku'] ?? ''),
    codigoBarrasPrincipal: String(row['codigoBarrasPrincipal'] ?? ''),
    stockActual: Number(row['stockTotal'] ?? row['stock'] ?? 0),
    stockMinimo: Number(row['stock_minimo'] ?? 0),
    stockMaximo: Number(row['stock_maximo'] ?? 0),
    imagen: String(row['imagen'] ?? ''),
    pesoKg: parseFloat(String(row['peso_kg'] ?? '0')),
    unidadMedida: String(row['unidad_medida'] ?? 'UNIDAD'),
    ubicacionPrincipal: String(row['ubicacionPrincipal'] ?? ''),
    categoriaId: row['categoria_id'] != null ? Number(row['categoria_id']) : null,
    almacenId: row['almacenId'] != null ? Number(row['almacenId']) : null,
    almacenNombre: String(row['almacenNombre'] ?? ''),
    proveedorId: row['proveedorId'] != null ? Number(row['proveedorId']) : null,
    proveedorRazonSocial: String(row['proveedorRazonSocial'] ?? ''),
    precioCompra: parseFloat(String(row['precio_compra'] ?? '0')),
    purchases: 0,
    sales: 0,
    orders: 0,
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const inventoryService = {

  /**
   * Obtiene todos los productos enriquecidos desde `vw_productos` y agrega
   * datos de almacén, ubicación, proveedor y código de barras principal.
   */
  getAllProducts: async (): Promise<Product[]> => {
    // 1. Vista principal (incluye categoriaNombre y stockTotal)
    const { data: vwData, error: vwError } = await supabase
      .from('vw_productos')
      .select('*')
      .order('nombre');

    if (vwError) {
      console.error('[inventoryService.getAllProducts] vw_productos:', vwError.message);
      throw new Error(vwError.message);
    }

    const rows = (vwData ?? []) as Record<string, unknown>[];
    if (rows.length === 0) return [];

    const ids = rows.map((r) => Number(r['id']));

    // 2. Código de barras principal por producto
    const { data: barcodesData } = await supabase
      .from('codigo_barras')
      .select('id_producto, codigo')
      .in('id_producto', ids)
      .eq('es_principal', true)
      .eq('estado', 'ACTIVO');

    const barcodeMap = new Map<number, string>();
    for (const b of barcodesData ?? []) {
      barcodeMap.set(Number(b.id_producto), b.codigo as string);
    }

    // 3. Inventario principal (almacén + ubicación)
    const { data: invData } = await supabase
      .from('inventario')
      .select('id_producto, id_almacen, ubicacion, almacen:id_almacen(id, nombre)')
      .in('id_producto', ids);

    // Tomamos el primer registro de inventario por producto (el "principal")
    const invMap = new Map<number, { almacenId: number; almacenNombre: string; ubicacion: string }>();
    for (const inv of invData ?? []) {
      const pid = Number(inv.id_producto);
      if (!invMap.has(pid)) {
        const almacen = relOne<{ id: number; nombre: string }>(inv.almacen);
        invMap.set(pid, {
          almacenId: almacen ? Number(almacen.id) : 0,
          almacenNombre: almacen ? String(almacen.nombre) : '',
          ubicacion: String(inv.ubicacion ?? ''),
        });
      }
    }

    // 4. Proveedor principal por producto
    const { data: provData } = await supabase
      .from('proveedor_producto')
      .select('id_producto, id_proveedor, proveedor:id_proveedor(id, razon_social)')
      .in('id_producto', ids)
      .eq('es_principal', true);

    const provMap = new Map<number, { proveedorId: number; proveedorRazonSocial: string }>();
    for (const pp of provData ?? []) {
      const pid = Number(pp.id_producto);
      if (!provMap.has(pid)) {
        const prov = relOne<{ id: number; razon_social: string }>(pp.proveedor);
        provMap.set(pid, {
          proveedorId: prov ? Number(prov.id) : 0,
          proveedorRazonSocial: prov ? String(prov.razon_social) : '',
        });
      }
    }

    // 5. Combinar todo
    return rows.map((row) => {
      const id = Number(row['id']);
      const inv = invMap.get(id);
      const prov = provMap.get(id);

      const enriched: Record<string, unknown> = {
        ...row,
        codigoBarrasPrincipal: barcodeMap.get(id) ?? '',
        almacenId: inv?.almacenId ?? null,
        almacenNombre: inv?.almacenNombre ?? '',
        ubicacionPrincipal: inv?.ubicacion ?? '',
        proveedorId: prov?.proveedorId ?? null,
        proveedorRazonSocial: prov?.proveedorRazonSocial ?? '',
      };

      return mapVwProductoToProduct(enriched);
    });
  },

  /** Obtiene un único producto por ID con todos sus datos relacionados. */
  getProductById: async (id: number): Promise<Product> => {
    const { data: vwRow, error: vwError } = await supabase
      .from('vw_productos')
      .select('*')
      .eq('id', id)
      .single();

    if (vwError || !vwRow) {
      const msg = vwError?.message ?? 'Producto no encontrado';
      console.error('[inventoryService.getProductById]', msg);
      throw new Error(msg);
    }

    const row = vwRow as Record<string, unknown>;

    // Código de barras principal
    const { data: barcodeData } = await supabase
      .from('codigo_barras')
      .select('codigo')
      .eq('id_producto', id)
      .eq('es_principal', true)
      .eq('estado', 'ACTIVO')
      .maybeSingle();

    // Inventario
    const { data: invData } = await supabase
      .from('inventario')
      .select('id_almacen, ubicacion, almacen:id_almacen(id, nombre)')
      .eq('id_producto', id)
      .limit(1)
      .maybeSingle();

    const almacen = relOne<{ id: number; nombre: string }>(invData?.almacen);

    // Proveedor principal
    const { data: provData } = await supabase
      .from('proveedor_producto')
      .select('id_proveedor, proveedor:id_proveedor(id, razon_social)')
      .eq('id_producto', id)
      .eq('es_principal', true)
      .maybeSingle();

    const prov = relOne<{ id: number; razon_social: string }>(provData?.proveedor);

    const enriched: Record<string, unknown> = {
      ...row,
      codigoBarrasPrincipal: barcodeData ? String(barcodeData.codigo) : '',
      almacenId: almacen ? Number(almacen.id) : null,
      almacenNombre: almacen ? String(almacen.nombre) : '',
      ubicacionPrincipal: invData ? String(invData.ubicacion ?? '') : '',
      proveedorId: prov ? Number(prov.id) : null,
      proveedorRazonSocial: prov ? String(prov.razon_social) : '',
    };

    return mapVwProductoToProduct(enriched);
  },

  /** Obtiene los movimientos de inventario de un producto. */
  getMovimientos: async (productoId: number): Promise<MovimientoInventario[]> => {
    const { data, error } = await supabase
      .from('movimiento_inventario')
      .select('id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, id_usuario, fecha_movimiento, almacen:id_almacen(nombre)')
      .eq('id_producto', productoId)
      .order('fecha_movimiento', { ascending: false });

    if (error) {
      console.error('[inventoryService.getMovimientos]', error.message);
      throw new Error(error.message);
    }

    return (data ?? []).map((m) => {
      const almacen = relOne<{ nombre: string }>(m.almacen);
      return {
        id: Number(m.id),
        tipoMovimiento: m.tipo_movimiento as MovimientoInventario['tipoMovimiento'],
        cantidad: Number(m.cantidad),
        stockAnterior: Number(m.stock_anterior),
        stockNuevo: Number(m.stock_nuevo),
        motivo: String(m.motivo ?? ''),
        nombreAlmacen: almacen ? String(almacen.nombre) : '',
        fechaMovimiento: String(m.fecha_movimiento ?? ''),
        idUsuario: Number(m.id_usuario ?? 0),
      };
    });
  },

  /** Elimina un producto por ID. */
  deleteProduct: async (id: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('producto')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
    } catch (error: unknown) {
      console.error('[inventoryService.deleteProduct]', error);
      throw new Error(getErrorMessage(error));
    }
  },
};
