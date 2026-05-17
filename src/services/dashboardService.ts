import { supabase } from '../lib/supabase';

// ── helpers ───────────────────────────────────────────────────────────────────
function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ── tipos internos de base de datos (snake_case) ──────────────────────────────
interface VentaRow {
  id: number;
  total: number | null;
  subtotal: number | null;
  igv: number | null;
  descuento_total: number | null;
  estado: string;
  fecha: string;
  id_cliente: number;
  id_usuario: number;
  id_almacen: number;
}

interface DetalleVentaRow {
  id: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number | null;
  producto: { nombre: string } | null;
}

interface CompraRow {
  id: number;
  total: number | null;
  subtotal: number | null;
  igv: number | null;
  estado: string;
  fecha: string;
}


// ── tipos exportados ──────────────────────────────────────────────────────────
export interface VentaResponse {
  id: number;
  subtotal: number;
  descuentoTotal: number;
  igv: number;
  total: number;
  estado: string;
  fecha: string;
  nombreCliente: string;
  nombreAlmacen: string;
  nombreUsuario: string;
  detalles: {
    id: number;
    idProducto: number;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}

export interface CompraResponse {
  id: number;
  total: number;
  subtotal: number;
  igv: number;
  estado: string;
  fechaCompra: string;
  proveedor?: { razonSocial: string };
  detalles?: {
    producto: { id: number; nombre: string };
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}

export interface ProductoResponse {
  id: number;
  nombre: string;
  precioVenta: number;
  precioCompra: number;
  estado: string;
  categoriaNombre: string;
  stockActual: number;
  stockMinimo: number;
  almacenNombre: string;
}

export interface ClienteResponse {
  id: number;
  tipo: string;
  estado: string;
  persona: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

export interface DashboardStats {
  totalVentas: number;
  ingresoVentas: number;
  totalCompras: number;
  gastoCompras: number;
  productosActivos: number;
  productosBajoStock: number;
  clientesActivos: number;
  ventasPorMes: { name: string; ventas: number; compras: number }[];
  ventasPorDia: { name: string; ventas: number; ingresos: number }[];
  topProductos: { name: string; cantidad: number; ingresos: number }[];
  ventasRecientes: {
    id: number;
    cliente: string;
    total: number;
    estado: string;
    fecha: string;
  }[];
  distribucionCategorias: { name: string; value: number }[];
}

// ── constantes ────────────────────────────────────────────────────────────────
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ── funciones de agregación (JS) ──────────────────────────────────────────────
function agruparVentasPorMes(
  ventas: VentaResponse[],
  compras: CompraResponse[],
): DashboardStats['ventasPorMes'] {
  const año = new Date().getFullYear();
  const mesesMap: Record<number, { ventas: number; compras: number }> = {};
  for (let i = 0; i < 12; i++) mesesMap[i] = { ventas: 0, compras: 0 };

  ventas.forEach(v => {
    if (v.estado === 'COMPLETADA') {
      const fecha = new Date(v.fecha);
      if (fecha.getFullYear() === año) mesesMap[fecha.getMonth()].ventas += v.total;
    }
  });

  compras.forEach(c => {
    if (c.estado === 'COMPLETADA') {
      const fecha = new Date(c.fechaCompra);
      if (fecha.getFullYear() === año) mesesMap[fecha.getMonth()].compras += c.total;
    }
  });

  return MESES.map((name, i) => ({
    name,
    ventas: Math.round(mesesMap[i].ventas * 100) / 100,
    compras: Math.round(mesesMap[i].compras * 100) / 100,
  }));
}

function agruparVentasPorDiaSemana(ventas: VentaResponse[]): DashboardStats['ventasPorDia'] {
  const hoy = new Date();
  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hoy.getDate() - 6);

  const diasMap: Record<number, { ventas: number; ingresos: number }> = {};
  for (let i = 0; i < 7; i++) diasMap[i] = { ventas: 0, ingresos: 0 };

  ventas.forEach(v => {
    if (v.estado === 'COMPLETADA') {
      const fecha = new Date(v.fecha);
      if (fecha >= hace7Dias && fecha <= hoy) {
        const dia = fecha.getDay();
        diasMap[dia].ventas += 1;
        diasMap[dia].ingresos += v.total;
      }
    }
  });

