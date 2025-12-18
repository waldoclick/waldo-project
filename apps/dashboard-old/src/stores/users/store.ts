import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState } from './types';
import { StrapiUser } from '@/lib/strapi';
import { config } from '@/lib/config';

// Función helper para limpiar completamente todos los datos de autenticación
function clearAllAuthData() {
  if (typeof window !== 'undefined') {
    // Limpiar localStorage
    localStorage.removeItem(config.authCookieName);
    localStorage.removeItem('user-storage');

    // Limpiar cookies de múltiples formas para asegurar
    // Método 1: Con path y expires
    document.cookie = `${config.authCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `${config.authCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${config.authCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Método 2: Con max-age=0
    document.cookie = `${config.authCookieName}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${config.authCookieName}=; max-age=0`;

    // Método 3: Con domain específico si es necesario
    document.cookie = `${config.authCookieName}=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Método 4: Sin path para asegurar
    document.cookie = `${config.authCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    console.log('Store clearAllAuthData - All data sources cleared');
    console.log('Store clearAllAuthData - Current cookies:', document.cookie);
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Acciones
      setUser: (user: StrapiUser | null) => {
        set({ user });
      },

      setToken: (token: string | null) => {
        set({ token, isAuthenticated: !!token });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      login: (user: StrapiUser, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // También guardar en cookie para el middleware
        if (typeof window !== 'undefined') {
          // Asegurar que la cookie se guarde correctamente
          const cookieValue = `${config.authCookieName}=${token}; path=/; max-age=2592000; SameSite=Lax; Secure=false`;
          document.cookie = cookieValue;
          console.log('Login - Cookie set:', cookieValue);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Usar la función helper para limpiar todo
        clearAllAuthData();
      },

      clearUser: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'user-storage', // nombre para localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
