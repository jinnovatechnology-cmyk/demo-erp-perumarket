import { supabase } from "../../lib/supabase";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e)
    return String((e as Record<string, unknown>).message);
  return "Error desconocido";
}

// ---------------------------------------------------------------------------
// Types (firmas públicas conservadas intactas)
// ---------------------------------------------------------------------------
export type EnvioResponse = {
  id: number;
  idVenta: number | null;
  idPedido: number | null;
  estado: string;
  direccionEnvio: string;
  fechaEnvio: string | null;
  fechaEntrega: string | null;
  costoTransporte: number | null;
  observaciones: string | null;
  fechaCreacion: string;
  placaVehiculo: string | null;
  marcaVehiculo: string | null;
  nombreConductor: string | null;
  licenciaConductor: string | null;
  nombreRuta: string | null;
  origenRuta: string | null;
  destinoRuta: string | null;
  totalVenta: number | null;
  nombreCliente: string | null;
  estadoVenta: string | null;
};

export type EnvioRequest = {
  idVenta?: number;
  idPedido?: number;
  idVehiculo?: number;
  idConductor?: number;
  idRuta?: number;
  direccionEnvio: string;
  fechaEnvio?: string;
  fechaEntrega?: string;
  costoTransporte?: number;
  observaciones?: string;
};

export type Vehiculo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  capacidadKg: number;
  estado: string;
};

export type Conductor = {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  numeroDocumento: string;
  licencia: string;
  categoriaLicencia: string;
  estado: string;
};

export type Ruta = {
  id: number;
  nombre: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  tiempoEstimadoHoras: number;
  costoBase: number;
};

export type VentaResumen = {
  id: number;
  nombreCliente: string;
  total: number;
  estado: string;
  fecha: string | null;
};

// ---------------------------------------------------------------------------
// Row types (snake_case, tal como devuelve Supabase)
// ---------------------------------------------------------------------------
type EnvioRow = {
  id: number;
  id_venta: number | null;
  id_pedido: number | null;
  id_vehiculo: number | null;
  id_conductor: number | null;
  id_ruta: number | null;
  direccion_envio: string | null;
  fecha_envio: string | null;
  fecha_entrega: string | null;
  costo_transporte: number | null;
  estado: string;
  observaciones: string | null;
  fecha_creacion: string;
  vehiculo: { placa: string | null; marca: string | null } | null;
  conductor: {
    nombres: string | null;
    licencia: string | null;
  } | null;
  ruta: {
    nombre: string | null;
    origen: string | null;
    destino: string | null;
  } | null;
  venta: {
    total: number | null;
    estado: string | null;
    cliente: {
      persona: { nombres: string | null; apellido_paterno: string | null } | null;
    } | null;
  } | null;
};

type VehiculoRow = {
  id: number;
  placa: string;
  marca: string | null;
  modelo: string | null;
  capacidad_kg: number | null;
  estado: string;
};

type ConductorRow = {
  id: number;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  telefono: string | null;
  numero_documento: string | null;
  licencia: string;
  categoria_licencia: string | null;
  estado: string;
};

