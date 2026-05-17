// src/services/api.ts
// ─────────────────────────────────────────────────────────────────────────
// CAPA DE ACCESO A DATOS — SUPABASE
//
// Todos los servicios deben conectarse a Supabase desde aquí:
//
//   import { supabase, db } from "../api";
//   const { data, error } = await db("cliente").select("*");
//
// `api` (axios) se conserva solo para servicios aún no migrados; cuando
// ninguno lo use, este bloque y la dependencia `axios` se pueden eliminar.
// ─────────────────────────────────────────────────────────────────────────
import axios from "axios";
import { supabase } from "../lib/supabase";

export { supabase };

/** Atajo a una tabla/vista de Supabase */
export const db = (table: string) => supabase.from(table);

/** Lanza el error de Supabase como Error legible */
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

// ── Legacy axios (pendiente de migrar) ───────────────────────────────────
export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem("auth");
      if (authData) {
        const { token } = JSON.parse(authData);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      /* ignore */
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      if (url.includes("/auth/") || error.response?.data?.message?.includes("token")) {
        localStorage.removeItem("auth");
        localStorage.removeItem("logged");
        localStorage.removeItem("usuarioId");
        localStorage.removeItem("almacenId");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
