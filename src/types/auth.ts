// src/types/auth.ts

export interface Module {
  id: number | string;
  nombre: string;
  descripcion: string;
  ruta: string;
}

export interface UserInfo {
  /** id de la fila public.usuario */
  id: number | string;
  username: string;
  nombres: string;
  apellidos: string;
  rol: string;
  email: string;
  almacenId?: number;
}

export interface AuthData {
  success: boolean;
  message: string;
  /** access_token de la sesión Supabase */
  token: string;
  user: UserInfo;
  modules: Module[];
}

/** Supabase Auth usa email + password */
export interface LoginRequest {
  email: string;
  password: string;
}
