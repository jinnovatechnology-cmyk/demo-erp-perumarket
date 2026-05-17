import { supabase } from '../lib/supabase';
import type { VentaResponse, CompraResponse, ProductoResponse } from './dashboardService';

// ── helper ────────────────────────────────────────────────────────────────────
function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ── tipos exportados ──────────────────────────────────────────────────────────
export interface ReporteVentas {
  totalVentas: number;
  ingresoTotal: number;
  igvTotal: number;
  descuentoTotal: number;
  ventasCompletadas: number;
  ventasPendientes: number;
  ventasAnuladas: number;
  ticketPromedio: number;
  ventasDelDia: number;
  ingresoDelDia: number;
  ventasPorMes: { name: string; ingresos: number; cantidad: number }[];
  ventasPorVendedor: { nombre: string; ventas: number; total: number; porcentaje: number }[];
  ventasPorAlmacen: { nombre: string; ventas: number; total: number }[];
  detalleVentas: {
    id: number;
    fecha: string;
    cliente: string;
    vendedor: string;
    almacen: string;
    subtotal: number;
    igv: number;
    total: number;
    estado: string;
  }[];
}

export interface ReporteCompras {
  totalCompras: number;
  gastoTotal: number;
  igvTotal: number;
  comprasCompletadas: number;
  comprasPendientes: number;
  comprasAnuladas: number;
  compraPromedio: number;
  comprasPorMes: { name: string; gastos: number; cantidad: number }[];
  comprasPorProveedor: { nombre: string; compras: number; total: number; porcentaje: number }[];
  detalleCompras: {
    id: number;
    fecha: string;
    proveedor: string;
    subtotal: number;
    igv: number;
    total: number;
    estado: string;
  }[];
}

export interface ReporteInventario {
  totalProductos: number;
  productosActivos: number;
  productosInactivos: number;
  productosBajoStock: number;
  valorInventario: number;
  productosPorCategoria: { name: string; cantidad: number }[];
  productosPorAlmacen: { name: string; cantidad: number }[];
  productosStockBajo: { nombre: string; stock: number; minimo: number; almacen: string; categoria: string }[];
  productosTopValor: { nombre: string; precioVenta: number; stock: number; valorTotal: number }[];
}

// ── constantes ────────────────────────────────────────────────────────────────
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── builders (misma lógica que el service original; operan sobre filas JS) ────

