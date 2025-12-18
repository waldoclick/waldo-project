import { useUserStore } from '@/stores/users';
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
} from '@/lib/strapi';
import { LoginCredentials } from '@/lib/strapi';
import { config } from '@/lib/config';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    setLoading,
    logout: logoutStore,
  } = useUserStore();

  const login = async (
    credentials: LoginCredentials & { recaptchaToken?: string }
  ) => {
    try {
      setLoading(true);
      const response = await loginApi(credentials);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const checkAuth = async () => {
    // Verificar token del store
    if (!token) {
      console.log('checkAuth - No token in store');
      return false;
    }

    // También verificar token en cookies como respaldo
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const strapiCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${config.authCookieName}=`)
      );
      const hasTokenInCookie = !!strapiCookie;

      console.log('checkAuth - Token in store:', !!token);
      console.log('checkAuth - Token in cookie:', hasTokenInCookie);

      if (!hasTokenInCookie) {
        console.log('checkAuth - No token in cookie, clearing store');
        logoutStore();
        return false;
      }
    }

    try {
      const user = await getCurrentUser();
      console.log('checkAuth - getCurrentUser result:', !!user);
      return !!user;
    } catch (error) {
      console.error('checkAuth - Error getting current user:', error);
      logoutStore();
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };
};
