// /src/extensions/users-permissions/controllers/authController.ts
import crypto from "crypto";
import { sendMjmlEmail } from "../../../services/mjml";

/**
 * Creates user reservations and featured reservations after user registration.
 *
 * @param {Object} user - The user object.
 * @returns {Object|Error} The user object if successful, or an error object if there was an issue.
 */
const createUserReservations = async (user) => {
  // Ensure the user was created successfully
  if (user && user.id) {
    try {
      // Check if the user already has reservations with price = 0
      const existingReservations = await strapi.db
        .query("api::ad-reservation.ad-reservation")
        .findMany({
          where: {
            user: user.id,
            price: 0,
          },
        });

      // If the user already has reservations with price = 0, return early
      if (existingReservations.length > 0) {
        return { message: "User already has free reservations" };
      }

      // Create three records in the "ad-reservation" collection
      for (let i = 0; i < 3; i++) {
        await strapi.db.query("api::ad-reservation.ad-reservation").create({
          data: {
            user: user.id,
            price: 0,
            total_days: 15,
            observation: `Reservation created automatically after user registration`,
          },
        });
      }

      // Create three records in the "ad-featured-reservation" collection
      for (let i = 0; i < 3; i++) {
        await strapi.db
          .query("api::ad-featured-reservation.ad-featured-reservation")
          .create({
            data: {
              user: user.id,
              price: 0,
              observation: `Reservation created automatically after user registration`,
            },
          });
      }

      // Return the user data
      return user;
    } catch (error) {
      // Handle errors that occur during the creation of additional records
      return { error: "Error creating ad reservations", details: error };
    }
  } else {
    // Handle the case where the user could not be retrieved
    return { error: "Could not retrieve the registered user" };
  }
};

/**
 * Registers a new user and creates additional records in the "ad-reservation" and "ad-featured-reservation" collections.
 *
 * @param {Function} registerController - The original register controller function.
 * @returns {Function} A new controller function that registers the user and creates additional records.
 */
export const registerUserLocal = (registerController) => async (ctx) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const {
      is_company,
      firstname,
      lastname,
      email,
      rut,
      password,
      confirm_password,
      username,
    } = ctx.request.body;

    // Validar que todos los campos requeridos estén presentes
    if (
      is_company === undefined ||
      !firstname ||
      !lastname ||
      !email ||
      !rut ||
      !password ||
      !confirm_password ||
      !username
    ) {
      return ctx.badRequest("All fields are required");
    }

    // Validar que las contraseñas coincidan
    if (password !== confirm_password) {
      return ctx.badRequest("Passwords do not match");
    }

    // Crear el objeto de datos del usuario sin `confirm_password`
    const userData = {
      is_company,
      firstname,
      lastname,
      rut,
      email,
      password,
      username,
    };

    // Reemplazar el cuerpo de la solicitud con los datos del usuario
    ctx.request.body = userData;

    // Llamar al controlador original para registrar al usuario
    await registerController(ctx);

    // Obtener el usuario recién creado de `ctx.response.body?.user` o `ctx.state.user`
    const user = ctx.response.body?.user || ctx.state.user;

    // Crear reservas de usuario
    createUserReservations(user);

    // Devolver la respuesta original
    return ctx.response;
  } catch (error) {
    ctx.badRequest("Error during registration:", { error });
  }
};

/**
 * Handles OAuth user registration and creates additional records in the "ad-reservation" and "ad-featured-reservation" collections.
 *
 * @param {Function} callbackController - The original callback controller function for OAuth.
 * @returns {Function} A new controller function that handles OAuth registration and creates additional records.
 */
export const registerUserAuth = (callbackController) => async (ctx) => {
  try {
    // Call the original callback controller for OAuth
    await callbackController(ctx);

    // Get the authenticated user from `ctx.response.body?.user` or `ctx.state.user`
    const user = ctx.response.body?.user || ctx.state.user;

    createUserReservations(user);
  } catch (error) {
    ctx.badRequest("Error during OAuth callback:", { error });
  }

  // Return the original response
  return ctx.response;
};

// ─── 2-Step Login controllers ───────────────────────────────────────────────

const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const VC_UID = "api::verification-code.verification-code";

/** Generates a 6-digit numeric code as a string */
const generateCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Wraps the original auth.local (callback) controller with 2-step verification.
 * Valid credentials → returns { pendingToken, email } instead of JWT.
 * Invalid credentials → passes through the original error unchanged.
 */
