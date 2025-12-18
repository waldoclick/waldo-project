// Configuración de la aplicación
export const config = {
  // Nombre de la cookie de autenticación
  authCookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'strapi_token',

  // Otras configuraciones pueden ir aquí
} as const;
