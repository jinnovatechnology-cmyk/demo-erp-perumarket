import { supabase } from "../../lib/supabase";
import type { Cliente } from "../../types/clientes/Client";
import type {
  DetallePago,
  MetodoPago,
  Producto,
  ProductoVenta,
  VentaRequest,
} from "../../types/ventas/ventas";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Error desconocido";
}

const construirUrlImagen = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "/img/products/default-product.png";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("data:")) return imagePath;
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `http://localhost:8080/api${cleanPath}`;
};

// ── Row-level mappers (snake_case → camelCase) ────────────────────────────────

interface ProductoRow {
  id: number;
  nombre: string;
  sku: string | null;
  precio_venta: number;
  imagen: string | null;
  unidad_medida: string | null;
  categoria_id: number | null;
  categoria_producto: { nombre: string } | null;
}

interface InventarioRow {
  stock_actual: number;
}

interface ProductoConInventario extends ProductoRow {
  inventario: InventarioRow[];
}

function mapProducto(
  p: ProductoConInventario,
  idAlmacen: number
): Producto {
  const stockAlmacen =
    p.inventario?.reduce(
      (sum: number, inv: InventarioRow) => sum + (inv.stock_actual ?? 0),
      0
    ) ?? 0;
  void idAlmacen; // almacen filter is applied in the query
  return {
    id: p.id,
    nombre: p.nombre,
    sku: p.sku ?? "",
    precio: p.precio_venta,
    imagen: construirUrlImagen(p.imagen),
    stock: stockAlmacen,
    categoria: {
      id: p.categoria_id ?? 0,
      nombre: p.categoria_producto?.nombre ?? "Sin categoría",
    },
    unidadMedida: p.unidad_medida ?? "UNIDAD",
  };
}

interface PersonaRow {
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string | null;
  direccion: string;
}

interface ClienteRow {
  id: number;
  tipo: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  persona: PersonaRow;
}

function mapCliente(c: ClienteRow): Cliente {
  // `clienteid` is used by hooks/pages as an alias for `id`; we inject it
  // via cast since the Cliente interface doesn't declare it.
  const base = {
    id: c.id,
    tipo: c.tipo ?? "NATURAL",
    estado: c.estado ?? "ACTIVO",
    fechaCreacion: c.fecha_creacion,
    fechaActualizacion: c.fecha_actualizacion,
    persona: {
      tipoDocumento: c.persona.tipo_documento ?? "",
      numeroDocumento: c.persona.numero_documento ?? "",
      nombres: c.persona.nombres ?? "",
      apellidoPaterno: c.persona.apellido_paterno ?? "",
      apellidoMaterno: c.persona.apellido_materno ?? "",
      correo: c.persona.correo ?? "",
      telefono: c.persona.telefono ?? "",
      fechaNacimiento: c.persona.fecha_nacimiento ?? undefined,
      direccion: c.persona.direccion ?? "",
    },
  };
  // Attach runtime alias expected by consuming hooks
  (base as Record<string, unknown>)["clienteid"] = c.id;
  return base as unknown as Cliente;
}

interface AlmacenRow {
  id: number;
  nombre: string;
  codigo: string | null;
  direccion: string | null;
  estado: string;
}

interface DetalleVentaRow {
  id: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  producto: { nombre: string } | null;
}

interface VentaRow {
  id: number;
  id_cliente: number;
  id_usuario: number;
  id_almacen: number;
  fecha: string;
  subtotal: number;
  descuento_total: number;
  igv: number;
  total: number;
  estado: string;
  cliente: {
    persona: { nombres: string; apellido_paterno: string } | null;
  } | null;
  usuario: {
    persona: { nombres: string; apellido_paterno: string } | null;
  } | null;
  almacen: { nombre: string } | null;
  detalles: DetalleVentaRow[];
}

