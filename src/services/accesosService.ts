// accesosService.ts — migrado a Supabase
import { supabase } from '../lib/supabase';

// ── helper ────────────────────────────────────────────────────────────────────
function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ── tipos exportados (conservados exactamente) ────────────────────────────────
export interface Usuario {
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

export interface CreateUsuarioRequest {
  username: string;
  password: string;
  estado: string;
  idRol: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
}

export interface UpdateUsuarioRequest {
  username: string;
  password?: string;
  estado: string;
  idRol: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  usuariosCount?: number;
  modulosActivosCount?: number;
}

export interface RolForDropdown {
  id: number;
  nombre: string;
}

export interface Modulo {
  id: number;
  nombre: string;
  descripcion: string;
  ruta: string;
}

export interface RolePermission {
  idModulo: number;
  nombreModulo?: string;
  hasAccess: boolean;
}

export interface UpdatePermissionsRequest {
  idRol: number;
  permissions: RolePermission[];
}

// ── tipos internos de BD (snake_case) ─────────────────────────────────────────
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

interface RolRow {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface ModuloRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  ruta: string | null;
}

interface UsuarioRow {
  id: number;
  id_persona: number;
  id_rol: number;
  username: string;
  estado: string;
  auth_user_id: string | null;
  persona: PersonaRow | null;
  rol: RolRow | null;
}

// ── mappers ───────────────────────────────────────────────────────────────────
function mapUsuarioRow(row: UsuarioRow): Usuario {
  const p = row.persona;
  const r = row.rol;
  return {
    id: row.id,
    username: row.username,
    estado: row.estado,
    persona: {
      id: p?.id ?? 0,
      tipoDocumento: p?.tipo_documento ?? '',
      numeroDocumento: p?.numero_documento ?? '',
      nombres: p?.nombres ?? '',
      apellidoPaterno: p?.apellido_paterno ?? '',
      apellidoMaterno: p?.apellido_materno ?? '',
      correo: p?.correo ?? '',
      telefono: p?.telefono ?? '',
      fechaNacimiento: p?.fecha_nacimiento ?? '',
      direccion: p?.direccion ?? '',
    },
    rol: {
      id: r?.id ?? 0,
      nombre: r?.nombre ?? '',
      descripcion: r?.descripcion ?? '',
    },
  };
}

// ── SERVICIO ──────────────────────────────────────────────────────────────────
export const accesosService = {

  // ========== USUARIOS ==========

  async getUsuarios(): Promise<Usuario[]> {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select(`
          id, id_persona, id_rol, username, estado, auth_user_id,
          persona ( id, tipo_documento, numero_documento, nombres,
                    apellido_paterno, apellido_materno, correo,
                    telefono, fecha_nacimiento, direccion ),
          rol ( id, nombre, descripcion )
        `)
        .order('id', { ascending: true });

      if (error) throw new Error(error.message);
      return ((data ?? []) as unknown as UsuarioRow[]).map(mapUsuarioRow);
    } catch (e) {
      console.error('accesosService.getUsuarios:', getErrorMessage(e));
      throw new Error('Error al cargar usuarios: ' + getErrorMessage(e));
    }
  },

  // testConnection: en Supabase no hay endpoint de test; devuelve OK si la
  // conexión funciona (intenta contar filas de `usuario`).
  async testConnection(): Promise<string> {
    try {
      console.log('Probando conexión con Supabase...');
      const { error } = await supabase
        .from('usuario')
        .select('id', { count: 'exact', head: true });
      if (error) throw new Error(error.message);
      console.log('Conexión con Supabase OK');
      return 'OK';
    } catch (e) {
      console.error('accesosService.testConnection:', getErrorMessage(e));
      throw new Error('No se pudo conectar con Supabase: ' + getErrorMessage(e));
    }
  },

