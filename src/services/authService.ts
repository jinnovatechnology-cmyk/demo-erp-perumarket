// src/services/authService.ts
// Autenticación con Supabase Auth + perfil real (usuario/persona/rol/modulo).
import { supabase } from "../lib/supabase";
import type { AuthData, LoginRequest, Module, UserInfo } from "../types/auth";

export type { AuthData, LoginRequest, UserInfo };
export type ModuleInfo = Module;

const WILDCARD_MODULE: Module = {
  id: "*",
  nombre: "*",
  descripcion: "Acceso total (usuario sin perfil vinculado aún)",
  ruta: "*",
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthData> {
    const creds = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    };

    const signIn = await supabase.auth.signInWithPassword(creds);
    let session = signIn.data.session;
    let authUser = signIn.data.user;
    let error = signIn.error;

    // Primer ingreso: si la cuenta aún no existe en Supabase Auth, se crea
    // automáticamente (auto-registro) y se inicia sesión.
    if (error && /invalid login credentials/i.test(error.message)) {
      const signUp = await supabase.auth.signUp(creds);
      if (signUp.error) {
        if (/already registered|already exists/i.test(signUp.error.message)) {
          throw new Error("Contraseña incorrecta para ese correo.");
        }
        throw new Error(signUp.error.message);
      }
      if (!signUp.data.session) {
        throw new Error(
          'Cuenta creada, pero tu proyecto Supabase exige confirmar el email. ' +
            'En Supabase → Authentication → Sign In / Providers → Email, ' +
            'desactiva "Confirm email" y vuelve a iniciar sesión.'
        );
      }
      session = signUp.data.session;
      authUser = signUp.data.user;
      error = null;
    }

    if (error) {
      throw new Error(
        /email not confirmed/i.test(error.message)
          ? 'Email sin confirmar. En Supabase → Authentication desactiva "Confirm email" (o confirma el usuario) y reintenta.'
          : /invalid login credentials/i.test(error.message)
            ? "Credenciales incorrectas"
            : error.message
      );
    }
    if (!session || !authUser) {
      throw new Error("No se pudo iniciar sesión");
    }
    let user: UserInfo = {
      id: authUser.id,
      username: authUser.email?.split("@")[0] ?? "",
      nombres: "",
      apellidos: "",
      rol: "usuario",
      email: authUser.email ?? credentials.email,
      almacenId: 1,
    };
    let modules: Module[] = [WILDCARD_MODULE];

    try {
      // Perfil real: usuario -> persona -> rol
      const { data: u } = await supabase
        .from("usuario")
        .select(
          "id, username, estado, id_rol, " +
            "persona:persona(nombres, apellido_paterno, apellido_materno, correo), " +
            "rol:rol(id, nombre)"
        )
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      if (u) {
        const persona = (u as Record<string, any>).persona ?? {};
        const rol = (u as Record<string, any>).rol ?? {};
        user = {
          id: (u as Record<string, any>).id,
          username: (u as Record<string, any>).username ?? user.username,
          nombres: persona.nombres ?? "",
          apellidos: `${persona.apellido_paterno ?? ""} ${persona.apellido_materno ?? ""}`.trim(),
          rol: rol.nombre ?? "usuario",
          email: persona.correo ?? user.email,
          almacenId: 1,
        };

        // Módulos según permisos del rol
        const { data: perms } = await supabase
          .from("role_module_permissions")
          .select("has_access, modulo:modulo(id, nombre, descripcion, ruta)")
          .eq("id_rol", (u as Record<string, any>).id_rol)
          .eq("has_access", true);

        if (perms && perms.length > 0) {
          modules = perms
            .map((p) => (p as Record<string, any>).modulo)
            .filter(Boolean) as Module[];
        }
      } else {
        console.warn(
          "[Auth] El usuario autenticado no está vinculado a public.usuario " +
            "(usuario.auth_user_id). Acceso total temporal. Ver README."
        );
      }
    } catch (e) {
      console.warn("[Auth] No se pudo cargar el perfil/módulos:", e);
    }

    const authData: AuthData = {
      success: true,
      message: "Login correcto",
      token: session.access_token,
      user,
      modules,
    };
    this.storeAuthData(authData);
    return authData;
  },

  storeAuthData(d: AuthData) {
    try {
      localStorage.setItem("auth", JSON.stringify(d));
      localStorage.setItem("logged", "true");
      localStorage.setItem("username", d.user.username);
      localStorage.setItem("userRole", d.user.rol);
      localStorage.setItem("usuarioId", String(d.user.id));
      localStorage.setItem("almacenId", String(d.user.almacenId ?? 1));
    } catch (e) {
      console.error("Error guardando auth:", e);
    }
  },

  getAuthData(): AuthData | null {
    try {
      const raw = localStorage.getItem("auth");
      return raw ? (JSON.parse(raw) as AuthData) : null;
    } catch {
      return null;
    }
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } finally {
      ["auth", "logged", "username", "userRole", "usuarioId", "almacenId"].forEach(
        (k) => localStorage.removeItem(k)
      );
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
  },

  getCurrentUser(): UserInfo | null {
    return this.getAuthData()?.user ?? null;
  },

  getUserModules(): Module[] {
    return this.getAuthData()?.modules ?? [];
  },
};
