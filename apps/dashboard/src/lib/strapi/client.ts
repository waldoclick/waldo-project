import { StrapiError, StrapiConfig } from './types';
import { config } from '@/lib/config';

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

    // Solo agregar Authorization si hay token Y no es un endpoint de auth
    if (token && !endpoint.includes('/auth/')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: StrapiError = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
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
