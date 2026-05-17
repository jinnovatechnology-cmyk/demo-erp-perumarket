import { supabase } from '../../lib/supabase';
import type { ProveedorData } from '../../types/proveedor/proveedorType';

// ── Utilidad de error ────────────────────────────────────────────────────────

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as Record<string, unknown>)['message'] === 'string'
  ) {
    return (e as Record<string, unknown>)['message'] as string;
  }
  return 'Error desconocido.';
}

// ── Servicio ─────────────────────────────────────────────────────────────────

export const ProveedorService = {
  getAll: async (query: string = ''): Promise<ProveedorData[]> => {
    try {
      let req = supabase
        .from('proveedor')
        .select('id, ruc, razon_social, contacto, telefono, correo, direccion, estado')
        .order('id', { ascending: true });

      if (query) {
        req = req.or(
          `razon_social.ilike.%${query}%,ruc.ilike.%${query}%`
        );
      }

      const { data, error } = await req;

      if (error) throw new Error(error.message);

      return (data ?? []) as ProveedorData[];
    } catch (e) {
      console.error('❌ Error fetching proveedores:', e);
      throw new Error(getErrorMessage(e));
    }
  },

  create: async (data: ProveedorData): Promise<ProveedorData> => {
    try {
      const { id: _id, ...payload } = data;

      const { data: row, error } = await supabase
        .from('proveedor')
        .insert(payload)
        .select('id, ruc, razon_social, contacto, telefono, correo, direccion, estado')
        .single();

      if (error) throw new Error(error.message);

      return row as ProveedorData;
    } catch (e) {
      console.error('❌ Error creating proveedor:', e);
      throw new Error(getErrorMessage(e));
    }
  },

  update: async (id: number, data: ProveedorData): Promise<ProveedorData> => {
    try {
      const { id: _id, ...payload } = data;

      const { data: row, error } = await supabase
        .from('proveedor')
        .update(payload)
        .eq('id', id)
        .select('id, ruc, razon_social, contacto, telefono, correo, direccion, estado')
        .single();

      if (error) throw new Error(error.message);

      return row as ProveedorData;
    } catch (e) {
      console.error('❌ Error updating proveedor:', e);
      throw new Error(getErrorMessage(e));
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('proveedor')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
    } catch (e) {
      console.error('❌ Error deleting proveedor:', e);
      throw new Error(getErrorMessage(e));
    }
  },
};
