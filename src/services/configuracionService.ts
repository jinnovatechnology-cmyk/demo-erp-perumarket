import { supabase } from "../lib/supabase";

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
// Public interfaces (firmas conservadas intactas)
// ---------------------------------------------------------------------------
export interface ProfileData {
  id: number;
  username: string;
  estado: string;
  persona: {
    id: number;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    telefono: string;
    fechaNacimiento: string;
    direccion: string;
  };
  rol: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}

export interface UpdateProfileRequest {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SystemInfo {
  version: string;
  nombre: string;
  totalUsuarios: number;
  usuariosActivos: number;
}

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------
type UsuarioRow = {
  id: number;
  username: string;
  estado: string;
  persona: {
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
  } | null;
  rol: {
    id: number;
    nombre: string;
    descripcion: string | null;
  } | null;
};

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------
function mapUsuarioRow(row: UsuarioRow): ProfileData {
  const p = row.persona;
  const r = row.rol;
  return {
    id: row.id,
    username: row.username,
    estado: row.estado,
    persona: {
      id: p?.id ?? 0,
      tipoDocumento: p?.tipo_documento ?? "",
      numeroDocumento: p?.numero_documento ?? "",
      nombres: p?.nombres ?? "",
      apellidoPaterno: p?.apellido_paterno ?? "",
      apellidoMaterno: p?.apellido_materno ?? "",
      correo: p?.correo ?? "",
      telefono: p?.telefono ?? "",
      fechaNacimiento: p?.fecha_nacimiento ?? "",
      direccion: p?.direccion ?? "",
    },
    rol: {
      id: r?.id ?? 0,
      nombre: r?.nombre ?? "",
      descripcion: r?.descripcion ?? "",
    },
  };
}

const USUARIO_SELECT = `
  id, username, estado,
  persona:id_persona (
    id, tipo_documento, numero_documento, nombres,
    apellido_paterno, apellido_materno, correo,
    telefono, fecha_nacimiento, direccion
  ),
  rol:id_rol ( id, nombre, descripcion )
` as const;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export const configuracionService = {
  /**
   * Obtiene el perfil del usuario dado su id en la tabla `usuario`.
   * Los datos personales vienen de la tabla `persona` enlazada por id_persona.
   */
  async getProfile(userId: number): Promise<ProfileData> {
    const { data, error } = await supabase
      .from("usuario")
      .select(USUARIO_SELECT)
      .eq("id", userId)
      .single();
    if (error) {
      console.error("getProfile:", error);
      throw new Error(getErrorMessage(error));
    }
    return mapUsuarioRow(data as unknown as UsuarioRow);
  },

  /**
   * Actualiza los campos personales del usuario en la tabla `persona`.
   * No modifica la tabla `usuario` directamente (username/estado).
   */
  async updateProfile(userId: number, req: UpdateProfileRequest): Promise<ProfileData> {
    // 1. Obtener id_persona del usuario
    const { data: usr, error: usrError } = await supabase
      .from("usuario")
      .select("id_persona")
      .eq("id", userId)
      .single();
    if (usrError) {
      console.error("updateProfile — fetch id_persona:", usrError);
      throw new Error(getErrorMessage(usrError));
    }
    const idPersona = (usr as { id_persona: number }).id_persona;

    // 2. Actualizar persona
    const { error: updateError } = await supabase
      .from("persona")
      .update({
        nombres: req.nombres,
        apellido_paterno: req.apellidoPaterno,
        apellido_materno: req.apellidoMaterno,
        correo: req.correo,
        telefono: req.telefono,
        direccion: req.direccion,
      })
      .eq("id", idPersona);
    if (updateError) {
      console.error("updateProfile — update persona:", updateError);
      throw new Error(getErrorMessage(updateError));
    }

    // 3. Devolver perfil actualizado
    return this.getProfile(userId);
  },

  /**
   * Cambia la contraseña del usuario autenticado usando Supabase Auth.
   * `currentPassword` no puede verificarse del lado cliente con Supabase Auth;
   * se delega la validación al proveedor Auth (el campo se conserva en la firma
   * por compatibilidad con la página).
   *
   * TODO: si se requiere verificación de contraseña actual, implementar una
   * Edge Function o RPC en Supabase que haga re-autenticación.
   */
  async changePassword(
    _userId: number,
    data: ChangePasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });
    if (error) {
      console.error("changePassword:", error);
      throw new Error(getErrorMessage(error));
    }
    return { success: true, message: "Contraseña actualizada correctamente" };
  },

  /**
   * Información general del sistema.
   * No existe tabla dedicada en el esquema; se construye consultando `usuario`.
   * La versión y nombre se leen desde localStorage (clave "app_config") o
   * se devuelven valores por defecto.
   *
   * TODO: crear tabla `configuracion_sistema` o endpoint RPC si se necesitan
   * datos configurables en servidor.
   */
  async getSystemInfo(): Promise<SystemInfo> {
    // Leer preferencias guardadas (si las hay)
    // TODO: si existe tabla configuracion_sistema, consultar aquí en su lugar.
    let version = "1.0.0";
    let nombre = "PeruMarket ERP";
    try {
      const raw = localStorage.getItem("app_config");
      if (raw) {
        const cfg = JSON.parse(raw) as Record<string, unknown>;
        if (typeof cfg.version === "string") version = cfg.version;
        if (typeof cfg.nombre === "string") nombre = cfg.nombre;
      }
    } catch {
      /* ignorar errores de parseo */
    }

    // Contar usuarios desde Supabase
    const { count: totalCount, error: totalError } = await supabase
      .from("usuario")
      .select("id", { count: "exact", head: true });
    if (totalError) console.error("getSystemInfo — totalUsuarios:", totalError);

    const { count: activosCount, error: activosError } = await supabase
      .from("usuario")
      .select("id", { count: "exact", head: true })
      .eq("estado", "ACTIVO");
    if (activosError) console.error("getSystemInfo — usuariosActivos:", activosError);

    return {
      version,
      nombre,
      totalUsuarios: totalCount ?? 0,
      usuariosActivos: activosCount ?? 0,
    };
  },
};
