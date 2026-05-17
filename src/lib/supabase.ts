// src/lib/supabase.ts
// Cliente central de Supabase. Toda la app debe importar `supabase` desde aquí.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // No rompemos la app: solo avisamos. El login fallará con un mensaje claro
  // hasta que se configuren las credenciales en el archivo .env
  console.warn(
    "[Supabase] Falta configurar VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY en el archivo .env. " +
      "Copia .env.example a .env y coloca las credenciales de tu proyecto Supabase."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "perumarket-erp-auth",
    },
  }
);

/** true si las credenciales de Supabase están presentes en el .env */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