function mapVenta(v: VentaRow): Record<string, unknown> {
  const clientePersona = v.cliente?.persona;
  const usuarioPersona = v.usuario?.persona;
  return {
    id: v.id,
    fecha: v.fecha,
    subtotal: v.subtotal,
    igv: v.igv,
    descuento_total: v.descuento_total,
    total: v.total,
    estado: v.estado,
    id_cliente: v.id_cliente,
    id_usuario: v.id_usuario,
    id_almacen: v.id_almacen,
    nombreCliente: clientePersona
      ? `${clientePersona.nombres} ${clientePersona.apellido_paterno}`.trim()
      : "Sin cliente",
    nombreUsuario: usuarioPersona
      ? `${usuarioPersona.nombres} ${usuarioPersona.apellido_paterno}`.trim()
      : "-",
    nombreAlmacen: v.almacen?.nombre ?? "-",
    detalles: (v.detalles ?? []).map((d) => ({
      id: d.id,
      id_producto: d.id_producto,
      nombreProducto: d.producto?.nombre ?? "-",
      cantidad: d.cantidad,
      precioUnitario: d.precio_unitario,
      descuento: d.descuento,
      subtotal: d.subtotal,
    })),
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const ventaService = {
  // Productos
  async fetchProductos(): Promise<Producto[]> {
    try {
      const idAlmacen = Number(localStorage.getItem("almacenId")) || 1;

      const { data, error } = await supabase
        .from("producto")
        .select(
          `id, nombre, sku, precio_venta, imagen, unidad_medida, categoria_id,
           categoria_producto:categoria_id(nombre),
           inventario!inner(stock_actual, id_almacen)`
        )
        .eq("estado", "ACTIVO")
        .eq("inventario.id_almacen", idAlmacen);

      if (error) throw new Error(error.message);

      return (data as unknown as ProductoConInventario[]).map((p) =>
        mapProducto(p, idAlmacen)
      );
    } catch (error) {
      console.error("Error cargando productos:", error);
      throw error;
    }
  },

  // Almacenes
  async fetchAlmacenes(): Promise<AlmacenRow[]> {
    try {
      const { data, error } = await supabase
        .from("almacen")
        .select("id, nombre, codigo, direccion, estado")
        .eq("estado", "ACTIVO");

      if (error) throw new Error(error.message);
      return (data as AlmacenRow[]) ?? [];
    } catch (error) {
      console.error("Error cargando almacenes:", error);
      throw error;
    }
  },

  // Clientes
  async fetchClientes(): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select(
          `id, tipo, estado, fecha_creacion, fecha_actualizacion,
           persona:id_persona(tipo_documento, numero_documento, nombres,
             apellido_paterno, apellido_materno, correo, telefono,
             fecha_nacimiento, direccion)`
        )
        .eq("estado", "ACTIVO");

      if (error) throw new Error(error.message);

      return (data as unknown as ClienteRow[]).map(mapCliente);
    } catch (error) {
      console.error("Error al cargar clientes activos:", error);
      throw new Error("No se pudieron cargar los clientes disponibles");
    }
  },

  async registrarCliente(clienteData: Omit<Cliente, "clienteid">): Promise<Cliente> {
    try {
      // 1. Insertar persona
      const { data: personaData, error: personaError } = await supabase
        .from("persona")
        .insert({
          tipo_documento: clienteData.persona.tipoDocumento,
          numero_documento: clienteData.persona.numeroDocumento,
          nombres: clienteData.persona.nombres,
          apellido_paterno: clienteData.persona.apellidoPaterno,
          apellido_materno: clienteData.persona.apellidoMaterno,
          correo: clienteData.persona.correo,
          telefono: clienteData.persona.telefono,
          fecha_nacimiento: clienteData.persona.fechaNacimiento ?? null,
          direccion: clienteData.persona.direccion,
        })
        .select("id")
        .single();

      if (personaError) throw new Error(personaError.message);

      // 2. Insertar cliente
      const { data: clienteResult, error: clienteError } = await supabase
        .from("cliente")
        .insert({
          id_persona: (personaData as { id: number }).id,
          tipo: clienteData.tipo ?? "NATURAL",
          estado: clienteData.estado ?? "ACTIVO",
        })
        .select(
          `id, tipo, estado, fecha_creacion, fecha_actualizacion,
           persona:id_persona(tipo_documento, numero_documento, nombres,
             apellido_paterno, apellido_materno, correo, telefono,
             fecha_nacimiento, direccion)`
        )
        .single();

      if (clienteError) throw new Error(clienteError.message);

      return mapCliente(clienteResult as unknown as ClienteRow);
    } catch (error) {
      console.error("Error al registrar cliente:", error);
      throw error;
    }
  },

  async buscarClientesActivos(texto: string): Promise<Cliente[]> {
    try {
      const query = supabase
        .from("cliente")
        .select(
          `id, tipo, estado, fecha_creacion, fecha_actualizacion,
           persona:id_persona(tipo_documento, numero_documento, nombres,
             apellido_paterno, apellido_materno, correo, telefono,
             fecha_nacimiento, direccion)`
        )
        .eq("estado", "ACTIVO");

      // Text filtering is applied client-side after fetching (persona fields
      // are in a joined table; server-side ilike would require a view or rpc).

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const clientes = (data as unknown as ClienteRow[]).map(mapCliente);

      if (!texto.trim()) return clientes;

      const term = texto.toLowerCase();
      return clientes.filter(
        (c) =>
          c.persona.nombres.toLowerCase().includes(term) ||
          c.persona.apellidoPaterno.toLowerCase().includes(term) ||
          c.persona.apellidoMaterno.toLowerCase().includes(term) ||
          c.persona.numeroDocumento.includes(texto)
      );
    } catch (error) {
      console.error("Error buscando clientes:", error);
      return [];
    }
  },

  // Métodos de pago
  async cargarMetodosPago(): Promise<MetodoPago[]> {
    try {
      const { data, error } = await supabase
        .from("metodo_pago")
        .select("id, nombre, descripcion, estado")
        .eq("estado", "ACTIVO");

      if (error) throw new Error(error.message);

      return ((data as Array<{ id: number; nombre: string; descripcion: string | null; estado: string }>) ?? []).map(
        (m) => ({
          id: m.id,
          nombre: m.nombre,
          descripcion: m.descripcion ?? "",
          estado: m.estado,
        })
      );
    } catch (error) {
      console.error("Error cargando métodos de pago:", error);
      // Fallback a lista estática si la tabla aún no tiene datos
      return [
        { id: 1, nombre: "Efectivo", descripcion: "Pago en efectivo", estado: "activo" },
        { id: 2, nombre: "Tarjeta Débito", descripcion: "Pago con tarjeta de débito", estado: "activo" },
        { id: 3, nombre: "Tarjeta Crédito", descripcion: "Pago con tarjeta de crédito", estado: "activo" },
        { id: 4, nombre: "Transferencia", descripcion: "Transferencia bancaria", estado: "activo" },
        { id: 5, nombre: "Yape", descripcion: "Pago con Yape", estado: "activo" },
      ];
    }
  },

  // Stock
  async actualizarStock(idProducto: number, stock: number): Promise<void> {
    try {
      const idAlmacen = Number(localStorage.getItem("almacenId")) || 1;
      const { error } = await supabase
        .from("inventario")
        .update({ stock_actual: stock })
        .eq("id_producto", idProducto)
        .eq("id_almacen", idAlmacen);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(`Error actualizando stock del producto ${idProducto}:`, error);
      throw error;
    }
  },

  // Venta
  async procesarVenta(
    ventaData: VentaRequest
  ): Promise<{ id: number; numeroComprobante: string }> {
    try {
      const datosVenta = {
        id_cliente: Number(ventaData.idCliente),
        id_usuario: Number(ventaData.idUsuario),
        id_almacen: Number(ventaData.idAlmacen),
        subtotal: Number(ventaData.subtotal.toFixed(2)),
        igv: Number(ventaData.igv.toFixed(2)),
        total: Number(ventaData.total.toFixed(2)),
        descuento_total: 0,
        estado: "COMPLETADA",
      };

      console.log("Enviando venta:", datosVenta);

      // 1. Insertar cabecera de venta
      const { data: ventaInsertada, error: ventaError } = await supabase
        .from("venta")
        .insert(datosVenta)
        .select("id")
        .single();

      if (ventaError) throw new Error(ventaError.message);
      const idVenta = (ventaInsertada as { id: number }).id;

      // 2. Insertar detalles de venta
      const detalles = ventaData.detalles.map((detalle) => ({
        id_venta: idVenta,
        id_producto: Number(detalle.idProducto),
        cantidad: Number(detalle.cantidad),
        precio_unitario: Number(detalle.precioUnitario.toFixed(2)),
        subtotal: Number(detalle.subtotal.toFixed(2)),
        descuento: 0,
      }));

      const { error: detallesError } = await supabase
        .from("detalle_venta")
        .insert(detalles);

      if (detallesError) throw new Error(detallesError.message);

      // 3. Insertar registro de pago + detalles de pago
      const { data: pagoInsertado, error: pagoError } = await supabase
        .from("pago")
        .insert({
          id_venta: idVenta,
          monto_total: Number(ventaData.total.toFixed(2)),
          estado: "COMPLETADO",
        })
        .select("id")
        .single();

      if (pagoError) throw new Error(pagoError.message);
      const idPago = (pagoInsertado as { id: number }).id;

      const detallesPago = (ventaData.pagos as DetallePago[]).map((pago) => ({
        id_pago: idPago,
        id_metodo_pago: Number(pago.id_metodo_pago),
        monto: Number(pago.monto.toFixed(2)),
        referencia: pago.referencia ?? "",
      }));

      const { error: detallePagoError } = await supabase
        .from("detalle_pago")
        .insert(detallesPago);

      if (detallePagoError) throw new Error(detallePagoError.message);

      // 4. Descontar stock en inventario y registrar movimientos
      const idAlmacen = Number(ventaData.idAlmacen);

      for (const detalle of ventaData.detalles) {
        const idProducto = Number(detalle.idProducto);
        const cantidad = Number(detalle.cantidad);

        // Leer stock actual
        const { data: invData, error: invReadError } = await supabase
          .from("inventario")
          .select("id, stock_actual")
          .eq("id_producto", idProducto)
          .eq("id_almacen", idAlmacen)
          .single();

        if (invReadError) {
          console.error(
            `Error leyendo inventario del producto ${idProducto}:`,
            invReadError.message
          );
          continue;
        }

        const inv = invData as { id: number; stock_actual: number };
        const stockAnterior = inv.stock_actual;
        const stockNuevo = Math.max(0, stockAnterior - cantidad);

        // Actualizar stock
        const { error: invUpdateError } = await supabase
          .from("inventario")
          .update({ stock_actual: stockNuevo })
          .eq("id", inv.id);

        if (invUpdateError) {
          console.error(
            `Error actualizando stock del producto ${idProducto}:`,
            invUpdateError.message
          );
          continue;
        }

        // Registrar movimiento de inventario
        const { error: movError } = await supabase
          .from("movimiento_inventario")
          .insert({
            id_inventario: inv.id,
            id_producto: idProducto,
            id_almacen: idAlmacen,
            tipo_movimiento: "SALIDA",
            cantidad,
            stock_anterior: stockAnterior,
            stock_nuevo: stockNuevo,
            motivo: `Venta #${idVenta}`,
            metodo_registro: "MANUAL",
            id_usuario: Number(ventaData.idUsuario),
            id_venta: idVenta,
          });

        if (movError) {
          console.error(
            `Error registrando movimiento de inventario del producto ${idProducto}:`,
            movError.message
          );
        }
      }

      const numeroComprobante = `VTA-${String(idVenta).padStart(4, "0")}`;
      return { id: idVenta, numeroComprobante };
    } catch (error) {
      console.error("Error procesando venta:", error);
      const mensaje = getErrorMessage(error) || "Error al procesar la venta";
      throw new Error(mensaje);
    }
  },

  // Calcular totales (puro, sin async)
  calcularTotales(carrito: ProductoVenta[]) {
    const subtotalProduct = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const igv = subtotalProduct * 0.18;
    const subtotal = subtotalProduct - igv;
    const total = subtotalProduct;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      igv: Number(igv.toFixed(2)),
      total: Number(total.toFixed(2)),
      subtotalProduct: Number(subtotalProduct.toFixed(2)),
    };
  },

  // Historial de ventas
  async fetchVentas(): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from("venta")
        .select(
          `id, fecha, subtotal, descuento_total, igv, total, estado,
           id_cliente, id_usuario, id_almacen,
           cliente:id_cliente(
             persona:id_persona(nombres, apellido_paterno)
           ),
           usuario:id_usuario(
             persona:id_persona(nombres, apellido_paterno)
           ),
           almacen:id_almacen(nombre),
           detalles:detalle_venta(
             id, id_producto, cantidad, precio_unitario, descuento, subtotal,
             producto:id_producto(nombre)
           )`
        )
        .order("fecha", { ascending: false });

      if (error) throw new Error(error.message);

      return (data as unknown as VentaRow[]).map(mapVenta);
    } catch (error) {
      console.error("Error cargando ventas:", error);
      throw error;
    }
  },

  async fetchVentaPorId(id: number): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await supabase
        .from("venta")
        .select(
          `id, fecha, subtotal, descuento_total, igv, total, estado,
           id_cliente, id_usuario, id_almacen,
           cliente:id_cliente(
             persona:id_persona(nombres, apellido_paterno)
           ),
           usuario:id_usuario(
             persona:id_persona(nombres, apellido_paterno)
           ),
           almacen:id_almacen(nombre),
           detalles:detalle_venta(
             id, id_producto, cantidad, precio_unitario, descuento, subtotal,
             producto:id_producto(nombre)
           )`
        )
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);

      return mapVenta(data as unknown as VentaRow);
    } catch (error) {
      console.error(`Error cargando venta ${id}:`, error);
      throw error;
    }
  },

  // Obtener datos de sesión
  obtenerDatosSesion(): { idUsuario: number; idAlmacen: number } {
    let idUsuario = Number(localStorage.getItem("usuarioId"));
    let idAlmacen = Number(localStorage.getItem("almacenId")) || 0;

    if (!idUsuario || idUsuario <= 0) {
      try {
        const authData = localStorage.getItem("auth");
        if (authData) {
          const parsed = JSON.parse(authData) as Record<string, unknown>;
          const user = parsed?.user as Record<string, unknown> | undefined;
          if (user?.id) {
            idUsuario = Number(user.id);
            localStorage.setItem("usuarioId", String(idUsuario));
          }
          if (user?.almacenId) {
            idAlmacen = Number(user.almacenId);
            localStorage.setItem("almacenId", String(idAlmacen));
          }
        }
      } catch (e) {
        console.error("Error leyendo auth data:", e);
      }
    }

    if (!idUsuario || idUsuario <= 0) {
      throw new Error("Usuario no válido. Por favor, inicia sesión de nuevo.");
    }

    if (!idAlmacen || idAlmacen <= 0) {
      idAlmacen = 1;
    }

    return { idUsuario, idAlmacen };
  },
};