type RutaRow = {
  id: number;
  nombre: string;
  origen: string | null;
  destino: string | null;
  distancia_km: number | null;
  tiempo_estimado_horas: number | null;
  costo_base: number | null;
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
function mapEnvioRow(row: EnvioRow): EnvioResponse {
  const conductor = row.conductor;
  const nombreConductor = conductor?.nombres ?? null;
  return {
    id: row.id,
    idVenta: row.id_venta,
    idPedido: row.id_pedido,
    estado: row.estado,
    direccionEnvio: row.direccion_envio ?? "",
    fechaEnvio: row.fecha_envio,
    fechaEntrega: row.fecha_entrega,
    costoTransporte: row.costo_transporte,
    observaciones: row.observaciones,
    fechaCreacion: row.fecha_creacion,
    placaVehiculo: row.vehiculo?.placa ?? null,
    marcaVehiculo: row.vehiculo?.marca ?? null,
    nombreConductor,
    licenciaConductor: conductor?.licencia ?? null,
    nombreRuta: row.ruta?.nombre ?? null,
    origenRuta: row.ruta?.origen ?? null,
    destinoRuta: row.ruta?.destino ?? null,
    totalVenta: row.venta?.total ?? null,
    nombreCliente:
      row.venta?.cliente?.persona
        ? `${row.venta.cliente.persona.nombres ?? ""} ${row.venta.cliente.persona.apellido_paterno ?? ""}`.trim()
        : null,
    estadoVenta: row.venta?.estado ?? null,
  };
}

function mapVehiculoRow(row: VehiculoRow): Vehiculo {
  return {
    id: row.id,
    placa: row.placa,
    marca: row.marca ?? "",
    modelo: row.modelo ?? "",
    capacidadKg: row.capacidad_kg ?? 0,
    estado: row.estado,
  };
}

function mapConductorRow(row: ConductorRow): Conductor {
  return {
    id: row.id,
    nombres: row.nombres ?? "",
    apellidoPaterno: row.apellido_paterno ?? "",
    apellidoMaterno: row.apellido_materno ?? "",
    telefono: row.telefono ?? "",
    numeroDocumento: row.numero_documento ?? "",
    licencia: row.licencia,
    categoriaLicencia: row.categoria_licencia ?? "",
    estado: row.estado,
  };
}

function mapRutaRow(row: RutaRow): Ruta {
  return {
    id: row.id,
    nombre: row.nombre,
    origen: row.origen ?? "",
    destino: row.destino ?? "",
    distanciaKm: row.distancia_km ?? 0,
    tiempoEstimadoHoras: row.tiempo_estimado_horas ?? 0,
    costoBase: row.costo_base ?? 0,
  };
}

// Join fragment reutilizable para envío completo
const ENVIO_SELECT = `
  id, id_venta, id_pedido, id_vehiculo, id_conductor, id_ruta,
  direccion_envio, fecha_envio, fecha_entrega, costo_transporte,
  estado, observaciones, fecha_creacion,
  vehiculo:id_vehiculo ( placa, marca ),
  conductor:id_conductor ( nombres, licencia ),
  ruta:id_ruta ( nombre, origen, destino ),
  venta:id_venta (
    total, estado,
    cliente:id_cliente (
      persona:id_persona ( nombres, apellido_paterno )
    )
  )
` as const;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export const envioService = {
  // ── Envíos ────────────────────────────────────────────────────────────────

  async fetchEnvios(): Promise<EnvioResponse[]> {
    const { data, error } = await supabase
      .from("envio")
      .select(ENVIO_SELECT)
      .order("id", { ascending: false });
    if (error) {
      console.error("fetchEnvios:", error);
      throw new Error(getErrorMessage(error));
    }
    return ((data ?? []) as unknown as EnvioRow[]).map(mapEnvioRow);
  },

  async fetchEnvio(id: number): Promise<EnvioResponse> {
    const { data, error } = await supabase
      .from("envio")
      .select(ENVIO_SELECT)
      .eq("id", id)
      .single();
    if (error) {
      console.error("fetchEnvio:", error);
      throw new Error(getErrorMessage(error));
    }
    return mapEnvioRow(data as unknown as EnvioRow);
  },

  async crearEnvio(envio: EnvioRequest): Promise<EnvioResponse> {
    const { data: inserted, error: insertError } = await supabase
      .from("envio")
      .insert({
        id_venta: envio.idVenta ?? null,
        id_pedido: envio.idPedido ?? null,
        id_vehiculo: envio.idVehiculo ?? null,
        id_conductor: envio.idConductor ?? null,
        id_ruta: envio.idRuta ?? null,
        direccion_envio: envio.direccionEnvio,
        fecha_envio: envio.fechaEnvio ?? null,
        fecha_entrega: envio.fechaEntrega ?? null,
        costo_transporte: envio.costoTransporte ?? null,
        observaciones: envio.observaciones ?? null,
      })
      .select("id")
      .single();
    if (insertError) {
      console.error("crearEnvio:", insertError);
      throw new Error(getErrorMessage(insertError));
    }
    return this.fetchEnvio((inserted as { id: number }).id);
  },

  async actualizarEnvio(id: number, envio: EnvioRequest): Promise<EnvioResponse> {
    const { error } = await supabase
      .from("envio")
      .update({
        id_venta: envio.idVenta ?? null,
        id_pedido: envio.idPedido ?? null,
        id_vehiculo: envio.idVehiculo ?? null,
        id_conductor: envio.idConductor ?? null,
        id_ruta: envio.idRuta ?? null,
        direccion_envio: envio.direccionEnvio,
        fecha_envio: envio.fechaEnvio ?? null,
        fecha_entrega: envio.fechaEntrega ?? null,
        costo_transporte: envio.costoTransporte ?? null,
        observaciones: envio.observaciones ?? null,
      })
      .eq("id", id);
    if (error) {
      console.error("actualizarEnvio:", error);
      throw new Error(getErrorMessage(error));
    }
    return this.fetchEnvio(id);
  },

  async actualizarEstado(id: number, estado: string): Promise<EnvioResponse> {
    const { error } = await supabase
      .from("envio")
      .update({ estado })
      .eq("id", id);
    if (error) {
      console.error("actualizarEstado:", error);
      throw new Error(getErrorMessage(error));
    }
    return this.fetchEnvio(id);
  },

  async eliminarEnvio(id: number): Promise<void> {
    const { error } = await supabase.from("envio").delete().eq("id", id);
    if (error) {
      console.error("eliminarEnvio:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // ── Vehículos ─────────────────────────────────────────────────────────────

  async fetchVehiculos(): Promise<Vehiculo[]> {
    const { data, error } = await supabase
      .from("vehiculo")
      .select("id, placa, marca, modelo, capacidad_kg, estado")
      .order("id", { ascending: true });
    if (error) {
      console.error("fetchVehiculos:", error);
      throw new Error(getErrorMessage(error));
    }
    return ((data ?? []) as VehiculoRow[]).map(mapVehiculoRow);
  },

  async crearVehiculo(vehiculo: Partial<Vehiculo>): Promise<Vehiculo> {
    const { data, error } = await supabase
      .from("vehiculo")
      .insert({
        placa: vehiculo.placa ?? "",
        marca: vehiculo.marca ?? null,
        modelo: vehiculo.modelo ?? null,
        capacidad_kg: vehiculo.capacidadKg ?? null,
        estado: vehiculo.estado ?? "DISPONIBLE",
      })
      .select("id, placa, marca, modelo, capacidad_kg, estado")
      .single();
    if (error) {
      console.error("crearVehiculo:", error);
      throw new Error(getErrorMessage(error));
    }
    return mapVehiculoRow(data as VehiculoRow);
  },

  async actualizarVehiculo(id: number, vehiculo: Partial<Vehiculo>): Promise<Vehiculo> {
    const { data, error } = await supabase
      .from("vehiculo")
      .update({
        placa: vehiculo.placa,
        marca: vehiculo.marca ?? null,
        modelo: vehiculo.modelo ?? null,
        capacidad_kg: vehiculo.capacidadKg ?? null,
        estado: vehiculo.estado,
      })
      .eq("id", id)
      .select("id, placa, marca, modelo, capacidad_kg, estado")
      .single();
    if (error) {
      console.error("actualizarVehiculo:", error);
      throw new Error(getErrorMessage(error));
    }
    return mapVehiculoRow(data as VehiculoRow);
  },

  async eliminarVehiculo(id: number): Promise<void> {
    const { error } = await supabase.from("vehiculo").delete().eq("id", id);
    if (error) {
      console.error("eliminarVehiculo:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // ── Conductores ───────────────────────────────────────────────────────────

  async fetchConductores(): Promise<Conductor[]> {
    const { data, error } = await supabase
      .from("conductor")
      .select(
        "id, nombres, apellido_paterno, apellido_materno, telefono, numero_documento, licencia, categoria_licencia, estado"
      )
      .order("id", { ascending: true });
    if (error) {
      console.error("fetchConductores:", error);
      throw new Error(getErrorMessage(error));
    }
    return ((data ?? []) as ConductorRow[]).map(mapConductorRow);
  },

  async crearConductor(conductor: Partial<Conductor>): Promise<Conductor> {
    // conductor.id_persona es requerido por el esquema; como la firma acepta
    // Partial<Conductor> que no lo incluye, se inserta con id_persona=1 como
    // valor provisional. TODO: ajustar cuando el formulario proporcione id_persona.
    const { data, error } = await supabase
      .from("conductor")
      .insert({
        id_persona: 1, // TODO: recibir id_persona desde el formulario
        nombres: conductor.nombres ?? null,
        apellido_paterno: conductor.apellidoPaterno ?? null,
        apellido_materno: conductor.apellidoMaterno ?? null,
        telefono: conductor.telefono ?? null,
        numero_documento: conductor.numeroDocumento ?? null,
        licencia: conductor.licencia ?? "",
        categoria_licencia: conductor.categoriaLicencia ?? null,
        estado: conductor.estado ?? "ACTIVO",
      })
      .select(
        "id, nombres, apellido_paterno, apellido_materno, telefono, numero_documento, licencia, categoria_licencia, estado"
      )
      .single();
    if (error) {
      console.error("crearConductor:", error);
      throw new Error(getErrorMessage(error));
    }
    return mapConductorRow(data as ConductorRow);
  },

  async actualizarConductor(id: number, conductor: Partial<Conductor>): Promise<Conductor> {
    const { data, error } = await supabase
      .from("conductor")
      .update({
        nombres: conductor.nombres ?? null,
        apellido_paterno: conductor.apellidoPaterno ?? null,
        apellido_materno: conductor.apellidoMaterno ?? null,
        telefono: conductor.telefono ?? null,
        numero_documento: conductor.numeroDocumento ?? null,
        licencia: conductor.licencia,
        categoria_licencia: conductor.categoriaLicencia ?? null,
        estado: conductor.estado,
      })
      .eq("id", id)
      .select(
        "id, nombres, apellido_paterno, apellido_materno, telefono, numero_documento, licencia, categoria_licencia, estado"
      )
      .single();
    if (error) {
      console.error("actualizarConductor:", error);
      throw new Error(getErrorMessage(error));
    }
    return mapConductorRow(data as ConductorRow);
  },

  async eliminarConductor(id: number): Promise<void> {
    const { error } = await supabase.from("conductor").delete().eq("id", id);
    if (error) {
      console.error("eliminarConductor:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // ── Rutas ─────────────────────────────────────────────────────────────────

  async fetchRutas(): Promise<Ruta[]> {
    const { data, error } = await supabase
      .from("ruta")
      .select(
        "id, nombre, origen, destino, distancia_km, tiempo_estimado_horas, costo_base"
      )
      .order("id", { ascending: true });
    if (error) {
      console.error("fetchRutas:", error);
      throw new Error(getErrorMessage(error));
    }
    return ((data ?? []) as RutaRow[]).map(mapRutaRow);
  },

  async crearRuta(ruta: Partial<Ruta>): Promise<Ruta> {
    const { data, error } = await supabase
      .from("ruta")
      .insert({
        nombre: ruta.nombre ?? "",
        origen: ruta.origen ?? null,
        destino: ruta.destino ?? null,
        distancia_km: ruta.distanciaKm ?? null,
        tiempo_estimado_horas: ruta.tiempoEstimadoHoras ?? null,
        costo_base: ruta.costoBase ?? null,
      })
      .select(
        "id, nombre, origen, destino, distancia_km, tiempo_estimado_horas, costo_base"
      )
      .single();
    if (error) {
      console.error("crearRuta:", error);
      throw new Error(getErrorMessage(error));
    }
    return mapRutaRow(data as RutaRow);
  },

  async actualizarRuta(id: number, ruta: Partial<Ruta>): Promise<Ruta> {
    const { data, error } = await supabase
      .from("ruta")
      .update({
        nombre: ruta.nombre,
        origen: ruta.origen ?? null,
        destino: ruta.destino ?? null,
        distancia_km: ruta.distanciaKm ?? null,
        tiempo_estimado_horas: ruta.tiempoEstimadoHoras ?? null,
        costo_base: ruta.costoBase ?? null,
      })
      .eq("id", id)
      .select(
        "id, nombre, origen, destino, distancia_km, tiempo_estimado_horas, costo_base"
      )
      .single();
    if (error) {
      console.error("actualizarRuta:", error);
      throw new Error(getErrorMessage(error));
    }
    return mapRutaRow(data as RutaRow);
  },

  async eliminarRuta(id: number): Promise<void> {
    const { error } = await supabase.from("ruta").delete().eq("id", id);
    if (error) {
      console.error("eliminarRuta:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // ── Ventas (para asociar al envío) ────────────────────────────────────────

  async fetchVentas(): Promise<VentaResumen[]> {
    const { data, error } = await supabase
      .from("venta")
      .select(
        "id, total, estado, fecha, cliente:id_cliente ( persona:id_persona ( nombres, apellido_paterno ) )"
      )
      .order("id", { ascending: false });
    if (error) {
      console.error("fetchVentas:", error);
      throw new Error(getErrorMessage(error));
    }

    type VentaJoin = {
      id: number;
      total: number | null;
      estado: string;
      fecha: string | null;
      cliente: {
        persona: { nombres: string | null; apellido_paterno: string | null } | null;
      } | null;
    };

    return ((data ?? []) as unknown as VentaJoin[]).map((v) => ({
      id: v.id,
      nombreCliente: v.cliente?.persona
        ? `${v.cliente.persona.nombres ?? ""} ${v.cliente.persona.apellido_paterno ?? ""}`.trim()
        : "Sin cliente",
      total: v.total ?? 0,
      estado: v.estado,
      fecha: v.fecha,
    }));
  },
};