function buildReporteVentas(ventas: VentaResponse[]): ReporteVentas {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const año = hoy.getFullYear();

  const completadas = ventas.filter(v => v.estado === 'COMPLETADA');
  const pendientes = ventas.filter(v => v.estado === 'PENDIENTE');
  const anuladas = ventas.filter(v => v.estado === 'ANULADA');

  const ingresoTotal = completadas.reduce((s, v) => s + v.total, 0);
  const igvTotal = completadas.reduce((s, v) => s + v.igv, 0);
  const descuentoTotal = completadas.reduce((s, v) => s + v.descuentoTotal, 0);
  const ticketPromedio = completadas.length > 0 ? ingresoTotal / completadas.length : 0;

  const ventasHoy = completadas.filter(v => new Date(v.fecha) >= inicioHoy);
  const ingresoDelDia = ventasHoy.reduce((s, v) => s + v.total, 0);

  // Por mes (agregación en JS)
  const mesesMap: Record<number, { ingresos: number; cantidad: number }> = {};
  for (let i = 0; i < 12; i++) mesesMap[i] = { ingresos: 0, cantidad: 0 };
  completadas.forEach(v => {
    const f = new Date(v.fecha);
    if (f.getFullYear() === año) {
      mesesMap[f.getMonth()].ingresos += v.total;
      mesesMap[f.getMonth()].cantidad += 1;
    }
  });
  const ventasPorMes = MESES.map((name, i) => ({
    name,
    ingresos: round(mesesMap[i].ingresos),
    cantidad: mesesMap[i].cantidad,
  }));

  // Por vendedor (agregación en JS)
  const vendedorMap: Record<string, { ventas: number; total: number }> = {};
  completadas.forEach(v => {
    const key = v.nombreUsuario || 'Sin vendedor';
    if (!vendedorMap[key]) vendedorMap[key] = { ventas: 0, total: 0 };
    vendedorMap[key].ventas += 1;
    vendedorMap[key].total += v.total;
  });
  const ventasPorVendedor = Object.entries(vendedorMap)
    .map(([nombre, d]) => ({
      nombre,
      ventas: d.ventas,
      total: round(d.total),
      porcentaje: ingresoTotal > 0 ? round((d.total / ingresoTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Por almacén (agregación en JS)
  const almacenMap: Record<string, { ventas: number; total: number }> = {};
  completadas.forEach(v => {
    const key = v.nombreAlmacen || 'Sin almacén';
    if (!almacenMap[key]) almacenMap[key] = { ventas: 0, total: 0 };
    almacenMap[key].ventas += 1;
    almacenMap[key].total += v.total;
  });
  const ventasPorAlmacen = Object.entries(almacenMap)
    .map(([nombre, d]) => ({ nombre, ventas: d.ventas, total: round(d.total) }))
    .sort((a, b) => b.total - a.total);

  // Detalle (hasta 50 registros más recientes)
  const detalleVentas = ventas
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 50)
    .map(v => ({
      id: v.id,
      fecha: v.fecha,
      cliente: v.nombreCliente || 'Cliente',
      vendedor: v.nombreUsuario || '-',
      almacen: v.nombreAlmacen || '-',
      subtotal: v.subtotal,
      igv: v.igv,
      total: v.total,
      estado: v.estado,
    }));

  return {
    totalVentas: ventas.length,
    ingresoTotal: round(ingresoTotal),
    igvTotal: round(igvTotal),
    descuentoTotal: round(descuentoTotal),
    ventasCompletadas: completadas.length,
    ventasPendientes: pendientes.length,
    ventasAnuladas: anuladas.length,
    ticketPromedio: round(ticketPromedio),
    ventasDelDia: ventasHoy.length,
    ingresoDelDia: round(ingresoDelDia),
    ventasPorMes,
    ventasPorVendedor,
    ventasPorAlmacen,
    detalleVentas,
  };
}

function buildReporteCompras(compras: CompraResponse[]): ReporteCompras {
  const año = new Date().getFullYear();
  const completadas = compras.filter(c => c.estado === 'COMPLETADA');
  const pendientes = compras.filter(c => c.estado === 'PENDIENTE');
  const anuladas = compras.filter(c => c.estado === 'ANULADA');

  const gastoTotal = completadas.reduce((s, c) => s + c.total, 0);
  const igvTotal = completadas.reduce((s, c) => s + c.igv, 0);
  const compraPromedio = completadas.length > 0 ? gastoTotal / completadas.length : 0;

  // Por mes (agregación en JS)
  const mesesMap: Record<number, { gastos: number; cantidad: number }> = {};
  for (let i = 0; i < 12; i++) mesesMap[i] = { gastos: 0, cantidad: 0 };
  completadas.forEach(c => {
    const f = new Date(c.fechaCompra);
    if (f.getFullYear() === año) {
      mesesMap[f.getMonth()].gastos += c.total;
      mesesMap[f.getMonth()].cantidad += 1;
    }
  });
  const comprasPorMes = MESES.map((name, i) => ({
    name,
    gastos: round(mesesMap[i].gastos),
    cantidad: mesesMap[i].cantidad,
  }));

  // Por proveedor (agregación en JS)
  const provMap: Record<string, { compras: number; total: number }> = {};
  completadas.forEach(c => {
    const key = c.proveedor?.razonSocial || 'Sin proveedor';
    if (!provMap[key]) provMap[key] = { compras: 0, total: 0 };
    provMap[key].compras += 1;
    provMap[key].total += c.total;
  });
  const comprasPorProveedor = Object.entries(provMap)
    .map(([nombre, d]) => ({
      nombre,
      compras: d.compras,
      total: round(d.total),
      porcentaje: gastoTotal > 0 ? round((d.total / gastoTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Detalle (hasta 50 registros más recientes)
  const detalleCompras = compras
    .sort((a, b) => new Date(b.fechaCompra).getTime() - new Date(a.fechaCompra).getTime())
    .slice(0, 50)
    .map(c => ({
      id: c.id,
      fecha: c.fechaCompra,
      proveedor: c.proveedor?.razonSocial || 'Sin proveedor',
      subtotal: c.subtotal,
      igv: c.igv,
      total: c.total,
      estado: c.estado,
    }));

  return {
    totalCompras: compras.length,
    gastoTotal: round(gastoTotal),
    igvTotal: round(igvTotal),
    comprasCompletadas: completadas.length,
    comprasPendientes: pendientes.length,
    comprasAnuladas: anuladas.length,
    compraPromedio: round(compraPromedio),
    comprasPorMes,
    comprasPorProveedor,
    detalleCompras,
  };
}

function buildReporteInventario(productos: ProductoResponse[]): ReporteInventario {
  const activos = productos.filter(p => p.estado === 'ACTIVO');
  const inactivos = productos.filter(p => p.estado === 'INACTIVO');
  const bajoStock = activos.filter(p => p.stockActual <= p.stockMinimo);

  // Valor inventario (agregación en JS)
  const valorInventario = activos.reduce((s, p) => s + p.precioVenta * p.stockActual, 0);

  // Por categoría (agregación en JS)
  const catMap: Record<string, number> = {};
  activos.forEach(p => {
    const cat = p.categoriaNombre || 'Sin categoría';
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const productosPorCategoria = Object.entries(catMap)
    .map(([name, cantidad]) => ({ name, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Por almacén (agregación en JS; almacenNombre puede ser '-' si no se popula)
  const almMap: Record<string, number> = {};
  activos.forEach(p => {
    const alm = p.almacenNombre || 'Sin almacén';
    almMap[alm] = (almMap[alm] || 0) + 1;
  });
  const productosPorAlmacen = Object.entries(almMap)
    .map(([name, cantidad]) => ({ name, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Stock bajo
  const productosStockBajo = bajoStock
    .map(p => ({
      nombre: p.nombre,
      stock: p.stockActual,
      minimo: p.stockMinimo,
      almacen: p.almacenNombre || '-',
      categoria: p.categoriaNombre || '-',
    }))
    .sort((a, b) => a.stock - b.stock);

  // Top valor
  const productosTopValor = activos
    .map(p => ({
      nombre: p.nombre,
      precioVenta: p.precioVenta,
      stock: p.stockActual,
      valorTotal: round(p.precioVenta * p.stockActual),
    }))
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 10);

  return {
    totalProductos: productos.length,
    productosActivos: activos.length,
    productosInactivos: inactivos.length,
    productosBajoStock: bajoStock.length,
    valorInventario: round(valorInventario),
    productosPorCategoria,
    productosPorAlmacen,
    productosStockBajo,
    productosTopValor,
  };
}

// ── fetchers Supabase ─────────────────────────────────────────────────────────

async function fetchVentasParaReporte(): Promise<VentaResponse[]> {
  // Reutiliza la misma lógica que dashboardService pero sin limit
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
  const ventas = (ventasRaw ?? []) as unknown as (Record<string, unknown> & {
    detalle_venta: (Record<string, unknown> & { producto: { nombre: string } | null })[];
  })[];

  if (ventas.length === 0) return [];

  const clienteIds = [...new Set(ventas.map(v => v['id_cliente'] as number))];
  const almacenIds = [...new Set(ventas.map(v => v['id_almacen'] as number))];
  const usuarioIds = [...new Set(ventas.map(v => v['id_usuario'] as number))];

  const { data: clientesRaw } = await supabase
    .from('vw_clientes')
    .select('id, nombres, "apellidoPaterno"')
    .in('id', clienteIds);
  const clienteMap: Record<number, string> = {};
  (clientesRaw ?? []).forEach((c: Record<string, unknown>) => {
    clienteMap[c['id'] as number] =
      `${c['nombres'] ?? ''} ${c['apellidoPaterno'] ?? ''}`.trim();
  });

  const { data: almacenesRaw } = await supabase
    .from('almacen')
    .select('id, nombre')
    .in('id', almacenIds);
  const almacenMap: Record<number, string> = {};
  (almacenesRaw ?? []).forEach((a: Record<string, unknown>) => {
    almacenMap[a['id'] as number] = (a['nombre'] as string) ?? '';
  });

  const { data: usuariosRaw } = await supabase
    .from('vw_usuarios')
    .select('id, nombres, "apellidoPaterno"')
    .in('id', usuarioIds);
  const usuarioMap: Record<number, string> = {};
  (usuariosRaw ?? []).forEach((u: Record<string, unknown>) => {
    usuarioMap[u['id'] as number] =
      `${u['nombres'] ?? ''} ${u['apellidoPaterno'] ?? ''}`.trim();
  });

  return ventas.map(v => ({
    id: v['id'] as number,
    subtotal: Number(v['subtotal'] ?? 0),
    descuentoTotal: Number(v['descuento_total'] ?? 0),
    igv: Number(v['igv'] ?? 0),
    total: Number(v['total'] ?? 0),
    estado: v['estado'] as string,
    fecha: v['fecha'] as string,
    nombreCliente: clienteMap[v['id_cliente'] as number] ?? 'Cliente',
    nombreAlmacen: almacenMap[v['id_almacen'] as number] ?? '-',
    nombreUsuario: usuarioMap[v['id_usuario'] as number] ?? '-',
    detalles: (v['detalle_venta'] as (Record<string, unknown> & {
      producto: { nombre: string } | null;
    })[]).map(d => ({
      id: d['id'] as number,
      idProducto: d['id_producto'] as number,
      nombreProducto: d['producto']?.nombre ?? `Producto ${d['id_producto']}`,
      cantidad: d['cantidad'] as number,
      precioUnitario: Number(d['precio_unitario'] ?? 0),
      subtotal: Number(d['subtotal'] ?? 0),
    })),
  }));
}

async function fetchComprasParaReporte(): Promise<CompraResponse[]> {
  const { data, error } = await supabase
    .from('compra')
    .select(`
      id, total, subtotal, igv, estado, fecha,
      proveedor ( razon_social )
    `)
    .order('fecha', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as (Record<string, unknown> & {
    proveedor: { razon_social: string } | null;
  })[]).map(c => ({
    id: c['id'] as number,
    total: Number(c['total'] ?? 0),
    subtotal: Number(c['subtotal'] ?? 0),
    igv: Number(c['igv'] ?? 0),
    estado: c['estado'] as string,
    fechaCompra: c['fecha'] as string,
    proveedor: c['proveedor']
      ? { razonSocial: c['proveedor'].razon_social }
      : undefined,
  }));
}

async function fetchProductosParaReporte(): Promise<ProductoResponse[]> {
  // vw_productos: incluye categoriaNombre y stockTotal
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
    stockActual: Number(p['stockTotal'] ?? p['stock'] ?? 0),
    stockMinimo: Number(p['stock_minimo'] ?? 0),
    almacenNombre: '-',
  }));
}

// ── servicio público ──────────────────────────────────────────────────────────
export const reportesService = {
  async getReporteVentas(): Promise<ReporteVentas> {
    try {
      const ventas = await fetchVentasParaReporte();
      return buildReporteVentas(ventas);
    } catch (e) {
      console.error('reportesService.getReporteVentas:', getErrorMessage(e));
      throw e;
    }
  },

  async getReporteCompras(): Promise<ReporteCompras> {
    try {
      const compras = await fetchComprasParaReporte();
      return buildReporteCompras(compras);
    } catch (e) {
      console.error('reportesService.getReporteCompras:', getErrorMessage(e));
      throw e;
    }
  },

  async getReporteInventario(): Promise<ReporteInventario> {
    try {
      const productos = await fetchProductosParaReporte();
      return buildReporteInventario(productos);
    } catch (e) {
      console.error('reportesService.getReporteInventario:', getErrorMessage(e));
      throw e;
    }
  },
};
