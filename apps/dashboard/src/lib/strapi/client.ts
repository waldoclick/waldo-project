import { StrapiError, StrapiConfig } from './types';
import { config } from '@/lib/config';

// Función para traducir mensajes de error comunes al español
function translateErrorMessage(message: string): string {
  if (!message) return '';

  const translations: Record<string, string> = {
    'Your new password must be different than your current password':
      'Tu nueva contraseña debe ser diferente a tu contraseña actual',
    'Invalid identifier or password': 'Identificador o contraseña inválidos',
    'Invalid credentials': 'Credenciales inválidas',
    'User not found': 'Usuario no encontrado',
    'Email already taken': 'El correo electrónico ya está en uso',
    'Username already taken': 'El nombre de usuario ya está en uso',
    'Password is too short': 'La contraseña es demasiado corta',
    'Passwords do not match': 'Las contraseñas no coinciden',
    'Current password is incorrect': 'La contraseña actual es incorrecta',
    'Password confirmation does not match':
      'La confirmación de contraseña no coincide',
  };

  // Buscar traducción exacta
  if (translations[message]) {
    return translations[message];
  }

  // Buscar traducción parcial (case insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(translations)) {
    if (key.toLowerCase() === lowerMessage) {
      return value;
    }
  }

  // Si no hay traducción, devolver el mensaje original
  return message;
}

// Configuración por defecto
const defaultConfig: StrapiConfig = {
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
};

class StrapiClient {
  private config: StrapiConfig;
  private token: string | null = null;

  constructor(config: Partial<StrapiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Establecer token de autenticación
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(config.authCookieName, token);
        // También guardar en cookie para el middleware
        document.cookie = `${config.authCookieName}=${token}; path=/; max-age=2592000; SameSite=Lax`; // 30 días
      } else {
        localStorage.removeItem(config.authCookieName);
        // Eliminar cookie
        document.cookie = `${config.authCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
    }
  }

  // Obtener token guardado
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      // Intentar obtener de localStorage primero, luego de cookies
      const localToken = localStorage.getItem(config.authCookieName);
      if (localToken) return localToken;

      // Leer de cookies
      const cookies = document.cookie.split(';');
      const strapiCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${config.authCookieName}=`)
      );
      if (strapiCookie) {
        return strapiCookie.split('=')[1];
      }
    }
    return this.token;
  }

  // Obtener token de cookies (para SSR)
  getTokenFromCookie(): string | null {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${config.authCookieName}=`)
      );
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    }
    return null;
  }

  // Función helper para hacer requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}/api${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Agregar Authorization si hay token
    // Excluir solo endpoints públicos de auth que no requieren autenticación
    const publicAuthEndpoints = [
      '/auth/local',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/local/register',
    ];
    const isPublicAuthEndpoint = publicAuthEndpoints.some((publicEndpoint) =>
      endpoint.includes(publicEndpoint)
    );

    if (token && !isPublicAuthEndpoint) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP! estado: ${response.status}`;
      let errorData: StrapiError | any = null;
      try {
        const jsonResponse = await response.json();
        errorData = jsonResponse;

        // Strapi puede devolver el error en diferentes estructuras:
        // 1. { error: { message: "...", status: 400, name: "..." } }
        // 2. { message: "...", status: 400, name: "..." }
        // 3. { data: null, error: { message: "...", status: 400 } }

        let rawMessage = '';
        if (jsonResponse.error) {
          rawMessage = jsonResponse.error.message || '';
        } else if (jsonResponse.message) {
          rawMessage = jsonResponse.message;
        } else if (jsonResponse.data?.error?.message) {
          rawMessage = jsonResponse.data.error.message;
        }

        // Traducir mensajes comunes de error al español
        errorMessage = translateErrorMessage(rawMessage) || errorMessage;
      } catch {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      if (errorData) {
        (error as any).errorData = errorData;
      }
      throw error;
    }

    return response.json();
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instancia singleton del cliente
export const strapiClient = new StrapiClient();

// Función para inicializar el cliente con configuración personalizada
export const initStrapiClient = (config: Partial<StrapiConfig>) => {
  return new StrapiClient(config);
};
