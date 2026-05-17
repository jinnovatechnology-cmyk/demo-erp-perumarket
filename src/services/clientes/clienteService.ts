import { supabase } from "../../lib/supabase";
import type { Cliente } from "../../types/clientes/Client";

// ---------------------------------------------------------------------------
// Tipos internos para las filas que devuelve Supabase
// ---------------------------------------------------------------------------

interface PersonaRow {
  id: number;
  tipo_documento: string | null;
  numero_documento: string | null;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  correo: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
}

interface ClienteRow {
  id: number;
  tipo: string | null;
  estado: string | null;
  fecha_creacion: string | null;
  persona: PersonaRow | PersonaRow[] | null;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function toPersonaFront(p: PersonaRow, personaId?: number): Cliente["persona"] {
  return {
    id: personaId ?? p.id,
    tipoDocumento: p.tipo_documento ?? "",
    numeroDocumento: p.numero_documento ?? "",
    nombres: p.nombres ?? "",
    apellidoPaterno: p.apellido_paterno ?? "",
    apellidoMaterno: p.apellido_materno ?? "",
    correo: p.correo ?? "",
    telefono: p.telefono ?? "",
    fechaNacimiento: p.fecha_nacimiento ?? undefined,
    direccion: p.direccion ?? "",
  };
}

function rowToCliente(row: ClienteRow): Cliente {
  // Supabase devuelve la relación como objeto o array según la consulta
  const personaRaw = Array.isArray(row.persona) ? row.persona[0] : row.persona;
  const persona = personaRaw
    ? toPersonaFront(personaRaw)
    : {
        tipoDocumento: "",
        numeroDocumento: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        correo: "",
        telefono: "",
        direccion: "",
      };

  return {
    id: row.id,
    tipo: row.tipo ?? "NATURAL",
    estado: row.estado ?? "ACTIVO",
    fechaCreacion: row.fecha_creacion ?? undefined,
    persona,
  };
}

// ---------------------------------------------------------------------------
// Utilidades de error
// ---------------------------------------------------------------------------

function getErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    return (e as { message: string }).message;
  }
  return "Error desconocido.";
}

// ---------------------------------------------------------------------------
// checkDniExists — exported standalone (la UI lo importa directamente)
// ---------------------------------------------------------------------------

export const checkDniExists = async (
  numeroDocumento: string,
  excludeId?: number
): Promise<{ exists: boolean; message: string }> => {
  try {
    // Buscamos en persona por numero_documento
    let query = supabase
      .from("persona")
      .select("id")
      .eq("numero_documento", numeroDocumento);

    // Si excludeId es el id del cliente, necesitamos excluir esa persona.
    // Obtenemos el id_persona del cliente a excluir primero.
    if (excludeId) {
      const { data: clienteData, error: clienteError } = await supabase
        .from("cliente")
        .select("id_persona")
        .eq("id", excludeId)
        .maybeSingle();

      if (clienteError) {
        console.error("Error buscando cliente para excluir:", clienteError);
      } else if (clienteData) {
        const row = clienteData as { id_persona: number };
        query = query.neq("id", row.id_persona);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking DNI:", error);
      return { exists: false, message: "No se pudo verificar el documento." };
    }

    const exists = Array.isArray(data) && data.length > 0;
    return {
      exists,
      message: exists ? "Este documento ya está registrado." : "",
    };
  } catch (error) {
    console.error("Error checking DNI:", error);
    return { exists: false, message: "No se pudo verificar el documento." };
  }
};

// ---------------------------------------------------------------------------
// ClienteService
// ---------------------------------------------------------------------------

export const ClienteService = {
  // ── getAllClientes ─────────────────────────────────────────────────────────
  getAllClientes: async (): Promise<Cliente[]> => {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select("id,tipo,estado,fecha_creacion,persona:persona(*)")
        .order("id");

      if (error) throw new Error(error.message);

      const rows = (data ?? []) as unknown as ClienteRow[];
      return rows.map(rowToCliente);
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // ── saveCliente ────────────────────────────────────────────────────────────
  saveCliente: async (cliente: Cliente): Promise<Cliente> => {
    try {
      const personaPayload = {
        tipo_documento: cliente.persona.tipoDocumento,
        numero_documento: cliente.persona.numeroDocumento,
        nombres: cliente.persona.nombres,
        apellido_paterno: cliente.persona.apellidoPaterno,
        apellido_materno: cliente.persona.apellidoMaterno,
        correo: cliente.persona.correo,
        telefono: cliente.persona.telefono,
        fecha_nacimiento: cliente.persona.fechaNacimiento ?? null,
        direccion: cliente.persona.direccion,
      };

      if (cliente.id) {
        // --- UPDATE ---
        // 1. Actualizar persona
        const personaId = cliente.persona.id;
        if (personaId) {
          const { error: personaError } = await supabase
            .from("persona")
            .update(personaPayload)
            .eq("id", personaId);
          if (personaError) throw new Error(personaError.message);
        }

        // 2. Actualizar cliente
        const { error: clienteError } = await supabase
          .from("cliente")
          .update({ tipo: cliente.tipo, estado: cliente.estado ?? "ACTIVO" })
          .eq("id", cliente.id);
        if (clienteError) throw new Error(clienteError.message);

        // 3. Releer y devolver
        const { data: refreshed, error: refreshError } = await supabase
          .from("cliente")
          .select("id,tipo,estado,fecha_creacion,persona:persona(*)")
          .eq("id", cliente.id)
          .single();
        if (refreshError) throw new Error(refreshError.message);

        return rowToCliente(refreshed as unknown as ClienteRow);
      } else {
        // --- INSERT ---
        // 1. Insertar persona
        const { data: personaData, error: personaError } = await supabase
          .from("persona")
          .insert(personaPayload)
          .select("id")
          .single();
        if (personaError) throw new Error(personaError.message);

        const newPersonaId = (personaData as { id: number }).id;

        // 2. Insertar cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from("cliente")
          .insert({
            id_persona: newPersonaId,
            tipo: cliente.tipo ?? "NATURAL",
            estado: cliente.estado ?? "ACTIVO",
          })
          .select("id,tipo,estado,fecha_creacion,persona:persona(*)")
          .single();
        if (clienteError) throw new Error(clienteError.message);

        return rowToCliente(clienteData as unknown as ClienteRow);
      }
    } catch (error) {
      console.error("Error saving client:", error);
      throw new Error(getErrorMessage(error));
    }
  },

  // ── deleteCliente ──────────────────────────────────────────────────────────
  deleteCliente: async (id: number): Promise<void> => {
    const { error } = await supabase.from("cliente").delete().eq("id", id);

    if (error) {
      // FK violation — venta.id_cliente referencia a cliente
      if (
        error.code === "23503" ||
        error.message.toLowerCase().includes("violates foreign key")
      ) {
        throw {
          status: 409,
          response: { status: 409 },
          message: "Conflicto: El cliente tiene ventas asociadas.",
        };
      }
      throw new Error(error.message);
    }

    console.log(`Cliente ${id} eliminado físicamente`);
  },

  // ── desactivarCliente ──────────────────────────────────────────────────────
  desactivarCliente: async (id: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from("cliente")
        .update({ estado: "INACTIVO" })
        .eq("id", id);

      if (error) throw new Error(error.message);

      console.log(`Cliente ${id} desactivado exitosamente`);
    } catch (error) {
      throw new Error("No se pudo desactivar el cliente: " + getErrorMessage(error));
    }
  },
};
