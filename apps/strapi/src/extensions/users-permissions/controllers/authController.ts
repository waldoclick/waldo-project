// /src/extensions/users-permissions/controllers/authController.ts
import crypto from "crypto";
import { sendMjmlEmail } from "../../../services/mjml";

/**
 * Creates user reservations and featured reservations after user registration.
 *
 * @param {Object} user - The user object.
 * @returns {Object|Error} The user object if successful, or an error object if there was an issue.
 */
export const createUserReservations = async (user) => {
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
 * @param {(...args: unknown[]) => Promise<unknown>} registerController - The original register controller function.
 * @returns {(...args: unknown[]) => Promise<unknown>} A new controller function that registers the user and creates additional records.
 */
export const registerUserLocal = (registerController) => async (ctx) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    // Note: confirm_password is validated and deleted by FormRegister.vue before submission
    const {
      is_company,
      firstname,
      lastname,
      email,
      rut,
      password,
      username,
      accepted_age_confirmation,
      accepted_terms,
    } = ctx.request.body;

    // Validar que todos los campos requeridos estén presentes
    if (
      is_company === undefined ||
      !firstname ||
      !lastname ||
      !email ||
      !rut ||
      !password ||
      !username ||
      accepted_age_confirmation !== true ||
      accepted_terms !== true
    ) {
      return ctx.badRequest("All fields are required");
    }

    // Crear el objeto de datos del usuario
    const userData = {
      is_company,
      firstname,
      lastname,
      rut,
      email,
      password,
      username,
      accepted_age_confirmation,
      accepted_terms,
    };

    // Reemplazar el cuerpo de la solicitud con los datos del usuario
    ctx.request.body = userData;

    // Llamar al controlador original para registrar al usuario
    await registerController(ctx);

    // Obtener el usuario recién creado de `ctx.response.body?.user` o `ctx.state.user`
    const user = ctx.response.body?.user || ctx.state.user;

    // Crear reservas de usuario
    createUserReservations(user);

    // If email confirmation is enabled, Strapi sends its built-in template.
    // Also send our branded MJML template (Admin Panel template must be cleared to avoid duplicate).
    if (!ctx.response.body?.jwt && user?.id) {
      try {
        const userWithToken = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: user.id },
            select: ["confirmationToken", "email", "username", "firstname"],
          });

        if (userWithToken?.confirmationToken) {
          const confirmationUrl = `${
            process.env.APP_URL || "http://localhost:1337"
          }/api/auth/email-confirmation?confirmation=${
            userWithToken.confirmationToken
          }`;
          const name =
            userWithToken.firstname ||
            userWithToken.username ||
            userWithToken.email;

          await sendMjmlEmail(
            strapi,
            "email-confirmation",
            userWithToken.email,
            "Confirma tu correo electrónico",
            { name, confirmationUrl }
          );
        }
      } catch (err) {
        // Non-fatal — Strapi's built-in already sent a confirmation email
        strapi.log.error(
          `[registerUserLocal] Failed to send MJML confirmation email: ${
            err?.message ?? err
          }`
        );
      }
    }

    // Devolver la respuesta original
    return ctx.response;
  } catch (error) {
    ctx.badRequest("Error during registration:", { error });
  }
};

/**
 * Handles OAuth user registration and creates additional records in the "ad-reservation" and "ad-featured-reservation" collections.
 *
 * @param {(...args: unknown[]) => Promise<unknown>} callbackController - The original callback controller function for OAuth.
 * @returns {(...args: unknown[]) => Promise<unknown>} A new controller function that handles OAuth registration and creates additional records.
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

const CODE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
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
  // OAuth callbacks use GET /api/auth/:provider/callback — skip 2-step for those
  if (ctx.method === "GET") {
    return originalController(ctx);
  }

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

  // Sanitize user using Strapi v5's contentAPI sanitizer (same as auth.local callback)
  const userSchema = strapi.getModel("plugin::users-permissions.user");
  const sanitizedUser = await strapi.contentAPI.sanitize.output(
    user,
    userSchema,
    { auth: ctx.state.auth }
  );

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

// ─── Password Reset Override ─────────────────────────────────────────────────

/**
 * Full replacement for Strapi's built-in forgotPassword controller.
 * Sends a branded MJML email with a context-aware reset URL.
 * IMPORTANT: Do NOT call the original forgotPassword — it also sends an email,
 * which would result in two emails per request.
 *
 * @see .planning/phases/080-password-reset-mjml-context-routing/080-RESEARCH.md
 */
export const overrideForgotPassword = () => async (ctx) => {
  const { email, context } = ctx.request.body as {
    email?: string;
    context?: "website" | "dashboard";
  };

  if (!email) return ctx.badRequest("Email is required");

  const user = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({ where: { email: email.toLowerCase() } });

  // Silent success for unknown/blocked users (matches built-in behavior)
  if (!user || user.blocked) return ctx.send({ ok: true });

  const resetPasswordToken = crypto.randomBytes(64).toString("hex");

  // Save token before sending email (matches built-in ordering)
  await strapi.db.query("plugin::users-permissions.user").update({
    where: { id: user.id },
    data: { resetPasswordToken },
  });

  const baseUrl =
    context === "dashboard"
      ? process.env.DASHBOARD_URL || "https://dashboard.waldo.click"
      : process.env.FRONTEND_URL || "https://waldo.click";

  const resetPath =
    context === "dashboard" ? "auth/reset-password" : "restablecer-contrasena";

  const resetUrl = `${baseUrl}/${resetPath}?token=${resetPasswordToken}`;

  try {
    await sendMjmlEmail(
      strapi,
      "reset-password",
      user.email,
      "Restablece tu contraseña",
      { name: user.firstname || user.username || user.email, resetUrl }
    );
  } catch (err) {
    strapi.log.error(
      `[overrideForgotPassword] Failed to send reset-password email to ${
        user.email
      }: ${err?.message ?? err}`
    );
  }

  ctx.send({ ok: true });
};

// ─── Email Confirmation Override ─────────────────────────────────────────────

/**
 * Full replacement for Strapi's built-in sendEmailConfirmation controller.
 * Sends a branded MJML confirmation email instead of the default Strapi template.
 * IMPORTANT: Do NOT call the original sendEmailConfirmation — it also sends an email,
 * which would result in two emails per request.
 *
 * Handles POST /api/auth/send-email-confirmation
 */
export const overrideSendEmailConfirmation = () => async (ctx) => {
  const { email } = ctx.request.body as { email?: string };

  if (!email) return ctx.badRequest("Email is required");

  const user = await strapi.db.query("plugin::users-permissions.user").findOne({
    where: { email: email.toLowerCase() },
    select: [
      "id",
      "email",
      "username",
      "firstname",
      "confirmed",
      "blocked",
      "confirmationToken",
    ],
  });

  // Silent success if user not found or already confirmed (matches Strapi built-in behavior)
  if (!user || user.confirmed || user.blocked) return ctx.send({ ok: true });

  const confirmationUrl = `${
    process.env.APP_URL || "http://localhost:1337"
  }/api/auth/email-confirmation?confirmation=${user.confirmationToken}`;
  const name = user.firstname || user.username || user.email;

  try {
    await sendMjmlEmail(
      strapi,
      "email-confirmation",
      user.email,
      "Confirma tu correo electrónico",
      { name, confirmationUrl }
    );
  } catch (err) {
    strapi.log.error(
      `[overrideSendEmailConfirmation] Failed to send confirmation email to ${
        user.email
      }: ${err?.message ?? err}`
    );
  }

  ctx.send({ ok: true });
};