  return DIAS_SEMANA.map((name, i) => ({
    name,
    ventas: diasMap[i].ventas,
    ingresos: Math.round(diasMap[i].ingresos * 100) / 100,
  }));
}

function calcularTopProductos(ventas: VentaResponse[]): DashboardStats['topProductos'] {
  const productosMap: Record<string, { cantidad: number; ingresos: number }> = {};

  ventas.forEach(v => {
    if (v.estado === 'COMPLETADA' && v.detalles) {
      v.detalles.forEach(d => {
        const key = d.nombreProducto || `Producto ${d.idProducto}`;
        if (!productosMap[key]) productosMap[key] = { cantidad: 0, ingresos: 0 };
        productosMap[key].cantidad += d.cantidad;
        productosMap[key].ingresos += d.subtotal;
      });
    }
  });

  return Object.entries(productosMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5);
}

function calcularDistribucionCategorias(
  productos: ProductoResponse[],
): DashboardStats['distribucionCategorias'] {
  const categoriasMap: Record<string, number> = {};

  productos.forEach(p => {
    if (p.estado === 'ACTIVO') {
      const cat = p.categoriaNombre || 'Sin categoría';
      categoriasMap[cat] = (categoriasMap[cat] || 0) + 1;
    }
  });

  return Object.entries(categoriasMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

// ── fetchers Supabase ─────────────────────────────────────────────────────────

/**
 * Trae ventas con sus detalles (join detalle_venta → producto) y
 * los nombres de cliente (vw_clientes), almacén y usuario.
 *
 * Supabase no permite múltiples joins en cadena sobre la misma relación FK
 * de forma directa, por lo que obtenemos los lookup maps de persona, almacén
 * y usuario por separado y los fusionamos en JS.
 */
async function fetchVentas(): Promise<VentaResponse[]> {
  // 1. Traer filas de venta con sus detalles (producto anidado)
  const { data: ventasRaw, error: errVentas } = await supabase
    .from('venta')
    .select(`
      id, total, subtotal, igv, descuento_total, estado, fecha,
      id_cliente, id_usuario, id_almacen,
      detalle_venta (
        id, id_producto, cantidad, precio_unitario, subtotal,
        producto ( nombre )
      )
    `)
    .order('fecha', { ascending: false });

  if (errVentas) throw new Error(errVentas.message);
  const ventas = (ventasRaw ?? []) as unknown as (VentaRow & {
    detalle_venta: (DetalleVentaRow & { producto: { nombre: string } | null })[];
  })[];

  if (ventas.length === 0) return [];

  // 2. IDs únicos para lookups
  const clienteIds = [...new Set(ventas.map(v => v.id_cliente))];
  const almacenIds = [...new Set(ventas.map(v => v.id_almacen))];
  const usuarioIds = [...new Set(ventas.map(v => v.id_usuario))];

  // 3. Lookup: nombre de cliente (vw_clientes tiene nombres/apellidos)
  const { data: clientesRaw } = await supabase
    .from('vw_clientes')
    .select('id, nombres, "apellidoPaterno"')
    .in('id', clienteIds);
  const clienteMap: Record<number, string> = {};
  (clientesRaw ?? []).forEach((c: Record<string, unknown>) => {
    clienteMap[c['id'] as number] =
      `${c['nombres'] ?? ''} ${c['apellidoPaterno'] ?? ''}`.trim();
  });

  // 4. Lookup: nombre de almacén
  const { data: almacenesRaw } = await supabase
    .from('almacen')
    .select('id, nombre')
    .in('id', almacenIds);
  const almacenMap: Record<number, string> = {};
  (almacenesRaw ?? []).forEach((a: Record<string, unknown>) => {
    almacenMap[a['id'] as number] = (a['nombre'] as string) ?? '';
  });

  // 5. Lookup: nombre de usuario (vw_usuarios)
  const { data: usuariosRaw } = await supabase
    .from('vw_usuarios')
    .select('id, nombres, "apellidoPaterno"')
    .in('id', usuarioIds);
  const usuarioMap: Record<number, string> = {};
  (usuariosRaw ?? []).forEach((u: Record<string, unknown>) => {
    usuarioMap[u['id'] as number] =
      `${u['nombres'] ?? ''} ${u['apellidoPaterno'] ?? ''}`.trim();
  });

  // 6. Mapear al shape VentaResponse
  return ventas.map(v => ({
    id: v.id,
    subtotal: Number(v.subtotal ?? 0),
    descuentoTotal: Number(v.descuento_total ?? 0),
    igv: Number(v.igv ?? 0),
    total: Number(v.total ?? 0),
    estado: v.estado,
    fecha: v.fecha,
    nombreCliente: clienteMap[v.id_cliente] ?? 'Cliente',
    nombreAlmacen: almacenMap[v.id_almacen] ?? '-',
    nombreUsuario: usuarioMap[v.id_usuario] ?? '-',
    detalles: (v.detalle_venta ?? []).map(d => ({
      id: d.id,
      idProducto: d.id_producto,
      nombreProducto: d.producto?.nombre ?? `Producto ${d.id_producto}`,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precio_unitario ?? 0),
      subtotal: Number(d.subtotal ?? 0),
    })),
  }));
}

async function fetchCompras(): Promise<CompraResponse[]> {
  const { data: comprasRaw, error } = await supabase
    .from('compra')
    .select(`
      id, total, subtotal, igv, estado, fecha,
      proveedor ( razon_social )
    `)
    .order('fecha', { ascending: false });

  if (error) throw new Error(error.message);

  return ((comprasRaw ?? []) as unknown as (CompraRow & {
    proveedor: { razon_social: string } | null;
  })[]).map(c => ({
    id: c.id,
    total: Number(c.total ?? 0),
    subtotal: Number(c.subtotal ?? 0),
    igv: Number(c.igv ?? 0),
    estado: c.estado,
    fechaCompra: c.fecha,
    proveedor: c.proveedor
      ? { razonSocial: c.proveedor.razon_social }
      : undefined,
  }));
}

async function fetchProductos(): Promise<ProductoResponse[]> {
  // vw_productos ya incluye categoriaNombre y stockTotal
  const { data, error } = await supabase
    .from('vw_productos')
    .select('*');

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map(p => ({
    id: p['id'] as number,
    nombre: (p['nombre'] as string) ?? '',
    precioVenta: Number(p['precio_venta'] ?? 0),
    precioCompra: Number(p['precio_compra'] ?? 0),
    estado: (p['estado'] as string) ?? '',
    categoriaNombre: (p['categoriaNombre'] as string) ?? 'Sin categoría',
    // La vista expone stockTotal (suma de inventario); usamos stock de producto como fallback
    stockActual: Number(p['stockTotal'] ?? p['stock'] ?? 0),
    stockMinimo: Number(p['stock_minimo'] ?? 0),
    almacenNombre: '-', // no se incluye en la vista; no afecta la lógica del dashboard
  }));
}

async function fetchClientes(): Promise<ClienteResponse[]> {
  const { data, error } = await supabase
    .from('vw_clientes')
    .select('id, tipo, estado, nombres, "apellidoPaterno", "apellidoMaterno"');

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map(c => ({
    id: c['id'] as number,
    tipo: (c['tipo'] as string) ?? '',
    estado: (c['estado'] as string) ?? '',
    persona: {
      nombres: (c['nombres'] as string) ?? '',
      apellidoPaterno: (c['apellidoPaterno'] as string) ?? '',
      apellidoMaterno: (c['apellidoMaterno'] as string) ?? '',
    },
  }));
}

// ── servicio público ──────────────────────────────────────────────────────────
export const dashboardService = {
  async getDashboardData(): Promise<DashboardStats> {
    const [ventas, compras, productos, clientes] = await Promise.all([
      fetchVentas().catch(e => {
        console.error('dashboardService: error en fetchVentas:', getErrorMessage(e));
        return [] as VentaResponse[];
      }),
      fetchCompras().catch(e => {
        console.error('dashboardService: error en fetchCompras:', getErrorMessage(e));
        return [] as CompraResponse[];
      }),
      fetchProductos().catch(e => {
        console.error('dashboardService: error en fetchProductos:', getErrorMessage(e));
        return [] as ProductoResponse[];
      }),
      fetchClientes().catch(e => {
        console.error('dashboardService: error en fetchClientes:', getErrorMessage(e));
        return [] as ClienteResponse[];
      }),
    ]);

    // Agregaciones en JS (misma lógica que el service original)
    const ventasCompletadas = ventas.filter(v => v.estado === 'COMPLETADA');
    const comprasCompletadas = compras.filter(c => c.estado === 'COMPLETADA');
    const productosActivos = productos.filter(p => p.estado === 'ACTIVO');

    const ingresoVentas = ventasCompletadas.reduce((sum, v) => sum + v.total, 0);
    const gastoCompras = comprasCompletadas.reduce((sum, c) => sum + c.total, 0);
    const productosBajoStock = productosActivos.filter(
      p => p.stockActual <= p.stockMinimo,
    );
    const clientesActivos = clientes.filter(c => c.estado === 'ACTIVO');

    const ventasRecientes = ventas
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        cliente: v.nombreCliente || 'Cliente',
        total: v.total,
        estado: v.estado,
        fecha: v.fecha,
      }));

    return {
      totalVentas: ventasCompletadas.length,
      ingresoVentas: Math.round(ingresoVentas * 100) / 100,
      totalCompras: comprasCompletadas.length,
      gastoCompras: Math.round(gastoCompras * 100) / 100,
      productosActivos: productosActivos.length,
      productosBajoStock: productosBajoStock.length,
      clientesActivos: clientesActivos.length,
      ventasPorMes: agruparVentasPorMes(ventas, compras),
      ventasPorDia: agruparVentasPorDiaSemana(ventas),
      topProductos: calcularTopProductos(ventas),
      ventasRecientes,
      distribucionCategorias: calcularDistribucionCategorias(productos),
    };
  },
};
