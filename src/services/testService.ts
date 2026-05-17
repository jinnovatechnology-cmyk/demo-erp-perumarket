// testService.ts — verifica la conexión con Supabase
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface TestResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export const testService = {
  /** Verifica que las credenciales/cliente de Supabase respondan. */
  async testBackendConnection(): Promise<TestResult> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        message: "❌ Falta configurar VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env",
      };
    }
    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, message: "✅ SUPABASE CONECTADO (Auth responde)" };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, message: `❌ ERROR SUPABASE: ${msg}`, data: error };
    }
  },

  /** Verifica acceso a la base de datos (lectura de una tabla del esquema). */
  async testDatabaseConnection(): Promise<TestResult> {
    try {
      const { error, count } = await supabase
        .from("modulo")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return {
        success: true,
        message: `✅ BASE DE DATOS CONECTADA (tabla 'modulo' accesible, filas: ${count ?? 0})`,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message:
          `❌ ERROR BASE DE DATOS: ${msg}. ` +
          "¿Ejecutaste supabase/schema.sql y seed.sql, y revisaste las políticas RLS?",
        data: error,
      };
    }
  },

  async testFullConnection(): Promise<{
    backend: TestResult;
    database: TestResult;
    summary: string;
  }> {
    const [backendResult, databaseResult] = await Promise.all([
      this.testBackendConnection(),
      this.testDatabaseConnection(),
    ]);

    const allSuccess = backendResult.success && databaseResult.success;

    return {
      backend: backendResult,
      database: databaseResult,
      summary: `
🌐 ESTADO DE CONEXIONES (Supabase):

${backendResult.message}
${databaseResult.message}

🎯 CONCLUSIÓN: ${allSuccess ? "TODO CONECTADO CORRECTAMENTE" : "HAY ERRORES EN LA CONEXIÓN"}
      `.trim(),
    };
  },
};
