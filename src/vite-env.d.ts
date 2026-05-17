/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del proyecto Supabase (ej: https://xxxx.supabase.co) */
  readonly VITE_SUPABASE_URL: string;
  /** Clave pública (anon) del proyecto Supabase */
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