  async getUsuarioById(id: number): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuario')
      .select(`
        id, id_persona, id_rol, username, estado, auth_user_id,
        persona ( id, tipo_documento, numero_documento, nombres,
                  apellido_paterno, apellido_materno, correo,
                  telefono, fecha_nacimiento, direccion ),
        rol ( id, nombre, descripcion )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return mapUsuarioRow(data as unknown as UsuarioRow);
  },

  async createUsuario(usuario: CreateUsuarioRequest): Promise<Usuario> {
    try {
      // TODO: crear cuenta en Supabase Auth (Admin API) y enlazar auth_user_id.
      // Por ahora solo se crea la fila en persona + usuario (sin auth real).

      // 1. Insertar persona
      const { data: personaData, error: personaError } = await supabase
        .from('persona')
        .insert({
          tipo_documento: usuario.tipoDocumento,
          numero_documento: usuario.numeroDocumento,
          nombres: usuario.nombres,
          apellido_paterno: usuario.apellidoPaterno,
          apellido_materno: usuario.apellidoMaterno,
          correo: usuario.correo,
          telefono: usuario.telefono,
          fecha_nacimiento: usuario.fechaNacimiento || null,
          direccion: usuario.direccion,
        })
        .select('id')
        .single();

      if (personaError) throw new Error(personaError.message);
      const idPersona = (personaData as { id: number }).id;

      // 2. Insertar usuario
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuario')
        .insert({
          id_persona: idPersona,
          id_rol: usuario.idRol,
          username: usuario.username,
          // password en BD es legacy; no almacenamos la contraseña real aquí
          password: null,
          estado: usuario.estado,
          auth_user_id: null,
        })
        .select('id')
        .single();

      if (usuarioError) throw new Error(usuarioError.message);
      const newId = (usuarioData as { id: number }).id;

      return await accesosService.getUsuarioById(newId);
    } catch (e) {
      console.error('accesosService.createUsuario:', getErrorMessage(e));
      throw new Error(getErrorMessage(e));
    }
  },

  async updateUsuario(id: number, usuario: UpdateUsuarioRequest): Promise<Usuario> {
    try {
      // 1. Obtener id_persona actual
      const { data: current, error: currentError } = await supabase
        .from('usuario')
        .select('id_persona')
        .eq('id', id)
        .single();
      if (currentError) throw new Error(currentError.message);
      const idPersona = (current as { id_persona: number }).id_persona;

      // 2. Actualizar persona
      const { error: personaError } = await supabase
        .from('persona')
        .update({
          tipo_documento: usuario.tipoDocumento,
          numero_documento: usuario.numeroDocumento,
          nombres: usuario.nombres,
          apellido_paterno: usuario.apellidoPaterno,
          apellido_materno: usuario.apellidoMaterno,
          correo: usuario.correo,
          telefono: usuario.telefono,
          fecha_nacimiento: usuario.fechaNacimiento || null,
          direccion: usuario.direccion,
        })
        .eq('id', idPersona);
      if (personaError) throw new Error(personaError.message);

      // 3. Actualizar usuario
      const { error: usuarioError } = await supabase
        .from('usuario')
        .update({
          id_rol: usuario.idRol,
          username: usuario.username,
          estado: usuario.estado,
        })
        .eq('id', id);
      if (usuarioError) throw new Error(usuarioError.message);

      return await accesosService.getUsuarioById(id);
    } catch (e) {
      console.error('accesosService.updateUsuario:', getErrorMessage(e));
      throw new Error(getErrorMessage(e));
    }
  },

  async deleteUsuario(id: number): Promise<void> {
    try {
      // Obtener id_persona para eliminar en cascada (la persona se borra sola
      // porque la FK tiene ON DELETE CASCADE, pero eliminar persona primero
      // también elimina el usuario por cascada).
      const { error } = await supabase
        .from('usuario')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    } catch (e) {
      console.error('accesosService.deleteUsuario:', getErrorMessage(e));
      throw new Error(getErrorMessage(e));
    }
  },

  // ========== ROLES ==========

  async getRoles(): Promise<Rol[]> {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('rol')
        .select('id, nombre, descripcion')
        .order('id', { ascending: true });
      if (rolesError) throw new Error(rolesError.message);
      const roles = (rolesData ?? []) as RolRow[];

      // Contar usuarios por rol (agregación en JS)
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuario')
        .select('id_rol');
      if (usuariosError) throw new Error(usuariosError.message);
      const usuariosCountMap: Record<number, number> = {};
      (usuariosData ?? []).forEach((u: { id_rol: number }) => {
        usuariosCountMap[u.id_rol] = (usuariosCountMap[u.id_rol] || 0) + 1;
      });

      // Contar módulos activos por rol (has_access = true) (agregación en JS)
      const { data: permsData, error: permsError } = await supabase
        .from('role_module_permissions')
        .select('id_rol, has_access');
      if (permsError) throw new Error(permsError.message);
      const modulosActivosMap: Record<number, number> = {};
      (permsData ?? []).forEach((p: { id_rol: number; has_access: boolean }) => {
        if (p.has_access) {
          modulosActivosMap[p.id_rol] = (modulosActivosMap[p.id_rol] || 0) + 1;
        }
      });

      return roles.map(r => ({
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion ?? '',
        usuariosCount: usuariosCountMap[r.id] ?? 0,
        modulosActivosCount: modulosActivosMap[r.id] ?? 0,
      }));
    } catch (e) {
      console.error('accesosService.getRoles:', getErrorMessage(e));
      throw new Error('Error al cargar roles: ' + getErrorMessage(e));
    }
  },

  async getRolesForDropdown(): Promise<RolForDropdown[]> {
    try {
      const { data, error } = await supabase
        .from('rol')
        .select('id, nombre')
        .order('nombre', { ascending: true });
      if (error) throw new Error(error.message);
      return ((data ?? []) as { id: number; nombre: string }[]).map(r => ({
        id: r.id,
        nombre: r.nombre,
      }));
    } catch (e) {
      console.error('accesosService.getRolesForDropdown:', getErrorMessage(e));
      throw new Error('Error al cargar roles: ' + getErrorMessage(e));
    }
  },

  async getRolById(id: number): Promise<Rol> {
    try {
      const { data, error } = await supabase
        .from('rol')
        .select('id, nombre, descripcion')
        .eq('id', id)
        .single();
      if (error) throw new Error(error.message);
      const r = data as RolRow;
      return { id: r.id, nombre: r.nombre, descripcion: r.descripcion ?? '' };
    } catch (e) {
      console.error('accesosService.getRolById:', getErrorMessage(e));
      throw new Error('Error al cargar rol: ' + getErrorMessage(e));
    }
  },

  async createRol(rol: Omit<Rol, 'id'>): Promise<Rol> {
    try {
      const { data, error } = await supabase
        .from('rol')
        .insert({ nombre: rol.nombre, descripcion: rol.descripcion ?? null })
        .select('id, nombre, descripcion')
        .single();
      if (error) throw new Error(error.message);
      const r = data as RolRow;
      return {
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion ?? '',
        usuariosCount: 0,
        modulosActivosCount: 0,
      };
    } catch (e) {
      console.error('accesosService.createRol:', getErrorMessage(e));
      throw new Error(getErrorMessage(e));
    }
  },

  async updateRol(id: number, rol: Omit<Rol, 'id'>): Promise<Rol> {
    try {
      const { data, error } = await supabase
        .from('rol')
        .update({ nombre: rol.nombre, descripcion: rol.descripcion ?? null })
        .eq('id', id)
        .select('id, nombre, descripcion')
        .single();
      if (error) throw new Error(error.message);
      const r = data as RolRow;
      return {
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion ?? '',
        usuariosCount: rol.usuariosCount,
        modulosActivosCount: rol.modulosActivosCount,
      };
    } catch (e) {
      console.error('accesosService.updateRol:', getErrorMessage(e));
      throw new Error(getErrorMessage(e));
    }
  },

  async deleteRol(id: number): Promise<void> {
    try {
      const { error } = await supabase.from('rol').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch (e) {
      console.error('accesosService.deleteRol:', getErrorMessage(e));
      throw new Error(getErrorMessage(e));
    }
  },

  // ========== MÓDULOS ==========

  async getModulos(): Promise<Modulo[]> {
    const { data, error } = await supabase
      .from('modulo')
      .select('id, nombre, descripcion, ruta')
      .order('id', { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as ModuloRow[]).map(m => ({
      id: m.id,
      nombre: m.nombre,
      descripcion: m.descripcion ?? '',
      ruta: m.ruta ?? '',
    }));
  },

  async getModuloById(id: number): Promise<Modulo> {
    const { data, error } = await supabase
      .from('modulo')
      .select('id, nombre, descripcion, ruta')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    const m = data as ModuloRow;
    return { id: m.id, nombre: m.nombre, descripcion: m.descripcion ?? '', ruta: m.ruta ?? '' };
  },

  async createModulo(modulo: Omit<Modulo, 'id'>): Promise<Modulo> {
    const { data, error } = await supabase
      .from('modulo')
      .insert({ nombre: modulo.nombre, descripcion: modulo.descripcion ?? null, ruta: modulo.ruta ?? null })
      .select('id, nombre, descripcion, ruta')
      .single();
    if (error) throw new Error(error.message);
    const m = data as ModuloRow;
    return { id: m.id, nombre: m.nombre, descripcion: m.descripcion ?? '', ruta: m.ruta ?? '' };
  },

  async updateModulo(id: number, modulo: Omit<Modulo, 'id'>): Promise<Modulo> {
    const { data, error } = await supabase
      .from('modulo')
      .update({ nombre: modulo.nombre, descripcion: modulo.descripcion ?? null, ruta: modulo.ruta ?? null })
      .eq('id', id)
      .select('id, nombre, descripcion, ruta')
      .single();
    if (error) throw new Error(error.message);
    const m = data as ModuloRow;
    return { id: m.id, nombre: m.nombre, descripcion: m.descripcion ?? '', ruta: m.ruta ?? '' };
  },

  async deleteModulo(id: number): Promise<void> {
    const { error } = await supabase.from('modulo').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ========== PERMISOS ==========

  async getPermissionsByRol(rolId: number): Promise<RolePermission[]> {
    try {
      // Traer todos los módulos y los permisos del rol dado
      const [modulosRes, permsRes] = await Promise.all([
        supabase.from('modulo').select('id, nombre').order('id', { ascending: true }),
        supabase
          .from('role_module_permissions')
          .select('id_modulo, has_access')
          .eq('id_rol', rolId),
      ]);

      if (modulosRes.error) throw new Error(modulosRes.error.message);
      if (permsRes.error) throw new Error(permsRes.error.message);

      const modulos = (modulosRes.data ?? []) as { id: number; nombre: string }[];
      const permsMap: Record<number, boolean> = {};
      (permsRes.data ?? []).forEach((p: { id_modulo: number; has_access: boolean }) => {
        permsMap[p.id_modulo] = p.has_access;
      });

      // Devuelve un RolePermission por cada módulo (aunque no exista fila de permiso)
      return modulos.map(m => ({
        idModulo: m.id,
        nombreModulo: m.nombre,
        hasAccess: permsMap[m.id] ?? false,
      }));
    } catch (e) {
      console.error('accesosService.getPermissionsByRol:', getErrorMessage(e));
      throw new Error('Error al cargar permisos: ' + getErrorMessage(e));
    }
  },

  async updatePermissions(request: UpdatePermissionsRequest): Promise<void> {
    try {
      const { idRol, permissions } = request;

      // Upsert de cada permiso usando la constraint UNIQUE (id_rol, id_modulo)
      const rows = permissions.map(p => ({
        id_rol: idRol,
        id_modulo: p.idModulo,
        has_access: p.hasAccess,
      }));

      const { error } = await supabase
        .from('role_module_permissions')
        .upsert(rows, { onConflict: 'id_rol,id_modulo' });

      if (error) throw new Error(error.message);
    } catch (e) {
      console.error('accesosService.updatePermissions:', getErrorMessage(e));
      throw new Error(getErrorMessage(e));
    }
  },

  // ========== RENIEC ==========
  // La consulta RENIEC requiere un servicio externo (no existe en Supabase).
  // Se mantiene el contrato del método pero lanza un error descriptivo para
  // que el equipo pueda conectar una Edge Function o un proxy cuando sea necesario.
  async consultarReniec(dni: string): Promise<{
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    direccion: string;
  }> {
    try {
      console.log('Consultando RENIEC para DNI:', dni);

      if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
        throw new Error('DNI debe tener exactamente 8 dígitos numéricos');
      }

      // TODO: invocar una Supabase Edge Function o un proxy externo para
      // consultar RENIEC. Ejemplo:
      //   const { data, error } = await supabase.functions.invoke('consulta-reniec', { body: { dni } });
      //   if (error) throw new Error(error.message);
      //   return data as { nombres: string; apellidoPaterno: string; apellidoMaterno: string; direccion: string };

      throw new Error(
        'La consulta RENIEC requiere una Supabase Edge Function. ' +
        'Configura la función "consulta-reniec" en el proyecto Supabase.',
      );
    } catch (e) {
      console.error('accesosService.consultarReniec:', {
        message: getErrorMessage(e),
        dni,
      });
      throw new Error(getErrorMessage(e));
    }
  },

  // ========== DEPENDENCIAS ==========

  async checkRolDependencies(
    id: number,
  ): Promise<{ usuariosAsociados: number; permisosAsociados: number }> {
    try {
      // Contar usuarios con este rol
      const { count: usuariosCount, error: errU } = await supabase
        .from('usuario')
        .select('id', { count: 'exact', head: true })
        .eq('id_rol', id);
      if (errU) throw new Error(errU.message);

      // Contar permisos asociados al rol
      const { count: permisosCount, error: errP } = await supabase
        .from('role_module_permissions')
        .select('id', { count: 'exact', head: true })
        .eq('id_rol', id);
      if (errP) throw new Error(errP.message);

      return {
        usuariosAsociados: usuariosCount ?? 0,
        permisosAsociados: permisosCount ?? 0,
      };
    } catch (e) {
      console.error('accesosService.checkRolDependencies:', getErrorMessage(e));
      throw new Error('Error al verificar dependencias: ' + getErrorMessage(e));
    }
  },
};
