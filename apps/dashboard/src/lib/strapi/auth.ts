import { strapiClient } from './client';
import {
  StrapiAuthResponse,
  LoginCredentials,
  ForgotPasswordData,
  ResetPasswordData,
  StrapiUser,
} from './types';
import { useUserStore } from '@/stores/users';
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

    console.log('clearAllAuthData - All data sources cleared');
    console.log('clearAllAuthData - Current cookies:', document.cookie);
  }
}

// Login
export async function login(
  credentials: LoginCredentials
): Promise<StrapiAuthResponse> {
  try {
    const response = await strapiClient.post<StrapiAuthResponse>(
      '/auth/local',
      credentials as unknown as Record<string, unknown>
    );

    // Configurar el token en el cliente ANTES de hacer cualquier otra llamada
    strapiClient.setToken(response.jwt);

    // Ahora obtener usuario completo con role incluido
    const userWithRole = await getCurrentUser();

    // Guardar en store y localStorage
    const { login: loginStore } = useUserStore.getState();
    loginStore(userWithRole, response.jwt);

    // Retornar respuesta con usuario completo
    return {
      jwt: response.jwt,
      user: userWithRole,
    };
  } catch (error: unknown) {
    // Extraer el mensaje de error de Strapi
    const errorMessage =
      error instanceof Error ? error.message : 'Credenciales inválidas';
    throw new Error(errorMessage);
  }
}

// Logout
export async function logout(): Promise<void> {
  // Strapi no tiene endpoint de logout por defecto, solo limpiar datos localmente
  // Limpiar store y localStorage
  const { logout: logoutStore } = useUserStore.getState();
  logoutStore();

  // También limpiar en cliente para compatibilidad
  strapiClient.setToken(null);

  // Limpiar manualmente todas las fuentes de datos
  clearAllAuthData();
}

// Obtener usuario actual
export async function getCurrentUser(): Promise<StrapiUser> {
  try {
    // Incluir el role en la consulta usando populate
    const response = await strapiClient.get<StrapiUser>(
      '/users/me?populate=role'
    );
    return response;
  } catch {
    throw new Error('No se pudo obtener el usuario actual');
  }
}

// Verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  const { isAuthenticated } = useUserStore.getState();
  return isAuthenticated;
}

// Verificar si el usuario tiene rol de manager
export function isModerator(user: StrapiUser): boolean {
  console.log('isModerator - User data:', user);
  console.log('isModerator - User role:', user.role);

  // Verificar si el role existe
  if (!user.role) {
    console.log('isModerator - No role found');
    return false;
  }

  // Verificar solo por type (case insensitive)
  const roleType = user.role.type?.toLowerCase();
  const validType = 'manager';

  console.log('isModerator - Role type:', roleType);
  console.log('isModerator - Valid type:', validType);

  const isValid = roleType === validType;
  console.log('isModerator - Is valid:', isValid);

  return isValid;
}

// Forgot password
export async function forgotPassword(data: ForgotPasswordData): Promise<void> {
  try {
    await strapiClient.post(
      '/auth/forgot-password',
      data as unknown as Record<string, unknown>
    );
  } catch {
    throw new Error('No se pudo enviar el email de recuperación');
  }
}

// Reset password
export async function resetPassword(data: ResetPasswordData): Promise<void> {
  try {
    await strapiClient.post(
      '/auth/reset-password',
      data as unknown as Record<string, unknown>
    );
  } catch {
    throw new Error('No se pudo restablecer la contraseña');
  }
}

// Cambiar contraseña (requiere autenticación)
export async function changePassword(data: {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}): Promise<void> {
  try {
    await strapiClient.post(
      '/auth/change-password',
      data as unknown as Record<string, unknown>
    );
  } catch (error) {
    // Preservar el mensaje de error original si está disponible
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo cambiar la contraseña');
  }
}

// Verificar token válido
export async function verifyToken(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
