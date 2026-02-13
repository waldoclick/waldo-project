export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, password } = body;

    // Validar que se proporcionen las credenciales
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Usuario y contraseña son requeridos",
      });
    }

    // Obtener credenciales del servidor (variables de entorno)
    const config = useRuntimeConfig();
    const devUsername = config.devUsername;
    const devPassword = config.devPassword;

    // Verificar credenciales
    if (username === devUsername && password === devPassword) {
      // Generar un token de sesión seguro
      const sessionToken = generateSessionToken();
      console.log("🍪 Estableciendo cookie devmode:", sessionToken);

      // ✅ SEGURO: Establecer cookie desde el servidor
      setCookie(event, "devmode", sessionToken, {
        maxAge: 60 * 60 * 24 * 7, // 7 días
        httpOnly: false, // ❌ NECESARIO: Permitir acceso desde JavaScript
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      console.log("✅ Cookie establecida correctamente");

      // Devolver respuesta exitosa (sin el token por seguridad)
      return {
        success: true,
        message: "Autenticación exitosa",
      };
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: "Credenciales incorrectas",
      });
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Error interno del servidor",
    });
  }
});

// Función para generar un token de sesión seguro
function generateSessionToken(): string {
  return crypto.randomUUID();
}
