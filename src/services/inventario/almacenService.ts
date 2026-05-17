// almacenService.ts
import type { AlmacenFormData } from '../../types/inventario/almacen';
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
// Service
// ---------------------------------------------------------------------------

export const almacenService = {
  /**
   * Crea un nuevo almacén.
   * Lanza un objeto `{ status, message, errors? }` compatible con
   * el handler de errores en `useAlmacenForm`.
   */
  create: async (data: AlmacenFormData): Promise<void> => {
    try {
      const { error } = await supabase.from('almacen').insert({
        nombre: data.nombre,
        codigo: data.codigo,
        direccion: data.direccion,
        capacidad_m3: data.capacidadM3,
        responsable: data.responsable,
        estado: 'ACTIVO',
      });

      if (error) {
        console.error('[almacenService.create]', error.message);
        throw {
          status: 400,
          message: error.message,
        };
      }
    } catch (err: unknown) {
      // Re-lanzamos sin envolver doble si ya tiene la forma esperada
      if (typeof err === 'object' && err !== null && 'status' in err) {
        throw err;
      }
      throw {
        status: 500,
        message: getErrorMessage(err),
      };
    }
  },
};