export const overrideAuthLocal = (originalController) => async (ctx) => {
  // Call the original controller first
  await originalController(ctx);

  // If the response has no jwt, credentials were invalid — pass through unchanged
  const jwt = ctx.response.body?.jwt;
  if (!jwt) return;

  // Credentials valid — intercept the response
  const userId: number = ctx.response.body.user.id;
  const email: string = ctx.response.body.user.email;
  const name: string =
    ctx.response.body.user.firstname ||
    ctx.response.body.user.username ||
    email;

  const code = generateCode();
  const pendingToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS).toISOString();

  // Delete any existing pending record for this user before creating a new one
  const existing = await strapi.db.query(VC_UID).findOne({ where: { userId } });
  if (existing) {
    await strapi.db.query(VC_UID).delete({ where: { id: existing.id } });
  }

  await strapi.db.query(VC_UID).create({
    data: { userId, code, expiresAt, attempts: 0, pendingToken },
  });

  // Send email — non-fatal
  try {
    await sendMjmlEmail(
      strapi,
      "verification-code",
      email,
      "Tu código de verificación",
      { name, code }
    );
  } catch (_) {
    // Non-fatal — user can use resend-code endpoint
  }

  // Replace response — no JWT exposed
  ctx.body = { pendingToken, email };
};

/**
 * Validates a pending verification code.
 * Correct code → issues JWT and returns full Strapi login response { jwt, user }.
 * Wrong code → increments attempts; max 3 failures deletes the record.
 * Expired code → deletes record and returns 401.
 */
export const verifyCode = async (ctx) => {
  const { pendingToken, code } = ctx.request.body as {
    pendingToken?: string;
    code?: string;
  };

  const normalizedCode = (code ?? "").toString().trim();

  if (!pendingToken || !normalizedCode) {
    return ctx.badRequest("pendingToken and code are required");
  }

  const record = await strapi.db
    .query(VC_UID)
    .findOne({ where: { pendingToken } });

  if (!record) {
    return ctx.badRequest("Invalid or expired token");
  }

  // Check expiry
  if (new Date(record.expiresAt) < new Date()) {
    await strapi.db.query(VC_UID).delete({ where: { id: record.id } });
    return ctx.unauthorized("Verification code has expired");
  }

  // Check wrong code (normalize both sides — DB may have stored with trim)
  if (record.code.trim() !== normalizedCode) {
    const newAttempts = record.attempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      await strapi.db.query(VC_UID).delete({ where: { id: record.id } });
      return ctx.unauthorized("Maximum attempts reached — please login again");
    }
    await strapi.db.query(VC_UID).update({
      where: { id: record.id },
      data: { attempts: newAttempts },
    });
    return ctx.unauthorized("Invalid code");
  }

  // Code is correct — issue JWT via Strapi's jwt service
  const user = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({ where: { id: record.userId } });

  if (!user) {
    await strapi.db.query(VC_UID).delete({ where: { id: record.id } });
    return ctx.internalServerError("User not found");
  }

  // Clean up the used verification record
  await strapi.db.query(VC_UID).delete({ where: { id: record.id } });

  // Issue JWT using the same method as the original auth.local controller
  const jwtToken = strapi.plugins["users-permissions"].services.jwt.issue({
    id: user.id,
  });

  // Sanitize user to match Strapi's normal login response shape
  const sanitizedUser = await strapi.plugins[
    "users-permissions"
  ].services.user.sanitizeOutput(user, ctx);

  ctx.body = { jwt: jwtToken, user: sanitizedUser };
};

/**
 * Resends a verification code for an existing pending token.
 * Rate-limited: rejects if called within 60 seconds of last send.
 * After cooldown: regenerates code + expiresAt, resets attempts, resends email.
 */
export const resendCode = async (ctx) => {
  const { pendingToken } = ctx.request.body as { pendingToken?: string };

  if (!pendingToken) {
    return ctx.badRequest("pendingToken is required");
  }

  const record = await strapi.db
    .query(VC_UID)
    .findOne({ where: { pendingToken } });

  if (!record) {
    return ctx.badRequest("Invalid or expired token");
  }

  // Rate limit: reject if last update was less than 60 seconds ago
  const lastUpdate = new Date(record.updatedAt).getTime();
  if (Date.now() - lastUpdate < RESEND_COOLDOWN_MS) {
    ctx.status = 429;
    ctx.body = {
      error: {
        status: 429,
        name: "TooManyRequests",
        message: "Please wait before requesting a new code",
      },
    };
    return;
  }

  const newCode = generateCode();
  const newExpiresAt = new Date(Date.now() + CODE_EXPIRY_MS).toISOString();

  await strapi.db.query(VC_UID).update({
    where: { id: record.id },
    data: { code: newCode, expiresAt: newExpiresAt, attempts: 0 },
  });

  // Fetch user for email
  const user = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({ where: { id: record.userId } });

  const email = user?.email;
  const name = user?.firstname || user?.username || email;

  // Send email — non-fatal
  try {
    await sendMjmlEmail(
      strapi,
      "verification-code",
      email,
      "Tu código de verificación",
      { name, code: newCode }
    );
  } catch (_) {
    // Non-fatal
  }

  ctx.body = { ok: true };
};
