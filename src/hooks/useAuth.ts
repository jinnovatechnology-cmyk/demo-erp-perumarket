// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import type { AuthData } from '../types/auth';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCached = () => {
      try {
        const raw = localStorage.getItem('auth');
        if (raw && mounted) setAuthData(JSON.parse(raw) as AuthData);
      } catch (e) {
        console.error('Error loading auth data:', e);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(Boolean(data.session));
      loadCached();
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setHasSession(Boolean(session));
      if (session) loadCached();
      else setAuthData(null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const hasModuleAccess = (moduleName: string): boolean => {
    if (!authData?.modules) return false;
    return authData.modules.some(
      (m) => m.nombre === '*' || m.nombre.toLowerCase() === moduleName.toLowerCase()
    );
  };

  const hasRouteAccess = (route: string): boolean => {
    if (!authData?.modules) return false;
    const map: { [k: string]: string } = {
      '/dashboard': 'Dashboard',
      '/accesos': 'Accesos',
      '/empleados': 'Empleados',
      '/clientes': 'Clientes',
      '/inventario': 'Inventario',
      '/ventas': 'Ventas',
      '/pedidos': 'Pedidos',
      '/compras': 'Compras',
      '/proveedores': 'Proveedores',
      '/envios': 'Envios',
      '/reportes': 'Reportes',
    };
    const name = map[route];
    return name ? hasModuleAccess(name) : false;
  };

  const getCurrentUser = () => authData?.user || null;

  const logout = async () => {
    await authService.logout();
    setAuthData(null);
    setHasSession(false);
  };

  return {
    authData,
    isLoading,
    hasModuleAccess,
    hasRouteAccess,
    getCurrentUser,
    logout,
    isAuthenticated: hasSession,
  };
};
