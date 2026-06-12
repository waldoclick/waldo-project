export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, password } = body;

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Usuario y contraseña son requeridos",
      });
    }

    const config = useRuntimeConfig();
    const devUsername = config.devUsername;
    const devPassword = config.devPassword;

    if (username === devUsername && password === devPassword) {
      const sessionToken = generateSessionToken();

      setCookie(event, "devmode", sessionToken, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

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
  } catch (error: unknown) {
    if ((error as Record<string, unknown>).statusCode) {
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
